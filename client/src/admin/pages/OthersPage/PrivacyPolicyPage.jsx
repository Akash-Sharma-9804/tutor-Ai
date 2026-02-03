import { useState } from "react";
import { FaShieldAlt, FaLock, FaUserShield, FaDatabase, FaEye, FaExchangeAlt } from "react-icons/fa";
import AdminFooter from "../../layout/AdminFooter";

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState("data-collection");

  const sections = [
    {
      id: "data-collection",
      title: "Data Collection",
      icon: FaDatabase,
      content: `
        <h3>Information We Collect</h3>
        <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
        
        <h4>Personal Information</h4>
        <ul>
          <li>Name, email address, and contact information</li>
          <li>School and educational institution details</li>
          <li>Academic records and performance data</li>
          <li>Usage patterns and preferences</li>
        </ul>
        
        <h4>Automatically Collected Information</h4>
        <ul>
          <li>IP addresses and device information</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
          <li>Cookies and similar technologies</li>
        </ul>
      `
    },
    {
      id: "data-usage",
      title: "Data Usage",
      icon: FaEye,
      content: `
        <h3>How We Use Your Data</h3>
        <p>We use the information we collect for the following purposes:</p>
        
        <h4>Educational Services</h4>
        <ul>
          <li>Personalize learning experiences</li>
          <li>Track academic progress and performance</li>
          <li>Provide targeted educational content</li>
          <li>Facilitate communication between students and teachers</li>
        </ul>
        
        <h4>System Improvement</h4>
        <ul>
          <li>Improve our educational platform</li>
          <li>Develop new features and services</li>
          <li>Conduct research and analysis</li>
          <li>Ensure system security and stability</li>
        </ul>
        
        <h4>Communication</h4>
        <ul>
          <li>Send important updates and notifications</li>
          <li>Respond to inquiries and support requests</li>
          <li>Provide educational resources and materials</li>
          <li>Share important announcements</li>
        </ul>
      `
    },
    {
      id: "data-protection",
      title: "Data Protection",
      icon: FaShieldAlt,
      content: `
        <h3>Our Security Measures</h3>
        <p>We implement comprehensive security measures to protect your data:</p>
        
        <h4>Technical Safeguards</h4>
        <ul>
          <li>End-to-end encryption for sensitive data</li>
          <li>Secure socket layer (SSL) technology</li>
          <li>Regular security audits and updates</li>
          <li>Firewall protection and intrusion detection</li>
        </ul>
        
        <h4>Administrative Controls</h4>
        <ul>
          <li>Strict access controls and authentication</li>
          <li>Regular staff training on data protection</li>
          <li>Data breach response procedures</li>
          <li>Privacy by design approach</li>
        </ul>
        
        <h4>Data Retention</h4>
        <p>We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including for legal, accounting, or reporting requirements.</p>
      `
    },
    {
      id: "user-rights",
      title: "User Rights",
      icon: FaUserShield,
      content: `
        <h3>Your Rights and Choices</h3>
        <p>You have the following rights regarding your personal data:</p>
        
        <h4>Access and Control</h4>
        <ul>
          <li>Right to access your personal data</li>
          <li>Right to correct inaccurate data</li>
          <li>Right to delete your data (with limitations)</li>
          <li>Right to restrict or object to processing</li>
        </ul>
        
        <h4>Data Portability</h4>
        <ul>
          <li>Right to receive your data in a structured format</li>
          <li>Right to transfer data to another service</li>
          <li>Right to withdraw consent at any time</li>
        </ul>
        
        <h4>Complaints</h4>
        <p>You have the right to lodge a complaint with a supervisory authority if you believe your data protection rights have been violated.</p>
      `
    },
    {
      id: "data-sharing",
      title: "Data Sharing",
      icon: FaExchangeAlt,
      content: `
        <h3>Third-Party Sharing</h3>
        <p>We may share your information in the following circumstances:</p>
        
        <h4>Educational Partners</h4>
        <ul>
          <li>Schools and educational institutions</li>
          <li>Teachers and administrators</li>
          <li>Educational service providers</li>
        </ul>
        
        <h4>Legal Requirements</h4>
        <ul>
          <li>When required by law or legal process</li>
          <li>To protect our rights and property</li>
          <li>In emergency circumstances</li>
          <li>To prevent fraud or security issues</li>
        </ul>
        
        <h4>Service Providers</h4>
        <p>We work with trusted third-party service providers who assist us in operating our platform. These providers are contractually obligated to protect your data and use it only for the services they provide to us.</p>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Header */}
      <div className=" mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Policy Sections
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                          activeSection === section.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="mr-3" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Need Help?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Contact our Data Protection Officer
                  </p>
                  <a
                    href="mailto:dpo@aitutor.example.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    dpo@aitutor.example.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                {/* Introduction */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Introduction
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    At AI Tutor, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    By accessing or using AI Tutor, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                  </p>
                </div>

                {/* Active Section Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none dark:[&_*]:text-white">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: sections.find(s => s.id === activeSection)?.content || '' 
                    }}
                  />
                </div>

                {/* Additional Information */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Data Protection Officer
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Email: dpo@aitutor.example.com<br />
                        Phone: +1 (555) 123-4567
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Headquarters
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        AI Tutor Inc.<br />
                        123 Education Street<br />
                        San Francisco, CA 94107
                      </p>
                    </div>
                  </div>
                </div>

                {/* Update Notice */}
                <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaShieldAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                        Policy Updates
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" md:-mx-8 -mx-4">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;