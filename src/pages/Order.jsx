import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, isMock } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { FileText, CheckCircle, Code, Layers, Sparkles } from 'lucide-react';

const Order = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const servicesList = [
    { id: 'ecommerce', name: 'eCommerce Website' },
    { id: 'crm', name: 'CRM System' },
    { id: 'cms', name: 'CMS Platform' },
    { id: 'business', name: 'Business Website' },
    { id: 'landing', name: 'Landing Page' },
    { id: 'custom', name: 'Custom Web App' },
    { id: 'dashboard', name: 'Admin Dashboard' },
    { id: 'api', name: 'API Integration' }
  ];

  const featuresList = [
    'Admin Panel',
    'User Login',
    'Payment Gateway / UPI Form',
    'Chat Support widget',
    'SEO Optimization',
    'Multi-language Support'
  ];

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('₹15,000 - ₹30,000');
  const [deadline, setDeadline] = useState('2-3 Weeks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill selected service from navigation state (e.g. clicking 'Order Now' on Services page)
  useEffect(() => {
    if (location.state?.selectedService) {
      const match = servicesList.find(s => s.name.toLowerCase() === location.state.selectedService.toLowerCase());
      if (match) {
        setSelectedServices([match.name]);
      }
    }
  }, [location.state]);

  const handleServiceChange = (name) => {
    if (selectedServices.includes(name)) {
      setSelectedServices(selectedServices.filter(item => item !== name));
    } else {
      setSelectedServices([...selectedServices, name]);
    }
  };

  const handleFeatureChange = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(item => item !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setError("Please select at least one service.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your project requirements.");
      return;
    }

    setLoading(true);
    setError(null);

    const orderData = {
      userId: currentUser.uid,
      clientName: userData?.name || currentUser.displayName || 'Client User',
      clientEmail: userData?.email || currentUser.email,
      clientPhone: userData?.phone || '',
      services: selectedServices,
      features: selectedFeatures,
      description: description.trim(),
      budget,
      deadline,
      status: 'New', // Default status
      price: null, // Price assigned by admin later
      upiUtr: '', // Submitted by client during checkout
      paymentApprovedAt: null,
      createdAt: isMock ? new Date().toISOString() : new Date() // Fallback check for mock
    };

    if (isMock) {
      // Mock Order Save
      const stored = localStorage.getItem('mock_orders');
      const orders = stored ? JSON.parse(stored) : [];
      const newOrder = { id: `mock-order-${Date.now()}`, ...orderData };
      localStorage.setItem('mock_orders', JSON.stringify([newOrder, ...orders]));
      
      // Auto trigger a mock chat notification from admin
      const storedChats = localStorage.getItem(`mock_chats_${currentUser.uid}`);
      const chatList = storedChats ? JSON.parse(storedChats) : [];
      const adminNotif = {
        id: `mock-msg-${Date.now()}`,
        userId: currentUser.uid,
        sender: 'admin',
        message: `Hello! I received your order request for [${selectedServices.join(', ')}]. I'll review your notes and post a price quote here shortly!`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`mock_chats_${currentUser.uid}`, JSON.stringify([...chatList, adminNotif]));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
      navigate('/profile');
      return;
    }

    try {
      await addDoc(collection(db, 'orders'), orderData);
      navigate('/profile');
    } catch (err) {
      console.error("Error submitting project order:", err);
      setError("Failed to submit project request. Please check connections and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 leading-tight">
            Start Your Web Project
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl">
            Select the services you require, outline additional specifications, and we will prepare a personalized price estimate.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-semibold">
            {error}
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-10 shadow-soft grid grid-cols-1 gap-8">
          
          {/* Services Section */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">
              1. Select Target Services (Choose one or more)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {servicesList.map((service) => {
                const isChecked = selectedServices.includes(service.name);
                return (
                  <label 
                    key={service.id} 
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'border-primary-500 bg-primary-50/20 text-primary-700 font-semibold shadow-sm' 
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleServiceChange(service.name)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                    />
                    <span className="text-xs sm:text-sm">{service.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">
              2. Add-on Features & Integrations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuresList.map((feature, idx) => {
                const isChecked = selectedFeatures.includes(feature);
                return (
                  <label 
                    key={idx} 
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'border-primary-500 bg-primary-50/10 text-primary-700 font-semibold' 
                        : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleFeatureChange(feature)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                    />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Project Details Section */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">
              3. Describe Your Project Specifications
            </span>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline your target pages, desired user workflows, competitor designs you admire, and any third-party APIs you want us to integrate..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* Budget & Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Budget Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Estimated Budget Range</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-700 font-semibold"
              >
                <option value="₹5,000 - ₹15,000">₹5,000 - ₹15,000 (Basic Landing Page / API integrations)</option>
                <option value="₹15,000 - ₹30,000">₹15,000 - ₹30,000 (CMS Platform / Standard Site)</option>
                <option value="₹30,000 - ₹50,000">₹30,000 - ₹50,000 (eCommerce / Custom Web App)</option>
                <option value="₹50,000+">₹50,000+ (Large Enterprise Portals / CRMs)</option>
              </select>
            </div>

            {/* Timeline Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Target Timeline</label>
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-700 font-semibold"
              >
                <option value="1 Week">1 Week (Urgent - Landing Page only)</option>
                <option value="2-3 Weeks">2-3 Weeks (Standard Business sites)</option>
                <option value="1 Month">1 Month (eCommerce Store / CMS)</option>
                <option value="2+ Months">2+ Months (Enterprise Portal / CRM)</option>
              </select>
            </div>
          </div>

          {/* Contact Summary Info */}
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Submitting Account Identity:</span>
              <span className="font-bold text-gray-800 text-sm">{userData?.name || currentUser.displayName} ({userData?.email || currentUser.email})</span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium sm:text-right">
              Contact Phone: {userData?.phone || 'No phone set'}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all hover:scale-[1.01] active:scale-99"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Submit Project Request</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Order;
