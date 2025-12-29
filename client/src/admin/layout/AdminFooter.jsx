import { 
  Heart, 
  Shield, 
  Zap, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Github,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  // Quick links
  const quickLinks = [
    { name: "Documentation", href: "#", icon: <ExternalLink className="h-3 w-3" /> },
    { name: "API Reference", href: "#", icon: <ArrowUpRight className="h-3 w-3" /> },
    { name: "System Status", href: "#", icon: <Zap className="h-3 w-3" /> },
    { name: "Changelog", href: "#", icon: <ArrowUpRight className="h-3 w-3" /> },
    { name: "Support Center", href: "#", icon: <ArrowUpRight className="h-3 w-3" /> },
    { name: "Developer Hub", href: "#", icon: <ArrowUpRight className="h-3 w-3" /> },
  ];

  // Resources
  const resources = [
    { name: "Knowledge Base", href: "#" },
    { name: "Video Tutorials", href: "#" },
    { name: "Community Forum", href: "#" },
    { name: "System Requirements", href: "#" },
    { name: "Security Whitepaper", href: "#" },
    { name: "Compliance Docs", href: "#" },
  ];

  // Contact info
  const contactInfo = [
    { icon: <Mail className="h-4 w-4" />, text: "support@adminpro.com", href: "mailto:support@adminpro.com" },
    { icon: <Phone className="h-4 w-4" />, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: <MapPin className="h-4 w-4" />, text: "San Francisco, CA", href: "#" },
  ];

  // Social links
  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter", color: "hover:bg-blue-500" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn", color: "hover:bg-blue-600" },
    { icon: <Github className="h-5 w-5" />, href: "#", label: "GitHub", color: "hover:bg-gray-800" },
    { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook", color: "hover:bg-blue-700" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
  ];

  // System stats
  const systemStats = [
    { label: "Uptime", value: "99.99%", color: "text-green-500" },
    { label: "Response Time", value: "48ms", color: "text-blue-500" },
    { label: "Active Users", value: "2,847", color: "text-purple-500" },
    { label: "API Calls", value: "1.2M", color: "text-orange-500" },
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin<span className="text-blue-600 dark:text-blue-400">Pro</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enterprise Dashboard v2.1
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Professional admin dashboard for managing educational institutions with real-time analytics, advanced security, and comprehensive tools.
            </p>
            
            {/* System Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {systemStats.map((stat, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group text-sm"
                  >
                    {link.icon}
                    <span>{link.name}</span>
                    <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Resources
            </h4>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <a
                    href={resource.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group text-sm flex items-center justify-between"
                  >
                    <span>{resource.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              Contact Us
            </h4>
            <div className="space-y-3 mb-6">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group text-sm"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    {contact.icon}
                  </div>
                  <span>{contact.text}</span>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Follow Us
              </p>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${social.color} hover:text-white transition-all duration-300`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <span>© {currentYear} AdminPro Dashboard. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by Admin Team
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Cookie Policy
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              GDPR Compliance
            </a>
          </div>

          {/* Version & Status */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">System Online</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">v2.1.4</span>
          </div>
        </div>

        {/* Back to Top Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all z-50"
          aria-label="Back to top"
        >
          <ArrowUpRight className="h-5 w-5 rotate-45" />
        </motion.button>
      </div>

      {/* Bottom Gradient Accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
};

export default AdminFooter;