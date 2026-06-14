import React, { useState, useEffect } from 'react';
import { db, isMock } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { generateInvoicePDF } from '../../services/invoiceGenerator';
import { Receipt, Download, RefreshCw, Calendar, Search } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    upiIds: ['amar@upi', '7047310066@paytm'],
    phone: '7047310066',
    email: 'amarbiswas@gmail.com',
    address: 'Krishnagar, West Bengal - 741163'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      // Mock invoices loading
      const loadMockInvoices = () => {
        const stored = localStorage.getItem('mock_invoices');
        const list = stored ? JSON.parse(stored) : [
          {
            id: 'mock-inv-1',
            invoiceNo: 'DC-2026-0001',
            orderId: 'mock-order-1',
            userId: 'mock-client-uid',
            amount: 35000,
            paymentMode: 'UPI',
            upiUtr: '987654321012',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        
        // Since we need client details for mock PDF, mock them inline
        const formatted = list.map(inv => ({
          ...inv,
          clientProfile: {
            name: 'Sanjay Sen',
            email: 'sanjay@example.com',
            phone: '9830098300'
          }
        }));
        setInvoices(formatted);
        setLoading(false);
      };

      loadMockInvoices();
      const interval = setInterval(loadMockInvoices, 1500);
      return () => clearInterval(interval);
    }

    // Real Firebase listener for all invoices
    const invoicesQuery = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    
    const unsubscribeInvoices = onSnapshot(invoicesQuery, async (snapshot) => {
      const list = [];
      
      // Real-time fetch. Wait, we also need to attach client profile names
      // We can fetch client profiles on Snapshot or simple local caching
      // To keep it simple and real-time, let's load all users and index them
      const usersSnap = await onSnapshot(collection(db, 'users'), (usersSnapshot) => {
        const usersMap = {};
        usersSnapshot.forEach(uDoc => {
          usersMap[uDoc.id] = uDoc.data();
        });

        snapshot.forEach((doc) => {
          const inv = doc.data();
          list.push({
            id: doc.id,
            ...inv,
            clientProfile: usersMap[inv.userId] || { name: 'Client User', email: 'N/A' }
          });
        });
        
        setInvoices(list);
        setLoading(false);
      });
    }, (error) => {
      console.error("Error loading admin invoices:", error);
      setLoading(false);
    });

    // Real Firebase Settings Listener
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(docSnap.data());
      }
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeSettings();
    };
  }, []);

  // Filter invoices on search query
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(
        invoices.filter(
          inv => 
            inv.invoiceNo.toLowerCase().includes(term) ||
            inv.clientProfile?.name?.toLowerCase().includes(term) ||
            inv.upiUtr?.toLowerCase().includes(term)
        )
      );
    }
  }, [invoices, searchTerm]);

  const handleDownload = (inv) => {
    generateInvoicePDF(inv, globalSettings, inv.clientProfile);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Options */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-2xl shadow-soft">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Invoice No, Client name, UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800"
          />
        </div>

        <span className="text-xs text-gray-400 font-medium shrink-0">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </span>
      </div>

      {/* Invoices Grid Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3 shadow-soft">
          <Receipt size={40} className="mx-auto text-gray-300" />
          <h3 className="font-display font-bold text-gray-700 text-base">No Invoices Located</h3>
          <p className="text-gray-400 text-xs">
            {searchTerm ? "No invoices matched your current search parameters." : "No client orders have been marked paid and approved yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-150 bg-gray-50/30">
                  <th className="py-3.5 px-6">Invoice No.</th>
                  <th className="py-3.5 px-6">Client Billed</th>
                  <th className="py-3.5 px-6">Payment Mode (UTR)</th>
                  <th className="py-3.5 px-6">Date Created</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6 text-right">Invoice PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/20 transition-all">
                    <td className="py-4 px-6 font-display font-bold text-gray-900">{inv.invoiceNo}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-800">{inv.clientProfile?.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{inv.clientProfile?.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5 font-medium">
                        <span>{inv.paymentMode}</span>
                        <span className="text-[10px] text-purple-600 font-mono tracking-wide">{inv.upiUtr}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {new Date(inv.createdAt?.seconds ? inv.createdAt.seconds * 1000 : inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-primary-600">
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownload(inv)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary-100 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold transition-all shadow-sm"
                        title="Download Vector PDF"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;
