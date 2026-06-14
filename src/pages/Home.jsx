import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db, isMock } from '../firebase/config';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { 
  ArrowRight, 
  Code, 
  Zap, 
  Target, 
  ShoppingBag, 
  Layout, 
  FileText, 
  LineChart, 
  Layers, 
  MessageSquare,
  Sparkles,
  Smile,
  Server,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Monitor,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import homeImg from '../assets/home.jpeg';

// Counter component for animated statistics
const CounterItem = ({ label, target, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    if (start === end) return;

    let totalDuration = 1800; // ms
    let incrementTime = Math.abs(Math.floor(totalDuration / end));

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-150 shadow-soft hover:shadow-premium transition-all duration-300">
      <span className="font-display font-extrabold text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 mb-2">
        {count}{suffix}
      </span>
      <span className="text-gray-500 font-bold text-[10px] sm:text-xs text-center uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
};

// FAQ Accordion Item
const FAQItem = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-soft transition-all duration-200">
      <button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-gray-800 text-sm sm:text-base hover:bg-gray-50/50 transition-colors"
      >
        <span>{question}</span>
        <div className={`p-1.5 rounded-lg bg-gray-50 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600 bg-primary-50' : ''}`}>
          <ChevronDown size={16} />
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="p-5 pt-0 border-t border-gray-50 text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-pre-line">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFeatureTab, setActiveFeatureTab] = useState('ui');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Mock projects fallback
  const mockProjects = [
    {
      id: 'mock-1',
      title: 'DevCraft CRM Dashboard',
      category: 'CRM Portal',
      techStack: ['React', 'Firebase', 'Recharts'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-2',
      title: 'Boutique Apparel Store',
      category: 'eCommerce Store',
      techStack: ['Shopify', 'React', 'Tailwind'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-3',
      title: 'Real Estate Landing Page',
      category: 'Landing Page',
      techStack: ['React', 'Framer Motion', 'Tailwind'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      if (isMock) {
        setFeaturedProjects(mockProjects);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'portfolio'),
          where('isVisible', '==', true),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        
        if (list.length === 0) {
          setFeaturedProjects(mockProjects);
        } else {
          setFeaturedProjects(list);
        }
      } catch (error) {
        console.error("Error loading portfolio preview:", error);
        setFeaturedProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const coreServices = [
    { icon: ShoppingBag, title: 'eCommerce Stores', desc: 'Custom storefronts, lightning-fast checkout paths, and built-in sales statistics dashboards.' },
    { icon: LineChart, title: 'CRM Custom Portals', desc: 'Streamline client pipelines, lead metrics, follow-up logs, and team permissions.' },
    { icon: Layers, title: 'CMS Platforms', desc: 'Robust content platforms allowing non-technical editors to draft posts and manage assets.' },
    { icon: Layout, title: 'Landing Pages', desc: 'High-conversion design structures engineered to turn ad clicks into paying clients.' }
  ];

  const packages = [
    {
      name: 'Launch Package',
      desc: 'Ideal for small businesses needing a clean online presence.',
      price: '₹14,999',
      features: [
        'Single Premium Page Design',
        'Mobile Responsive Layout',
        'Contact Lead Form Capture',
        'Basic SEO Optimizations',
        'Direct WhatsApp Chat Integration',
        'Vite/React Fast Loading speed'
      ],
      popular: false,
      cta: 'Choose Launch'
    },
    {
      name: 'Scale Platform',
      desc: 'Perfect for brands looking to sell products or manage content.',
      price: '₹34,999',
      features: [
        'Multi-page React/Vite SPA',
        'Full eCommerce Shopping Cart',
        'Cloudinary Rich Media upload presets',
        'Custom Admin Dashboard',
        'Manual UPI Payment QR & UTR portal',
        'Client profile order history log',
        'Real-time Firestore Coordinate Chat'
      ],
      popular: true,
      cta: 'Choose Scale'
    },
    {
      name: 'Custom Enterprise',
      desc: 'Tailor-made software for complex internal company operations.',
      price: 'Custom Quote',
      features: [
        'Bespoke Database Schema indexing',
        'Custom CRM Pipeline Analytics',
        'Recharts analytical graphs',
        'Role-based staff panel credentials',
        'Rest API / third party hookups',
        'Detailed PDF/CSV report exports',
        'Premium dedicated support logs'
      ],
      popular: false,
      cta: 'Consult Developer'
    }
  ];

  const faqItems = [
    {
      question: "How does the manual UPI payment and UTR verification work?",
      answer: "We support a transparent, commission-free payment setup. When your project quote is ready, your profile panel displays the admin's UPI handles and a payment QR code. You pay using any UPI app (GPay, PhonePe, Paytm), copy the 12-digit UTR transaction number from your receipt, and paste it into the portal. The developer verifies this in bank records, clicks 'Approve', and your invoice is instantly logged as downloadable PDF."
    },
    {
      question: "Why should I choose a custom React + Firebase app over WordPress?",
      answer: "WordPress sites are often bloated, slower to load, and vulnerable to plugin exploits. Our custom React.js platforms load within milliseconds, score high on Google PageSpeed (ranking you higher on search engines), and use Firebase Firestore rules to guarantee enterprise-grade data security with zero plugin vulnerabilities."
    },
    {
      question: "How long does a standard web project build take?",
      answer: "A single-page marketing landing page is typically completed in 1 week. Standard eCommerce stores or CMS blogs take between 2 to 3 weeks, while comprehensive Custom CRM Dashboards or Enterprise portals require 4+ weeks. Timelines are finalized during our quoting phase."
    },
    {
      question: "Can I manage site content myself once development finishes?",
      answer: "Absolutely. If you select our CMS Platform or eCommerce packages, you receive a full-featured admin dashboard panel. You can easily upload images (optimized on-the-fly via Cloudinary), update text description inputs, add products, publish blogs, and view analytical charts without writing a single line of code."
    }
  ];

  const featureTabsContent = {
    ui: {
      title: "UI/UX Visual Engineering",
      desc: "We construct interfaces utilizing curated harmonious color palettes (no generic defaults), clean responsive margins, and glassmorphic designs that look sleek on both mobile viewports and large desktop monitors.",
      bullets: ["Tailwind CSS mobile-first grid systems", "Premium Inter/Poppins typography packages", "Framer Motion micro-animations", "Custom technology SVG icons"],
      image: "https://images.unsplash.com/photo-1541462608141-ad4979e408c9?w=800&auto=format&fit=crop&q=60"
    },
    security: {
      title: "Firestore Security & Rules",
      desc: "Our serverless databases are locked down using complex Firestore rules validating auth tokens. No user can read other client profiles, chat threads, or order details, guaranteeing enterprise-grade compliance.",
      bullets: ["Client UID validation checks", "Restricted admin route guards", "Automatic input structure queries", "Zero SQL injection vulnerability"],
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60"
    },
    media: {
      title: "Cloudinary Image Pipelines",
      desc: "Instead of overloading local hosting bandwidth, image thumbnails and assets are uploaded directly from the client browser to Cloudinary. This returns optimized CDN links which render on your site instantly.",
      bullets: ["Direct unsigned POST uploader presets", "Automatic resolution scaling", "Image format conversion (webp)", "Superfast global CDN delivery"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
    }
  };

  return (
    <div className="bg-[#F9FAFB] relative">
      
      {/* BACKGROUND DECORATIVE GRID OVERLAY & MESH BLURS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb80_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb80_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-primary-200/30 to-indigo-200/30 rounded-full filter blur-[120px] opacity-70"></div>
        <div className="absolute top-[800px] right-1/4 w-[400px] h-[400px] bg-indigo-150/20 rounded-full filter blur-[100px] opacity-40"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-[10px] sm:text-xs font-bold text-primary-700 uppercase tracking-widest shadow-sm"
            >
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span>Full-Stack Development Studio</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-[1.1] tracking-tight"
            >
              Building Premium Web Platforms For <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700">
                Modern Enterprises.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              We bypass templates and bloated CMS systems. DevCraft Studio engineers hand-coded React.js websites, custom eCommerce portals, real-time chats, and CRM dashboard interfaces with exceptional speed and security.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link 
                to="/order" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold tracking-wide shadow-premium transition-all hover:scale-[1.02] active:scale-98 text-sm"
              >
                <span>Launch Your Project</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                to="/services" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold tracking-wide shadow-sm transition-all hover:scale-[1.02] active:scale-98 text-sm"
              >
                <span>Explore Packages</span>
              </Link>
            </motion.div>
          </div>

          {/* Hero Image Section - Premium Glassmorphic GitHub Profile Card */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md"
            >
              <a 
                href="https://github.com/amarb7047/devcraft-studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative group overflow-hidden rounded-3xl bg-white border border-gray-150 p-3 shadow-premium hover:shadow-2xl hover:border-primary-200 transition-all duration-300 cursor-pointer"
              >
                {/* Developer Photo */}
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-50 border border-gray-100">
                  <img 
                    src={homeImg} 
                    alt="Amar Biswas - DevCraft Studio Lead Developer" 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Glass overlay badge for "Verified Developer" */}
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/40 text-[10px] font-bold text-gray-800 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Verified Developer</span>
                  </div>
                </div>

                {/* Glassmorphic GitHub Profile Details Panel */}
                <div className="mt-3 bg-gradient-to-r from-white/70 to-gray-50/70 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center justify-between gap-4 group-hover:bg-white/95 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* Small Round Profile Image */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-200 shrink-0">
                      <img src={homeImg} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-display font-extrabold text-sm text-gray-900 leading-none">Amar Biswas</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                        </svg>
                        <span>@amarb7047</span>
                      </span>
                    </div>
                  </div>

                  {/* View on GitHub Glass Button */}
                  <div className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs shadow-sm group-hover:bg-primary-600 group-hover:shadow-premium transition-all duration-300 flex items-center gap-1.5">
                    <span>GitHub</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </div>
              </a>
            </motion.div>
          </div>

        </div>
      </section>

      {/* TECH STACK LOGOS SCROLLING INFINITE MARQUEE */}
      <section className="py-8 bg-white border-y border-gray-150 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
            ENGINEERED WITH MODERN INDUSTRY STANDARDS
          </span>
        </div>
        
        {/* Scrolling wrap */}
        <div className="flex gap-12 select-none w-max animate-marquee">
          {/* Duplicate set for infinite loop effect */}
          {[1, 2].map((loopIdx) => (
            <div key={loopIdx} className="flex gap-16 items-center">
              {['React.js', 'Next.js', 'Node.js', 'Firebase', 'Tailwind CSS', 'Shopify Storefront', 'WordPress CMS', 'SQLite', 'Cloudinary API'].map((tech, idx) => (
                <span 
                  key={idx} 
                  className="font-display font-extrabold text-sm sm:text-base text-gray-300 hover:text-primary-600 transition-colors cursor-default tracking-tight uppercase"
                >
                  // {tech}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Metric Counters */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10 bg-gray-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CounterItem label="Production Builds Deployed" target="40" suffix="+" />
            <CounterItem label="Bengal & National Clients" target="25" suffix="+" />
            <CounterItem label="Years Web Engineering" target="5" suffix="+" />
          </div>
        </div>
      </section>

      {/* Interactive Core Capabilities Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-150 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-[10px] font-bold text-primary-700 uppercase tracking-widest">
              <Cpu size={12} />
              <span>Full-Stack Capabilities</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight">
              Design. Develop. Deploy.
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              We specialize in custom web architectures that deliver immediate speed, responsiveness, and control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-gray-50/30 p-6 rounded-2xl border border-gray-150 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-200 text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 text-primary-600 flex items-center justify-center mb-5 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-extrabold text-gray-800 text-base mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* INTERACTIVE SPECIFICATIONS TABS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 border-t border-gray-150 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">OPERATIONAL SPECIFICATIONS</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-955">Engineering Details That Matter</h2>
          </div>

          {/* Tab buttons */}
          <div className="flex justify-center gap-2 border-b border-gray-200 pb-3 max-w-md mx-auto">
            {[
              { id: 'ui', label: 'UI/UX Craft', icon: Layout },
              { id: 'security', label: 'Auth & Rules', icon: ShieldCheck },
              { id: 'media', label: 'Cloudinary Presets', icon: ImageIcon }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-premium' 
                      : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content window */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-10 shadow-soft max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[350px]">
            <div className="space-y-5 text-left">
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-gray-900 leading-tight">
                {featureTabsContent[activeFeatureTab].title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                {featureTabsContent[activeFeatureTab].desc}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {featureTabsContent[activeFeatureTab].bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                    <Check size={14} className="text-primary-600 stroke-[3]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-[16/10] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
              <img 
                src={featureTabsContent[activeFeatureTab].image} 
                alt={featureTabsContent[activeFeatureTab].title} 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/30 border-t border-gray-150 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight">
              Why Collaborate With DevCraft?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              We stand for developer-to-client direct relations. No middle managers. No bloated timelines. Just pure technical craft centered around your operational needs.
            </p>
            <div className="space-y-4">
              {[
                { icon: Zap, title: "Next-Gen Speeds", desc: "No bulky engines. We code in lightweight React + Vite architectures." },
                { icon: Target, title: "Fair Manual Payments", desc: "Pay securely via your favorite UPI apps with transparent invoicing." },
                { icon: MessageSquare, title: "Instant Chat Coordination", desc: "Discuss refinements directly using our real-time portal chat." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100 shadow-sm">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                    <p className="text-gray-500 text-xs sm:text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Feature Panel - Split Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Direct Assurance Card */}
            <div className="md:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Smile className="text-primary-600 animate-bounce" size={24} />
                  <h3 className="font-display font-extrabold text-gray-900 text-base sm:text-lg">
                    Client Direct Assurance
                  </h3>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  "Our development workflow centers entirely around transparency. You fill out our custom request builder, receive a fair quote within hours, confirm via standard UPI, and follow code development stages and downloadable invoice files directly inside your secure profile dashboard. No complexity, just code."
                </p>
              </div>
              <div className="border-t border-gray-100 pt-6 mt-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                  AB
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-800 text-sm">Amar Biswas</span>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Lead Developer</span>
                </div>
              </div>
            </div>

            {/* DevCraft Core Engine Mock Card */}
            <div className="md:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 shadow-soft flex flex-col justify-between text-left">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
                  <Code size={18} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-xs text-gray-800">Core Engine</span>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
              
              {/* Mock Dashboard Graph */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-3 flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-medium">Orders Completed</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" />
                    <span>+12.4%</span>
                  </span>
                </div>
                <div className="h-16 flex items-end gap-2.5 pt-2">
                  <div className="w-full bg-gray-200 h-6 rounded"></div>
                  <div className="w-full bg-gray-200 h-10 rounded"></div>
                  <div className="w-full bg-gray-200 h-8 rounded"></div>
                  <div className="w-full bg-primary-600 h-14 rounded shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-150 rounded-xl text-[10px] mt-4">
                <span className="text-gray-400 font-medium">Relations:</span>
                <span className="font-bold text-gray-800">Amar Biswas</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Packages Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-150 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-[10px] font-bold text-primary-700 uppercase tracking-widest">
              <Star size={12} />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight">
              Flexible Development Tiers
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Find the perfect project configuration. Commission-free UPI payment setups with flat rates and zero monthly surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {packages.map((pkg, idx) => (
              <div 
                key={idx}
                className={`bg-white border rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-200 ${
                  pkg.popular 
                    ? 'border-primary-500 ring-2 ring-primary-100 shadow-premium -translate-y-2' 
                    : 'border-gray-200 shadow-soft hover:border-gray-300'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-4.5 py-1 rounded-full border border-white shadow-premium">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  {/* Package Title */}
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-display font-extrabold text-lg text-gray-900">{pkg.name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{pkg.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="border-y border-gray-100 py-4 text-left">
                    <span className="text-3xl font-display font-extrabold text-gray-900">{pkg.price}</span>
                    {pkg.price !== 'Custom Quote' && <span className="text-xs text-gray-400 font-bold ml-1">/ one-time fee</span>}
                  </div>

                  {/* Feature lists */}
                  <div className="space-y-3 text-left">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                        <Check size={14} className="text-primary-600 stroke-[3] shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Link 
                    to="/order" 
                    state={{ selectedService: pkg.name.includes('Enterprise') ? 'Custom Web App' : pkg.name.includes('Scale') ? 'eCommerce Website' : 'Landing Page' }}
                    className={`w-full h-11 flex items-center justify-center rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] ${
                      pkg.popular 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-premium' 
                        : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pkg.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Portfolio Case Studies */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/20 border-t border-gray-150 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-3 text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">CASE STUDY SHOWCASE</span>
              <h2 className="font-display font-extrabold text-3xl text-gray-900 leading-tight">
                Case Studies
              </h2>
            </div>
            
            <Link 
              to="/portfolio" 
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold shadow-sm transition-all"
            >
              <span>Explore All Projects</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-soft hover:shadow-premium group flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-101.5 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[9px] font-extrabold text-primary-600 border border-white">
                      {project.category}
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-2 text-left">
                    <h3 className="font-display font-bold text-gray-800 text-base leading-snug group-hover:text-primary-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {project.description || 'Custom full-stack deployment for digital operations.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex flex-wrap gap-1 border-t border-gray-50 pt-4">
                    {project.techStack?.map((tech, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 rounded bg-gray-50 border border-gray-150 text-gray-400 text-[9px] font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Premium Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-150 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">CLIENT STORIES</span>
            <h2 className="font-display font-extrabold text-3xl text-gray-900 leading-tight">
              Trusted By Growing Brands
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Amar built our boutique's eCommerce store from scratch. The checkout speed is outstanding, and approving invoices via UTR has made tracking manual UPI payments extremely easy. A+ service.",
                author: "Anindita Sen",
                role: "Director, Sen Apparel",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60"
              },
              {
                quote: "We needed a custom CRM lead tracking board. Amar delivered an interactive dashboard using Recharts and Firestore that our sales agents operate effortlessly. Direct contact with the developer was extremely helpful.",
                author: "Gourab Saha",
                role: "Operations Head, Bengal Agro",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
              },
              {
                quote: "Our marketing landing page has scored 100/100 on Google PageSpeed since DevCraft deployed it. Conversions have doubled. I highly recommend their custom React builds over any template.",
                author: "Rakesh Koley",
                role: "Founder, Zenith SaaS",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60"
              }
            ].map((test, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50/30 p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-soft flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed italic">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                    <img src={test.avatar} alt={test.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-xs sm:text-sm">{test.author}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 border-t border-gray-150 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">YOUR QUESTIONS ANSWERED</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqItems.map((item, idx) => (
              <FAQItem 
                key={idx}
                question={item.question}
                answer={item.answer}
                isOpen={openFaqIndex === idx}
                toggleOpen={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* CTA Final Banner */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-600 text-white relative overflow-hidden z-10">
        {/* Background shapes */}
        <div className="absolute inset-0 bg-white/5 opacity-10 filter blur-[80px] rounded-full"></div>
        
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 sm:space-y-8 relative">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Ready to Build Your Custom Platform?
          </h2>
          <p className="text-primary-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Register your client account in a few clicks, configure your target features, and obtain a competitive price quote.
          </p>
          
          <div className="flex justify-center">
            <Link 
              to="/order" 
              className="flex items-center gap-2 px-8 h-14 rounded-full bg-white text-primary-600 hover:bg-gray-50 font-bold tracking-wide shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm"
            >
              <span>Build My Platform</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
