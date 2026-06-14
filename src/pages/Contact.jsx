import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { db, isMock } from '../firebase/config';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';

// Custom SVG Icons because brand icons are missing in the latest Lucide bundles
const Linkedin = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Github = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const Contact = () => {
  const [globalSettings, setGlobalSettings] = useState({
    phone: '7047310066',
    email: 'amarbiswas@gmail.com',
    address: 'Krishnagar, West Bengal - 741163',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      whatsapp: 'https://wa.me/917047310066'
    }
  });

  useEffect(() => {
    if (isMock) {
      const stored = localStorage.getItem('mock_global_settings');
      if (stored) {
        setGlobalSettings(JSON.parse(stored));
      }
      return;
    }
    const docRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(docSnap.data());
      }
    }, (error) => {
      console.warn("Could not retrieve global settings from Firestore, using default.");
    });
    return unsubscribe;
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Business Website',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const services = [
    'eCommerce Website',
    'CRM System',
    'CMS Platform',
    'Business Website',
    'Landing Page',
    'Custom Web App',
    'Admin Dashboard',
    'API Integration'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (isMock) {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', service: 'Business Website', message: '' });
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', service: 'Business Website', message: '' });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError("Failed to submit contact request. Please try again or call directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Contact Info Panel */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-4xl text-gray-900 leading-tight">
              Get In Touch.
            </h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Have a web project in mind? Fill out the form or reach out directly. We respond to quotes and inquiries within 12 hours.
            </p>
          </div>

          <div className="space-y-6">
            {/* Phone */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-150 shadow-soft">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Call Directly</span>
                <a href={`tel:${globalSettings.phone}`} className="text-gray-800 font-bold hover:text-primary-600 transition-colors text-sm sm:text-base">
                  +91 {globalSettings.phone}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-150 shadow-soft">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Inquiry</span>
                <a href={`mailto:${globalSettings.email}`} className="text-gray-800 font-bold hover:text-primary-600 transition-colors text-sm sm:text-base">
                  {globalSettings.email}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-150 shadow-soft">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Office Location</span>
                <span className="text-gray-800 font-bold text-sm sm:text-base">
                  {globalSettings.address}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links & WhatsApp Redirection */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Direct Message & Socials</span>
            <div className="flex flex-wrap gap-3">
              <a 
                href={globalSettings.socialLinks?.whatsapp || 'https://wa.me/917047310066'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-102"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
              <a 
                href={globalSettings.socialLinks?.linkedin || 'https://linkedin.com'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin size={16} />
              </a>
              <a 
                href={globalSettings.socialLinks?.github || 'https://github.com'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all"
                title="GitHub Repos"
              >
                <Github size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 sm:p-10 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {success && (
              <div className="p-4 bg-emerald-55 text-emerald-800 rounded-xl border border-emerald-100 text-sm font-medium">
                Thank you! Your message was submitted successfully. I will get back to you shortly.
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
              </div>

              {/* Service Required */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Service Needed</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-700"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Project details or Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your website goals, features, and timeline requirements..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all hover:scale-[1.01] active:scale-99"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Inquiry</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
