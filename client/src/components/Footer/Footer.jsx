import React from 'react'
import { motion } from "framer-motion"
import { 
  Brain, 
  MessageSquare, 
  Rocket, 
  Sparkles, 
  Award,
  BookOpen,
  Users,
  Globe,
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Heart,
  ArrowUpRight,
  GraduationCap,
  Lightbulb,
  Zap
} from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  // Quick links
  const quickLinks = [
    { name: "AI Tutor", icon: <Brain className="w-4 h-4" />, href: "#" },
    { name: "Live Classes", icon: <MessageSquare className="w-4 h-4" />, href: "#" },
    { name: "Practice Tests", icon: <BookOpen className="w-4 h-4" />, href: "#" },
    { name: "Study Plans", icon: <Rocket className="w-4 h-4" />, href: "#" },
    { name: "Achievements", icon: <Award className="w-4 h-4" />, href: "#" },
    { name: "Community", icon: <Users className="w-4 h-4" />, href: "#" },
  ]

  // Subject categories
  const subjects = [
    { name: "Mathematics", color: "text-blue-500" },
    { name: "Science", color: "text-green-500" },
    { name: "Computer Science", color: "text-pink-500" },
    { name: "Social Studies", color: "text-orange-500" },
    { name: "Physics", color: "text-indigo-500" },
    { name: "English", color: "text-purple-500" },
    { name: "Chemistry", color: "text-teal-500" },
    { name: "Biology", color: "text-lime-500" },
    
  ]

  // Social links
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", color: "hover:bg-blue-500" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", color: "hover:bg-sky-500" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", color: "hover:bg-pink-500" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", color: "hover:bg-blue-600" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", color: "hover:bg-red-500" },
  ]

  // Contact info
  const contactInfo = [
    { icon: <Mail className="w-4 h-4" />, text: "support@aitutor.com" },
    // { icon: <Phone className="w-4 h-4" />, text: "+1 (555) 123-4567" },
    { icon: <MapPin className="w-4 h-4" />, text: "San Francisco, CA" },
  ]

  // Features
  const features = [
    { icon: <Zap className="w-4 h-4" />, text: "AI Powered Learning" },
    { icon: <Shield className="w-4 h-4" />, text: "100% Safe & Secure" },
    { icon: <Globe className="w-4 h-4" />, text: "Available 24/7" },
    { icon: <GraduationCap className="w-4 h-4" />, text: "Certified Tutors" },
  ]

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/50 to-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 border-t-2 border-gray-100 dark:border-gray-800 mt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 dark:bg-blue-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main footer content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top section with logo and features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Logo and description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="relative ">
                  <div className="text-4xl">🎓</div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI Tutor
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For Grades 4-10
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Making learning fun, engaging, and effective with AI-powered tutoring for students worldwide. 
              Join thousands of successful learners today!
            </p>

            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="text-blue-500 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <a
                    href={link.href}
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Subjects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Subjects
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <a
                    href="#"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md ${subject.color}`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-sm font-medium">{subject.name}</span>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact & Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              Contact Us
            </h3>
            
            <div className="space-y-4 mb-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {info.icon}
                  </div>
                  <span className="text-sm">{info.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Newsletter */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Get Learning Tips!
                </p>
                <div className="flex flex-col gap-2 max-w-full">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Join
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-8"
        />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm"
          >
            <span>© {currentYear} AI Tutor Pro. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> for students
            </span>
          </motion.div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 ${social.color} hover:text-white transition-all shadow-sm hover:shadow-lg`}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          {/* Legal links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm"
          >
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
          </motion.div>
        </div>

        {/* Floating back to top button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all z-50"
        >
          <Rocket className="w-5 h-5" />
        </motion.button>

        {/* Stats badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="fixed bottom-6 left-6 hidden lg:block"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30"></div>
            <div className="relative px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Learners</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">10,245+</p>
                </div>
                <Sparkles className="w-4 h-4 text-yellow-500 ml-2" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  )
}

export default Footer