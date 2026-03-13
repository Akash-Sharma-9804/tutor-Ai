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
  Zap,
  ChevronRight,
  Star,
  Target,
  Trophy,
 TrendingUp 
} from "lucide-react"

const Footer = () => {
  const currentYear = 2026
  
  // Quick links
  const quickLinks = [
    
    { name: "About", icon: <Users className="w-4 h-4" />, href: "#" },
    { name: "Privacy Policy", icon: <Shield className="w-4 h-4" />, href: "#" },
    { name: "Terms of Service", icon: <BookOpen className="w-4 h-4" />, href: "#" },
    { name: "Security", icon: <Shield className="w-4 h-4" />, href: "#" },
    { name: "Cookie Policy", icon: <Sparkles className="w-4 h-4" />, href: "#" },
  ]

  // Company info
  const companyInfo = [
    { icon: <Mail className="w-4 h-4" />, text: "your@email.com", href: "mailto:your@email.com" },
    { icon: <MapPin className="w-4 h-4" />, text: "Wilmington, DE 19801, USA", href: "#" },
  ]

  // Social links
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
  ]

// Features
const features = [
  { 
    icon: <Zap className="w-4 h-4" />, 
    text: "AI-Powered Personalized Learning", 
    color: "from-yellow-500 to-orange-500" 
  },
  { 
    icon: <Brain className="w-4 h-4" />, 
    text: "Smart Skill Assessment", 
    color: "from-purple-500 to-pink-500" 
  },
  { 
    icon: <BookOpen className="w-4 h-4" />, 
    text: "Interactive Courses & Projects", 
    color: "from-blue-500 to-cyan-500" 
  },
  { 
    icon: <TrendingUp className="w-4 h-4" />, 
    text: "Career Growth Tracking", 
    color: "from-green-500 to-emerald-500" 
  },
];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
      {/* Large background text - QUANTUMEDU with blinking dots - SMALLER ON MOBILE */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full"
        >
          {/* Blinking dots around the text - smaller on mobile */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 dark:bg-blue-400"
              style={{
                left: `${3 + (i * 8)}%`,
                top: i % 2 === 0 ? '-10px' : 'auto',
                bottom: i % 2 !== 0 ? '-10px' : 'auto',
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.5, 0.8],
                backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#3B82F6'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Additional floating dots - smaller on mobile */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`float-dot-${i}`}
              className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 rounded-full bg-purple-500 dark:bg-purple-400"
              style={{
                left: `${5 + (i * 10)}%`,
                top: i % 2 === 0 ? '-15px' : 'auto',
                bottom: i % 2 !== 0 ? '-15px' : 'auto',
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.3, 0.8],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Background text - MUCH SMALLER ON MOBILE */}
          <div 
            className="font-black whitespace-nowrap leading-none text-gray-200/70 dark:text-white/5 text-center"
            style={{
              fontSize: 'clamp(2.5rem, 18vw, 10rem)',
              fontFamily: "sans-serif",
              letterSpacing: "normal",
              wordBreak: "normal",
              textRendering: "geometricPrecision",
            }}
          >
            QUANTUMEDU
          </div>
        </motion.div>
      </div>

      {/* Simple animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle floating particles */}
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
        
        {/* Simple gradient orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main footer content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Logo and description */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4"
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="relative">
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
                <motion.h2 
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  QuantumEdu
                </motion.h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  A subsidiary of QuantumHash Corporation
                </p>
              </div>
            </motion.div>
            
          <p className="text-black dark:text-gray-100 mb-8 leading-relaxed">
  QuantumEdu is an AI-driven eLearning platform designed to deliver personalized
  courses, real-time insights, and career-focused learning to help you grow faster.
</p>

            {/* Feature badges with bright hover */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.08,
                    y: -5,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  className="group relative cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl blur opacity-0 group-hover:opacity-40 dark:group-hover:opacity-50 transition-opacity duration-300`} />
                  <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 group-hover:border-transparent transition-all duration-300 shadow-sm">
                    <div className={`text-transparent bg-gradient-to-r ${feature.color} bg-clip-text group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                      {feature.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 lg:col-start-5"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              STAY IN THE LOOP
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 8 }}
                    className="group flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                  >
                    <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {link.name}
                    </span>
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 lg:col-start-9"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              CONTACT US
            </h3>
            
            <div className="space-y-4 mb-8">
              {companyInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.href}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                    {info.icon}
                  </div>
                  <span className="text-sm group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 dark:group-hover:from-purple-400 dark:group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {info.text}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Newsletter with bright hover */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-50 dark:group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative p-5 rounded-xl bg-white dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 group-hover:border-transparent transition-all duration-300 shadow-sm">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Subscribe for updates
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group/btn overflow-hidden px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow-lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Subscribe
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
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

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
         
          {/* Social links with bright hover */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.2,
                  y: -5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
                aria-label={social.label}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                  {social.icon}
                </div>
              </motion.a>
            ))}
          </div>

          {/* Legal links with bright hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm"
          >
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.05 }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 relative group"
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
        </div>

        {/* Company name at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500">
            QuantumEdu © {currentYear} | All rights reserved. A subsidiary of QuantumHash Corporation
          </p>
        </motion.div>
      </div>

      {/* Back to top button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        whileHover={{ 
          scale: 1.1,
          y: -5,
          transition: { type: "spring", stiffness: 400 }
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 z-50 group"
      >
        <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* Bottom gradient accent */}
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      />
    </footer>
  )
}

export default Footer