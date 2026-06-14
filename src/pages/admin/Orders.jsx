import React, { useState, useEffect } from 'react';
import { db, isMock } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { 
  ShoppingBag, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  X, 
  Eye, 
  FileText,
  MessageSquare
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit controls inside details modal
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const statuses = ['All', 'New', 'Under Review', 'Quoted', 'Payment Pending', 'In Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    if (isMock) {
      // Mock orders loading
      const loadMockOrders = () => {
        const stored = localStorage.getItem('mock_orders');
        const list = stored ? JSON.parse(stored) : [
          {
            id: 'mock-order-1',
            userId: 'mock-client-uid',
            clientName: 'Sanjay Sen',
            clientEmail: 'sanjay@example.com',
            clientPhone: '9830098300',
            services: ['eCommerce Website'],
            features: ['Admin Panel', 'Chat Support widget'],
            description: 'Custom Shopify-style bookstore with manual payment UTRs.',
            budget: '₹30,000 - ₹50,000',
            deadline: '1 Month',
            status: 'Payment Pending',
            price: 35000,
            upiUtr: '987654321012',
            paymentApprovedAt: null,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'mock-order-2',
            userId: 'mock-client-uid',
            clientName: 'Rumi Roy',
            clientEmail: 'rumi@example.com',
            clientPhone: '9836012345',
            services: ['Business Website'],
            features: ['SEO Optimization'],
            description: 'Multi-page architecture showcase for corporate real estate firm.',
            budget: '₹15,000 - ₹30,000',
            deadline: '2-3 Weeks',
            status: 'New',
            price: null,
            upiUtr: '',
            paymentApprovedAt: null,
            createdAt: new Date().toISOString()
          }
        ];
        setOrders(list);
        setLoading(false);
      };

      loadMockOrders();
      const interval = setInterval(loadMockOrders, 1000);
      return () => clearInterval(interval);
    }

    // Real Firebase listener for all orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setOrders(list);
      setLoading(false);
    }, (error) => {
      console.error("Error loading admin orders:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter orders
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === activeFilter));
    }
  }, [orders, activeFilter]);

  // Open Details Modal and populate state
  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setEditPrice(order.price || '');
    setEditStatus(order.status || 'New');
    setEditNotes(order.internalNotes || '');
  };

  // Save changes to Order (Status, Price, Notes)
  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    setUpdating(true);

    const priceNum = editPrice !== '' ? Number(editPrice) : null;
    const updates = {
      price: priceNum,
      status: editStatus,
      internalNotes: editNotes
    };

    if (isMock) {
      // Mock Save updates
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updatedList = list.map(o => o.id === selectedOrder.id ? { ...o, ...updates } : o);
        localStorage.setItem('mock_orders', JSON.stringify(updatedList));
        setSelectedOrder({ ...selectedOrder, ...updates });
      }
      setUpdating(false);
      return;
    }

    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, updates);
      setSelectedOrder({ ...selectedOrder, ...updates });
    } catch (err) {
      console.error("Error updating order:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Approve Payment Flow (Creates Invoice, updates order to In Progress, sends alert chat message)
  const handleApprovePayment = async () => {
    if (!selectedOrder.price) {
      alert("Please set a price quote before approving payment.");
      return;
    }

    setUpdating(true);

    const invoiceNo = `DC-2026-${Date.now().toString().slice(-4)}`;
    
    // 1. Set order variables
    const orderUpdates = {
      status: 'In Progress',
      paymentApprovedAt: isMock ? new Date().toISOString() : new Date()
    };

    // 2. Setup invoice record
    const invoiceData = {
      orderId: selectedOrder.id,
      userId: selectedOrder.userId,
      invoiceNo,
      amount: selectedOrder.price,
      paymentMode: 'UPI',
      upiUtr: selectedOrder.upiUtr,
      createdAt: isMock ? new Date().toISOString() : new Date()
    };

    // 3. Setup chat notification message
    const chatNotification = {
      userId: selectedOrder.userId,
      sender: 'admin',
      message: `Payment Approved! Your order for [${selectedOrder.services.join(', ')}] has been placed in progress. You can now view and download Invoice [${invoiceNo}] directly from your profile dashboard. Development has officially kicked off!`,
      isRead: false,
      createdAt: isMock ? new Date().toISOString() : new Date()
    };

    if (isMock) {
      // Update mock orders
      const storedOrders = localStorage.getItem('mock_orders');
      if (storedOrders) {
        const list = JSON.parse(storedOrders);
        const updatedList = list.map(o => o.id === selectedOrder.id ? { ...o, ...orderUpdates } : o);
        localStorage.setItem('mock_orders', JSON.stringify(updatedList));
        setSelectedOrder({ ...selectedOrder, ...orderUpdates });
      }

      // Add mock invoice
      const storedInvoices = localStorage.getItem('mock_invoices');
      const invoicesList = storedInvoices ? JSON.parse(storedInvoices) : [];
      const newInvoice = { id: `mock-inv-${Date.now()}`, ...invoiceData };
      localStorage.setItem('mock_invoices', JSON.stringify([newInvoice, ...invoicesList]));

      // Add mock chat message
      const storedChats = localStorage.getItem(`mock_chats_${selectedOrder.userId}`);
      const chatList = storedChats ? JSON.parse(storedChats) : [];
      localStorage.setItem(`mock_chats_${selectedOrder.userId}`, JSON.stringify([...chatList, chatNotification]));

      setUpdating(false);
      return;
    }

    try {
      // Commit in Firebase
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, orderUpdates);
      
      await addDoc(collection(db, 'invoices'), invoiceData);
      await addDoc(collection(db, 'chats'), chatNotification);

      setSelectedOrder({ ...selectedOrder, ...orderUpdates });
    } catch (err) {
      console.error("Error approving payment:", err);
      alert("Failed to approve payment. Review firestore configs.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Quoted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Payment Pending': return 'bg-purple-50 text-purple-700 border-purple-100 animate-pulse';
      case 'In Progress': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filter Row Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        {statuses.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
              activeFilter === tab
                ? 'bg-primary-600 text-white shadow-premium'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-primary-600 hover:bg-primary-50/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3 shadow-soft">
          <ShoppingBag size={40} className="mx-auto text-gray-300" />
          <h3 className="font-display font-bold text-gray-700 text-base">No Orders Found</h3>
          <p className="text-gray-400 text-xs leading-normal">
            No project requests found under the status filter: <strong className="text-gray-600 font-semibold">{activeFilter}</strong>.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-150 bg-gray-50/30">
                  <th className="py-3.5 px-6">Client Info</th>
                  <th className="py-3.5 px-6">Services Required</th>
                  <th className="py-3.5 px-6">Budget Range</th>
                  <th className="py-3.5 px-6">Assigned Quote</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/20 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-900">{order.clientName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{order.clientEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 truncate max-w-[200px] font-semibold">{order.services.join(' + ')}</td>
                    <td className="py-4 px-6 text-gray-500 font-medium">{order.budget}</td>
                    <td className="py-4 px-6 font-bold text-primary-600">
                      {order.price ? `₹${order.price.toLocaleString('en-IN')}` : <span className="text-gray-300 font-normal">Pending Quote</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 font-semibold shadow-sm transition-all"
                      >
                        <Eye size={12} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Sliding Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <h3 className="font-display font-bold text-base sm:text-lg">Project Order Specifications</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              
              {/* Split Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                
                {/* Client Contact Info */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Client Profile</span>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <User size={14} className="text-gray-400" />
                      <span>{selectedOrder.clientName}</span>
                    </div>
                    <p className="text-gray-500 font-medium text-xs">Email: {selectedOrder.clientEmail}</p>
                    {selectedOrder.clientPhone && (
                      <p className="text-gray-500 font-medium text-xs">Phone: +91 {selectedOrder.clientPhone}</p>
                    )}
                  </div>
                </div>

                {/* Logistics */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Project Logistics</span>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Timeline: {selectedOrder.deadline}</span>
                    </div>
                    <p className="text-gray-500 font-medium text-xs">Budget Range: {selectedOrder.budget}</p>
                    <p className="text-gray-500 font-medium text-xs">
                      Sub Date: {new Date(selectedOrder.createdAt?.seconds ? selectedOrder.createdAt.seconds * 1000 : selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

              </div>

              {/* Requirement Notes */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Requirements Description</span>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 max-h-48 overflow-y-auto leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {selectedOrder.description}
                </div>
              </div>

              {/* Checked Features badges */}
              {selectedOrder.features?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Features Checked</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOrder.features.map((feature, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-100 text-primary-700 font-semibold text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* UTR Verification Alert Section */}
              {selectedOrder.upiUtr && (
                <div className="p-4 bg-purple-50 border border-purple-150 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider block">Submitted UPI Payment Reference</span>
                    <strong className="font-mono text-base text-purple-800 tracking-wider select-all">{selectedOrder.upiUtr}</strong>
                  </div>
                  {selectedOrder.status === 'Payment Pending' && (
                    <button
                      onClick={handleApprovePayment}
                      disabled={updating}
                      className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold transition-all shadow-sm shrink-0"
                    >
                      Approve Payment
                    </button>
                  )}
                </div>
              )}

              {/* Control Operations Form */}
              <form onSubmit={handleSaveChanges} className="space-y-4 pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Update Quote & Operation Status</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Quote Price (INR)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="e.g. 35000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800 font-semibold"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Project Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800 font-semibold"
                    >
                      {statuses.filter(s => s !== 'All').map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Internal Developer Notes */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Internal Notes (Not visible to Client)</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Discussed landing page revisions. Ready for checkout UTR verification..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all"
                  >
                    {updating ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
