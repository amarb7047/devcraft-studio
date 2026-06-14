import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, isMock } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { 
  ShoppingBag, 
  Receipt, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    activeChats: 0,
    activeUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load admin dashboard statistics and list
  useEffect(() => {
    if (isMock) {
      // Load mock dashboard data
      const mockOrdersList = JSON.parse(localStorage.getItem('mock_orders')) || [
        { id: 'm-1', clientName: 'Sanjay Sen', services: ['eCommerce Website'], price: 35000, status: 'In Progress', createdAt: new Date().toISOString() },
        { id: 'm-2', clientName: 'Rumi Roy', services: ['CMS Platform'], price: 22000, status: 'Payment Pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'm-3', clientName: 'Gourab Dey', services: ['Landing Page'], price: 8000, status: 'Completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 'm-4', clientName: 'Puja Ray', services: ['Custom Web App'], price: 55000, status: 'New', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() }
      ];

      setRecentOrders(mockOrdersList.slice(0, 5));

      // Calculate stats
      const totalRev = mockOrdersList
        .filter(o => o.status === 'In Progress' || o.status === 'Completed')
        .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
      
      const pendingPay = mockOrdersList.filter(o => o.status === 'Payment Pending').length;

      // Seed chart data
      setChartData([
        { name: 'Jan', revenue: 15000 },
        { name: 'Feb', revenue: 35000 },
        { name: 'Mar', revenue: 50000 },
        { name: 'Apr', revenue: 85000 },
        { name: 'May', revenue: 95000 },
        { name: 'Jun', revenue: totalRev > 0 ? totalRev : 120000 },
      ]);

      setStats({
        totalOrders: mockOrdersList.length,
        pendingPayments: pendingPay,
        totalRevenue: totalRev > 0 ? totalRev : 120000,
        activeChats: 2,
        activeUsers: 8
      });
      setLoading(false);
      return;
    }

    // Real Firebase listener for orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const allOrders = [];
      let revenue = 0;
      let pendingPay = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        allOrders.push({ id: doc.id, ...data });

        // Add to revenue if order is paid
        if (data.status === 'In Progress' || data.status === 'Completed') {
          revenue += (Number(data.price) || 0);
        }
        if (data.status === 'Payment Pending') {
          pendingPay++;
        }
      });

      setRecentOrders(allOrders.slice(0, 5));
      
      setStats(prev => ({
        ...prev,
        totalOrders: allOrders.length,
        pendingPayments: pendingPay,
        totalRevenue: revenue
      }));

      // Group revenue by Month for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = months.map(m => ({ name: m, revenue: 0 }));
      
      allOrders.forEach(o => {
        if (o.status === 'In Progress' || o.status === 'Completed') {
          const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt);
          const monthIndex = date.getMonth();
          monthlyData[monthIndex].revenue += (Number(o.price) || 0);
        }
      });

      // Filter months showing only active months up to current
      const currentMonth = new Date().getMonth();
      setChartData(monthlyData.slice(0, currentMonth + 1));
    });

    // Real Firebase listener for users count
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats(prev => ({ ...prev, activeUsers: snapshot.size }));
    });

    // Real Firebase listener for chats unread count
    const chatsQuery = query(collection(db, 'chats'), where('sender', '==', 'client'), where('isRead', '==', false));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const uniqueUsers = new Set();
      snapshot.forEach((doc) => {
        if (doc.data().userId) uniqueUsers.add(doc.data().userId);
      });
      setStats(prev => ({ ...prev, activeChats: uniqueUsers.size }));
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeChats();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Quoted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Payment Pending': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'In Progress': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const metricCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-primary-600 bg-primary-50 border-primary-100' },
    { label: 'Pending Verification', value: stats.pendingPayments, icon: Clock, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'Active Conversations', value: stats.activeChats, icon: MessageSquare, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { label: 'Registered Clients', value: stats.activeUsers, icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block">
                  {card.label}
                </span>
                <span className="font-display font-extrabold text-2xl text-gray-900">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart & Shortcuts split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recharts Area Chart Panel */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="space-y-0.5">
              <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Revenue Growth (INR)</h3>
              <p className="text-gray-400 text-[10px] sm:text-xs">Visual analytics showing verified client payouts</p>
            </div>
            <TrendingUp size={18} className="text-primary-600" />
          </div>
          
          <div className="h-64 sm:h-72 w-full text-xs font-mono text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1A56DB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1A56DB" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-soft space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Administrative Shortcuts</h3>
            <p className="text-gray-400 text-[10px] sm:text-xs">Quick controls for project operations</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              to="/admin/orders" 
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-100 hover:bg-primary-50/20 text-gray-700 hover:text-primary-700 text-sm font-semibold transition-all shadow-sm"
            >
              <span>Verify Pending UPI Receipts</span>
              <ArrowRight size={14} />
            </Link>
            <Link 
              to="/admin/chat" 
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-100 hover:bg-primary-50/20 text-gray-700 hover:text-primary-700 text-sm font-semibold transition-all shadow-sm"
            >
              <span>Reply to Client Inboxes</span>
              <ArrowRight size={14} />
            </Link>
            <Link 
              to="/admin/portfolio" 
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-100 hover:bg-primary-50/20 text-gray-700 hover:text-primary-700 text-sm font-semibold transition-all shadow-sm"
            >
              <span>Post New Portfolio Case Study</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Recent Order Requests</h3>
            <p className="text-gray-400 text-[10px] sm:text-xs">Incoming project leads from the public website</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-6">No order requests received yet.</p>
        ) : (
          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Services</th>
                  <th className="py-3 px-4">Price / Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Requested Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-800">{order.clientName}</td>
                    <td className="py-3.5 px-4 truncate max-w-[200px] font-medium">{order.services?.join(', ')}</td>
                    <td className="py-3.5 px-4 font-semibold text-primary-600">
                      {order.price ? `₹${order.price.toLocaleString('en-IN')}` : 'Not Quoted'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-400 text-xs">
                      {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
