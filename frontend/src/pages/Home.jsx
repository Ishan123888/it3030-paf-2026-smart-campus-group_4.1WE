import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════
   INLINE STYLES – zero Tailwind dependency for
   all animated / 3-D parts
═══════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  :root {
    --bg:      #060812;
    --surface: #0d1120;
    --border:  rgba(99,130,255,0.18);
    --accent:  #4f6fff;
    --accent2: #00e5c3;
    --accent3: #ff5b8d;
    --text:    #e8ecff;
    --muted:   #6b7599;
    --glow:    rgba(79,111,255,0.35);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

  /* ─── CANVAS STARS ─── */
  #starCanvas {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }

  /* ═══════════════════════════════
     HERO / SLIDESHOW SECTION
  ═══════════════════════════════ */
  .slide-hero {
    position: relative;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
  }

  /* individual slide layers */
  .slide-layer {
    position: absolute; inset: 0;
    will-change: transform, opacity;
    transition: opacity 0.9s cubic-bezier(.4,0,.2,1),
                transform 0.9s cubic-bezier(.4,0,.2,1);
  }
  .slide-layer img {
    width: 100%; height: 100%; object-fit: cover;
    filter: brightness(.38) saturate(1.3);
  }
  .slide-layer.enter  { opacity: 0; transform: translateX(6%) scale(1.04); }
  .slide-layer.active { opacity: 1; transform: translateX(0)   scale(1);   }
  .slide-layer.exit   { opacity: 0; transform: translateX(-6%) scale(.98); }

  /* colour tint per slide */
  .slide-layer::after {
    content: '';
    position: absolute; inset: 0;
    background: var(--slide-tint, rgba(6,8,18,.55));
    transition: background 0.9s ease;
  }

  /* persistent grid overlay */
  .slide-hero::before {
    content: '';
    position: absolute; inset: 0; z-index: 3; pointer-events: none;
    background-image:
      linear-gradient(rgba(79,111,255,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,111,255,.06) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 50%, black 30%, transparent 100%);
  }

  /* bottom fade to page bg */
  .slide-hero::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 220px; z-index: 4;
    background: linear-gradient(to bottom, transparent, var(--bg));
    pointer-events: none;
  }

  /* orbs sit inside hero */
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(90px); opacity: .42; pointer-events: none;
    animation: drift 16s ease-in-out infinite alternate;
    z-index: 2;
  }
  .orb-1 { width:520px;height:520px;background:#1e30b8;top:-100px;left:-180px;animation-delay:0s; }
  .orb-2 { width:380px;height:380px;background:#007c6a;top:80px;right:-120px;animation-delay:-6s; }
  .orb-3 { width:300px;height:300px;background:#aa1855;bottom:-40px;left:35%;animation-delay:-11s; }
  @keyframes drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(28px,38px) scale(1.07); }
  }

  /* hero content */
  .hero-content {
    position: absolute; inset: 0; z-index: 5;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 60px;
  }

  .badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 18px; border-radius: 100px;
    background: rgba(79,111,255,.15); border: 1px solid rgba(79,111,255,.4);
    font-size: .76rem; font-weight: 600; letter-spacing: .07em;
    color: #a3b5ff; text-transform: uppercase;
    margin-bottom: 28px;
    animation: fadeUp .8s ease both;
  }
  .badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent2);
    box-shadow: 0 0 8px var(--accent2);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  .hero-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2.8rem, 7.5vw, 5.6rem);
    line-height: 1.06; letter-spacing: -2.5px;
    color: var(--text);
    animation: fadeUp .9s .1s ease both;
  }
  .hero-title .grad {
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
    background-size: 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }
  @keyframes shimmer { from{background-position:0%} to{background-position:200%} }

  /* animated slide caption */
  .slide-caption {
    height: 28px; overflow: hidden; margin: 10px 0 0;
    animation: fadeUp .9s .15s ease both;
  }
  .slide-caption-inner {
    font-size: .88rem; font-weight: 600; color: var(--accent2);
    letter-spacing: .07em; text-transform: uppercase;
    transition: opacity .5s, transform .5s;
  }
  .slide-caption-inner.fade { opacity:0; transform:translateY(6px); }

  .hero-sub {
    max-width: 560px; margin: 18px auto 0;
    font-size: 1.06rem; color: var(--muted); line-height: 1.72;
    animation: fadeUp .9s .22s ease both;
  }

  .hero-cta {
    margin-top: 40px; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    animation: fadeUp .9s .32s ease both;
  }
  .btn-primary {
    padding: 14px 32px; border-radius: 10px; font-size: 1rem; font-weight: 700;
    background: linear-gradient(135deg, var(--accent), #7b6fff);
    color: #fff; text-decoration: none;
    box-shadow: 0 0 32px var(--glow);
    transition: transform .2s, box-shadow .2s;
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,.15));
    opacity:0; transition:opacity .2s;
  }
  .btn-primary:hover { transform:translateY(-3px); box-shadow:0 0 52px var(--glow); }
  .btn-primary:hover::after { opacity:1; }

  .btn-ghost {
    padding: 14px 32px; border-radius: 10px; font-size: 1rem; font-weight: 700;
    border: 1px solid var(--border); color: var(--text); text-decoration: none;
    transition: background .2s, transform .2s;
    backdrop-filter: blur(8px);
  }
  .btn-ghost:hover { background: rgba(79,111,255,.12); transform:translateY(-3px); }

  /* slide dots */
  .slide-dots {
    position: absolute; bottom: 52px; left: 50%; transform: translateX(-50%);
    z-index: 6; display: flex; gap: 8px; align-items: center;
  }
  .slide-dot {
    height: 8px; border-radius: 100px; cursor: pointer;
    background: rgba(255,255,255,.25);
    transition: width .35s cubic-bezier(.4,0,.2,1), background .35s;
    width: 8px; border: none; padding: 0;
  }
  .slide-dot.active { width: 28px; background: var(--accent2); }

  /* slide arrows */
  .slide-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    z-index: 6; width: 46px; height: 46px;
    border-radius: 50%;
    background: rgba(13,17,32,.62); border: 1px solid var(--border);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text); font-size: 1.3rem;
    transition: background .2s, border-color .2s, transform .2s;
    outline: none;
  }
  .slide-arrow:hover { background: rgba(79,111,255,.32); border-color: var(--accent); transform:translateY(-50%) scale(1.08); }
  .slide-arrow.prev { left: 28px; }
  .slide-arrow.next { right: 28px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ═══════════════════════════════
     FLOATING DASHBOARD PREVIEW
  ═══════════════════════════════ */
  .hero-visual {
    margin-top: 52px;
    animation: fadeUp .9s .5s ease both, float 6s ease-in-out infinite;
  }
  @keyframes float {
    0%,100%{transform:translateY(0) rotateX(2deg)}
    50%{transform:translateY(-14px) rotateX(-2deg)}
  }
  .preview-card {
    width: min(720px, 88vw);
    background: rgba(13,17,32,.88);
    border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,.65), 0 0 60px rgba(79,111,255,.14);
    transition: transform .15s ease;
  }
  .preview-topbar {
    display:flex; align-items:center; gap:8px;
    padding:14px 20px;
    background:rgba(255,255,255,.04);
    border-bottom:1px solid var(--border);
  }
  .dot  { width:11px;height:11px;border-radius:50%; }
  .dot-r{background:#ff5f57} .dot-y{background:#febc2e} .dot-g{background:#28c840}
  .preview-url {
    flex:1; text-align:center; font-size:.75rem; color:var(--muted);
    background:rgba(255,255,255,.05); border-radius:6px; padding:3px 12px;
    max-width:300px; margin:0 auto;
  }
  .preview-body {
    padding:24px;
    display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;
  }
  .mini-card {
    background:rgba(255,255,255,.04);
    border:1px solid var(--border);
    border-radius:12px; padding:16px;
    position:relative; overflow:hidden;
  }
  .mini-card::before {
    content:''; position:absolute; top:0;left:0;right:0;height:3px;
    background:var(--mc-color,var(--accent));
    border-radius:12px 12px 0 0;
  }
  .mini-card-icon  { font-size:1.5rem; margin-bottom:8px; }
  .mini-card-title { font-size:.75rem; font-weight:700; color:var(--text); margin-bottom:4px; }
  .mini-card-val   { font-size:1.4rem; font-weight:800; font-family:'Syne',sans-serif; color:var(--text); }
  .mini-card-label { font-size:.65rem; color:var(--muted); margin-top:2px; }
  .mini-badge { display:inline-block; font-size:.6rem; padding:2px 7px; border-radius:100px; font-weight:700; margin-top:6px; }
  .badge-green { background:rgba(0,229,195,.15); color:#00e5c3; }
  .badge-blue  { background:rgba(79,111,255,.15); color:#a3b5ff; }
  .badge-red   { background:rgba(255,91,141,.15); color:#ff5b8d; }

  /* ═══════════════════════════════
     STATS BAR
  ═══════════════════════════════ */
  .stats-wrap {
    position:relative; z-index:1;
    max-width:900px; margin:0 auto;
    padding:0 32px 80px;
  }
  .stats {
    display:flex; justify-content:center; flex-wrap:wrap;
    border:1px solid var(--border); border-radius:20px; overflow:hidden;
    background:rgba(13,17,32,.72); backdrop-filter:blur(16px);
  }
  .stat-item {
    flex:1; min-width:140px;
    padding:34px 20px; text-align:center; position:relative;
  }
  .stat-item + .stat-item::before {
    content:''; position:absolute; left:0; top:20%; bottom:20%;
    width:1px; background:var(--border);
  }
  .stat-num {
    font-family:'Syne',sans-serif; font-size:2.3rem; font-weight:800;
    background:linear-gradient(135deg,var(--text),var(--accent));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .stat-label { font-size:.78rem; color:var(--muted); margin-top:4px; text-transform:uppercase; letter-spacing:.08em; }

  /* ═══════════════════════════════
     SECTIONS
  ═══════════════════════════════ */
  .section {
    position:relative; z-index:1;
    max-width:1180px; margin:0 auto;
    padding:0 32px 110px;
  }
  .section-header { text-align:center; margin-bottom:60px; }
  .section-eyebrow {
    font-size:.76rem; text-transform:uppercase; letter-spacing:.13em;
    color:var(--accent2); font-weight:700; margin-bottom:12px;
  }
  .section-title {
    font-family:'Syne',sans-serif;
    font-size:clamp(1.8rem,4vw,2.8rem);
    font-weight:800; color:var(--text); letter-spacing:-1px;
  }
  .section-sub { color:var(--muted); margin-top:12px; font-size:1rem; }

  .features-grid {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:22px;
  }
  .feat-card {
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:20px; padding:34px 30px;
    position:relative; overflow:hidden;
    transition:transform .3s, border-color .3s, box-shadow .3s;
  }
  .feat-card::before {
    content:''; position:absolute; inset:0; opacity:0;
    background:radial-gradient(circle at 30% 30%, var(--fc-glow,rgba(79,111,255,.08)), transparent 60%);
    transition:opacity .4s;
  }
  .feat-card:hover { transform:translateY(-6px); border-color:rgba(99,130,255,.4); box-shadow:0 20px 48px rgba(0,0,0,.4); }
  .feat-card:hover::before { opacity:1; }

  .feat-icon-wrap {
    width:52px; height:52px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    font-size:1.45rem; margin-bottom:18px; position:relative;
  }
  .feat-icon-wrap::after {
    content:''; position:absolute; inset:-1px; border-radius:15px;
    background:linear-gradient(135deg,var(--fi-a),var(--fi-b));
    z-index:-1; opacity:.55;
  }
  .feat-title { font-family:'Syne',sans-serif; font-size:1.15rem; font-weight:700; color:var(--text); margin-bottom:10px; }
  .feat-desc  { color:var(--muted); font-size:.91rem; line-height:1.72; }
  .feat-link  { display:inline-flex; align-items:center; gap:6px; margin-top:18px; font-size:.86rem; font-weight:700; text-decoration:none; transition:gap .2s; }
  .feat-link:hover { gap:10px; }

  .feat-tags  { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
  .tag        { font-size:.64rem; padding:3px 9px; border-radius:100px; font-weight:700; background:rgba(255,255,255,.06); color:var(--muted); border:1px solid rgba(255,255,255,.08); }

  /* workflow */
  .workflow { display:flex; justify-content:center; flex-wrap:wrap; margin-top:32px; }
  .wf-step  { display:flex; flex-direction:column; align-items:center; gap:8px; position:relative; min-width:116px; padding:0 8px; }
  .wf-step + .wf-step::before { content:'→'; position:absolute; left:-14px; top:16px; color:var(--muted); font-size:1rem; }
  .wf-dot   { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.85rem; font-weight:700; background:rgba(255,255,255,.06); border:1px solid var(--border); color:var(--text); }
  .wf-dot.active { background:var(--accent); border-color:var(--accent); box-shadow:0 0 20px var(--glow); }
  .wf-label { font-size:.7rem; color:var(--muted); text-align:center; }

  /* CTA band */
  .band {
    position:relative; z-index:1;
    background:linear-gradient(135deg,rgba(79,111,255,.12),rgba(0,229,195,.08));
    border-top:1px solid var(--border); border-bottom:1px solid var(--border);
    padding:76px 32px; text-align:center;
  }
  .band-title {
    font-family:'Syne',sans-serif; font-size:clamp(1.4rem,3.5vw,2.2rem); font-weight:800;
    color:var(--text); max-width:680px; margin:0 auto 30px; letter-spacing:-1px;
  }
  .band-title span {
    background:linear-gradient(90deg,var(--accent),var(--accent2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }

  /* responsive */
  @media(max-width:768px){
    .slide-arrow { display:none; }
    .hero-content { padding:80px 20px 50px; }
    .preview-body { grid-template-columns:1fr 1fr; }
    .stat-item + .stat-item::before { display:none; }
  }
`;

/* ════════════════════════════════════
   STAR CANVAS
════════════════════════════════════ */
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.003 + 0.001,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.a += s.speed;
        const alpha = (Math.sin(s.a) + 1) / 2 * 0.65 + 0.08;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,200,255,${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas id="starCanvas" ref={ref} />;
}

/* ════════════════════════════════════
   COUNT-UP HOOK
════════════════════════════════════ */
function useCountUp(target, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const prog = Math.min((ts - start) / duration, 1);
          setVal(Math.floor(prog * target));
          if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return [val, ref];
}

/* ════════════════════════════════════
   SLIDE DATA
   – Add more objects here to add more slides
   – img: null will show a gradient fallback
════════════════════════════════════ */
const SLIDES = [
  {
    img: 'https://i.imgur.com/lFBizEk.jpeg',
    caption: 'Smart Facility & Asset Booking',
    tint: 'rgba(8,14,48,.52)',
  },
  {
    // second Imgur image — replace the URL when you have it
    img: 'https://i.imgur.com/lFBizEk.jpeg',
    caption: 'Incident & Maintenance Ticketing',
    tint: 'rgba(6,24,20,.52)',
  },
];

/* ════════════════════════════════════
   HOME PAGE
════════════════════════════════════ */
const Home = () => {

  /* ── Slideshow ── */
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState(null);
  const [busy,    setBusy]    = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    if (busy) return;
    const target = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (target === current) return;
    setBusy(true);
    setPrev(current);
    setCurrent(target);
    setTimeout(() => { setPrev(null); setBusy(false); }, 950);
  }, [busy, current]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const back = useCallback(() => goTo(current - 1), [goTo, current]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const slideClass = (i) => {
    if (i === current) return 'slide-layer active';
    if (i === prev)    return 'slide-layer exit';
    return 'slide-layer enter';
  };

  /* ── Tilt card ── */
  const tiltRef = useRef(null);
  const onMove  = e => {
    if (!tiltRef.current) return;
    const { left, top, width, height } = tiltRef.current.getBoundingClientRect();
    tiltRef.current.style.transform =
      `rotateY(${((e.clientX-left)/width-.5)*12}deg) rotateX(${((e.clientY-top)/height-.5)*-8}deg)`;
  };
  const onLeave = () => { if (tiltRef.current) tiltRef.current.style.transform = 'rotateY(0) rotateX(0)'; };

  /* ── Stats ── */
  const [v1,r1] = useCountUp(50);
  const [v2,r2] = useCountUp(1200);
  const [v3,r3] = useCountUp(98);
  const [v4,r4] = useCountUp(24);

  /* ── Feature cards ── */
  const features = [
    { title:'Facilities & Assets Catalogue', desc:'Browse lecture halls, labs, meeting rooms, and equipment in real-time with smart search and availability filters.', icon:'🏛️', link:'/dashboard/resources', tags:['ACTIVE / OUT_OF_SERVICE','Search & Filter'], colorA:'#4f6fff', colorB:'#7b6fff', glow:'rgba(79,111,255,.08)' },
    { title:'Booking Management', desc:'Request and track bookings with conflict detection. Admins approve or reject requests with a full audit trail.', icon:'📅', link:'/dashboard/bookings', tags:['PENDING → APPROVED','Conflict Check'], colorA:'#00e5c3', colorB:'#0099aa', glow:'rgba(0,229,195,.08)' },
    { title:'Incident Ticketing', desc:'Submit fault reports with photo evidence, assign technicians, and track resolution through a structured workflow.', icon:'🔧', link:'/dashboard/incidents', tags:['OPEN → RESOLVED','Image Attachments'], colorA:'#ff5b8d', colorB:'#cc2266', glow:'rgba(255,91,141,.08)' },
    { title:'Smart Notifications', desc:'Get instant alerts for booking decisions, ticket updates, and comment threads — all in one notification panel.', icon:'🔔', link:'/dashboard/notifications', tags:['Real-time','In-app Panel'], colorA:'#f5a623', colorB:'#e07b00', glow:'rgba(245,166,35,.08)' },
    { title:'Role-Based Access', desc:'USER, ADMIN, and TECHNICIAN roles with OAuth 2.0 (Google Sign-In) for secure, frictionless authentication.', icon:'🛡️', link:'/login', tags:['OAuth 2.0','Google Sign-in'], colorA:'#a855f7', colorB:'#7c3aed', glow:'rgba(168,85,247,.08)' },
    { title:'Admin Analytics', desc:'Usage dashboards showing peak booking hours, top resources, SLA timers for ticket resolution, and more.', icon:'📊', link:'/dashboard/analytics', tags:['Usage Stats','SLA Tracking'], colorA:'#06b6d4', colorB:'#0284c7', glow:'rgba(6,182,212,.08)' },
  ];

  return (
    <>
      <style>{css}</style>
      <StarCanvas />

      {/* ══════ HERO ══════ */}
      <section className="slide-hero">

        {SLIDES.map((sl, i) => (
          <div key={i} className={slideClass(i)} style={{ '--slide-tint': sl.tint }}>
            {sl.img
              ? <img src={sl.img} alt={sl.caption} />
              : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#0d1a3a,#0a2a22,#1a0a2e)' }} />
            }
          </div>
        ))}

        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        <div className="hero-content">
          <div className="badge"><span className="badge-dot" />SLIIT · IT3030 · Smart Campus Operations Hub</div>

          <h1 className="hero-title">
            Campus Operations,<br /><span className="grad">Reimagined</span>
          </h1>

          <div className="slide-caption">
            <div className={`slide-caption-inner${busy ? ' fade' : ''}`}>
              {SLIDES[current].caption}
            </div>
          </div>

          <p className="hero-sub">
            A unified platform for booking facilities, managing assets, and resolving
            incidents — built for SLIIT students, staff, and administrators.
          </p>

          <div className="hero-cta">
            <Link to="/login"   className="btn-primary">Get Started →</Link>
            <Link to="/contact" className="btn-ghost">Contact Support</Link>
          </div>

          {/* 3-D tilt dashboard preview */}
          <div className="hero-visual" onMouseMove={onMove} onMouseLeave={onLeave}>
            <div ref={tiltRef} className="preview-card">
              <div className="preview-topbar">
                <span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/>
                <div className="preview-url">smartcampus.sliit.lk / dashboard</div>
              </div>
              <div className="preview-body">
                <div className="mini-card" style={{'--mc-color':'#4f6fff'}}>
                  <div className="mini-card-icon">🏛️</div>
                  <div className="mini-card-title">Total Resources</div>
                  <div className="mini-card-val">54</div>
                  <div className="mini-card-label">Halls · Labs · Equipment</div>
                  <span className="mini-badge badge-green">All Active</span>
                </div>
                <div className="mini-card" style={{'--mc-color':'#00e5c3'}}>
                  <div className="mini-card-icon">📅</div>
                  <div className="mini-card-title">Bookings Today</div>
                  <div className="mini-card-val">23</div>
                  <div className="mini-card-label">6 pending approval</div>
                  <span className="mini-badge badge-blue">On Schedule</span>
                </div>
                <div className="mini-card" style={{'--mc-color':'#ff5b8d'}}>
                  <div className="mini-card-icon">🔧</div>
                  <div className="mini-card-title">Open Tickets</div>
                  <div className="mini-card-val">8</div>
                  <div className="mini-card-label">3 in progress</div>
                  <span className="mini-badge badge-red">2 High Priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ◀ ▶ */}
        <button className="slide-arrow prev" onClick={back}  aria-label="Previous">‹</button>
        <button className="slide-arrow next" onClick={next}  aria-label="Next">›</button>

        {/* dots */}
        <div className="slide-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`slide-dot${i===current?' active':''}`} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`} />
          ))}
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <div className="stats-wrap">
        <div className="stats">
          <div className="stat-item" ref={r1}><div className="stat-num">{v1}+</div><div className="stat-label">Bookable Venues</div></div>
          <div className="stat-item" ref={r2}><div className="stat-num">{v2}+</div><div className="stat-label">Bookings Handled</div></div>
          <div className="stat-item" ref={r3}><div className="stat-num">{v3}%</div><div className="stat-label">Ticket Resolution</div></div>
          <div className="stat-item" ref={r4}><div className="stat-num">{v4}/7</div><div className="stat-label">Platform Uptime</div></div>
        </div>
      </div>

      {/* ══════ FEATURES ══════ */}
      <section className="section" id="features">
        <div className="section-header">
          <div className="section-eyebrow">Core Modules</div>
          <h2 className="section-title">Everything in One Place</h2>
          <p className="section-sub">Six integrated modules covering the full campus operations lifecycle.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feat-card" style={{'--fc-glow':f.glow}}>
              <div className="feat-icon-wrap" style={{'--fi-a':f.colorA,'--fi-b':f.colorB,background:`linear-gradient(135deg,${f.colorA}22,${f.colorB}22)`}}>
                {f.icon}
              </div>
              <div className="feat-tags">{f.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
              <Link to={f.link} className="feat-link" style={{color:f.colorA}}>Explore module <span>→</span></Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ WORKFLOW ══════ */}
      <section className="section" id="workflow" style={{paddingBottom:'40px'}}>
        <div className="section-header">
          <div className="section-eyebrow">Workflow</div>
          <h2 className="section-title">How Booking Works</h2>
          <p className="section-sub">A transparent, conflict-free pipeline from request to confirmed slot.</p>
        </div>
        <div className="workflow">
          {['Request','PENDING','Admin Review','APPROVED','Use Facility','CANCELLED?'].map((s,i)=>(
            <div className="wf-step" key={s}>
              <div className={`wf-dot${i===3?' active':''}`}>{i+1}</div>
              <div className="wf-label">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CTA BAND ══════ */}
      <div className="band">
        <h3 className="band-title">
          Built with <span>Spring Boot</span> &amp; <span>React</span> —
          production-grade, role-secured, and audit-ready.
        </h3>
        <Link to="/login" className="btn-primary" style={{display:'inline-flex'}}>
          Launch Dashboard →
        </Link>
      </div>
    </>
  );
};

export default Home;