import React from 'react'
import { motion } from "framer-motion"
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
  ExternalLink,
  Sparkles,
  Star,
  GraduationCap,
  ChevronRight
} from "lucide-react";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  // Quick links
  const quickLinks = [
    { name: "Documentation", href: "/documentation", icon: <ExternalLink className="w-4 h-4" /> },
    { name: "API Reference", href: "#", icon: <ArrowUpRight className="w-4 h-4" /> },
    { name: "System Status", href: "#", icon: <Zap className="w-4 h-4" /> },
    { name: "Changelog", href: "#", icon: <ArrowUpRight className="w-4 h-4" /> },
    { name: "Support Center", href: "#", icon: <ArrowUpRight className="w-4 h-4" /> },
    { name: "Developer Hub", href: "#", icon: <ArrowUpRight className="w-4 h-4" /> },
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
    { icon: <Mail className="w-4 h-4" />, text: "support@adminpro.com", href: "mailto:support@adminpro.com" },
    { icon: <Phone className="w-4 h-4" />, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: <MapPin className="w-4 h-4" />, text: "San Francisco, CA", href: "#" },
  ];

  // Social links
  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter", color: "hover:bg-[#1DA1F2]" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn", color: "hover:bg-[#0A66C2]" },
    { icon: <Github className="w-5 h-5" />, href: "#", label: "GitHub", color: "hover:bg-[#333]" },
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook", color: "hover:bg-[#1877F2]" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram", color: "hover:bg-[#E4405F]" },
  ];

  // System stats
  const systemStats = [
    { label: "Uptime", value: "99.99%", color: "from-green-500 to-emerald-500" },
    { label: "Response Time", value: "48ms", color: "from-blue-500 to-cyan-500" },
    { label: "Active Users", value: "2,847", color: "from-purple-500 to-pink-500" },
    { label: "API Calls", value: "1.2M", color: "from-orange-500 to-red-500" },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
      {/* Background watermark - ADMINPRO */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full"
        >
          {/* Background text - Responsive */}
          <div 
            className="font-black whitespace-nowrap leading-none text-gray-200/70 dark:text-white/5 text-center"
            style={{
              fontSize: 'clamp(2.5rem, 20vw, 12rem)',
              fontFamily: "sans-serif",
              letterSpacing: "normal",
              wordBreak: "normal",
              textRendering: "geometricPrecision",
            }}
          >
            ADMINPRO
          </div>
        </motion.div>
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-0.5 h-0.5 bg-blue-400/30 dark:bg-blue-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Section - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand & Stats - spans 4 on lg */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="  rounded-xl   shadow-lg">
                    <img
    src="/logo3.png"
    alt="QuantumEdu Logo"
    className="w-14 h-14 object-contain"
  />
                  </div>
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 dark:group-hover:opacity-50"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Admin<span className="text-blue-600 dark:text-blue-400">Pro</span>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    Enterprise Dashboard v2.1
                  </p>
                </div>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Professional admin dashboard for managing educational institutions with real-time analytics, advanced security, and comprehensive tools.
              </p>
            </motion.div>
            
            {/* System Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              {systemStats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="group relative cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl blur opacity-0 group-hover:opacity-40 dark:group-hover:opacity-50 transition-opacity duration-300`} />
                  <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 group-hover:border-transparent transition-all duration-300 shadow-sm">
                    <div className={`text-lg font-bold text-transparent bg-gradient-to-r ${stat.color} bg-clip-text`}>{stat.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 lg:col-start-5"
          >
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="group flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                  >
                    <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium text-sm group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {link.name}
                    </span>
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Resources
            </h4>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <motion.a
                    href={resource.href}
                    whileHover={{ x: 5 }}
                    className="group flex items-center justify-between text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 text-sm"
                  >
                    <span className="group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-600 dark:group-hover:from-green-400 dark:group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent">
                      {resource.name}
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              Contact Us
            </h4>
            
            <div className="space-y-4 mb-6">
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={index}
                  href={contact.href}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                    {contact.icon}
                  </div>
                  <span className="text-sm group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 dark:group-hover:from-purple-400 dark:group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {contact.text}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Follow Us
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.2,
                      y: -5,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                    aria-label={social.label}
                  >
                    <div className={`absolute inset-0 ${social.color} rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                    <div className="relative p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                      {social.icon}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-8"
        />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"
          >
            <span>© {currentYear} AdminPro Dashboard. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by Admin Team
            </span>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm"
          >
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR Compliance"].map((item, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.05 }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 relative group whitespace-nowrap"
              >
                {item}
                <motion.span 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
              </motion.a>
            ))}
          </motion.div>

          {/* Version & Status */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">System Online</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">v2.1.4</span>
          </motion.div>
        </div>

        {/* Bottom watermark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500">
            AdminPro Dashboard © {currentYear} | Enterprise Edition
          </p>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        whileHover={{ 
          scale: 1.1,
          y: -5,
          transition: { type: "spring", stiffness: 400 }
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 z-50 group"
        aria-label="Back to top"
      >
        <ArrowUpRight className="h-5 w-5 rotate-45 group-hover:rotate-0 transition-transform" />
      </motion.button>

      {/* Bottom Gradient Accent */}
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      />
    </footer>
  );
};

export default AdminFooter;