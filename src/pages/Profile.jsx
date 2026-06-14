import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isMock } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { generateInvoicePDF } from '../services/invoiceGenerator';
import { 
  ShoppingBag, 
  Receipt, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Download, 
  ExternalLink,
  Copy,
  Check,
  QrCode
} from 'lucide-react';

const Profile = () => {
  const { currentUser, userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    upiIds: ['amar@upi', '7047310066@paytm'],
    phone: '7047310066',
    email: 'amarbiswas@gmail.com'
  });
  const [loading, setLoading] = useState(true);

  // UTR submission state
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrSuccess, setUtrSuccess] = useState(false);
  const [utrError, setUtrError] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(null);

  // Load orders, invoices, and settings
  useEffect(() => {
    if (!currentUser) return;

    if (isMock) {
      // Mock orders loading
      const loadMockData = () => {
        const storedOrders = localStorage.getItem('mock_orders');
        const orderList = storedOrders ? JSON.parse(storedOrders) : [
          {
            id: 'mock-order-1',
            userId: currentUser.uid,
            services: ['eCommerce Website'],
            features: ['Admin Panel', 'Chat Support widget'],
            description: 'Online store mockup for portfolio.',
            budget: '₹30,000 - ₹50,000',
            deadline: '1 Month',
            status: 'Quoted',
            price: 35000,
            upiUtr: '',
            paymentApprovedAt: null,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ];
        
        // Filter by user ID
        setOrders(orderList.filter(o => o.userId === currentUser.uid));

        // Load mock invoices
        const storedInvoices = localStorage.getItem('mock_invoices');
        const invoiceList = storedInvoices ? JSON.parse(storedInvoices) : [];
        setInvoices(invoiceList.filter(inv => inv.userId === currentUser.uid));
        setLoading(false);
      };

      loadMockData();
      
      // Periodically check localstorage to mimic database updates
      const interval = setInterval(loadMockData, 1500);
      return () => clearInterval(interval);
    }

    // Real Firebase listener for orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setOrders(list);
    }, (error) => {
      console.error("Error loading profile orders:", error);
    });

    // Real Firebase listener for invoices
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setInvoices(list);
    }, (error) => {
      console.error("Error loading profile invoices:", error);
    });

    // Fetch Global Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.warn("Settings document not found, using default UPIs.");
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeInvoices();
      unsubscribeSettings();
    };
  }, [currentUser]);

  // Copy UPI handle to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(text);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  // Submit UTR Transaction Code
  const handleUtrSubmit = async (e) => {
    e.preventDefault();
    if (utrNumber.trim().length !== 12 || isNaN(utrNumber.trim())) {
      setUtrError("UTR number must be exactly a 12-digit number.");
      return;
    }

    setSubmittingUtr(true);
    setUtrError(null);
    setUtrSuccess(false);

    const utr = utrNumber.trim();

    if (isMock) {
      // Mock UTR Save
      const storedOrders = localStorage.getItem('mock_orders');
      if (storedOrders) {
        const orderList = JSON.parse(storedOrders);
        const updated = orderList.map(o => o.id === selectedOrderForPayment.id 
          ? { ...o, upiUtr: utr, status: 'Payment Pending' } 
          : o
        );
        localStorage.setItem('mock_orders', JSON.stringify(updated));
        
        // Auto trigger admin message acknowledging UTR
        const storedChats = localStorage.getItem(`mock_chats_${currentUser.uid}`);
        const chatList = storedChats ? JSON.parse(storedChats) : [];
        const adminReply = {
          id: `mock-msg-${Date.now()}`,
          userId: currentUser.uid,
          sender: 'admin',
          message: `Thanks for submitting UTR [${utr}] for ₹${selectedOrderForPayment.price.toLocaleString('en-IN')}. I will check my bank records and approve your payment shortly!`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`mock_chats_${currentUser.uid}`, JSON.stringify([...chatList, adminReply]));
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setUtrSuccess(true);
      setUtrNumber('');
      setSelectedOrderForPayment(null);
      setSubmittingUtr(false);
      return;
    }

    try {
      const orderRef = doc(db, 'orders', selectedOrderForPayment.id);
      await updateDoc(orderRef, {
        upiUtr: utr,
        status: 'Payment Pending'
      });
      setUtrSuccess(true);
      setUtrNumber('');
      setSelectedOrderForPayment(null);
    } catch (err) {
      console.error("UTR submission error:", err);
      setUtrError("Failed to submit UTR. Please try again.");
    } finally {
      setSubmittingUtr(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Quoted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Payment Pending': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'In Progress': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Profile Card Summary */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg sm:text-xl">
              {(userData?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-gray-900 leading-tight">
                {userData?.name || 'Client Dashboard'}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Client profile: {userData?.email} {userData?.phone && `| Phone: ${userData.phone}`}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full">
            Client Account Active
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Orders Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={20} className="text-gray-600" />
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-gray-900">Project Requests & Orders</h2>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center space-y-4 shadow-soft">
                  <ShoppingBag size={40} className="mx-auto text-gray-300" />
                  <h3 className="font-display font-bold text-gray-700 text-base">No active orders</h3>
                  <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto">
                    You haven't requested any web development services yet. Fill out our project builder to get started!
                  </p>
                  <Link 
                    to="/order" 
                    className="inline-flex h-10 px-6 items-center rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm"
                  >
                    Start Project Build
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-soft hover:shadow-md transition-all"
                    >
                      {/* Card Header info */}
                      <div className="p-6 border-b border-gray-100 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            Created: {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-display font-extrabold text-base text-gray-800">
                            {order.services.join(' + ')}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                            {order.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Details/Pricing & Actions */}
                      <div className="px-6 py-4 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-6 text-xs text-gray-500">
                          <div>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Budget Range</span>
                            <span className="font-bold text-gray-700">{order.budget}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Timeline Goal</span>
                            <span className="font-bold text-gray-700">{order.deadline}</span>
                          </div>
                          {order.price && (
                            <div>
                              <span className="block text-[10px] text-gray-400 font-bold uppercase">Assigned Price</span>
                              <span className="font-extrabold text-primary-600 text-sm">₹{order.price.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>

                        {/* Order action state switches */}
                        <div className="flex gap-2">
                          {order.status === 'Quoted' && (
                            <button
                              onClick={() => setSelectedOrderForPayment(order)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              <CreditCard size={14} />
                              <span>Pay Now (UPI)</span>
                            </button>
                          )}
                          {order.status === 'Payment Pending' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-55 text-purple-700 text-xs font-semibold border border-purple-100">
                              <Clock size={12} className="animate-spin" />
                              <span>UTR Submitted: {order.upiUtr}</span>
                            </span>
                          )}
                          {(order.status === 'In Progress' || order.status === 'Completed') && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-55 text-emerald-700 text-xs font-semibold border border-emerald-100">
                              <CheckCircle size={12} />
                              <span>Payment Approved</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Receipt size={20} className="text-gray-600" />
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-gray-900">Invoices</h2>
              </div>

              {invoices.length === 0 ? (
                <div className="bg-white border border-gray-150 rounded-2xl p-6 text-center space-y-3 shadow-soft">
                  <Receipt size={32} className="mx-auto text-gray-300" />
                  <h3 className="font-display font-bold text-gray-700 text-sm">No Invoices</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Invoices are auto-generated as soon as the administrator approves a project's UPI payment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div 
                      key={inv.id}
                      className="bg-white border border-gray-150 rounded-xl p-5 shadow-soft hover:border-primary-100 transition-all space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="space-y-0.5">
                          <span className="block text-[10px] text-gray-400 font-bold uppercase">Invoice No.</span>
                          <span className="font-display font-bold text-sm text-gray-800">{inv.invoiceNo}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          PAID
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Paid Amount</span>
                        <strong className="text-gray-800 font-extrabold text-base">₹{inv.amount.toLocaleString('en-IN')}</strong>
                      </div>

                      <button
                        onClick={() => generateInvoicePDF(inv, globalSettings, userData)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary-100 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold transition-all"
                      >
                        <Download size={14} />
                        <span>Download Invoice PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Payment Drawer Modal */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-display font-bold text-base sm:text-lg">UPI Manual Payment</h3>
              <button 
                onClick={() => {
                  setSelectedOrderForPayment(null);
                  setUtrError(null);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Payment Details Card */}
              <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-5 text-gray-700 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span>Project Selected:</span>
                  <strong className="text-gray-900 font-bold">{selectedOrderForPayment.services.join(' + ')}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Price Quote:</span>
                  <strong className="text-primary-600 font-extrabold text-base">₹{selectedOrderForPayment.price.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* QR Code and UPI Copy */}
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center border-b border-gray-100 pb-6">
                {/* Dynamically generated UPI payment QR code */}
                <div className="w-40 h-40 bg-gray-50 border border-gray-150 rounded-2xl p-3 flex items-center justify-center relative shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `upi://pay?pa=${globalSettings.upiIds[0]}&pn=DevCraft%20Studio&am=${selectedOrderForPayment.price}&cu=INR`
                    )}`} 
                    alt="Payment QR"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute -bottom-2 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[8px] font-bold text-gray-400 uppercase shadow-sm flex items-center gap-1">
                    <QrCode size={10} />
                    <span>Scan to Pay</span>
                  </div>
                </div>

                {/* Manual UPI selection details */}
                <div className="space-y-4 text-center sm:text-left flex-grow">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Copy UPI Addresses</span>
                  <div className="space-y-2">
                    {globalSettings.upiIds.map((upi, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="font-mono text-xs text-gray-700 select-all truncate">{upi}</span>
                        <button
                          onClick={() => copyToClipboard(upi)}
                          className="p-1 rounded bg-white border border-gray-100 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                          title="Copy Address"
                        >
                          {copiedUpi === upi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * Scan the QR code or use the UPI addresses listed above in any mobile payment app (Paytm, PhonePe, GPay) to transfer ₹{selectedOrderForPayment.price.toLocaleString('en-IN')}.
                  </p>
                </div>
              </div>

              {/* UTR Submission Form */}
              <form onSubmit={handleUtrSubmit} className="space-y-4">
                {utrError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium">
                    {utrError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Enter 12-Digit UPI UTR / Transaction Reference Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 614088921473"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono tracking-widest text-center"
                  />
                  <span className="text-[10px] text-gray-400 block leading-normal">
                    * The UTR (Unique Transaction Reference) is a 12-digit numeric code found on your UPI receipt. The admin will verify this number in bank records to authorize your project order.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingUtr}
                  className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all hover:scale-[1.01]"
                >
                  {submittingUtr ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Submit Payment Reference</span>
                    </>
                  )}
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
