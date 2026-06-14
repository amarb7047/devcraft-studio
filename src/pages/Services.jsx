import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, LineChart, Layers, Layout, Code, Monitor, Cpu, Settings, Check } from 'lucide-react';

// Inline SVGs for official technology logos
const TechLogos = {
  React: () => (
    <svg className="w-5 h-5 text-[#61DAFB]" viewBox="0 0 255.5 221" fill="currentColor">
      <path d="M79 110.5c0-3.9 3-23 16-45.5 16.5-28.5 38-45 52.5-45 13.5 0 20.5 12.3 20.5 26.5 0 8.2-5.7 26.8-21 51.5-16.5 26.5-37 42.5-51 42.5-14 0-17-12-17-30zm68-98c-23.5 0-50.5 19-75.5 50.5-26 33-39.5 67.5-39.5 86 0 32.5 13 49.5 34 49.5 22.5 0 49-18 73-47.5 28.5-35 41-71 41-90 0-33.5-12.5-48.5-33-48.5z" />
      <path d="M148.5 110.5c0 3.9-3 23-16 45.5-16.5 28.5-38 45-52.5 45-13.5 0-20.5-12.3-20.5-26.5 0-8.2 5.7-26.8 21-51.5 16.5-26.5 37-42.5 51-42.5 14 0 17 12 17 30zm-68 98c23.5 0 50.5-19 75.5-50.5 26-33 39.5-67.5 39.5-86 0-32.5-13-49.5-34-49.5-22.5 0-49 18-73 47.5-28.5 35-41 71-41 90 0 33.5 12.5 48.5 33 48.5z" />
      <circle cx="127.8" cy="110.5" r="19.3" />
    </svg>
  ),
  Nodejs: () => (
    <svg className="w-5 h-5 text-[#339933]" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128 0L37.8 52.1v104.2L128 208.4l90.2-52.1V52.1L128 0zm68 142.1l-68 39.3-68-39.3V63.9l68-39.3 68 39.3v78.2z" />
    </svg>
  ),
  Shopify: () => (
    <svg className="w-5 h-5 text-[#96BF48]" viewBox="0 0 256 256" fill="currentColor">
      <path d="M228.3 75.9L146.4 15c-4.4-4-11.4-4-15.8 0L48.8 75.9c-2.3 2.1-3.6 5-3.6 8.2v105.7c0 3.1 1.3 6.1 3.6 8.2l81.9 60.9c4.4 4 11.4 4 15.8 0l81.9-60.9c2.3-2.1 3.6-5 3.6-8.2V84.1c-.1-3.2-1.4-6.1-3.7-8.2z" />
    </svg>
  ),
  WordPress: () => (
    <svg className="w-5 h-5 text-[#21759B]" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm0 244.7c-59.5 0-108.3-45.1-115.6-103.3l59.4 162.7c16.3 7 34.3 10.9 53.2 10.9 2.1 0 4.1-.1 6.2-.2L54.4 75.5c24.6 71.9 51.5 149.2 51.5 149.2l12.4-38.2L91.4 96.6c-4.4-12.8-8.8-19.1-13.2-22.1l-2.2-1.6 30-1.6 30 1.6-2.2 1.6c-4.4 3-8.8 9.3-13.2 22.1l26.9 86.8 17-52.6-11.9-34.2c-4-11.5-8-17.1-11.9-19.8l-1.9-1.4 23.4-1.6 23.4 1.6-2 1.4c-4 2.8-8 8.3-11.9 19.8l11.9 34.2 11.9-34.2c4-11.5 8-17.1 11.9-19.8l1.9-1.4 23.4-1.6 23.4 1.6-2 1.4c-4 2.8-8 8.3-11.9 19.8l17 52.6 15.6-47.8c3.2-9.7 6.3-16.7 9.4-20.9l1.4-2 21.2-1.6c4.9 0 9.7.2 14.5.6-6.1 43.1-23.7 82.2-49.8 113.8L243.6 128c0-64.4-51.8-116.7-115.6-116.7z" />
    </svg>
  ),
  Firebase: () => (
    <svg className="w-5 h-5 text-[#FFCA28]" viewBox="0 0 256 256" fill="currentColor">
      <path d="M40.2 187.8l38.2-237.9c1-6.1 6.9-10.2 13-9.2 4.1.7 7.6 3.4 8.9 7.3l25.8 77.2L40.2 187.8z" />
      <path d="M215.8 187.8l-25.2-149.4c-1-6.1-6.9-10.2-13-9.2-4.1.7-7.6 3.4-8.9 7.3l-28.7 86 75.8 65.3z" />
    </svg>
  ),
  Tailwind: () => (
    <svg className="w-5 h-5 text-[#06B6D4]" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128 48C70.6 48 24 94.6 24 152s46.6 104 104 104 104-46.6 104-104S185.4 48 128 48zm0 180c-41.9 0-76-34.1-76-76s34.1-76 76-76 76 34.1 76 76-34.1 76-76 76z" />
    </svg>
  )
};

