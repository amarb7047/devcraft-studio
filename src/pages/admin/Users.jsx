import React, { useState, useEffect } from 'react';
import { db, isMock } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Mail, Phone, Calendar, ShoppingCart, UserCheck } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      // Mock Users list loading
      const loadMockUsers = () => {
        const mockList = [
          { id: 'mock-client-uid', name: 'Demo Client', email: 'client@example.com', phone: '9876543210', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: 'u-1', name: 'Sanjay Sen', email: 'sanjay@example.com', phone: '9830098300', createdAt: new Date(Date.now() - 172800000).toISOString() },
          { id: 'u-2', name: 'Rumi Roy', email: 'rumi@example.com', phone: '9836012345', createdAt: new Date(Date.now() - 86400000).toISOString() }
        ];

        // Fetch mock orders to count them
        const storedOrders = JSON.parse(localStorage.getItem('mock_orders')) || [];
        
        const aggregated = mockList.map(u => ({
          ...u,
          orderCount: storedOrders.filter(o => o.userId === u.id).length
        }));
        
        setUsers(aggregated);
        setLoading(false);
      };

      loadMockUsers();
      const interval = setInterval(loadMockUsers, 1500);
      return () => clearInterval(interval);
    }

    // Real Firebase listener for all users and count orders
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      const usersList = [];
      const usersMap = {};

      snapshot.forEach(docSnap => {
        const u = docSnap.data();
        usersMap[docSnap.id] = { id: docSnap.id, ...u, orderCount: 0 };
      });

      // Fetch orders to calculate count
      onSnapshot(collection(db, 'orders'), (ordersSnapshot) => {
        // Reset counts
        Object.keys(usersMap).forEach(uid => {
          usersMap[uid].orderCount = 0;
        });

        ordersSnapshot.forEach(oDoc => {
          const order = oDoc.data();
          if (usersMap[order.userId]) {
            usersMap[order.userId].orderCount++;
          }
        });

        // Convert back to sorted list by creation date
        const list = Object.values(usersMap).sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setUsers(list);
        setLoading(false);
      });
    }, (error) => {
      console.error("Error loading users list:", error);
      setLoading(false);
    });

    return () => unsubscribeUsers();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Registered Client Base</h3>
            <p className="text-gray-400 text-[10px] sm:text-xs">Database profiles of active and prospective partners</p>
          </div>
        </div>
        
        <span className="text-xs font-bold px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full">
          Total Users: {users.length}
        </span>
      </div>

      {/* Users Grid Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3 shadow-soft">
          <Users size={40} className="mx-auto text-gray-300" />
          <h3 className="font-display font-bold text-gray-700 text-base">No Users Found</h3>
          <p className="text-gray-400 text-xs">No client profiles exist in the Firestore auth database yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-150 bg-gray-50/30">
                  <th className="py-3.5 px-6">Client Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Contact Phone</th>
                  <th className="py-3.5 px-6">Project Orders Count</th>
                  <th className="py-3.5 px-6">Registration Date</th>
                  <th className="py-3.5 px-6 text-right">Account Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/20 transition-all">
                    <td className="py-4 px-6 font-bold text-gray-950 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-55 text-primary-700 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                        {user.name?.charAt(0) || 'C'}
                      </div>
                      <span>{user.name || 'Client User'}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      <a href={`mailto:${user.email}`} className="hover:text-primary-600 flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        <span>{user.email}</span>
                      </a>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {user.phone ? (
                        <a href={`tel:${user.phone}`} className="hover:text-primary-600 flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          <span>+91 {user.phone}</span>
                        </a>
                      ) : (
                        <span className="text-gray-300">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        user.orderCount > 0 
                          ? 'bg-primary-50 text-primary-600 border-primary-100' 
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {user.orderCount} Orders
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-xs font-medium">
                      {new Date(user.createdAt?.seconds ? user.createdAt.seconds * 1000 : user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        user.role === 'admin' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {user.role === 'admin' ? 'Owner / Admin' : 'Client Profile'}
                      </span>
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

export default UsersList;
