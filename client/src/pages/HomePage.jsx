import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ─── Floating Particle ───────────────────────────────────────────────────────
function Particle({ style }) {
  return <div className="particle" style={style} />;
}

// ─── Counter animation hook ───────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, started }) {
  const count = useCounter(value, 2000, started);
  return (
    <div className="stat-card">
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent, delay }) {
  return (
    <div className="feature-card" style={{ animationDelay: delay }}>
      <div className="feature-icon" style={{ background: accent }}>{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, grade, school, emoji }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-emoji">{emoji}</div>
      <p className="testimonial-quote">"{quote}"</p>
      <div className="testimonial-author">
        <strong>{name}</strong>
        <span>{grade} · {school}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const particles = Array.from({ length: 24 }, (_, i) => ({
    width: `${Math.random() * 8 + 2}px`,
    height: `${Math.random() * 8 + 2}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${Math.random() * 12 + 8}s`,
    opacity: Math.random() * 0.3 + 0.1,
    background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0a0a14;
          --cream: #f8f5ef;
          --quantum: #6366f1;
          --quantum-dark: #4f46e5;
          --quantum-light: #818cf8;
          --gold: #fbbf24;
          --teal: #2dd4bf;
          --coral: #f87171;
          --purple: #8b5cf6;
          --card-bg: #ffffff;
          --muted: #6b7280;
          --border: rgba(0,0,0,0.07);
          --glass-bg: rgba(255, 255, 255, 0.95);
        }

        html { scroll-behavior: smooth; }
        body { 
          font-family: 'Inter', sans-serif; 
          background: var(--cream); 
          color: var(--ink); 
          overflow-x: hidden; 
          line-height: 1.6;
        }

        h1, h2, h3, h4, .nav-logo, .btn-primary, .btn-secondary, .btn-gold {
          font-family: 'Space Grotesk', sans-serif;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 24px 0;
        }
        .nav.scrolled {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          padding: 16px 0;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }
        .nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px;
        }
        .nav-logo {
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 800; 
          font-size: 1.5rem;
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none; 
          display: flex; 
          align-items: center; 
          gap: 10px;
          letter-spacing: -0.02em;
        }
        .logo-dot { 
          width: 12px; 
          height: 12px; 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          border-radius: 50%; 
          display: inline-block;
          box-shadow: 0 0 20px var(--quantum-light);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .nav-links { display: flex; align-items: center; gap: 40px; }
        .nav-link { 
          font-size: 0.95rem; 
          font-weight: 500; 
          color: var(--ink); 
          text-decoration: none; 
          opacity: 0.7; 
          transition: all 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--quantum), var(--purple));
          transition: width 0.3s;
        }
        .nav-link:hover { 
          opacity: 1; 
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-cta {
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; 
          font-size: 0.9rem; 
          padding: 12px 28px; 
          border-radius: 100px;
          text-decoration: none; 
          transition: all 0.3s; 
          letter-spacing: 0.02em;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .nav-cta:hover { 
          transform: translateY(-2px);
          box-shadow: 0 20px 30px -8px rgba(99, 102, 241, 0.4);
        }
        .nav-hamburger { display: none; flex-direction: column; gap: 6px; cursor: pointer; padding: 4px; }
        .nav-hamburger span { 
          width: 24px; 
          height: 2px; 
          background: linear-gradient(90deg, var(--quantum), var(--purple));
          border-radius: 2px; 
          transition: all 0.3s; 
        }
        .mobile-menu {
          display: none; position: fixed; top: 80px; left: 0; right: 0; z-index: 99;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 32px;
          flex-direction: column; gap: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu .nav-link { font-size: 1rem; opacity: 1; }
        .mobile-menu .nav-cta { text-align: center; padding: 14px; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-hamburger { display: flex; }
          .nav-inner { padding: 0 24px; }
        }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          position: relative; 
          overflow: hidden;
          background: linear-gradient(135deg, #f8f5ef 0%, #f0f4ff 50%, #f5f0ff 100%);
          padding: 140px 32px 100px;
        }
        .hero-bg-circle {
          position: absolute; 
          border-radius: 50%; 
          filter: blur(100px); 
          pointer-events: none;
          opacity: 0.5;
        }
        .hero-bg-circle.c1 { 
          width: 600px; 
          height: 600px; 
          background: rgba(99, 102, 241, 0.15); 
          top: -200px; 
          right: -200px; 
          animation: float 20s infinite;
        }
        .hero-bg-circle.c2 { 
          width: 500px; 
          height: 500px; 
          background: rgba(139, 92, 246, 0.12); 
          bottom: -200px; 
          left: -200px;
          animation: float 25s infinite reverse;
        }
        .hero-bg-circle.c3 { 
          width: 400px; 
          height: 400px; 
          background: rgba(251, 191, 36, 0.1); 
          top: 40%; 
          left: 40%;
          animation: float 30s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        .particle {
          position: absolute; 
          border-radius: 50%;
          animation: floatParticle linear infinite;
          pointer-events: none;
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-60vh) rotate(360deg) scale(0.5); }
          90% { opacity: 0.3; }
          100% { transform: translateY(-120vh) rotate(720deg) scale(0); opacity: 0; }
        }

        .hero-inner { 
          max-width: 1000px; 
          margin: 0 auto; 
          text-align: center; 
          position: relative; 
          z-index: 1; 
        }
        .hero-badge {
          display: inline-flex; 
          align-items: center; 
          gap: 10px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 10px 22px; 
          border-radius: 100px; 
          font-size: 0.9rem; 
          font-weight: 500;
          color: var(--quantum-dark); 
          margin-bottom: 32px; 
          animation: fadeUp 0.6s ease both;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
        }
        .badge-dot { 
          width: 8px; 
          height: 8px; 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          border-radius: 50%; 
          animation: pulse 2s infinite; 
        }

        .hero-title {
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 800;
          font-size: clamp(3rem, 8vw, 5.5rem); 
          line-height: 1.05;
          color: var(--ink); 
          margin-bottom: 16px;
          animation: fadeUp 0.7s 0.1s ease both;
          letter-spacing: -0.03em;
        }
        .hero-title .accent { 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative; 
          display: inline-block; 
        }
        .hero-title .accent2 { 
          color: var(--gold); 
        }
        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.3rem); 
          color: var(--muted); 
          font-weight: 400;
          max-width: 600px; 
          margin: 0 auto 48px; 
          line-height: 1.7;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions { 
          display: flex; 
          gap: 20px; 
          justify-content: center; 
          flex-wrap: wrap; 
          animation: fadeUp 0.7s 0.3s ease both; 
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          color: white; 
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; 
          font-size: 1.1rem; 
          padding: 18px 44px; 
          border-radius: 100px;
          text-decoration: none; 
          transition: all 0.3s; 
          letter-spacing: 0.02em; 
          display: inline-flex; 
          align-items: center; 
          gap: 10px;
          box-shadow: 0 20px 30px -8px rgba(99, 102, 241, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-primary:hover { 
          transform: translateY(-3px);
          box-shadow: 0 30px 40px -10px rgba(99, 102, 241, 0.5);
        }
        .btn-secondary {
          background: transparent; 
          color: var(--ink); 
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; 
          font-size: 1.1rem; 
          padding: 18px 44px; 
          border-radius: 100px;
          text-decoration: none; 
          border: 2px solid rgba(99, 102, 241, 0.3); 
          transition: all 0.3s; 
          display: inline-flex; 
          align-items: center; 
          gap: 10px;
          backdrop-filter: blur(10px);
        }
        .btn-secondary:hover { 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          border-color: transparent;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 20px 30px -8px rgba(99, 102, 241, 0.3);
        }

        .hero-visual {
          margin-top: 80px; 
          animation: fadeUp 0.8s 0.4s ease both; 
          position: relative;
        }
        .hero-card-wrap {
          position: relative; 
          max-width: 720px; 
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 32px; 
          padding: 36px;
          box-shadow: 0 40px 80px rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .chat-row { 
          display: flex; 
          gap: 16px; 
          margin-bottom: 20px; 
          align-items: flex-start; 
        }
        .chat-row.right { 
          flex-direction: row-reverse; 
        }
        .chat-avatar { 
          width: 44px; 
          height: 44px; 
          border-radius: 14px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 1.3rem; 
          flex-shrink: 0;
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
        }
        .chat-avatar.ai { 
          background: linear-gradient(135deg, var(--quantum), var(--purple)); 
        }
        .chat-avatar.user { 
          background: linear-gradient(135deg, var(--gold), #f59e0b); 
        }
        .chat-bubble {
          background: rgba(248, 250, 252, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px; 
          padding: 14px 20px;
          font-size: 0.95rem; 
          line-height: 1.6; 
          max-width: 80%; 
          color: var(--ink);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .chat-row.right .chat-bubble { 
          background: linear-gradient(135deg, var(--quantum), var(--purple)); 
          color: white; 
        }
        .chat-label { 
          font-size: 0.75rem; 
          color: var(--muted); 
          font-weight: 500; 
          margin-bottom: 6px; 
          letter-spacing: 0.5px;
        }
        .chat-row.right .chat-label { 
          text-align: right; 
          color: var(--quantum);
        }
        .typing-dots { 
          display: flex; 
          gap: 6px; 
          padding: 14px 20px; 
          background: rgba(248, 250, 252, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px; 
          width: fit-content; 
          border: 1px solid rgba(255,255,255,0.5);
        }
        .typing-dot { 
          width: 8px; 
          height: 8px; 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          border-radius: 50%; 
          animation: typingBounce 1.4s infinite; 
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 
          0%,60%,100% { transform: translateY(0); opacity: 0.4; } 
          30% { transform: translateY(-8px); opacity: 1; } 
        }
        .floating-badge {
          position: absolute; 
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 100px; 
          padding: 12px 22px;
          box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.2); 
          border: 1px solid rgba(255, 255, 255, 0.8);
          display: flex; 
          align-items: center; 
          gap: 10px; 
          font-size: 0.9rem; 
          font-weight: 600; 
          white-space: nowrap;
          color: var(--ink);
        }
        .fb-top-left { top: -20px; left: -30px; animation: floatBadge 4s ease-in-out infinite; }
        .fb-top-right { top: -20px; right: -30px; animation: floatBadge 4s 1s ease-in-out infinite; }
        .fb-bottom { bottom: -20px; left: 50%; transform: translateX(-50%); animation: floatBadgeCentered 4s 0.5s ease-in-out infinite; }
        @keyframes floatBadge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes floatBadgeCentered { 
          0%,100% { transform: translateX(-50%) translateY(0); } 
          50% { transform: translateX(-50%) translateY(-12px); } 
        }

        /* ── STATS ── */
        .stats-section { 
          background: linear-gradient(135deg, var(--ink) 0%, #1a1a2e 100%);
          padding: 100px 32px; 
          position: relative;
          overflow: hidden;
        }
        .stats-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
        }
        .stats-inner { 
          max-width: 1100px; 
          margin: 0 auto; 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 48px; 
          text-align: center; 
          position: relative;
          z-index: 1;
        }
        .stat-number { 
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 800; 
          font-size: 3.5rem; 
          background: linear-gradient(135deg, var(--gold), #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1; 
          margin-bottom: 8px;
        }
        .stat-label { 
          font-size: 1rem; 
          color: rgba(255,255,255,0.6); 
          font-weight: 400; 
          letter-spacing: 0.5px;
        }

        /* ── FEATURES ── */
        .features-section { 
          padding: 120px 32px; 
          background: var(--cream); 
        }
        .section-inner { 
          max-width: 1280px; 
          margin: 0 auto; 
        }
        .section-tag { 
          font-size: 0.9rem; 
          font-weight: 600; 
          letter-spacing: 0.15em; 
          text-transform: uppercase; 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px; 
        }
        .section-title { 
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 800; 
          font-size: clamp(2.5rem, 5vw, 3.5rem); 
          color: var(--ink); 
          margin-bottom: 20px; 
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .section-sub { 
          font-size: 1.1rem; 
          color: var(--muted); 
          max-width: 600px; 
          line-height: 1.7; 
          font-weight: 400; 
          margin-bottom: 64px; 
        }
        .features-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 30px; 
        }
        .feature-card {
          background: white; 
          border-radius: 28px; 
          padding: 40px;
          border: 1px solid var(--border); 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeUp 0.6s ease both;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.03);
        }
        .feature-card:hover { 
          transform: translateY(-10px); 
          box-shadow: 0 40px 60px -15px rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.2);
        }
        .feature-icon { 
          width: 64px; 
          height: 64px; 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 2rem; 
          margin-bottom: 24px;
          box-shadow: 0 15px 30px -8px rgba(99, 102, 241, 0.2);
        }
        .feature-title { 
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 700; 
          font-size: 1.3rem; 
          color: var(--ink); 
          margin-bottom: 12px; 
        }
        .feature-desc { 
          font-size: 1rem; 
          color: var(--muted); 
          line-height: 1.7; 
          font-weight: 400; 
        }

        /* ── HOW IT WORKS ── */
        .how-section { 
          padding: 120px 32px; 
          background: linear-gradient(135deg, #0a0a14 0%, #1a103a 100%);
          position: relative;
          overflow: hidden;
        }
        .how-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
        }
        .how-section .section-title { 
          color: white; 
        }
        .how-section .section-tag { 
          color: var(--gold); 
        }
        .how-section .section-sub { 
          color: rgba(255,255,255,0.5); 
        }
        .steps-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 32px; 
          position: relative;
          z-index: 1;
        }
        .step-card { 
          text-align: center; 
          padding: 40px 24px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }
        .step-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.2);
        }
        .step-number {
          width: 72px; 
          height: 72px; 
          border-radius: 50%; 
          border: 2px solid rgba(251, 191, 36, 0.3);
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 800; 
          font-size: 1.8rem; 
          background: linear-gradient(135deg, var(--gold), #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 auto 24px;
        }
        .step-icon { 
          font-size: 2.5rem; 
          margin-bottom: 20px; 
        }
        .step-title { 
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 700; 
          font-size: 1.3rem; 
          color: white; 
          margin-bottom: 12px; 
        }
        .step-desc { 
          font-size: 0.95rem; 
          color: rgba(255,255,255,0.4); 
          line-height: 1.7; 
        }

        /* ── SUBJECTS ── */
        .subjects-section { 
          padding: 120px 32px; 
          background: var(--cream); 
          overflow: hidden; 
        }
        .subjects-scroll { 
          display: flex; 
          gap: 20px; 
          margin-top: 56px; 
          overflow-x: auto; 
          padding-bottom: 20px; 
          scroll-snap-type: x mandatory; 
          -webkit-overflow-scrolling: touch; 
        }
        .subjects-scroll::-webkit-scrollbar { height: 6px; }
        .subjects-scroll::-webkit-scrollbar-track { background: transparent; }
        .subjects-scroll::-webkit-scrollbar-thumb { 
          background: linear-gradient(90deg, var(--quantum), var(--purple));
          border-radius: 3px; 
        }
        .subject-pill {
          flex-shrink: 0; 
          scroll-snap-align: start;
          background: white; 
          border: 1px solid var(--border); 
          border-radius: 100px;
          padding: 24px 40px; 
          display: flex; 
          flex-direction: row; 
          align-items: center; 
          gap: 16px;
          transition: all 0.3s; 
          cursor: default; 
          min-width: auto;
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.03);
        }
        .subject-pill:hover { 
          transform: translateY(-4px) scale(1.05); 
          box-shadow: 0 20px 30px -8px rgba(99, 102, 241, 0.15); 
          border-color: var(--quantum); 
        }
        .subject-emoji { 
          font-size: 2rem; 
        }
        .subject-name { 
          font-family: 'Space Grotesk', sans-serif; 
          font-size: 1rem; 
          font-weight: 600; 
          color: var(--ink); 
          text-align: center; 
        }

        /* ── TESTIMONIALS ── */
        .testimonials-section { 
          padding: 120px 32px; 
          background: linear-gradient(135deg, #f0ecff 0%, #f8f5ef 100%);
        }
        .testimonials-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 30px; 
          margin-top: 64px; 
        }
        .testimonial-card {
          background: white; 
          border-radius: 28px; 
          padding: 40px;
          border: 1px solid rgba(139,108,247,0.1); 
          transition: all 0.3s;
          box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.05);
        }
        .testimonial-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 30px 60px -15px rgba(99, 102, 241, 0.15); 
          border-color: rgba(99, 102, 241, 0.2);
        }
        .testimonial-emoji { 
          font-size: 3rem; 
          margin-bottom: 20px; 
        }
        .testimonial-quote { 
          font-size: 1rem; 
          color: var(--ink); 
          line-height: 1.8; 
          font-style: italic; 
          font-weight: 400; 
          margin-bottom: 24px; 
        }
        .testimonial-author { 
          display: flex; 
          flex-direction: column; 
          gap: 4px; 
        }
        .testimonial-author strong { 
          font-family: 'Space Grotesk', sans-serif; 
          font-size: 1rem; 
          font-weight: 700; 
          color: var(--ink); 
        }
        .testimonial-author span { 
          font-size: 0.9rem; 
          color: var(--muted); 
        }

        /* ── CTA ── */
        .cta-section {
          padding: 140px 32px; 
          text-align: center;
          background: linear-gradient(135deg, var(--ink) 0%, #1f1449 100%);
          position: relative; 
          overflow: hidden;
        }
        .cta-glow { 
          position: absolute; 
          width: 800px; 
          height: 800px; 
          border-radius: 50%; 
          background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%); 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%,-50%); 
          pointer-events: none; 
        }
        .cta-section .section-title { 
          color: white; 
          margin-bottom: 24px; 
        }
        .cta-section .section-sub { 
          color: rgba(255,255,255,0.5); 
          margin: 0 auto 56px; 
          max-width: 600px; 
        }
        .cta-buttons { 
          display: flex; 
          gap: 24px; 
          justify-content: center; 
          flex-wrap: wrap; 
          position: relative; 
          z-index: 1; 
        }
        .btn-gold {
          background: linear-gradient(135deg, var(--gold), #f59e0b);
          color: var(--ink); 
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; 
          font-size: 1.1rem; 
          padding: 20px 48px; 
          border-radius: 100px;
          text-decoration: none; 
          transition: all 0.3s; 
          display: inline-flex; 
          align-items: center; 
          gap: 10px;
          box-shadow: 0 20px 30px -8px rgba(251, 191, 36, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-gold:hover { 
          transform: translateY(-3px);
          box-shadow: 0 30px 40px -10px rgba(251, 191, 36, 0.4);
        }
        .btn-outline-white {
          background: transparent; 
          color: white; 
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; 
          font-size: 1.1rem; 
          padding: 20px 48px; 
          border-radius: 100px;
          text-decoration: none; 
          border: 2px solid rgba(255,255,255,0.2); 
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }
        .btn-outline-white:hover { 
          background: rgba(255,255,255,0.05); 
          border-color: var(--gold);
          transform: translateY(-3px);
        }

        /* ── FOOTER ── */
        .footer { 
          background: #07070f; 
          padding: 80px 32px 40px; 
          color: rgba(255,255,255,0.4); 
        }
        .footer-inner { 
          max-width: 1280px; 
          margin: 0 auto; 
        }
        .footer-top { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          flex-wrap: wrap; 
          gap: 60px; 
          margin-bottom: 60px; 
        }
        .footer-brand .nav-logo { 
          background: linear-gradient(135deg, var(--quantum), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 1; 
          font-size: 1.8rem;
        }
        .footer-brand p { 
          font-size: 0.95rem; 
          line-height: 1.7; 
          max-width: 320px; 
          margin-top: 16px; 
          color: rgba(255,255,255,0.5);
        }
        .footer-links h4 { 
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 600; 
          font-size: 1rem; 
          letter-spacing: 0.05em; 
          text-transform: uppercase; 
          color: white; 
          margin-bottom: 20px; 
        }
        .footer-links ul { 
          list-style: none; 
          display: flex; 
          flex-direction: column; 
          gap: 14px; 
        }
        .footer-links a { 
          color: rgba(255,255,255,0.4); 
          text-decoration: none; 
          font-size: 0.95rem; 
          transition: all 0.2s; 
        }
        .footer-links a:hover { 
          color: var(--quantum); 
          transform: translateX(5px);
        }
        .footer-bottom { 
          border-top: 1px solid rgba(255,255,255,0.06); 
          padding-top: 32px; 
          display: flex; 
          justify-content: space-between; 
          flex-wrap: wrap; 
          gap: 16px; 
          font-size: 0.9rem; 
          color: rgba(255,255,255,0.3);
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        @media (max-width: 600px) {
          .hero { padding: 120px 20px 60px; }
          .floating-badge { display: none; }
          .footer-top { flex-direction: column; gap: 40px; }
          .hero-title { font-size: 2.8rem; }
          .btn-primary, .btn-secondary, .btn-gold, .btn-outline-white { 
            width: 100%; 
            justify-content: center;
          }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="logo-dot" />
            QuantumEdu
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#subjects" className="nav-link">Subjects</a>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-cta">Get Started →</Link>
          </div>
          <div className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span style={{ transform: menuOpen ? "rotate(45deg) translate(6px,6px)" : "none" }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translate(6px,-6px)" : "none" }} />
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#subjects" className="nav-link" onClick={() => setMenuOpen(false)}>Subjects</a>
        <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
        <Link to="/signup" className="nav-cta" onClick={() => setMenuOpen(false)}>Start Learning Free →</Link>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-circle c1" />
        <div className="hero-bg-circle c2" />
        <div className="hero-bg-circle c3" />
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        <div className="hero-inner">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-Powered Learning Platform for Students
          </div>

          <h1 className="hero-title">
            Learn Smarter with<br />
            <span className="accent">Quantum</span> <span className="accent2">AI</span>
          </h1>

          <p className="hero-subtitle">
            Experience the future of education with personalized AI tutoring, 
            smart book reader, and instant doubt solving — all in one place.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">
              Start Learning Free ✦
            </Link>
            <Link to="/login" className="btn-secondary">
              Watch Demo →
            </Link>
          </div>

          {/* Chat Preview Card */}
          <div className="hero-visual">
            <div className="hero-card-wrap">
              <div className="floating-badge fb-top-left">
                🔥 <span>50K+ Students</span>
              </div>
              <div className="floating-badge fb-top-right">
                ⚡ <span>24/7 AI Support</span>
              </div>
              <div className="floating-badge fb-bottom">
                🏆 <span>94% Grade Improvement</span>
              </div>

              <div className="chat-row">
                <div className="chat-avatar ai">🤖</div>
                <div>
                  <div className="chat-label">Quantum AI</div>
                  <div className="chat-bubble">
                    Hey! Ready to explore Chapter 5 — Quantum Mechanics? I noticed you found wave-particle duality interesting. Want to dive deeper? 🚀
                  </div>
                </div>
              </div>

              <div className="chat-row right">
                <div className="chat-avatar user">👤</div>
                <div>
                  <div className="chat-label">You</div>
                  <div className="chat-bubble">
                    Yes! Can you explain the double-slit experiment with some practice problems?
                  </div>
                </div>
              </div>

              <div className="chat-row">
                <div className="chat-avatar ai">🤖</div>
                <div>
                  <div className="chat-label">Quantum AI</div>
                  <div className="typing-dots">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-inner">
          <StatCard value={50000} suffix="+" label="Active Students" started={statsVisible} />
          <StatCard value={94} suffix="%" label="Grade Improvement" started={statsVisible} />
          <StatCard value={200} suffix="+" label="Subjects Covered" started={statsVisible} />
          <StatCard value={24} suffix="/7" label="AI Availability" started={statsVisible} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="section-tag">✦ Why Students Love QuantumEdu</div>
          <h2 className="section-title">Everything You Need<br />to Excel in Your Studies</h2>
          <p className="section-sub">From AI tutoring to smart book reading, every feature is designed to make learning intuitive, engaging, and effective.</p>
          <div className="features-grid">
            <FeatureCard
              icon="🧠"
              title="Quantum AI Tutor"
              desc="Your personal AI tutor available 24/7. Explains concepts in multiple ways, adapts to your learning style, and never gets tired."
              accent="linear-gradient(135deg, #6366f1, #8b5cf6)"
              delay="0s"
            />
            <FeatureCard
              icon="📖"
              title="Smart Book Reader"
              desc="Read textbooks line-by-line with AI annotations, instant explanations, and interactive summaries on every page."
              accent="linear-gradient(135deg, #2dd4bf, #0d9488)"
              delay="0.1s"
            />
            <FeatureCard
              icon="📷"
              title="Scan & Solve"
              desc="Point your camera at any question from your notebook or textbook and get step-by-step solutions with detailed explanations."
              accent="linear-gradient(135deg, #f87171, #dc2626)"
              delay="0.2s"
            />
            <FeatureCard
              icon="🎯"
              title="Smart Assessments"
              desc="Personalized practice tests generated from your syllabus. Track progress by chapter and topic with detailed analytics."
              accent="linear-gradient(135deg, #fbbf24, #d97706)"
              delay="0.3s"
            />
            <FeatureCard
              icon="📊"
              title="Progress Dashboard"
              desc="Visual insights into your learning journey. See exactly what you've mastered and where to focus next."
              accent="linear-gradient(135deg, #f472b6, #db2777)"
              delay="0.4s"
            />
            <FeatureCard
              icon="🗣️"
              title="Voice Learning"
              desc="Learn with voice commands and get spoken explanations. Perfect for auditory learners and revision on the go."
              accent="linear-gradient(135deg, #60a5fa, #2563eb)"
              delay="0.5s"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <div className="section-tag">✦ Simple Process</div>
          <h2 className="section-title">Start Learning<br />in 4 Easy Steps</h2>
          <p className="section-sub">No complicated setup. Just sign up, set your preferences, and let Quantum AI guide your learning journey.</p>
          <div className="steps-grid">
            {[
              { n: "01", icon: "📝", title: "Create Account", desc: "Sign up with email or Google in seconds. Choose your grade and subjects to personalize your experience." },
              { n: "02", icon: "🔧", title: "Customize Settings", desc: "Set your learning goals, preferred pace, and subjects. Our AI adapts to your unique requirements." },
              { n: "03", icon: "🚀", title: "Start Learning", desc: "Dive into any subject, chat with AI, scan questions, or take assessments. Learning begins immediately." },
              { n: "04", icon: "📈", title: "Track Progress", desc: "Monitor your improvement with detailed analytics. The AI continuously adapts to help you master concepts." },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section className="subjects-section" id="subjects">
        <div className="section-inner">
          <div className="section-tag">✦ Comprehensive Coverage</div>
          <h2 className="section-title">All Subjects,<br />One Platform</h2>
          <p className="section-sub">From Class 1 to 12 — every subject in your curriculum is supported with AI-powered learning materials.</p>
        </div>
        <div className="subjects-scroll">
          {[
            { e: "🧮", n: "Mathematics" },
            { e: "⚛️", n: "Physics" },
            { e: "🧪", n: "Chemistry" },
            { e: "🧬", n: "Biology" },
            { e: "🌍", n: "Geography" },
            { e: "📜", n: "History" },
            { e: "💻", n: "Computer Science" },
            { e: "📗", n: "English" },
            { e: "🏛️", n: "Civics" },
            { e: "📊", n: "Economics" },
            { e: "🎨", n: "Fine Arts" },
            { e: "🌱", n: "Environmental Science" },
            { e: "🔢", n: "Statistics" },
            { e: "🧠", n: "Psychology" },
          ].map(s => (
            <div key={s.n} className="subject-pill">
              <span className="subject-emoji">{s.e}</span>
              <span className="subject-name">{s.n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-tag">✦ Student Success Stories</div>
          <h2 className="section-title">What Our Students Say</h2>
          <div className="testimonials-grid">
            <TestimonialCard
              emoji="🌟"
              quote="My Physics grades improved from 54 to 88 in just one term. The AI explained complex concepts in ways that finally made sense to me."
              name="Priya Sharma"
              grade="Class 11 Science"
              school="Delhi Public School"
            />
            <TestimonialCard
              emoji="🎯"
              quote="I used to struggle with exam anxiety. Now I actually enjoy studying because Quantum AI makes learning feel like a conversation, not a lecture."
              name="Rohan Mehta"
              grade="Class 9"
              school="Kendriya Vidyalaya"
            />
            <TestimonialCard
              emoji="🔥"
              caption="The scan feature is a game-changer. I just photograph any problem I'm stuck on and get instant, detailed solutions with explanations."
              name="Ananya Reddy"
              grade="Class 12 PCM"
              school="Narayana Junior College"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag" style={{ color: "var(--gold)" }}>✦ Ready to Begin?</div>
          <h2 className="section-title">Start Your Quantum<br />Learning Journey Today</h2>
          <p className="section-sub">
            Join thousands of students who are already studying smarter with AI. 
            Free to start — no credit card required.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-gold">Create Free Account ✦</Link>
            <Link to="/login" className="btn-outline-white">Sign In →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="nav-logo">
                <span className="logo-dot" />
                QuantumEdu
              </Link>
              <p>Revolutionizing education through AI-powered personalized learning for students worldwide.</p>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#subjects">Subjects</a></li>
                <li><a href="#how">How it works</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Account</h4>
              <ul>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><a href="#">Student Dashboard</a></li>
                <li><a href="#">Parent Access</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 QuantumEdu. All rights reserved.</span>
            <span>Made with ✦ for students everywhere</span>
          </div>
        </div>
      </footer>
    </>
  );
}