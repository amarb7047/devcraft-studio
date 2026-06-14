import React from 'react';
import { ShieldCheck, Receipt, Landmark } from 'lucide-react';

const LegalLayout = ({ icon: Icon, title, children }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-150 p-8 sm:p-12 shadow-soft">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Icon size={24} />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900">{title}</h1>
        </div>
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy = () => {
  return (
    <LegalLayout icon={ShieldCheck} title="Privacy Policy">
      <p><strong>Last Updated: June 1, 2026</strong></p>
      <p>
        At DevCraft Studio, accessible from devcraft.studio, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DevCraft Studio and how we use it.
      </p>
      
      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">1. Information We Collect</h2>
      <p>
        We collect several types of information to provide and improve our services, including:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Personal Information:</strong> Name, email address, phone number, and project specifications that you submit when signing up, ordering services, or sending a contact request.</li>
        <li><strong>Chat History:</strong> Message exchanges inside our floating chat system to support your project queries and coordinate progress.</li>
        <li><strong>Session Cookies:</strong> We use authentication cookies to keep you safely logged into your client profile. We do not use tracking or advertising cookies.</li>
      </ul>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">2. How We Use Your Information</h2>
      <p>
        The details you share are strictly used to:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Create and maintain your client account dashboard.</li>
        <li>Review service orders and issue manual UPI payment links/invoices.</li>
        <li>Communicate with you directly through chat or phone for developer support.</li>
        <li>Draft and deliver project invoice PDFs.</li>
      </ul>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">3. Data Sharing & Security</h2>
      <p>
        We value your trust. Your personal data is stored securely in our cloud database and is <strong>never sold, leased, or shared</strong> with third parties. Only the system owner/developer (Amar Biswas) can view and process order requirements.
      </p>
      
      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">4. Your Rights</h2>
      <p>
        You have the right to request a copy of the data we store about you or request that we completely erase your account and chat threads from our records. To do so, please reach out to us at:
      </p>
      <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 text-gray-700 space-y-1 mt-4">
        <p className="font-semibold text-gray-900">DevCraft Studio</p>
        <p>Developer: Amar Biswas</p>
        <p>Phone: +91 7047310066</p>
        <p>Location: Krishnagar, West Bengal - 741163</p>
      </div>
    </LegalLayout>
  );
};

export const RefundPolicy = () => {
  return (
    <LegalLayout icon={Receipt} title="Refund & Cancellation Policy">
      <p><strong>Last Updated: June 1, 2026</strong></p>
      <p>
        Please read our cancellation and refund parameters carefully before completing a payment on our platform.
      </p>
      
      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">1. Commenced Development Work</h2>
      <p className="text-red-600 font-medium">
        Once project development work has commenced (meaning your UPI transaction has been approved and marked "In Progress" in the dashboard), NO REFUNDS will be issued under any circumstances.
      </p>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">2. Cancellations Before Commencement</h2>
      <p>
        If you submit a cancellation request before the coding/design phase begins, you may be eligible for a partial refund:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Cancellations within 24 hours of payment: Up to 50% refund, depending on developer time spent organizing files, planning schemas, or consulting.</li>
        <li>Cancellations after 24 hours: No refunds will be considered.</li>
      </ul>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">3. Revisions & Satisfaction</h2>
      <p>
        Dissatisfaction with layouts, design revisions, or custom code modifications are not grounds for a refund. Projects include a set number of revision cycles (established during the quoting phase). All disputes and project refinements are resolved through developer revisions inside the chat widget.
      </p>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">4. Studio Initiated Cancellations</h2>
      <p>
        DevCraft Studio reserves the right to cancel an active order at its sole discretion if a project is deemed unfeasible or if a client violates our code of conduct. If the studio cancels the project, a 100% full refund will be issued to the client's bank account.
      </p>
    </LegalLayout>
  );
};

export const TermsOfService = () => {
  return (
    <LegalLayout icon={Landmark} title="Terms of Service">
      <p><strong>Last Updated: June 1, 2026</strong></p>
      <p>
        Welcome to DevCraft Studio. By visiting our website or purchasing our custom services, you engage in our "Service" and agree to be bound by the following terms and conditions.
      </p>
      
      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">1. Service Booking & Quotes</h2>
      <p>
        Clients submit requests detailing their target website or web app requirements. The developer reviews the specifications, assigns a final custom price quote, and updates the status to "Quoted". Quotes are valid for 14 calendar days from creation.
      </p>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">2. Intellectual Property</h2>
      <p>
        Unless otherwise agreed in a separate written contract, the intellectual property of the final source code and assets is transferred to the client <strong>only after full payment has been completed and verified</strong> by the developer.
      </p>
      <p>
        The developer retains the right to display screenshots, URLs, and descriptions of the completed product in DevCraft Studio's public portfolio for marketing purposes, unless a NDA (Non-Disclosure Agreement) is signed.
      </p>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">3. Third-Party Outages & Licensing</h2>
      <p>
        DevCraft Studio is not responsible for outages, service interruptions, or pricing changes of third-party platforms utilized in your project (e.g. Hostinger, Vercel, Firebase hosting, Cloudinary bandwidth limits, domain registrars, or API providers).
      </p>

      <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl pt-4">4. Governing Law</h2>
      <p>
        These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of your relationship with DevCraft Studio will be subject to the exclusive jurisdiction of courts located in <strong>Krishnagar, West Bengal</strong>.
      </p>
    </LegalLayout>
  );
};
