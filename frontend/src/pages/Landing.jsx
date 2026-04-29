import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { User, FileText, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
const cn = (...cls) => cls.filter(Boolean).join(" ");
/* ── Global styles injected once ── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  :root {
    --gold:       #C49E52;
    --gold-light: #E8C97A;
    --gold-dim:   rgba(196,158,82,0.18);
    --deep:       #07091E;
    --deep2:      #070C1E;
    --cream:      #F5F0E8;
  }

  ::-webkit-scrollbar          { width: 4px; }
  ::-webkit-scrollbar-track    { background: #04080F; }
  ::-webkit-scrollbar-thumb    { background: rgba(196,158,82,0.45); border-radius: 0; }

  .animated-bg {
    background: var(--deep2);
    font-family: 'DM Sans', sans-serif;
  }

  /* architectural grid overlay */
  .animated-bg::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
      linear-gradient(rgba(196,158,82,0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(196,158,82,0.028) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* gold vertical rule — left edge */
  .animated-bg::after {
    content: '';
    position: fixed;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    pointer-events: none;
    z-index: 5;
    background: linear-gradient(180deg,transparent 0%,var(--gold) 25%,var(--gold-light) 60%,transparent 100%);
  }

  .glass {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .glass-3d {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .glass-dark {
    background: rgba(4,8,15,0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .hero-headline {
    font-family: 'Cormorant Garamond', serif !important;
    font-weight: 700;
    color: var(--cream);
    letter-spacing: -0.02em;
    line-height: 1.05 !important;
  }

  .gold-gradient-text {
    background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerGold 5s linear infinite;
  }

  .section-heading {
    font-family: 'Cormorant Garamond', serif !important;
    font-weight: 700;
    color: var(--cream);
    letter-spacing: -0.01em;
  }

  /* primary button */
  .btn-primary {
    background: linear-gradient(135deg, var(--gold), var(--gold-light), var(--gold));
    background-size: 200% auto;
    color: #07091E !important;
    border: none;
    clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
    transition: background-position 0.4s, box-shadow 0.25s;
    letter-spacing: 0.06em;
    font-weight: 700;
    font-size: 15px;
  }
  .btn-primary:hover { background-position: right center; box-shadow: 0 8px 28px rgba(196,158,82,0.45); }

  /* secondary button */
  .btn-secondary {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(196,158,82,0.28) !important;
    color: rgba(255,255,255,0.75) !important;
    backdrop-filter: blur(12px);
    transition: background 0.25s, border-color 0.25s;
    letter-spacing: 0.04em;
    font-weight: 600;
    font-size: 15px;
    border-radius: 2px;
  }
  .btn-secondary:hover { background: rgba(196,158,82,0.07); border-color: rgba(196,158,82,0.5) !important; }

  /* badge */
  .badge-official {
    background: rgba(196,158,82,0.10);
    border: 1px solid rgba(196,158,82,0.28);
    color: var(--gold);
  }

  /* description block */
  .quote-block {
    background: rgba(196,158,82,0.05);
    border-left: 3px solid var(--gold) !important;
    border: 1px solid rgba(196,158,82,0.15);
    color: rgba(255,255,255,0.55) !important;
  }

  /* feature cards */
  .feature-card {
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s, border-color 0.35s;
    position: relative;
    overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 38px; height: 38px;
    border-top: 2px solid rgba(196,158,82,0.32);
    border-left: 2px solid rgba(196,158,82,0.32);
    pointer-events: none;
  }
  .feature-card::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 38px; height: 38px;
    border-bottom: 2px solid rgba(196,158,82,0.32);
    border-right: 2px solid rgba(196,158,82,0.32);
    pointer-events: none;
  }
  .feature-card:hover {
    transform: translateY(-7px) !important;
    box-shadow: 0 28px 55px rgba(0,0,0,0.55), 0 0 28px rgba(196,158,82,0.09);
    border-color: rgba(196,158,82,0.3) !important;
  }

  /* icon box inside feature card */
  .icon-box {
    background: rgba(196,158,82,0.08) !important;
    border: 1px solid rgba(196,158,82,0.2) !important;
    box-shadow: none !important;
  }

  /* official label card */
  .official-card {
    background: rgba(196,158,82,0.06);
    border: 1px solid rgba(196,158,82,0.2);
    backdrop-filter: blur(16px);
  }

  /* footer */
  .footer-dark {
    background: #04080F;
    border-top: 1px solid rgba(196,158,82,0.14) !important;
  }

  /* ping dot */
  .ping-dot {
    position: relative;
    width: 8px; height: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .ping-dot::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.55;
    animation: pingAnim 1.8s cubic-bezier(0,0,0.2,1) infinite;
  }
  .ping-dot::after {
    content: '';
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--gold);
    position: relative;
    z-index: 1;
  }

  @keyframes shimmerGold {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pingAnim {
    75%, 100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: scale(1) translate(0,0); }
    50%       { transform: scale(1.08) translate(10px,-10px); }
  }
  @keyframes spinRing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


const CERTS = [
  { icon: "💰", name: "Income Certificate", desc: "Scholarships, reservations & govt schemes", live: true },
  { icon: "🏠", name: "Domicile Certificate", desc: "Proof of residential status in Maharashtra", live: true },
  { icon: "⚖️", name: "EWS Certificate", desc: "Economically Weaker Section proof", live: true },
  { icon: "👶", name: "Birth Certificate", desc: "Official birth registration record", live: true },
  { icon: "🏛️", name: "Caste Certificate", desc: "OBC / SC / ST category certification", live: false },
  { icon: "🎓", name: "Character Certificate", desc: "Education & employment verification", live: false },
];

function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 20);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn(className, "transition-all duration-700 ease-out")}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* ── framer variants — identical to original ── */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };


  function CertCard({ c }) {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        className="relative rounded-2xl p-6 text-center cursor-default select-none"
        style={{
          background: hovered ? "rgba(255,179,0,0.07)" : "rgba(255,255,255,0.05)",
          border: hovered ? "1px solid rgba(255,179,0,0.30)" : "1px solid rgba(255,255,255,0.09)",
          transform: hovered ? "translateY(-8px) scale(1.04)" : "none",
          boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.35), 0 0 28px rgba(255,179,0,0.10)" : "none",
          transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Badge */}
        <span
          className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={
            c.live
              ? { background: "rgba(0,230,118,0.15)", color: "#69F0AE", border: "1px solid rgba(0,230,118,0.25)" }
              : { background: "rgba(255,179,0,0.12)", color: "#FFD54F", border: "1px solid rgba(255,179,0,0.2)" }
          }
        >
          {c.live ? "Live" : "Soon"}
        </span>

        <span
          className="block text-[36px] mb-3"
          style={{ transition: "transform 0.3s", transform: hovered ? "scale(1.2) rotate(-5deg)" : "none" }}
        >
          {c.icon}
        </span>
        <p className="font-bold text-[13px] text-white mb-1.5">{c.name}</p>
        <p className="text-[11px] text-white/38 leading-snug">{c.desc}</p>
      </div>
    );
  }

  const STEPS = [
    { icon: "🪪", num: 1, title: "Register", desc: "Aadhaar-linked secure account creation" },
    { icon: "📤", num: 2, title: "Upload Docs", desc: "Submit supporting documents securely" },
    { icon: "🤖", num: 3, title: "AI Validates", desc: "Instant automated document verification" },
    { icon: "✅", num: 4, title: "Approved", desc: "Authority sign-off within minutes" },
    { icon: "📥", num: 5, title: "Download", desc: "Digitally signed, legally valid certificate" },
  ];

  function StepItem({ s }) {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        className="flex flex-col items-center text-center cursor-default select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center text-[28px] mb-5 z-10"
          style={{
            background: hovered ? "rgba(255,87,34,0.12)" : "rgba(255,255,255,0.06)",
            border: hovered ? "1px solid rgba(255,87,34,0.35)" : "1px solid rgba(255,255,255,0.10)",
            transform: hovered ? "scale(1.16) translateY(-6px)" : "none",
            boxShadow: hovered ? "0 16px 40px rgba(255,87,34,0.28), 0 0 0 8px rgba(255,87,34,0.07)" : "none",
            transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Step number */}
          <span
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF5722,#FFB300)" }}
          >
            {s.num}
          </span>
          {s.icon}
        </div>
        <p className="font-bold text-[14px] text-white mb-1.5">{s.title}</p>
        <p className="text-[12px] text-white/38 leading-relaxed">{s.desc}</p>
      </div>
    );
  }


  function OfficialCard({ img, name, role, size, featured, style: inlineStyle }) {
    const isLg = size === "lg";
    const [hovered, setHovered] = useState(false);

    return (
      <div
        className="flex flex-col items-center cursor-default select-none"
        style={{
          ...inlineStyle,
          transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          transform: hovered ? `translateY(${isLg ? -20 : -12}px) scale(${isLg ? 1.05 : 1.04})` : "none",
          zIndex: featured ? 2 : 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            width: isLg ? 156 : 108,
            height: isLg ? 156 : 108,
            border: featured
              ? "4px solid rgba(255,179,0,0.7)"
              : "3px solid rgba(255,255,255,0.2)",
            boxShadow: featured
              ? "0 0 0 10px rgba(255,179,0,0.08), 0 24px 64px rgba(0,0,0,0.55)"
              : "0 12px 36px rgba(0,0,0,0.4)",
          }}
        >
          {/* Spinning ring for featured */}
          {featured && (
            <div
              className="absolute inset-[-5px] rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(135deg,#FF5722,#FFB300,#00E676,#FF5722)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                maskComposite: "exclude",
                padding: "2px",
                animation: "spinRing 4s linear infinite",
              }}
            />
          )}
          <img
            src={img}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.4))" }}
          />
        </div>

        {/* Label */}
        <div
          className="mt-3 text-center px-4 py-2.5 rounded-2xl"
          style={{
            minWidth: isLg ? 160 : 130,
            background: featured ? "rgba(255,179,0,0.07)" : "rgba(255,255,255,0.07)",
            border: featured ? "1px solid rgba(255,179,0,0.25)" : "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
          }}
        >
          <p
            className="font-bold leading-tight"
            style={{
              fontSize: isLg ? "14px" : "12px",
              color: featured ? "#FFD54F" : "#fff",
            }}
          >
            {name}
          </p>
          <p className="text-[10px] text-white/45 uppercase tracking-wider mt-1">{role}</p>
        </div>
      </div>
    );
  }


  /* ─── Particle Canvas ─── */
  function ParticleCanvas() {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      let W, H, particles = [], raf;

      const colors = [
        "rgba(255,87,34,", "rgba(255,179,0,", "rgba(0,230,118,", "rgba(255,138,101,"
      ];

      class P {
        reset(init) {
          this.x = Math.random() * W;
          this.y = init ? Math.random() * H : H + 10;
          this.r = Math.random() * 2.5 + 0.5;
          this.vx = (Math.random() - 0.5) * 0.6;
          this.vy = -(Math.random() * 1.2 + 0.3);
          this.life = Math.random() * 0.5 + 0.5;
          this.decay = Math.random() * 0.003 + 0.001;
          this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        constructor() { this.reset(true); }
        update() {
          this.x += this.vx; this.y += this.vy; this.life -= this.decay;
          if (this.life <= 0 || this.y < -10) this.reset(false);
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx.fillStyle = this.color + (this.life * 0.8) + ")";
          ctx.fill();
        }
      }

      function resize() {
        const parent = canvas.parentElement;
        W = canvas.width = parent.offsetWidth;
        H = canvas.height = parent.offsetHeight;
      }

      function init() {
        particles = [];
        for (let i = 0; i < 140; i++) particles.push(new P());
      }

      function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        raf = requestAnimationFrame(loop);
      }

      resize(); init(); loop();
      window.addEventListener("resize", () => { resize(); init(); });
      return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans animated-bg relative overflow-hidden">
      <Navbar />

      {/* ── Background Orbs (same positions, gold/blue tones) ── */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196,158,82,0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "floatOrb 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(91,143,212,0.10) 0%, transparent 70%)",
          filter: "blur(110px)",
          animation: "floatOrb 16s ease-in-out infinite reverse",
        }}
      />

      {/* ══════════════════════════
          HERO  (original structure)
          ══════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: "var(--deep)" }}>
        {/* Mesh BG */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 75% 40%, rgba(255,87,34,0.18) 0%, transparent 60%)," +
              "radial-gradient(ellipse 55% 70% at 10% 80%, rgba(0,230,118,0.10) 0%, transparent 55%)," +
              "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(255,179,0,0.13) 0%, transparent 50%)",
            animation: "meshPulse 9s ease-in-out infinite alternate",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <ParticleCanvas />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          {/* Left */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-widest mb-6"
              style={{
                background: "rgba(255,87,34,0.12)",
                border: "1px solid rgba(255,87,34,0.30)",
                color: "#FF8A65",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#FF5722", animation: "blink 1.5s ease-in-out infinite" }}
              />
              Official AI Platform · Live 2026
            </div>

            {/* Headline */}
            <h1
              className="text-[clamp(42px,6vw,72px)] font-extrabold leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Digital India<br />
              <span
                style={{
                  background: "linear-gradient(90deg,#FF5722,#FFB300,#FF5722)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 4s linear infinite",
                }}
              >
                Starts Here.
              </span>
            </h1>

            <p className="text-[16px] text-white/55 leading-relaxed max-w-lg mb-8">
              Get Income, Domicile, EWS & Birth Certificates in minutes —
              no queues, no Tahsil visits. Powered by cutting-edge AI verification.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/auth">
                <button
                  className="relative overflow-hidden flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-[15px] text-white transition-all duration-200 hover:-translate-y-1 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#FF5722,#FFB300)",
                    boxShadow: "0 6px 30px rgba(255,87,34,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <span>✦ Apply Now</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </Link>
              <Link to="/dashboard">
                <button
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-[15px] text-white/85 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  Track Application
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { num: 240000, display: "2.4L+", label: "Certificates Issued" },
                { display: "~8 min", label: "Avg. Processing" },
                { display: "99%", label: "Approval Rate" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-10 bg-white/10" />}
                  <div>
                    <div
                      className="text-[28px] font-extrabold leading-none"
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        background: "linear-gradient(135deg,#fff,rgba(255,255,255,0.7))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {s.display}
                    </div>
                    <div className="text-[11px] text-white/38 uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Officials */}
          <div className="flex items-end justify-center gap-4 pt-8 lg:pt-0" style={{ perspective: "800px" }}>
            {/* Side Official */}
            <Reveal delay={100}>
              <OfficialCard
                img="https://images.moneycontrol.com/static-mcnews/2022/06/Eknath-Shinde-435x435.jpg"
                name="Shri Eknath Shinde"
                role="Chief Minister"
                size="sm"
                style={{ marginBottom: "32px" }}
              />
            </Reveal>

            {/* Center — Modi */}
            <Reveal delay={0}>
              <OfficialCard
                img="https://www.thestatesman.com/wp-content/uploads/2022/09/03_Merged.jpg"
                name="Shri Narendra Modi"
                role="Prime Minister of India"
                size="lg"
                featured
              />
            </Reveal>

            {/* Side Official */}
            <Reveal delay={200}>
              <OfficialCard
                img="https://yt3.googleusercontent.com/NZdann7v63WTVxM_f0BEAroqJq-sLHeDWtFaRzY2snrOtnOL8XnOgh6Hddt0Osr3oS3tljtj=s900-c-k-c0x00ffffff-no-r"
                name="Shri Devendra Fadnavis"
                role="Deputy Chief Minister"
                size="sm"
                style={{ marginBottom: "32px" }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SERVICES  (original structure)
          ══════════════════════════════ */}
      <section className="py-20 relative z-10">
        {/* top rule */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, var(--gold) 0%, rgba(196,158,82,0.2) 30%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            {/* section label */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: "var(--gold)", opacity: 0.6 }} />
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase" }}>
                Digital Infrastructure
              </span>
              <div className="h-px w-8" style={{ background: "var(--gold)", opacity: 0.6 }} />
            </div>
            <h3 className="section-heading text-3xl md:text-4xl drop-shadow-sm">
              What We Offer
            </h3>
            {/* ornament below heading */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12" style={{ background: "var(--gold)", opacity: 0.4 }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: "var(--gold)" }} />
              <div className="h-px w-12" style={{ background: "var(--gold)", opacity: 0.4 }} />
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: FileText,
                title: "Instant Issue",
                desc: "Receive Income, Domicile, EWS, and Birth certificates instantly upon AI validation without manual queue delays.",
                iconColor: "var(--gold)",
                glowColor: "rgba(196,158,82,0.07)",
              },
              {
                icon: Activity,
                title: "Live Tracking",
                desc: "Track your submitted documents and verification algorithms flowing through the queue live in your portal.",
                iconColor: "#5B8FD4",
                glowColor: "rgba(91,143,212,0.07)",
              },
              {
                icon: User,
                title: "Secure Vault",
                desc: "Your uploaded and approved sensitive Government documents stay permanently sealed inside an encrypted locker.",
                iconColor: "#64C88C",
                glowColor: "rgba(100,200,140,0.07)",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-3d feature-card p-8"
                style={{ borderRadius: "4px" }}
              >
                {/* ambient glow blob */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: feature.glowColor, filter: "blur(50px)" }} />

                <feature.icon
                  className="w-14 h-14 mb-6 relative z-10 p-3 icon-box"
                  style={{ color: feature.iconColor, borderRadius: "4px" }}
                />
                <h4 className="section-heading text-2xl mb-3 relative z-10" style={{ fontSize: "22px" }}>
                  {feature.title}
                </h4>
                <p className="leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.42)", fontSize: "14px" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        className="py-28 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,rgba(255,87,34,0.10) 0%,rgba(255,179,0,0.08) 50%,rgba(0,230,118,0.06) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Pulsing glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle,rgba(255,87,34,0.15) 0%,transparent 70%)",
            animation: "ctaGlow 4s ease-in-out infinite",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <Reveal>
            <h2
              className="text-[clamp(36px,5vw,62px)] font-extrabold tracking-tight leading-[1.1] mb-5"
              style={{ fontFamily: "'Syne',sans-serif" }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-[16px] text-white/50 leading-relaxed mb-10">
              Join over 2.4 lakh citizens who've received their certificates — completely online,
              completely free, in under 10 minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                className="flex items-center gap-2 px-10 py-4 rounded-full font-bold text-[16px] text-white transition-all duration-200 hover:-translate-y-1 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#FF5722,#FFB300)",
                  boxShadow: "0 8px 32px rgba(255,87,34,0.50)",
                }}
              >
                ✦ Apply For Free
              </button>
              <button
                className="flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-[16px] text-white/80 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Learn More →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="certificates"
        className="py-28 relative overflow-hidden"
        style={{ background: "#06091F" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#FFB300] mb-3">✦ Available Services</p>
            <h2
              className="text-[clamp(30px,4vw,50px)] font-extrabold tracking-tight leading-[1.1] mb-4"
              style={{ fontFamily: "'Syne',sans-serif" }}
            >
              What You Can Apply For
            </h2>
            <p className="text-[15px] text-white/45 max-w-md leading-relaxed mb-14">
              Six government certificates — available 24/7, processed by AI, delivered digitally.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
            {CERTS.map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <CertCard c={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg,#06091F 0%,#04081A 100%)" }}
      >
        {/* Big ghost text */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap select-none"
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: "clamp(100px,18vw,220px)",
            fontWeight: 800,
            color: "rgba(255,255,255,0.018)",
            letterSpacing: "-0.04em",
          }}
        >
          PROCESS
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#FFB300] mb-3">✦ How It Works</p>
            <h2
              className="text-[clamp(30px,4vw,50px)] font-extrabold tracking-tight leading-[1.1] mb-4"
              style={{ fontFamily: "'Syne',sans-serif" }}
            >
              Done in 5 Simple Steps
            </h2>
            <p className="text-[15px] text-white/45 max-w-md leading-relaxed mb-16">
              From registration to certificate download — entirely online, entirely automated.
            </p>
          </Reveal>

          {/* Steps */}
          <div className="relative">
            {/* Connector line */}
            <div
              className="hidden lg:block absolute top-11 left-[10%] right-[10%] h-px"
              style={{ background: "linear-gradient(90deg,transparent,rgba(255,179,0,0.3),rgba(255,87,34,0.3),transparent)" }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
              {STEPS.map((s, i) => (
                <Reveal key={i} delay={i * 100}>
                  <StepItem s={s} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ═══════════════════════════
          FOOTER  (original structure)
          ═══════════════════════════ */}
      <footer className="footer-dark py-10 relative z-20 mt-auto">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="p-2"
              style={{
                background: "rgba(196,158,82,0.08)",
                border: "1px solid rgba(196,158,82,0.25)",
                borderRadius: "4px",
              }}>
              <img src="https://i.pinimg.com/236x/d2/4d/0b/d24d0ba8771e4e12006055ad3aee017a.jpg"
                alt="Maha Logo" className="w-10 h-10 filter drop-shadow-lg" />
            </div>
          </div>
          {/* tricolor bar */}
          <div className="flex h-[2px] w-16 mx-auto mb-4 overflow-hidden">
            <span className="flex-1" style={{ background: "#FF9933" }} />
            <span className="flex-1" style={{ background: "#fff" }} />
            <span className="flex-1" style={{ background: "#138808" }} />
          </div>
          <p className="font-bold mb-2 text-lg tracking-wide"
            style={{ color: "var(--cream)", fontFamily: "'Cormorant Garamond',serif" }}>
            © 2026 Government of Maharashtra
          </p>
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.28)" }}>
            This is a simulated platform for educational system design purposes. Not connected to real Tahsil.
          </p>
        </div>
      </footer>
    </div>
  );
}