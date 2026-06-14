import React from 'react';
import { Target, Eye, Code2, Heart, Award, GraduationCap } from 'lucide-react';

const SkillBar = ({ skill, percentage }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs sm:text-sm font-semibold">
        <span className="text-gray-700">{skill}</span>
        <span className="text-primary-600">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
        <div 
          className="h-full bg-primary-600 rounded-full transition-all duration-1000" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="bg-[#F9FAFB] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Profile Card Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Avatar Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border border-gray-200 shadow-premium group">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60" 
                alt="Amar Biswas" 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <h3 className="font-display font-extrabold text-lg sm:text-xl">Amar Biswas</h3>
                <p className="text-xs text-primary-200 font-medium tracking-wide uppercase">Lead Full-Stack Architect</p>
              </div>
            </div>
          </div>

          {/* Biography Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700 uppercase tracking-wider">
              <Code2 size={12} />
              <span>Developer Profile</span>
            </div>
            
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight">
              Crafting High-End Web Software Since 2021
            </h1>
            
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Hello! I'm <strong>Amar Biswas</strong>, a passionate full-stack developer based in Krishnagar, West Bengal. I specialize in building custom single-page applications, administrative dashboards, and eCommerce stores with clean, serverless architectures.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              At DevCraft Studio, we bypass the bloated agency workflows and deliver direct, transparent developer-to-client solutions. We write scalable layouts using React, Firestore database rule validations, and Cloudinary media pipelines.
            </p>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-150 pt-6">
              <div className="text-center sm:text-left">
                <span className="block font-display font-extrabold text-2xl text-primary-600">40+</span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Deploys</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block font-display font-extrabold text-2xl text-primary-600">5+</span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Years Exp</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block font-display font-extrabold text-2xl text-primary-600">100%</span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">UPI Trust</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-150 rounded-2xl p-8 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Target size={22} />
            </div>
            <h3 className="font-display font-extrabold text-gray-800 text-lg sm:text-xl">Our Mission</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              To empower startups and small business owners with bespoke React architectures that load instantly, streamline day-to-day administrative tasks, and convert visitors into active customers without the enterprise price tag.
            </p>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-8 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Eye size={22} />
            </div>
            <h3 className="font-display font-extrabold text-gray-800 text-lg sm:text-xl">Our Vision</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              To establish DevCraft Studio as the premier direct developer service in Bengal and pan-India, recognized for transparent, local-first workflows, and premium front-end interfaces that set new design benchmarks.
            </p>
          </div>
        </section>

        {/* Tech Stack Skills Section */}
        <section className="bg-white border border-gray-150 rounded-2xl p-8 sm:p-12 shadow-soft space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 leading-tight">
              Technical Skill Matrix
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Our core development skills are balanced between visual layout fidelity and database speed/security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <SkillBar skill="React.js (Vite)" percentage={95} />
              <SkillBar skill="Tailwind CSS / Styling" percentage={95} />
              <SkillBar skill="JavaScript (ES6+) & TypeScript" percentage={90} />
            </div>
            <div className="space-y-4">
              <SkillBar skill="Firebase Web SDK / Auth / rules" percentage={88} />
              <SkillBar skill="Node.js & Express REST APIs" percentage={90} />
              <SkillBar skill="Firestore & SQL Schemas" percentage={85} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
