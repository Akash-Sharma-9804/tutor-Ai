import { useState } from "react";
import {
  FaFileContract,
  FaUserCheck,
  FaBan,
  FaGavel,
  FaBalanceScale,
  FaExclamationTriangle,
  FaHandshake,
} from "react-icons/fa";
import AdminFooter from "../../layout/AdminFooter";

const TermsOfServicePage = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FaUserCheck,
      content: `
        <h3 className="dark:text-white">Agreement to Terms</h3>
        <p>By accessing and using the AI Tutor platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
        
        <h4>Eligibility</h4>
        <p>You must be at least 13 years of age to use our services. If you are under 18, you must have parental or guardian consent to use our platform.</p>
        
        <h4>Account Responsibility</h4>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
      `,
    },
    {
      id: "user-obligations",
      title: "User Obligations",
      icon: FaHandshake,
      content: `
        <h3>User Responsibilities</h3>
        <p>As a user of AI Tutor, you agree to:</p>
        
        <h4>Proper Use</h4>
        <ul>
          <li>Use the platform for lawful educational purposes only</li>
          <li>Provide accurate and complete information</li>
          <li>Respect intellectual property rights</li>
          <li>Maintain appropriate conduct in all interactions</li>
        </ul>
        
        <h4>Prohibited Activities</h4>
        <ul>
          <li>Harassing or bullying other users</li>
          <li>Uploading malicious content or viruses</li>
          <li>Attempting to gain unauthorized access</li>
          <li>Violating any applicable laws or regulations</li>
        </ul>
      `,
    },
    {
      id: "content",
      title: "Content & Intellectual Property",
      icon: FaFileContract,
      content: `
        <h3>Ownership and Rights</h3>
        
        <h4>Our Content</h4>
        <p>All educational materials, software, logos, and trademarks on AI Tutor are owned by us or our licensors and are protected by intellectual property laws.</p>
        
        <h4>User Content</h4>
        <p>You retain ownership of any content you submit to the platform. By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, and display your content for educational purposes.</p>
        
        <h4>Third-Party Content</h4>
        <p>We may include content from third parties. Such content is subject to the respective third party's terms and conditions.</p>
      `,
    },
    {
      id: "limitations",
      title: "Limitations & Disclaimers",
      icon: FaBan,
      content: `
        <h3>Service Limitations</h3>
        
        <h4>Availability</h4>
        <p>We strive to maintain 99.9% service availability but cannot guarantee uninterrupted access. We may perform maintenance that temporarily affects availability.</p>
        
        <h4>Educational Purpose</h4>
        <p>AI Tutor is designed for educational purposes only. We do not guarantee specific academic results or outcomes.</p>
        
        <h4>Third-Party Services</h4>
        <p>We may integrate with third-party services. We are not responsible for the content or practices of these services.</p>
      `,
    },
    {
      id: "liability",
      title: "Liability & Indemnification",
      icon: FaBalanceScale,
      content: `
        <h3>Limitation of Liability</h3>
        
        <h4>Direct Damages</h4>
        <p>To the maximum extent permitted by law, AI Tutor shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
        
        <h4>Maximum Liability</h4>
        <p>Our total liability to you for all claims shall not exceed the amount you paid for our services in the last 12 months.</p>
        
        <h4>Indemnification</h4>
        <p>You agree to indemnify and hold harmless AI Tutor from any claims arising from your use of the platform or violation of these terms.</p>
      `,
    },
    {
      id: "termination",
      title: "Termination",
      icon: FaExclamationTriangle,
      content: `
        <h3>Suspension and Termination</h3>
        
        <h4>By You</h4>
        <p>You may terminate your account at any time by contacting our support team or using the account deletion feature.</p>
        
        <h4>By Us</h4>
        <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in prohibited activities.</p>
        
        <h4>Effect of Termination</h4>
        <p>Upon termination, your right to use the platform will immediately cease. Some provisions will survive termination.</p>
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      <div className=" mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
            <FaGavel className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            These terms govern your use of AI Tutor. Please read them carefully.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Terms Sections
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
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="mr-3" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-8 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Important Notice
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These terms constitute a legal agreement between you and AI
                    Tutor.
                  </p>
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
                    Welcome to AI Tutor
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    These Terms of Service ("Terms") govern your access to and
                    use of the AI Tutor platform, including our website,
                    applications, and services (collectively, the "Platform").
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    By accessing or using our Platform, you agree to be bound by
                    these Terms. If you disagree with any part of the terms, you
                    may not access the Platform.
                  </p>
                </div>

                {/* Active Section Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none dark:[&_*]:text-white">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        sections.find((s) => s.id === activeSection)?.content ||
                        "",
                    }}
                  />
                </div>

                {/* Governing Law */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Governing Law
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      These Terms shall be governed and construed in accordance
                      with the laws of the State of California, without regard
                      to its conflict of law provisions.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Any disputes arising under these Terms will be resolved in
                      the state or federal courts located in San Francisco
                      County, California.
                    </p>
                  </div>
                </div>

                {/* Changes to Terms */}
                <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800/30">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle className="text-purple-600 dark:text-purple-400 text-xl" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                        Changes to Terms
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        We reserve the right, at our sole discretion, to modify
                        or replace these Terms at any time. If a revision is
                        material, we will provide at least 30 days' notice prior
                        to any new terms taking effect. What constitutes a
                        material change will be determined at our sole
                        discretion.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                      Contact Us
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                      If you have any questions about these Terms, please
                      contact us at:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Email: legal@aitutor.example.com
                      <br />
                      Phone: +1 (555) 123-4567
                      <br />
                      Address: 123 Education Street, San Francisco, CA 94107
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                      Effective Date
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      These Terms are effective as of{" "}
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      and supersede all prior versions.
                    </p>
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

export default TermsOfServicePage;
