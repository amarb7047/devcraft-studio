import React, { useState, useEffect } from 'react';
import { db, isMock } from '../../firebase/config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Settings, Save, Smartphone, Mail, MapPin, Share2, CreditCard, Check } from 'lucide-react';

const SettingsPage = () => {
  const [upi1, setUpi1] = useState('amar@upi');
  const [upi2, setUpi2] = useState('7047310066@paytm');
  const [phone, setPhone] = useState('7047310066');
  const [email, setEmail] = useState('amarbiswas@gmail.com');
  const [address, setAddress] = useState('Krishnagar, West Bengal - 741163');
  
  // Socials
  const [linkedin, setLinkedin] = useState('https://linkedin.com');
  const [github, setGithub] = useState('https://github.com/amarb7047/devcraft-studio');
  const [whatsapp, setWhatsapp] = useState('https://wa.me/917047310066');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isMock) {
      // Mock settings loading
      const stored = localStorage.getItem('mock_global_settings');
      if (stored) {
        const data = JSON.parse(stored);
        setUpi1(data.upiIds?.[0] || 'amar@upi');
        setUpi2(data.upiIds?.[1] || '7047310066@paytm');
        setPhone(data.phone || '7047310066');
        setEmail(data.email || 'amarbiswas@gmail.com');
        setAddress(data.address || 'Krishnagar, West Bengal - 741163');
        setLinkedin(data.socialLinks?.linkedin || 'https://linkedin.com');
        setGithub(data.socialLinks?.github || 'https://github.com');
        setWhatsapp(data.socialLinks?.whatsapp || 'https://wa.me/917047310066');
      }
      setLoading(false);
      return;
    }

    // Real Firebase listener
    const docRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUpi1(data.upiIds?.[0] || 'amar@upi');
        setUpi2(data.upiIds?.[1] || '7047310066@paytm');
        setPhone(data.phone || '7047310066');
        setEmail(data.email || 'amarbiswas@gmail.com');
        setAddress(data.address || 'Krishnagar, West Bengal - 741163');
        setLinkedin(data.socialLinks?.linkedin || 'https://linkedin.com');
        setGithub(data.socialLinks?.github || 'https://github.com');
        setWhatsapp(data.socialLinks?.whatsapp || 'https://wa.me/917047310066');
      }
      setLoading(false);
    }, (err) => {
      console.warn("Could not retrieve global settings from Firestore, loading defaults.");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const settingsData = {
      upiIds: [upi1.trim(), upi2.trim()].filter(id => id !== ''),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      socialLinks: {
        linkedin: linkedin.trim(),
        github: github.trim(),
        whatsapp: whatsapp.trim()
      }
    };

    if (isMock) {
      localStorage.setItem('mock_global_settings', JSON.stringify(settingsData));
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess(true);
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'global'), settingsData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving global settings:", err);
      setError("Failed to save settings. Review Firestore permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Settings Info Card */}
      <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Settings size={20} />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">System Configurations</h3>
            <p className="text-gray-400 text-[10px] sm:text-xs">Update contacts and payment parameters</p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-soft space-y-8 text-xs sm:text-sm">
        
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
            <Check size={16} />
            <span>Settings saved successfully! Updates are now live across the platform.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl font-semibold">
            {error}
          </div>
        )}

        {/* UPI Payments Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <CreditCard size={16} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              UPI Billing Accounts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Primary UPI Handle</label>
              <input
                type="text"
                required
                value={upi1}
                onChange={(e) => setUpi1(e.target.value)}
                placeholder="amar@upi"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secondary UPI Handle</label>
              <input
                type="text"
                value={upi2}
                onChange={(e) => setUpi2(e.target.value)}
                placeholder="7047310066@paytm"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Support & Contact Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Smartphone size={16} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Primary Support Details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Support Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="7047310066"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Support Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amarbiswas@gmail.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Office physical Location</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Krishnagar, West Bengal - 741163"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Social Links Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Share2 size={16} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Social Media Channels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">LinkedIn URL</label>
              <input
                type="url"
                required
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">GitHub URL</label>
              <input
                type="url"
                required
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Contact URL</label>
            <input
              type="url"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="https://wa.me/917047310066"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Submit Save */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all hover:scale-[1.01]"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Save size={16} />
              <span>Save System Settings</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
};

export default SettingsPage;
