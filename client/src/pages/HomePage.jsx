import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer/Footer";
import {
  Brain, BookOpen, ScanLine, Mic, BarChart3, Trophy,
  Zap, Star, ArrowRight, ChevronDown, Play, CheckCircle,
  Sparkles, GraduationCap, Users, Clock, TrendingUp, Menu, X
} from "lucide-react";

// ─── Google Fonts ────────────────────────────────────────────────────────────
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

    .font-outfit { font-family: 'Outfit', sans-serif; }
    .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
    html { scroll-behavior: smooth; }

    .gradient-text-hero {
      background: linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #bfdbfe 75%, #c4b5fd 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .gradient-text-blue {
      background: linear-gradient(135deg, #60a5fa, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .gradient-text-warm {
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #a3e635);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .card-glass {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .card-glass-light {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148,163,184,0.15);
      box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    }

    .mesh-bg {
      background:
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 85% 80%, rgba(139,92,246,0.12) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 15% 70%, rgba(245,158,11,0.06) 0%, transparent 50%),
        #080d1a;
    }
    .section-dark { background: linear-gradient(180deg, #080d1a 0%, #0c1526 100%); }
    .section-mid { background: linear-gradient(180deg, #0c1526 0%, #080d1a 100%); }
    .section-light { background: linear-gradient(180deg, #f8faff 0%, #f1f5ff 100%); }

    .orbit-ring {
      position: absolute; border-radius: 50%;
      border: 1px solid rgba(99,179,237,0.1);
      animation: orbitSpin linear infinite;
    }
    @keyframes orbitSpin {
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }
    .orbit-dot {
      position: absolute; width: 7px; height: 7px; border-radius: 50%;
      top: -3.5px; left: calc(50% - 3.5px);
    }

    @keyframes twinkle {
      0%,100% { opacity: 0.15; transform: scale(1); }
      50%      { opacity: 0.9; transform: scale(1.6); }
    }
    .star-particle { animation: twinkle linear infinite; }

    @keyframes floatY {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-12px); }
    }
    .float-a { animation: floatY 3.8s ease-in-out infinite; }
    .float-b { animation: floatY 5.2s ease-in-out infinite 1.2s; }
    .float-c { animation: floatY 4.5s ease-in-out infinite 0.6s; }

    .btn-glow-blue {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 6px 28px rgba(59,130,246,0.38);
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .btn-glow-blue:hover {
      box-shadow: 0 10px 44px rgba(59,130,246,0.55);
      transform: translateY(-2px);
    }
    .btn-ghost {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      transition: all 0.25s;
    }
    .btn-ghost:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(99,179,237,0.4);
      transform: translateY(-2px);
    }

    .nav-glass {
      background: rgba(8,13,26,0.7);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    @keyframes shimmerAnim {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .shimmer-line {
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmerAnim 2.5s ease-in-out infinite;
    }

    .typing-cursor::after {
      content: '|'; color: #60a5fa;
      animation: blink 1s step-end infinite;
    }
    @keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0; } }

    .subject-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    .subject-card:hover { transform: translateY(-8px) scale(1.04); }

    @media (max-width: 768px) {
      .orbit-ring { display: none; }
    }
  `}</style>
);

// ─── Typing word rotator ─────────────────────────────────────────────────────
const WORDS = ["Physics", "Chemistry", "Mathematics", "Biology", "History", "Computer Science", "Economics"];
function TypingWord() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = WORDS[idx];
    let t;
    if (!del && text.length < w.length)      t = setTimeout(() => setText(w.slice(0, text.length + 1)), 85);
    else if (!del && text.length === w.length) t = setTimeout(() => setDel(true), 2000);
    else if (del && text.length > 0)           t = setTimeout(() => setText(text.slice(0, -1)), 45);
    else { setDel(false); setIdx(i => (i + 1) % WORDS.length); }
    return () => clearTimeout(t);
  }, [text, del, idx]);
  return <span className="gradient-text-warm font-outfit typing-cursor">{text}</span>;
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, suffix, started }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!started) return;
    let s = null;
    const run = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 2400, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [to, started]);
  return <>{v.toLocaleString()}{suffix}</>;
}

// ─── Stars ───────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 55 }, () => ({
  x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2.2 + 0.4,
  delay: Math.random() * 6, dur: Math.random() * 3 + 2.5,
}));

// ─── Feature data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain, color: "#60a5fa", bgColor: "rgba(96,165,250,0.12)",
    title: "AI Tutor — Always Available",
    desc: "Ask anything, anytime. The AI explains concepts in multiple ways until you truly understand — no judgment, unlimited patience.",
    example: "I asked about Newton's third law 4 different ways and the AI kept rephrasing until it finally clicked for me!",
  },
  {
    icon: BookOpen, color: "#34d399", bgColor: "rgba(52,211,153,0.12)",
    title: "Line-by-Line Book Reader",
    desc: "Read your school textbooks one sentence at a time with AI annotations and instant explanations on every page.",
    example: "Tapped a sentence in my History chapter and the AI instantly explained the full context and why it mattered.",
  },
  {
    icon: ScanLine, color: "#fbbf24", bgColor: "rgba(251,191,36,0.12)",
    title: "Scan & Learn",
    desc: "Photograph any question from your notebook or textbook and get complete step-by-step solutions in seconds.",
    example: "Snapped a photo of a trigonometry problem I was stuck on and got a full worked solution in 3 seconds.",
  },
  {
    icon: BarChart3, color: "#a78bfa", bgColor: "rgba(167,139,250,0.12)",
    title: "Smart Progress Tracking",
    desc: "Visual dashboards show exactly how much you've studied, what you've mastered, and where to focus next.",
    example: "My dashboard showed I was over-studying chapters I already knew — helped me refocus on weak areas instantly.",
  },
  {
    icon: Trophy, color: "#f472b6", bgColor: "rgba(244,114,182,0.12)",
    title: "Personalised Practice Tests",
    desc: "AI-generated tests from your exact syllabus, adapting difficulty as you improve week by week.",
    example: "My practice scores jumped from 62% to 89% in 2 weeks using AI-generated tests from my actual textbooks.",
  },
  {
    icon: Mic, color: "#22d3ee", bgColor: "rgba(34,211,238,0.12)",
    title: "Talk to Your AI Tutor",
    desc: "Voice-based learning for students who prefer listening. Speak your question and get clear spoken answers.",
    example: "I do all my revision during my commute now — just speak to the AI tutor through my earphones.",
  },
];

const SUBJECTS = [
  { e: "➗", n: "Mathematics" }, { e: "⚛️", n: "Physics" },
  { e: "🧪", n: "Chemistry" },  { e: "🧬", n: "Biology" },
  { e: "🌍", n: "Geography" },  { e: "📜", n: "History" },
  { e: "💻", n: "Computer Sci" }, { e: "📗", n: "English" },
  { e: "🏛️", n: "Civics" },    { e: "📊", n: "Economics" },
  { e: "🌱", n: "Env. Science" }, { e: "🎨", n: "Arts" },
];

const STEPS = [
  { n: "01", icon: "✍️", title: "Create Your Account", desc: "Sign up with email or Google in 60 seconds. Select your school and class for a personalised experience." },
  { n: "02", icon: "📚", title: "Pick Your Subjects", desc: "Subjects auto-load based on your class. Class 11 & 12 students choose their specific stream." },
  { n: "03", icon: "🚀", title: "Start with AI Now", desc: "Open a book, chat with your AI tutor, scan a question, or take a practice test — immediately." },
];

const TESTIMONIALS = [
  { quote: "My Physics marks went from 54 to 88 in one term. The AI explained Newton's laws in five different ways until it clicked.", name: "Priya Sharma", grade: "Class 11 Science", school: "Delhi Public School", avatar: "P" },
  { quote: "I used to dread exam season. Now I actually look forward to studying — the AI makes it feel like a real conversation.", name: "Rohan Mehta", grade: "Class 9", school: "Kendriya Vidyalaya", avatar: "R" },
  { quote: "The scan feature is insane. I photograph a problem I'm stuck on and get a full step-by-step walkthrough in seconds.", name: "Ananya Reddy", grade: "Class 12 PCM", school: "Narayana Junior College", avatar: "A" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [statsVis, setStatsVis]       = useState(false);
  const [activeF, setActiveF]         = useState(0);
  const statsRef = useRef(null);
  const heroRef  = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpa = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.35 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveF(p => (p + 1) % FEATURES.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="font-jakarta bg-[#080d1a] text-white overflow-x-hidden">
      <FontStyle />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <motion.nav initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass" : ""}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-glow-blue">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit text-lg font-700 tracking-tight group-hover:text-blue-300 transition-colors">
              QuantumEdu
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {[["Features","#features"],["Subjects","#subjects"],["How it Works","#how"],["About","#about"]].map(([l,h]) => (
              <a key={l} href={h} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-500 text-white">Sign In</Link>
            <Link to="/signup" className="btn-glow-blue px-5 py-2.5 rounded-xl text-sm font-600 text-white flex items-center gap-1.5">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="md:hidden nav-glass border-t border-white/5 overflow-hidden">
              <div className="px-5 py-5 space-y-4">
                {[["Features","#features"],["Subjects","#subjects"],["How it Works","#how"]].map(([l,h]) => (
                  <a key={l} href={h} className="block text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>{l}</a>
                ))}
                <hr className="border-white/10" />
                <Link to="/login" className="block text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" className="block btn-glow-blue px-5 py-3 rounded-xl text-sm font-700 text-white text-center" onClick={() => setMenuOpen(false)}>
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden mesh-bg">

        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((s, i) => (
            <div key={i} className="star-particle absolute rounded-full bg-white"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
                animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
          ))}
        </div>

        {/* Orbit rings */}
        {[420, 620, 820].map((sz, i) => (
          <div key={i} className="orbit-ring"
            style={{ width: sz, height: sz, top: "50%", left: "50%",
              animationDuration: `${18 + i * 14}s`, animationDirection: i % 2 ? "reverse" : "normal" }}>
            <div className="orbit-dot" style={{ background: ["#60a5fa","#a78bfa","#34d399"][i] }} />
          </div>
        ))}

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)" }} />

        <motion.div style={{ y: heroY, opacity: heroOpa }}
          className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center pt-28 pb-12">

          {/* Live badge */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full card-glass mb-7 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-70" />
              <span className="relative rounded-full h-2 w-2 bg-blue-400" />
            </span>
            <span className="text-xs font-600 text-blue-300 tracking-wide font-outfit">
              AI-Powered Learning · For School Students
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="font-outfit text-5xl sm:text-6xl lg:text-[4.5rem] font-800 leading-[1.06] mb-5">
            <span className="gradient-text-hero">Master </span>
            <TypingWord /><br />
            <span className="gradient-text-hero">with Your Personal AI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-9 leading-relaxed font-300">
            Experience school subjects like never before. Your AI tutor understands your pace,
            answers every question, and guides you through every chapter — <em className="text-slate-300">24 hours a day</em>.
          </motion.p>

          {/* Buttons */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.42 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/signup" className="btn-glow-blue px-8 py-4 rounded-2xl font-outfit font-700 text-base text-white flex items-center gap-2 w-full sm:w-auto justify-center">
              <Sparkles className="w-5 h-5" /> Start Learning Free
            </Link>
            <Link to="/login" className="btn-ghost px-8 py-4 rounded-2xl font-outfit font-600 text-base text-white flex items-center gap-2 w-full sm:w-auto justify-center">
              <Play className="w-4 h-4 fill-white" /> Student Login
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            className="flex flex-wrap justify-center gap-5 text-sm text-slate-500 mb-14">
            {["✓ Free to start", "✓ No card needed", "✓ Class 1–12 covered", "✓ 24 / 7 AI"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </motion.div>

          {/* Hero Chat Preview */}
          <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5 }}
            className="relative max-w-[640px] mx-auto">

            {/* Floating chips */}
            <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 3.5, repeat: Infinity }}
              className="hidden sm:flex absolute -top-6 -left-10 card-glass rounded-2xl px-4 py-3 items-center gap-2.5 z-10">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-700 text-white font-outfit">94% improve grades</div>
                <div className="text-[10px] text-slate-500">verified results</div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
              className="hidden sm:flex absolute -top-6 -right-10 card-glass rounded-2xl px-4 py-3 items-center gap-2 z-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-70" />
                <span className="relative rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-xs font-600 text-white font-outfit">AI online · 24 / 7</span>
            </motion.div>

            {/* Chat card */}
            <div className="card-glass rounded-3xl p-5 sm:p-7 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-line pointer-events-none opacity-40 rounded-3xl" />

              {/* Chat header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 btn-glow-blue">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-outfit font-700 text-sm text-white">AI Tutor</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-slate-500">Ready to help</span>
                  </div>
                </div>
                <div className="ml-auto text-[11px] text-slate-600 font-outfit">Physics · Chapter 3</div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base btn-glow-blue">🤖</div>
                  <div className="bg-white/6 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 leading-relaxed max-w-xs">
                    Hey! Ready to continue Newton's Laws? I noticed you found <strong className="text-blue-300">inertia</strong> tricky last session — want a fresh analogy? 🚀
                  </div>
                </div>
                <div className="flex gap-3 items-start justify-end">
                  <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white leading-relaxed max-w-xs"
                    style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}>
                    Yes please! And 3 practice questions after? 💪
                  </div>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base bg-gradient-to-br from-amber-400 to-orange-500">😄</div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base btn-glow-blue">🤖</div>
                  <div className="bg-white/6 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1.5 items-center">
                    {[0, 0.22, 0.44].map(d => (
                      <div key={d} className="w-2 h-2 rounded-full bg-blue-400"
                        style={{ animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div animate={{ y: [0,-7,0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
              className="hidden sm:flex absolute -bottom-5 left-1/2 -translate-x-1/2 card-glass rounded-2xl px-4 py-2.5 items-center gap-2 z-10">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs font-outfit font-700 text-white">50,000+ students learning now</span>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            className="mt-20 flex flex-col items-center gap-1 text-slate-600">
            <span className="text-xs font-outfit tracking-widest uppercase">Explore</span>
            <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 section-mid">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 50000, suf: "+", label: "Active Students", icon: Users, c: "#60a5fa" },
              { val: 94,    suf: "%", label: "Improve Their Grades", icon: TrendingUp, c: "#34d399" },
              { val: 200,   suf: "+", label: "Books & Chapters", icon: BookOpen, c: "#a78bfa" },
              { val: 24,    suf: "/7", label: "AI Always Available", icon: Zap, c: "#fbbf24" },
            ].map(({ val, suf, label, icon: Icon, c }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: c + "15", border: `1px solid ${c}25` }}>
                  <Icon className="w-5 h-5" style={{ color: c }} />
                </div>
                <div className="font-outfit text-3xl sm:text-4xl font-800 mb-1" style={{ color: c }}>
                  <Counter to={val} suffix={suf} started={statsVis} />
                </div>
                <div className="text-xs sm:text-sm text-slate-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 section-dark">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-outfit font-600 mb-5 tracking-widest uppercase">
              ✦ Platform Features
            </div>
            <h2 className="font-outfit text-4xl sm:text-5xl font-800 mb-4">
              <span className="gradient-text-hero">Every Tool You Need</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
              Built around how students actually learn — each feature solves a real problem students face every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="group card-glass rounded-2xl p-7 cursor-default relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 20% 20%, ${f.color}10, transparent 60%)` }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: f.bgColor, border: `1px solid ${f.color}30` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-outfit font-700 text-base text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 section-light">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-600 text-xs font-outfit font-600 mb-5 uppercase tracking-widest">
              ✦ Getting Started
            </div>
            <h2 className="font-outfit text-4xl sm:text-5xl font-800 text-gray-900 mb-4">
              Up & Learning in<br />
              <span className="gradient-text-blue">3 Simple Steps</span>
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">No complicated setup. Sign up, pick your class, and the AI starts teaching immediately.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[calc(33%-16px)] right-[calc(33%-16px)] h-0.5"
              style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
            {STEPS.map(({ n, icon, title, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative">
                <div className="relative inline-flex mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg relative z-10"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}>
                    {icon}
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white shadow border-2 border-blue-400 flex items-center justify-center">
                    <span className="text-[10px] font-outfit font-800 text-blue-500">{n}</span>
                  </div>
                </div>
                <h3 className="font-outfit font-700 text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.5 }} className="text-center mt-14">
            <Link to="/signup" className="inline-flex items-center gap-2 btn-glow-blue px-9 py-4 rounded-2xl font-outfit font-700 text-white">
              <GraduationCap className="w-5 h-5" /> Create My Free Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SUBJECTS ────────────────────────────────────────────────────────── */}
      <section id="subjects" className="py-24 section-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-outfit font-600 mb-5 uppercase tracking-widest">
              ✦ Full Curriculum
            </div>
            <h2 className="font-outfit text-4xl sm:text-5xl font-800 mb-3 gradient-text-hero">
              All Your School Subjects
            </h2>
            <p className="text-slate-500">Class 1 through 12 — every topic, covered by AI</p>
          </motion.div>
        </div>

        {/* Auto-scrolling rows */}
        {[SUBJECTS, [...SUBJECTS].reverse()].map((row, ri) => (
          <motion.div key={ri}
            animate={{ x: ri === 0 ? [0, -200] : [-200, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
            className="flex gap-4 mb-4 px-4">
            {[...row, ...row, ...row].map((s, i) => (
              <div key={i} className="subject-card card-glass rounded-2xl px-6 py-5 flex-shrink-0 text-center min-w-[130px] cursor-default">
                <div className="text-3xl mb-2">{s.e}</div>
                <div className="font-outfit font-700 text-xs text-slate-300">{s.n}</div>
              </div>
            ))}
          </motion.div>
        ))}
      </section>

      {/* ── INTERACTIVE FEATURE EXPLORER ─────────────────────────────────── */}
      <section className="py-24 section-mid relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-outfit font-600 mb-5 uppercase tracking-widest">
              ✦ See It in Action
            </div>
            <h2 className="font-outfit text-4xl sm:text-5xl font-800 gradient-text-hero mb-3">
              AI Features Explored
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">Select any feature to see exactly how it helps you learn</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Selector */}
            <div className="lg:col-span-2 space-y-2">
              {FEATURES.map((f, i) => (
                <motion.button key={i} onClick={() => setActiveF(i)} whileHover={{ x: 3 }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                    activeF === i ? "card-glass border-l-2 bg-white/4" : "hover:bg-white/3 border-l-2 border-transparent"
                  }`}
                  style={ activeF === i ? { borderLeftColor: f.color } : {} }>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: activeF === i ? f.bgColor : "rgba(255,255,255,0.04)",
                      border: `1px solid ${activeF === i ? f.color + "40" : "transparent"}` }}>
                    <f.icon className="w-4 h-4" style={{ color: activeF === i ? f.color : "#475569" }} />
                  </div>
                  <span className={`font-outfit text-sm font-500 ${activeF === i ? "text-white" : "text-slate-500"}`}>
                    {f.title}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Preview panel */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div key={activeF}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}
                  className="card-glass rounded-2xl p-7 h-full min-h-[260px] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: FEATURES[activeF].bgColor, border: `1px solid ${FEATURES[activeF].color}30` }}>
                      {(() => { const I = FEATURES[activeF].icon; return <I className="w-7 h-7" style={{ color: FEATURES[activeF].color }} />; })()}
                    </div>
                    <h3 className="font-outfit text-xl font-700 text-white mb-3">{FEATURES[activeF].title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{FEATURES[activeF].desc}</p>
                  </div>
                  <div className="mt-5 p-4 rounded-xl bg-white/4 border border-white/6">
                    <p className="text-[11px] text-slate-600 mb-1 font-outfit uppercase tracking-wider">Real student example</p>
                    <p className="text-sm text-slate-300 italic">"{FEATURES[activeF].example}"</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-24 section-light">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-600 text-xs font-outfit font-600 mb-5 uppercase tracking-widest">
              ✦ Student Stories
            </div>
            <h2 className="font-outfit text-4xl sm:text-5xl font-800 text-gray-900 mb-2">What Students Say</h2>
            <p className="text-gray-500">Real results from real students across India</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, grade, school, avatar }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="card-glass-light rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-outfit font-800 text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}>{avatar}</div>
                  <div>
                    <div className="font-outfit font-700 text-gray-900 text-sm">{name}</div>
                    <div className="text-[11px] text-gray-400">{grade} · {school}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden section-dark">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.09) 0%, transparent 65%)" }} />
        </div>
        {[320, 520].map((sz, i) => (
          <div key={i} className="orbit-ring"
            style={{ width: sz, height: sz, top: "50%", left: "50%",
              animationDuration: `${18 + i * 10}s`, animationDirection: i % 2 ? "reverse" : "normal" }}>
            <div className="orbit-dot" style={{ background: ["#60a5fa","#a78bfa"][i] }} />
          </div>
        ))}

        <div className="relative max-w-3xl mx-auto px-6 text-center z-10">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-outfit font-600 mb-6 uppercase tracking-widest">
              ✦ Ready to Begin?
            </div>
            <h2 className="font-outfit text-4xl sm:text-6xl font-800 leading-tight mb-5">
              <span className="gradient-text-hero">Your Smarter</span><br />
              <span className="gradient-text-warm">Learning Journey</span><br />
              <span className="gradient-text-hero">Starts Today</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of students already learning smarter with AI.
              Free to get started — no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link to="/signup" className="btn-glow-blue px-10 py-4 rounded-2xl font-outfit font-700 text-lg text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> Create Free Account
              </Link>
              <Link to="/login" className="btn-ghost px-10 py-4 rounded-2xl font-outfit font-600 text-lg text-white flex items-center justify-center gap-2">
                Sign In <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {["50,000+ students", "Always free to start", "All subjects covered", "Class 1–12"].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle className="w-4 h-4 text-green-500" /> {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}