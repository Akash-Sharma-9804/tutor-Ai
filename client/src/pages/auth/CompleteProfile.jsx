// CompleteProfile.jsx — Fixed & Polished
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, School, Users, CalendarDays, PhoneCall,
  BookMarked, CheckCircle, Sparkles, Brain,
  ChevronRight, ChevronLeft, Search, Loader2,
  Check, Zap, Target, Shield, UserCircle
} from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";

const API = import.meta.env.VITE_BACKEND_URL;

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .cp-root  { font-family: 'DM Sans', sans-serif; }
    .cp-head  { font-family: 'Bricolage Grotesque', sans-serif; }

    /* ── Left panel ─────────────────────────────────────── */
    .cp-left {
      background: linear-gradient(155deg, #0b1f30 0%, #0e2d45 50%, #0b2035 100%);
      position: relative;
      overflow: hidden;
    }
    .cp-left::before {
      content: '';
      position: absolute; inset: 0;
      background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 26px 26px;
      pointer-events: none;
    }

    /* Step nodes */
    .sn-done   { background:#0d9488; border:2px solid #0d9488; color:#fff; }
    .sn-active { background:#ffffff; border:2px solid #0d9488; color:#0b1f30;
                 box-shadow: 0 0 0 4px rgba(13,148,136,0.22); }
    .sn-idle   { background:rgba(255,255,255,0.06); border:2px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.35); }

    .sl-done { background:#0d9488; }
    .sl-idle { background:rgba(255,255,255,0.1); }

    /* ── Right panel ────────────────────────────────────── */
    .cp-right { background:#f4f7fb; }

    /* ── Inputs ─────────────────────────────────────────── */
    .cp-inp {
      width:100%; padding:0.8rem 1rem;
      background:#ffffff; border:1.5px solid #dde3ed;
      border-radius:11px; font-family:'DM Sans',sans-serif;
      font-size:0.9rem; color:#0f172a; outline:none;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .cp-inp:focus  { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.13); }
    .cp-inp::placeholder { color:#a0aec0; }
    .cp-inp:disabled { background:#f1f5f9; cursor:not-allowed; color:#a0aec0; }

    select.cp-inp {
      appearance:none; cursor:pointer;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 13px center;
      padding-right:2.5rem;
    }

    /* ── Labels ─────────────────────────────────────────── */
    .cp-lbl {
      display:flex; align-items:center; gap:6px;
      font-size:0.72rem; font-weight:600; letter-spacing:0.06em;
      text-transform:uppercase; color:#64748b; margin-bottom:7px;
    }

    /* ── Gender pills ───────────────────────────────────── */
    .g-pill {
      flex:1; padding:0.75rem 0.5rem; text-align:center;
      border:1.5px solid #dde3ed; border-radius:11px;
      background:#fff; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:0.875rem; font-weight:500; color:#64748b;
      transition:all 0.18s ease;
    }
    .g-pill:hover { border-color:#0d9488; color:#0f172a; background:#f0fdfb; }
    .g-pill.gsel  { border-color:#0d9488; background:#f0fdfb; color:#0f766e;
                    font-weight:600; box-shadow:0 0 0 3px rgba(13,148,136,0.13); }

    /* ── Subject chips ──────────────────────────────────── */
    .s-chip {
      display:inline-flex; align-items:center; gap:6px;
      padding:0.45rem 0.85rem; border-radius:100px;
      border:1.5px solid #dde3ed; background:#fff;
      cursor:pointer; font-family:'DM Sans',sans-serif;
      font-size:0.8rem; font-weight:500; color:#64748b;
      transition:all 0.16s cubic-bezier(0.34,1.56,0.64,1);
      white-space:nowrap;
    }
    .s-chip:hover { border-color:#0d9488; transform:translateY(-2px); color:#0f172a; }
    .s-chip.ssel  { border-color:#0d9488; background:#f0fdfb; color:#0f766e;
                    font-weight:600; box-shadow:0 2px 8px rgba(13,148,136,0.18); }

    /* ── Primary button ─────────────────────────────────── */
    .cp-btn {
      flex:1; padding:0.9rem 1rem;
      background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);
      color:#fff; border:none; border-radius:12px;
      font-family:'Bricolage Grotesque',sans-serif; font-size:0.95rem; font-weight:600;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 5px 20px rgba(13,148,136,0.28);
      transition:all 0.2s; position:relative; overflow:hidden;
    }
    .cp-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(13,148,136,0.38); }
    .cp-btn:disabled { opacity:0.55; cursor:not-allowed; }
    .cp-btn::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
      background-size:200% 100%;
      animation:shimBtn 2.5s ease-in-out infinite;
    }
    @keyframes shimBtn { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    /* ── Back button ────────────────────────────────────── */
    .cp-back {
      padding:0.85rem 1.2rem;
      background:#fff; color:#64748b;
      border:1.5px solid #dde3ed; border-radius:12px;
      font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:500;
      cursor:pointer; display:flex; align-items:center; gap:5px;
      transition:all 0.18s;
    }
    .cp-back:hover { border-color:#0d9488; color:#0d9488; }

    /* ── Success screen ─────────────────────────────────── */
    .success-bg {
      background:linear-gradient(145deg,#0b1f30 0%,#0e2d45 60%,#0b3030 100%);
    }
    @keyframes popIn {
      0%   { transform:scale(0.4); opacity:0; }
      70%  { transform:scale(1.08); }
      100% { transform:scale(1); opacity:1; }
    }
    .pop-in { animation:popIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* ── Confetti ───────────────────────────────────────── */
    @keyframes cffall {
      0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
      100% { transform:translateY(110vh)  rotate(720deg); opacity:0; }
    }

    /* ── Scrollbar ──────────────────────────────────────── */
    .thin-scroll { scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent; }
    .thin-scroll::-webkit-scrollbar { width:4px; height:4px; }
    .thin-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }

    @keyframes spin { to { transform:rotate(360deg); } }
    .spin { animation:spin 1s linear infinite; }

    /* ── Mobile step indicator ──────────────────────────── */
    .m-step-dot { height:6px; border-radius:3px; transition:all 0.3s; }
  `}</style>
);

/* ─── Confetti ───────────────────────────────────────────────────────────── */
const CF_COLORS = ["#0d9488","#f59e0b","#6366f1","#ec4899","#22d3ee","#84cc16"];
function Confetti({ x, delay, color, circle }) {
  return (
    <div style={{
      position:"fixed", left:`${x}%`, top:-14,
      width: circle ? 10 : 7, height: circle ? 10 : 13,
      borderRadius: circle ? "50%" : 2, background: color,
      animation:`cffall ${2.2 + Math.random()*1.2}s ease-in ${delay}s forwards`,
      zIndex:60, pointerEvents:"none",
    }} />
  );
}

/* ─── Steps config ───────────────────────────────────────────────────────── */
const STEPS = [
  { id:1, label:"Your School",    icon:School,        color:"#0d9488", desc:"Where do you study?" },
  { id:2, label:"Your Class",     icon:GraduationCap, color:"#6366f1", desc:"Which class are you in?" },
  { id:3, label:"About You",      icon:UserCircle,    color:"#f59e0b", desc:"Tell us about yourself" },
  { id:4, label:"Stay Connected", icon:PhoneCall,     color:"#ec4899", desc:"Your contact details" },
];

/* ─── Left sidebar ───────────────────────────────────────────────────────── */
function LeftPanel({ step }) {
  const pct = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="cp-left" style={{ width:300, flexShrink:0, display:"flex",
      flexDirection:"column", padding:"2.25rem 1.75rem", minHeight:"100vh" }}>

      {/* Animated glow blob */}
      <motion.div
        animate={{ scale:[1,1.2,1], opacity:[0.15,0.25,0.15] }}
        transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
        style={{ position:"absolute", top:"35%", left:"50%", translate:"-50% -50%",
          width:280, height:280, borderRadius:"50%", pointerEvents:"none",
          background:"radial-gradient(circle, rgba(13,148,136,0.4) 0%, transparent 70%)" }}
      />

      {/* Brand */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"2.5rem", position:"relative" }}>
        <div style={{ width:36, height:36, borderRadius:9,
          background:"linear-gradient(135deg,#0d9488,#0f766e)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 3px 12px rgba(13,148,136,0.4)" }}>
          <Brain style={{ width:19, height:19, color:"#fff" }} />
        </div>
        <span className="cp-head" style={{ color:"#ffffff", fontWeight:700, fontSize:"1.05rem" }}>
          QuantumEdu
        </span>
      </div>

      {/* Dynamic headline */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-10 }} transition={{ duration:0.3 }}
          style={{ position:"relative", marginBottom:"1.75rem" }}>
          <p style={{ fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.1em",
            color:"#5eead4", textTransform:"uppercase", marginBottom:8 }}>
            Step {step} of {STEPS.length}
          </p>
          <h2 className="cp-head" style={{ fontSize:"1.55rem", fontWeight:800,
            color:"#ffffff", lineHeight:1.2, marginBottom:8 }}>
            {step === 1 && "Your School"}
            {step === 2 && "Your Class"}
            {step === 3 && "About You"}
            {step === 4 && "Stay Connected"}
          </h2>
          <p style={{ fontSize:"0.87rem", color:"rgba(255,255,255,0.45)", lineHeight:1.55 }}>
            {STEPS[step-1].desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress ring */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:"2rem", position:"relative" }}>
        <svg width={60} height={60} viewBox="0 0 60 60">
          <circle cx={30} cy={30} r={24} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
          <motion.circle cx={30} cy={30} r={24} fill="none"
            stroke="#0d9488" strokeWidth={5} strokeLinecap="round"
            strokeDasharray={150.8}
            animate={{ strokeDashoffset: 150.8 - (pct / 100) * 150.8 }}
            initial={{ strokeDashoffset: 150.8 }}
            transition={{ duration:0.55, ease:"easeInOut" }}
            style={{ transform:"rotate(-90deg)", transformOrigin:"30px 30px" }} />
          <text x={30} y={35} textAnchor="middle" fill="#ffffff"
            style={{ fontSize:12, fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700 }}>
            {pct}%
          </text>
        </svg>
        <div>
          <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.35)", marginBottom:3 }}>
            Profile complete
          </p>
          <p className="cp-head" style={{ color:"#ffffff", fontWeight:700, fontSize:"0.9rem" }}>
            {pct === 0 ? "Let's begin! 🚀" : pct < 50 ? "Good start!" : pct < 100 ? "Almost there!" : "All done! ✓"}
          </p>
        </div>
      </div>

      {/* Step ladder */}
      <div style={{ position:"relative" }}>
        {STEPS.map((s, i) => {
          const done   = step > s.id;
          const active = step === s.id;
          const Icon   = s.icon;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div className={`sn-${done ? "done" : active ? "active" : "idle"}`}
                  style={{ width:34, height:34, borderRadius:"50%",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, transition:"all 0.3s" }}>
                  {done
                    ? <Check style={{ width:14, height:14 }} />
                    : <Icon style={{ width:14, height:14 }} />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`sl-${done ? "done" : "idle"}`}
                    style={{ width:2, height:30, borderRadius:2, margin:"3px 0",
                      transition:"background 0.4s" }} />
                )}
              </div>
              <div style={{ paddingTop:7, paddingBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                <p style={{ fontSize:"0.82rem", fontWeight:600, lineHeight:1,
                  color: active ? "#ffffff" : done ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                  transition:"color 0.3s" }}>
                  {s.label}
                </p>
                {active && (
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                    style={{ fontSize:"0.7rem", color:"#5eead4", marginTop:2 }}>
                    In progress
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex:1 }} />

      {/* Trust badges */}
      <div style={{ display:"flex", flexDirection:"column", gap:9, position:"relative" }}>
        {[
          { icon:Shield, text:"Your data is safe & private" },
          { icon:Zap,    text:"Takes less than 2 minutes" },
          { icon:Target, text:"Personalised just for you" },
        ].map(({ icon:Ic, text }) => (
          <div key={text} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Ic style={{ width:12, height:12, color:"#5eead4", flexShrink:0 }} />
            <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.3)" }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Field wrapper ──────────────────────────────────────────────────────── */
function Field({ label, icon:Icon, required, children }) {
  return (
    <div>
      <label className="cp-lbl">
        {Icon && <Icon style={{ width:12, height:12, color:"#0d9488" }} />}
        {label}{required && <span style={{ color:"#f43f5e", marginLeft:1 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Error message ──────────────────────────────────────────────────────── */
function Err({ msg }) {
  return (
    <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
      style={{ fontSize:"0.75rem", color:"#e11d48", marginTop:5,
        display:"flex", alignItems:"center", gap:5 }}>
      <span style={{ width:4, height:4, borderRadius:"50%",
        background:"#e11d48", display:"inline-block", flexShrink:0 }} />
      {msg}
    </motion.p>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const studentId = location.state?.studentId || new URLSearchParams(location.search).get("studentId");
  const token     = location.state?.token     || new URLSearchParams(location.search).get("token") || localStorage.getItem("token");

  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState({ schoolName:"", className:"", gender:"", dob:"", phone:"" });
  const [schools, setSchools]         = useState([]);
  const [classes, setClasses]         = useState([]);
  const [selClassId, setSelClassId]   = useState(null);
  const [subjects, setSubjects]       = useState([]);
  const [selSubs, setSelSubs]         = useState([]);
  const [subQ, setSubQ]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [errors, setErrors]           = useState({});
  const [confetti, setConfetti]       = useState([]);

  const UPPER = /^(11|12)(\s*[\(\s]*(Science|Arts|Commerce)[\)]*)?$/i;
  const isUpper = UPPER.test(form.className?.trim());
  const filteredSubs = subjects.filter(s =>
    s.name.toLowerCase().includes(subQ.toLowerCase())
  );

  useEffect(() => {
    if (!studentId) navigate("/login");
    axios.get(`${API}/api/data/schools`).then(r => setSchools(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selClassId && isUpper) {
      setSelSubs([]);
      axios.get(`${API}/api/subjects/class/${selClassId}`)
        .then(r => setSubjects(r.data))
        .catch(() => setSubjects([]));
    } else { setSubjects([]); setSelSubs([]); }
  }, [selClassId, form.className]);

  const validate = (s) => {
    const e = {};
    if (s === 1 && !form.schoolName) e.schoolName = "Please select your school";
    if (s === 2) {
      if (!form.className) e.className = "Please select your class";
      if (isUpper && selSubs.length === 0) e.subjects = "Select at least one subject";
    }
    if (s === 3) {
      if (!form.gender) e.gender = "Please select your gender";
      if (!form.dob)    e.dob    = "Please enter your date of birth";
    }
    if (s === 4) {
      if (!form.phone)  e.phone  = "Please enter your phone number";
      else if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-\+]/g,"")))
        e.phone = "Enter a valid phone number";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (step < STEPS.length) { setStep(s => s + 1); }
    else handleSubmit();
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/complete-profile`,
        { studentId, ...form },
        { headers: { Authorization:`Bearer ${token}` } }
      );
      if (isUpper && selSubs.length > 0) {
        await axios.post(`${API}/api/subjects/student/select`,
          { subjectIds: selSubs },
          { headers: { Authorization:`Bearer ${token}` } }
        );
      }
      dispatch(loginSuccess({ token, student: res.data.student }));
      setConfetti(Array.from({ length:50 }, (_,i) => ({
        id:i, x:Math.random()*100, delay:Math.random()*0.9,
        color:CF_COLORS[i % CF_COLORS.length], circle:Math.random()>0.5
      })));
      setDone(true);
      await new Promise(r => setTimeout(r, 2800));
      navigate("/", { replace:true });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to save. Please try again." });
    } finally { setLoading(false); }
  };

  /* ── Step content ────────────────────────────────────────────────────── */
  const stepForms = {
    1: (
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <Field label="Select Your School" icon={School} required>
          <select className="cp-inp" value={form.schoolName}
            onChange={e => {
              const sc = schools.find(s => s.name === e.target.value);
              setForm({ ...form, schoolName:e.target.value, className:"" });
              setClasses([]); setSelClassId(null);
              if (sc) axios.get(`${API}/api/school/${sc.id}`)
                .then(r => setClasses(Array.isArray(r.data) ? r.data : r.data.data || []))
                .catch(console.error);
            }}>
            <option value="">Choose your school…</option>
            {schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          {errors.schoolName && <Err msg={errors.schoolName} />}
          <AnimatePresence>
            {form.schoolName && (
              <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }}
                style={{ display:"flex", alignItems:"center", gap:6, marginTop:8,
                  fontSize:"0.78rem", color:"#0d9488", fontWeight:500 }}>
                <CheckCircle style={{ width:13, height:13 }} />
                {form.schoolName}
              </motion.div>
            )}
          </AnimatePresence>
        </Field>

        {/* Feature pills */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:4 }}>
          {[
            { icon:Target, t:"Personalised learning" },
            { icon:Brain,  t:"AI-powered tutor" },
            { icon:Zap,    t:"Smart study plans" },
          ].map(({ icon:Ic, t }) => (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:5,
              padding:"0.4rem 0.8rem", borderRadius:100, background:"#e8f5f3",
              fontSize:"0.72rem", color:"#0f766e", fontWeight:500 }}>
              <Ic style={{ width:12, height:12 }} /> {t}
            </div>
          ))}
        </div>
      </div>
    ),

    2: (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <Field label="Select Your Class" icon={GraduationCap} required>
          <select className="cp-inp" value={selClassId || ""}
            disabled={!form.schoolName}
            onChange={e => {
              const cls = classes.find(c => String(c.id) === e.target.value);
              setSelClassId(e.target.value);
              setForm({ ...form, className: cls ? cls.class_name : "" });
            }}>
            <option value="">{form.schoolName ? "Select your class…" : "Select school first"}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
          {errors.className && <Err msg={errors.className} />}
        </Field>

        <AnimatePresence>
          {isUpper && subjects.length > 0 && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
              exit={{ opacity:0, height:0 }} transition={{ duration:0.3 }} style={{ overflow:"hidden" }}>
              <Field label="Select Your Subjects" icon={BookMarked} required>
                {/* Search */}
                <div style={{ position:"relative", marginBottom:10 }}>
                  <Search style={{ position:"absolute", left:11, top:"50%", translate:"0 -50%",
                    width:14, height:14, color:"#a0aec0" }} />
                  <input className="cp-inp" placeholder="Search subjects…"
                    value={subQ} onChange={e => setSubQ(e.target.value)}
                    style={{ paddingLeft:"2rem" }} />
                </div>
                {/* Chips */}
                <div className="thin-scroll"
                  style={{ display:"flex", flexWrap:"wrap", gap:7, maxHeight:155,
                    overflowY:"auto", padding:"2px 1px 4px" }}>
                  {filteredSubs.map(sub => {
                    const sel = selSubs.includes(sub.id);
                    return (
                      <motion.button key={sub.id} type="button"
                        onClick={() => setSelSubs(p =>
                          p.includes(sub.id) ? p.filter(x => x !== sub.id) : [...p, sub.id])}
                        whileTap={{ scale:0.94 }}
                        className={`s-chip ${sel ? "ssel" : ""}`}>
                        {sel && <Check style={{ width:11, height:11, flexShrink:0 }} />}
                        {sub.name}
                      </motion.button>
                    );
                  })}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginTop:8, fontSize:"0.72rem", color:"#a0aec0" }}>
                  <span>{selSubs.length} selected</span>
                  <span style={{ color:"#0d9488" }}>Minimum 1 required</span>
                </div>
                {errors.subjects && <Err msg={errors.subjects} />}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),

    3: (
      <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
        <Field label="Gender" icon={Users} required>
          <div style={{ display:"flex", gap:10 }}>
            {["Male","Female"].map(g => (
              <motion.button key={g} type="button" whileTap={{ scale:0.97 }}
                onClick={() => setForm({ ...form, gender:g })}
                className={`g-pill ${form.gender === g ? "gsel" : ""}`}>
                {g === "Male" ? "👦 Male" : "👧 Female"}
              </motion.button>
            ))}
            <motion.button type="button" whileTap={{ scale:0.97 }}
              onClick={() => setForm({ ...form, gender:"Other" })}
              className={`g-pill ${form.gender === "Other" ? "gsel" : ""}`}>
              Other
            </motion.button>
          </div>
          {errors.gender && <Err msg={errors.gender} />}
        </Field>

        <Field label="Date of Birth" icon={CalendarDays} required>
          <input type="date" className="cp-inp" value={form.dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setForm({ ...form, dob:e.target.value })} />
          {errors.dob && <Err msg={errors.dob} />}
          <AnimatePresence>
            {form.dob && (
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ fontSize:"0.78rem", color:"#0d9488", marginTop:6, fontWeight:500 }}>
                Age: {Math.floor((new Date() - new Date(form.dob)) / (365.25 * 86400000))} years old
              </motion.p>
            )}
          </AnimatePresence>
        </Field>
      </div>
    ),

    4: (
      <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
        <Field label="Phone Number" icon={PhoneCall} required>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", translate:"0 -50%",
              fontSize:"0.85rem", color:"#94a3b8", fontWeight:600 }}>+</span>
            <input className="cp-inp" type="tel"
              placeholder="91 98765 43210"
              value={form.phone}
              style={{ paddingLeft:"1.6rem" }}
              onChange={e => setForm({ ...form, phone:e.target.value })} />
          </div>
          {errors.phone && <Err msg={errors.phone} />}
        </Field>

        {errors.submit && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
            style={{ padding:"0.75rem 1rem", background:"#fff1f2",
              border:"1.5px solid #fecdd3", borderRadius:10,
              fontSize:"0.85rem", color:"#e11d48" }}>
            ⚠ {errors.submit}
          </motion.div>
        )}

        {/* Summary card */}
        <AnimatePresence>
          {form.schoolName && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ padding:"1rem 1.1rem", background:"#f0fdfb",
                border:"1.5px solid #99f6e4", borderRadius:12 }}>
              <p style={{ fontSize:"0.72rem", fontWeight:600, color:"#0d9488",
                letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>
                Your Profile Summary
              </p>
              {[
                { label:"School",  value:form.schoolName },
                { label:"Class",   value:form.className },
                { label:"Gender",  value:form.gender },
                { label:"DOB",     value:form.dob ? new Date(form.dob).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "" },
              ].filter(r => r.value).map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"0.8rem", marginBottom:4 }}>
                  <span style={{ color:"#64748b" }}>{row.label}</span>
                  <span style={{ color:"#0f172a", fontWeight:500 }}>{row.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
  };

  /* ── Success screen ──────────────────────────────────────────────────── */
  if (done) return (
    <div className="cp-root success-bg"
      style={{ minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <Styles />
      {confetti.map(c => <Confetti key={c.id} {...c} />)}
      <div style={{ position:"absolute", top:"50%", left:"50%", translate:"-50% -50%",
        width:450, height:450, borderRadius:"50%", pointerEvents:"none",
        background:"radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 65%)" }} />
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        style={{ textAlign:"center", position:"relative", zIndex:1, padding:"2rem" }}>
        <div className="pop-in"
          style={{ width:92, height:92, borderRadius:"50%", margin:"0 auto 1.5rem",
            background:"linear-gradient(135deg,#0d9488,#0f766e)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 0 14px rgba(13,148,136,0.12), 0 0 0 28px rgba(13,148,136,0.06)" }}>
          <Check style={{ width:40, height:40, color:"#fff", strokeWidth:3 }} />
        </div>
        <h2 className="cp-head" style={{ color:"#fff", fontSize:"2.1rem",
          fontWeight:800, marginBottom:10 }}>Welcome Aboard! 🎉</h2>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.95rem", marginBottom:"2rem" }}>
          Your profile is all set. Taking you to your dashboard…
        </p>
        <div style={{ display:"inline-flex", alignItems:"center", gap:10,
          padding:"0.7rem 1.4rem", borderRadius:100,
          background:"rgba(13,148,136,0.15)", border:"1px solid rgba(13,148,136,0.3)" }}>
          <Loader2 className="spin" style={{ width:16, height:16, color:"#5eead4" }} />
          <span style={{ color:"#5eead4", fontSize:"0.88rem", fontWeight:500 }}>
            Loading dashboard…
          </span>
        </div>
      </motion.div>
    </div>
  );

  /* ── Main layout ─────────────────────────────────────────────────────── */
  return (
    <div className="cp-root" style={{ minHeight:"100vh", display:"flex" }}>
      <Styles />

      {/* Left panel — desktop only */}
      <div style={{ display:"none" }} className="lg-show">
        <LeftPanel step={step} />
      </div>
      {/* CSS show helper */}
      <style>{`@media(min-width:1024px){.lg-show{display:flex!important;}}`}</style>

      {/* Right panel */}
      <div className="cp-right"
        style={{ flex:1, display:"flex", alignItems:"center",
          justifyContent:"center", padding:"2rem 1.5rem", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:460 }}>

          {/* Mobile brand */}
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:"1.5rem" }}
            className="mobile-brand">
            <div style={{ width:32, height:32, borderRadius:8,
              background:"linear-gradient(135deg,#0d9488,#0f766e)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Brain style={{ width:16, height:16, color:"#fff" }} />
            </div>
            <span className="cp-head" style={{ fontWeight:700, color:"#0f172a", fontSize:"1rem" }}>
              QuantumEdu
            </span>
          </div>
          <style>{`@media(min-width:1024px){.mobile-brand{display:none!important;}}`}</style>

          {/* Mobile progress dots */}
          <div style={{ display:"flex", gap:6, marginBottom:"1.75rem", alignItems:"center" }}
            className="mobile-dots">
            {STEPS.map(s => (
              <div key={s.id} className="m-step-dot" style={{
                width: step === s.id ? 22 : 7,
                background: step > s.id ? "#0d9488" : step === s.id ? "#0d9488" : "#dde3ed",
                opacity: step === s.id ? 1 : step > s.id ? 0.7 : 0.4,
              }} />
            ))}
            <span style={{ fontSize:"0.72rem", color:"#94a3b8", marginLeft:6 }}>
              {step}/{STEPS.length}
            </span>
          </div>
          <style>{`@media(min-width:1024px){.mobile-dots{display:none!important;}}`}</style>

          {/* Step header */}
          <AnimatePresence mode="wait">
            <motion.div key={`h-${step}`}
              initial={{ opacity:0, x:22 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-18 }} transition={{ duration:0.27 }}
              style={{ marginBottom:"1.75rem" }}>
              {/* Icon badge */}
              <div style={{ width:50, height:50, borderRadius:13, marginBottom:14,
                background:`${STEPS[step-1].color}14`,
                border:`1.5px solid ${STEPS[step-1].color}28`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {(() => { const I = STEPS[step-1].icon;
                  return <I style={{ width:23, height:23, color:STEPS[step-1].color }} />; })()}
              </div>
              <h1 className="cp-head" style={{ fontSize:"1.55rem", fontWeight:800,
                color:"#0f172a", lineHeight:1.18, marginBottom:5 }}>
                {step === 1 && "Which school do you attend?"}
                {step === 2 && "What class are you in?"}
                {step === 3 && "A little about you"}
                {step === 4 && "How can we reach you?"}
              </h1>
              <p style={{ fontSize:"0.875rem", color:"#64748b", lineHeight:1.5 }}>
                {step === 1 && "This helps us load the right books and curriculum for you"}
                {step === 2 && "We'll personalise your subjects and study material"}
                {step === 3 && "Your details help us tailor your learning experience"}
                {step === 4 && "We'll send you important learning updates here"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div key={`f-${step}`}
              initial={{ opacity:0, x:22 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-18 }} transition={{ duration:0.27 }}
              style={{ marginBottom:"1.5rem" }}>
              {stepForms[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>
            {step > 1 && (
              <button className="cp-back" onClick={back}>
                <ChevronLeft style={{ width:15, height:15 }} /> Back
              </button>
            )}
            <motion.button className="cp-btn" onClick={next}
              disabled={loading} whileTap={{ scale:0.98 }}>
              {loading
                ? <><Loader2 className="spin" style={{ width:17, height:17 }} /> Saving…</>
                : step < STEPS.length
                  ? <>Continue <ChevronRight style={{ width:17, height:17 }} /></>
                  : <><Sparkles style={{ width:17, height:17 }} /> Complete Profile</>
              }
            </motion.button>
          </div>

          <p style={{ textAlign:"center", marginTop:14, fontSize:"0.75rem", color:"#a0aec0" }}>
            Step {step} of {STEPS.length} &mdash; {STEPS[step-1].label}
          </p>
        </div>
      </div>
    </div>
  );
}