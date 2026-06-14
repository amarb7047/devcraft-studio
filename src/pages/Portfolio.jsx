import React, { useState, useEffect } from 'react';
import { db, isMock } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ExternalLink, Grid, LayoutGrid } from 'lucide-react';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock projects for offline/development fallback
  const mockProjects = [
    {
      id: 'mock-1',
      title: 'DevCraft CRM Dashboard',
      description: 'Customer Relationship Portal featuring user analytics, invoice tracking, and direct chat integrations.',
      category: 'CRM',
      techStack: ['React', 'Firebase', 'Tailwind CSS', 'Recharts'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-2',
      title: 'Boutique Apparel Store',
      description: 'Elegant custom online fashion boutique featuring full cart integrations and direct UPI invoices.',
      category: 'eCommerce',
      techStack: ['React', 'Shopify Storefront', 'Tailwind', 'Cloudinary'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-3',
      title: 'SaaS Startup Landing Page',
      description: 'Ultra-fast, high-converting product launch page built for a global marketing automation startup.',
      category: 'Landing Page',
      techStack: ['React', 'Framer Motion', 'Tailwind CSS'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-4',
      title: 'Tech Blog & CMS Platform',
      description: 'A developer blog featuring a custom rich text content editing panel and dynamic image uploads.',
      category: 'CMS',
      techStack: ['React', 'Nodejs', 'Firestore', 'Cloudinary'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-5',
      title: 'Bengali Agro CRM Portal',
      description: 'Bespoke CRM platform tracking lead generation, crop pricing analytics, and direct support WhatsApp logs.',
      category: 'CRM',
      techStack: ['React', 'Firebase', 'Recharts', 'Tailwind'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1595080033112-a50d98938c10?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    },
    {
      id: 'mock-6',
      title: 'Bespoke Gym App Portal',
      description: 'A custom membership web application tracking active subscriptions, fitness goals, and trainer schedules.',
      category: 'Custom',
      techStack: ['React', 'Nodejs', 'Firestore', 'Express'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60',
      liveUrl: 'https://example.com'
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      if (isMock) {
        setProjects(mockProjects);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'portfolio'), where('isVisible', '==', true));
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        
        if (list.length === 0) {
          setProjects(mockProjects);
        } else {
          setProjects(list);
        }
      } catch (error) {
        console.error("Error loading portfolio projects:", error);
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const tabs = ['All', 'eCommerce', 'CRM', 'CMS', 'Landing Page', 'Custom'];

  // Filter projects based on selected tab
  const filteredProjects = activeTab === 'All' 
    ? projects 
    : projects.filter(p => p.category?.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="bg-[#F9FAFB] py-16 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-display font-extrabold text-4xl text-gray-900 leading-tight">
            Our Work Showcase
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Explore our portfolio of custom web solutions built for startups, businesses, and custom client platforms.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 border-b border-gray-150 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-premium'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-primary-600 hover:bg-primary-50/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl p-8">
            <LayoutGrid size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-display font-bold text-gray-700 text-lg mb-2">No projects found</h3>
            <p className="text-gray-400 text-sm">No items match the selected filter category at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-soft hover:shadow-premium group flex flex-col transition-all duration-200"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden shrink-0">
                  <img 
                    src={project.thumbnailUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-extrabold text-primary-600 uppercase tracking-widest border border-white">
                    {project.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack?.map((tech, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action */}
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        <span>View Live Project</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Portfolio;