const Services = () => {
  const servicesList = [
    {
      icon: ShoppingBag,
      title: 'eCommerce Website',
      description: 'Full-featured online store with intuitive cart structures, product management grids, custom checkouts, and clean admin reporting tools.',
      features: ['Secure Cart & Checkout', 'Product Inventory CRUD', 'Order Tracking system', 'Discount Code integration', 'Manual UPI/UTR approvals'],
      tech: ['React', 'Firebase', 'Shopify API', 'Tailwind'],
      price: 'Starting at ₹25,000',
    },
    {
      icon: LineChart,
      title: 'CRM System',
      description: 'Tailored Customer Relationship Management portals built to track client pipeline details, sales logs, staff permissions, and operations.',
      features: ['Lead capture forms', 'Visual pipeline dashboards', 'Client activity logs', 'Internal follow-up notes', 'Role-based access controls'],
      tech: ['React', 'Firestore', 'Tailwind', 'Recharts'],
      price: 'Starting at ₹40,000',
    },
    {
      icon: Layers,
      title: 'CMS Platform',
      description: 'Robust Content Management Systems built to allow non-technical teams to instantly update pages, draft blogs, and organize media.',
      features: ['Rich text editing panel', 'Upload presets (Cloudinary)', 'Blog categories & tags', 'Publish scheduler', 'SEO tag fields'],
      tech: ['React', 'Cloudinary', 'Nodejs', 'Firestore'],
      price: 'Starting at ₹30,000',
    },
    {
      icon: Monitor,
      title: 'Business Website',
      description: 'Professional, multi-page company portfolio websites designed to establish authority, display core services, and capture leads.',
      features: ['Responsive hero layouts', 'Interactive service grids', 'Team profiles & bios', 'Contact forms & maps', 'Highly optimized SEO build'],
      tech: ['React', 'Framer Motion', 'Tailwind', 'Firestore'],
      price: 'Starting at ₹15,000',
    },
    {
      icon: Layout,
      title: 'Landing Page',
      description: 'High-converting single pages engineered for specific marketing campaigns, SaaS launches, or visual product showcases.',
      features: ['Sticky navigation links', 'Feature highlight sections', 'High-impact CTA blocks', 'FAQ drop-down items', 'Google Analytics tags'],
      tech: ['React', 'Tailwind CSS', 'Framer Motion'],
      price: 'Starting at ₹8,000',
    },
    {
      icon: Code,
      title: 'Custom Web App',
      description: 'Bespoke, complex web software designed from scratch to solve specific operational requirements or product ideas.',
      features: ['Tailored data model structures', 'Bespoke routing patterns', 'Real-time updates & tables', 'Custom exports (PDF/CSV)', 'Secure data encryption'],
      tech: ['React.js', 'Node.js', 'Firestore', 'Tailwind'],
      price: 'Custom Quote',
    },
    {
      icon: Cpu,
      title: 'Admin Dashboard',
      description: 'Operational control centers featuring data charts, detailed filters, activity logs, and system configuration metrics.',
      features: ['Analytical line/bar charts', 'Interactive sorting tables', 'System setting toggles', 'CSV invoice exports', 'System security rules'],
      tech: ['React', 'Recharts', 'Firestore', 'Tailwind'],
      price: 'Starting at ₹20,000',
    },
    {
      icon: Settings,
      title: 'API Integration',
      description: 'Bespoke third-party API hookups. Integrate webhooks, messaging modules (SMS/WhatsApp), mailing arrays, or analytics scripts.',
      features: ['REST/GraphQL endpoints', 'Secure token environments', 'Auto-cron job routines', 'Error logging diagnostics', 'Detailed webhook mapping'],
      tech: ['Node.js', 'Express', 'Firebase', 'Axios'],
      price: 'Starting at ₹10,000',
    }
  ];

  return (
    <div className="bg-[#F9FAFB] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-display font-extrabold text-4xl text-gray-900 leading-tight">
            Our Development Services
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            We deliver hand-crafted, high-performance web applications using the absolute best modern developer tools. Find the package that matches your operational needs.
          </p>
        </div>

        {/* Tech Stack Banner */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-soft flex flex-col items-center gap-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            Standard Technology Stack We Support
          </span>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
            {[
              { name: 'React', svg: TechLogos.React },
              { name: 'Node.js', svg: TechLogos.Nodejs },
              { name: 'Shopify', svg: TechLogos.Shopify },
              { name: 'WordPress', svg: TechLogos.WordPress },
              { name: 'Firebase', svg: TechLogos.Firebase },
              { name: 'Tailwind CSS', svg: TechLogos.Tailwind },
            ].map((logo, idx) => (
              <div key={idx} className="flex items-center gap-2 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all cursor-default">
                <logo.svg />
                <span className="font-display font-bold text-sm text-gray-800">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesList.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-gray-150 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Header Card */}
                <div className="p-8 border-b border-gray-100 flex-grow">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                      {service.price}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-extrabold text-gray-900 text-lg mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  {/* Features Bullet */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Features Included:</span>
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Check size={14} className="text-primary-600 stroke-[3]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    {service.tech.map((techItem, i) => (
                      <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-md">
                        {techItem}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    to="/order" 
                    state={{ selectedService: service.title }}
                    className="px-5 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Lead Capture Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-premium">
          <div className="absolute inset-0 bg-white/5 opacity-10 filter blur-3xl rounded-full"></div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">
            Need a Completely Custom Architecture?
          </h2>
          <p className="text-primary-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            We are experts in bespoke full-stack systems. If you have unique business workflows, custom dashboards, or payment rules, let's build it together.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/order" 
              className="px-8 py-3 rounded-full bg-white text-primary-600 hover:bg-gray-50 font-bold text-sm shadow-md transition-transform hover:scale-105"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Services;
