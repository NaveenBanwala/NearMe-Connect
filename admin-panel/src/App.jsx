import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ClusterReview from './pages/ClusterReview.jsx'          // ← replaces BlockRequests
import BlockEditor from './pages/BlockEditor.jsx'
import UserManagement from './pages/UserManagement.jsx'
import VerificationQueue from './pages/VerificationQueue.jsx'
import HeatMap from './pages/HeatMap.jsx'
import Reports from './pages/Reports.jsx'
import api from './services/adminApi.js'
import 'leaflet/dist/leaflet.css';
export default function App() {
  const [user, setUser]       = useState(null)
  const [checking, setChecking] = useState(true)

  // On load — check if token already exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      api.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('admin_token')
          delete api.defaults.headers.common.Authorization
        })
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    delete api.defaults.headers.common.Authorization
    setUser(null)
  }

  if (checking) return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Login onLogin={setUser} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
          <Route index                    element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="clusters/review"   element={<ClusterReview />} />          {/* ← replaces block-requests */}
          <Route path="block-editor"      element={<BlockEditor />} />
          <Route path="block-editor/:id"  element={<BlockEditor />} />
          <Route path="users"             element={<UserManagement />} />
          <Route path="verification"      element={<VerificationQueue />} />
          <Route path="heatmap"           element={<HeatMap />} />
          <Route path="reports"           element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

// import { useState, useMemo, useEffect, useCallback } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, LineChart, Line, Legend,
// } from "recharts";

// /* ─────────────────────────────────────────────
//    SENTIMENT ENGINE (keyword-based NLP)
// ───────────────────────────────────────────── */
// const POS = ['amazing','wonderful','fantastic','great','excellent','beautiful','loved',
//   'perfect','stunning','breathtaking','awesome','incredible','outstanding','superb',
//   'magnificent','delightful','enjoyable','pleasant','good','nice','best','peaceful',
//   'clean','friendly','gorgeous','spectacular','impressive','lovely','charming','scenic',
//   'unforgettable','paradise','worth','gem','recommended','must-visit'];
// const NEG = ['terrible','awful','horrible','bad','poor','disappointing','worst',
//   'disgusting','dirty','crowded','overrated','expensive','rude','avoid','waste',
//   'boring','mediocre','unpleasant','ugly','loud','smelly','dangerous','overpriced',
//   'scam','dull','filthy','chaotic','polluted','sketchy','unsafe'];

// function getSentiment(text) {
//   const t = text.toLowerCase();
//   const pos = POS.filter(w => t.includes(w)).length;
//   const neg = NEG.filter(w => t.includes(w)).length;
//   if (pos === 0 && neg === 0) return 'positive';
//   return neg > pos ? 'negative' : 'positive';
// }

// /* ─────────────────────────────────────────────
//    SEED DATA
// ───────────────────────────────────────────── */
// let _uid = 4, _rid = 9;

// const SEED_USERS = [
//   { id: 1, name: 'Admin', email: 'admin@tour.com', password: 'admin123', isAdmin: true },
//   { id: 2, name: 'Priya Sharma', email: 'priya@example.com', password: 'pass123', isAdmin: false },
//   { id: 3, name: 'Rahul Gupta', email: 'rahul@example.com', password: 'pass123', isAdmin: false },
// ];

// const SEED_REVIEWS = [
//   { id: 1, userId: 2, userName: 'Priya Sharma', destination: 'Taj Mahal', rating: 5, text: 'Absolutely stunning! The architecture is breathtaking and the history is amazing. A must-visit.', sentiment: 'positive', date: '2024-11-10' },
//   { id: 2, userId: 3, userName: 'Rahul Gupta', destination: 'Goa Beaches', rating: 4, text: 'Beautiful beaches with wonderful sunsets. The seafood is great but it can get crowded.', sentiment: 'positive', date: '2024-11-15' },
//   { id: 3, userId: 2, userName: 'Priya Sharma', destination: 'Jaipur', rating: 5, text: 'The Pink City is magnificent! The palaces are incredible and the local culture is outstanding.', sentiment: 'positive', date: '2024-11-20' },
//   { id: 4, userId: 3, userName: 'Rahul Gupta', destination: 'Taj Mahal', rating: 3, text: 'Mediocre experience. Long queues, overpriced entry tickets, and very disappointing overall.', sentiment: 'negative', date: '2024-12-01' },
//   { id: 5, userId: 2, userName: 'Priya Sharma', destination: 'Kerala Backwaters', rating: 5, text: 'A delightful and peaceful experience. The houseboat stay was perfect. Absolutely loved it!', sentiment: 'positive', date: '2024-12-05' },
//   { id: 6, userId: 3, userName: 'Rahul Gupta', destination: 'Goa Beaches', rating: 2, text: 'Too crowded, dirty, and expensive. The water was filthy in some areas. Avoid peak season.', sentiment: 'negative', date: '2024-12-10' },
//   { id: 7, userId: 2, userName: 'Priya Sharma', destination: 'Shimla', rating: 4, text: 'Nice hill station with pleasant weather. The mall road is good and the mountain views are lovely.', sentiment: 'positive', date: '2025-01-05' },
//   { id: 8, userId: 3, userName: 'Rahul Gupta', destination: 'Shimla', rating: 5, text: 'Wonderful snowfall experience! Absolutely loved it – best winter destination I have visited.', sentiment: 'positive', date: '2025-01-12' },
// ];

// const DESTINATIONS = ['Taj Mahal', 'Goa Beaches', 'Jaipur', 'Kerala Backwaters', 'Shimla',
//   'Varanasi', 'Darjeeling', 'Manali', 'Rishikesh', 'Mysore', 'Udaipur', 'Amritsar'];

// /* ─────────────────────────────────────────────
//    THEME TOKENS
// ───────────────────────────────────────────── */
// const C = {
//   bg: '#080F1E',
//   surface: '#0F1A2E',
//   card: 'rgba(255,255,255,0.04)',
//   cardBorder: 'rgba(255,255,255,0.08)',
//   accent: '#F5A623',
//   accentDim: 'rgba(245,166,35,0.12)',
//   coral: '#E8654A',
//   coralDim: 'rgba(232,101,74,0.12)',
//   green: '#27AE60',
//   greenDim: 'rgba(39,174,96,0.12)',
//   blue: '#3498DB',
//   text: '#E8E4DC',
//   muted: '#8A9BB0',
//   dim: '#3A4A5C',
// };

// const S = {
//   card: {
//     background: C.card,
//     border: `1px solid ${C.cardBorder}`,
//     borderRadius: 14,
//     padding: 24,
//   },
//   input: {
//     background: 'rgba(255,255,255,0.06)',
//     border: '1px solid rgba(255,255,255,0.12)',
//     borderRadius: 8,
//     color: C.text,
//     padding: '10px 14px',
//     fontSize: 14,
//     fontFamily: "'DM Sans', sans-serif",
//     width: '100%',
//     outline: 'none',
//     transition: 'border-color 0.2s',
//   },
//   label: {
//     fontSize: 11,
//     fontWeight: 600,
//     color: C.muted,
//     letterSpacing: 1.2,
//     textTransform: 'uppercase',
//     marginBottom: 6,
//     display: 'block',
//   },
//   btnPrimary: {
//     background: `linear-gradient(135deg, ${C.accent} 0%, ${C.coral} 100%)`,
//     color: '#0A1628',
//     border: 'none',
//     padding: '10px 22px',
//     borderRadius: 8,
//     cursor: 'pointer',
//     fontFamily: "'DM Sans', sans-serif",
//     fontWeight: 700,
//     fontSize: 14,
//     transition: 'opacity 0.2s',
//   },
//   btnOutline: {
//     background: 'transparent',
//     color: C.accent,
//     border: `1px solid ${C.accent}`,
//     padding: '9px 20px',
//     borderRadius: 8,
//     cursor: 'pointer',
//     fontFamily: "'DM Sans', sans-serif",
//     fontWeight: 500,
//     fontSize: 14,
//     transition: 'all 0.2s',
//   },
//   btnGhost: {
//     background: 'transparent',
//     color: C.muted,
//     border: '1px solid transparent',
//     padding: '6px 14px',
//     borderRadius: 6,
//     cursor: 'pointer',
//     fontFamily: "'DM Sans', sans-serif",
//     fontSize: 13,
//     transition: 'all 0.2s',
//   },
//   btnDanger: {
//     background: C.coralDim,
//     color: C.coral,
//     border: `1px solid rgba(232,101,74,0.3)`,
//     padding: '5px 12px',
//     borderRadius: 6,
//     cursor: 'pointer',
//     fontFamily: "'DM Sans', sans-serif",
//     fontSize: 12,
//     fontWeight: 500,
//   },
//   h1: {
//     fontFamily: "'Playfair Display', serif",
//     fontSize: 44,
//     fontWeight: 900,
//     lineHeight: 1.1,
//     color: C.text,
//   },
//   h2: {
//     fontFamily: "'Playfair Display', serif",
//     fontSize: 28,
//     fontWeight: 700,
//     color: C.text,
//   },
//   h3: {
//     fontFamily: "'Playfair Display', serif",
//     fontSize: 18,
//     fontWeight: 600,
//     color: C.text,
//   },
//   section: {
//     maxWidth: 1160,
//     margin: '0 auto',
//     padding: '44px 24px',
//   },
//   badge: (type) => ({
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: 4,
//     padding: '3px 9px',
//     borderRadius: 20,
//     fontSize: 10,
//     fontWeight: 700,
//     letterSpacing: 0.8,
//     textTransform: 'uppercase',
//     background: type === 'positive' ? C.greenDim : C.coralDim,
//     color: type === 'positive' ? C.green : C.coral,
//     border: `1px solid ${type === 'positive' ? 'rgba(39,174,96,0.3)' : 'rgba(232,101,74,0.3)'}`,
//   }),
// };

// /* ─────────────────────────────────────────────
//    STAR RATING
// ───────────────────────────────────────────── */
// function Stars({ rating, onChange, size = 20 }) {
//   const [hov, setHov] = useState(0);
//   return (
//     <div style={{ display: 'flex', gap: 3 }}>
//       {[1, 2, 3, 4, 5].map(i => (
//         <span
//           key={i}
//           onClick={() => onChange?.(i)}
//           onMouseEnter={() => onChange && setHov(i)}
//           onMouseLeave={() => onChange && setHov(0)}
//           style={{
//             fontSize: size,
//             cursor: onChange ? 'pointer' : 'default',
//             color: i <= (hov || rating) ? C.accent : C.dim,
//             transition: 'color 0.15s',
//             userSelect: 'none',
//           }}
//         >★</span>
//       ))}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    TOAST NOTIFICATION
// ───────────────────────────────────────────── */
// function Toast({ n }) {
//   if (!n) return null;
//   return (
//     <div style={{
//       position: 'fixed', top: 76, right: 16, zIndex: 9999,
//       background: n.type === 'error' ? C.coral : C.green,
//       color: '#fff', padding: '11px 18px', borderRadius: 9,
//       fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
//       boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
//       animation: 'toastIn 0.3s ease',
//       display: 'flex', alignItems: 'center', gap: 8,
//     }}>
//       {n.type === 'error' ? '✕' : '✓'} {n.msg}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    REVIEW CARD
// ───────────────────────────────────────────── */
// function ReviewCard({ r, user, onEdit, onDelete }) {
//   return (
//     <div style={{ ...S.card, transition: 'border-color 0.2s', ':hover': { borderColor: 'rgba(245,166,35,0.2)' } }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, marginBottom: 2, color: C.text }}>{r.destination}</div>
//           <div style={{ fontSize: 12, color: C.muted }}>by {r.userName} · {r.date}</div>
//         </div>
//         <span style={S.badge(r.sentiment)}>{r.sentiment === 'positive' ? '▲' : '▼'} {r.sentiment}</span>
//       </div>
//       <Stars rating={r.rating} size={17} />
//       <p style={{ fontSize: 13, color: '#9AAAB8', lineHeight: 1.65, margin: '10px 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
//         {r.text}
//       </p>
//       {(user?.id === r.userId || user?.isAdmin) && (
//         <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.cardBorder}` }}>
//           {user?.id === r.userId && (
//             <button style={{ ...S.btnOutline, padding: '4px 12px', fontSize: 12 }} onClick={() => onEdit(r)}>Edit</button>
//           )}
//           <button style={S.btnDanger} onClick={() => onDelete(r.id)}>Delete</button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    CHART TOOLTIP
// ───────────────────────────────────────────── */
// const ChartTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background: '#1A2840', border: `1px solid rgba(245,166,35,0.25)`, borderRadius: 8, padding: '8px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.text }}>
//       <div style={{ color: C.muted, marginBottom: 4 }}>{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} style={{ color: C.accent, fontWeight: 600 }}>{p.name}: {p.value}</div>
//       ))}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────────
//    MAIN APP
// ───────────────────────────────────────────── */
// export default function App() {
//   const [page, setPage] = useState('home');
//   const [users, setUsers] = useState(SEED_USERS);
//   const [reviews, setReviews] = useState(SEED_REVIEWS);
//   const [me, setMe] = useState(null);
//   const [authTab, setAuthTab] = useState('login');
//   const [editRev, setEditRev] = useState(null);
//   const [search, setSearch] = useState('');
//   const [sortBy, setSortBy] = useState('date');
//   const [filterRating, setFilterRating] = useState(0);
//   const [toast, setToast] = useState(null);

//   // Font injection
//   useEffect(() => {
//     const lnk = document.createElement('link');
//     lnk.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
//     lnk.rel = 'stylesheet';
//     document.head.appendChild(lnk);
//     const sty = document.createElement('style');
//     sty.textContent = `
//       *{box-sizing:border-box;margin:0;padding:0;}
//       body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
//       @keyframes toastIn{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}
//       @keyframes fadeUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
//       ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${C.accentDim};border-radius:3px}
//       select option{background:#0F1A2E;color:${C.text}}
//     `;
//     document.head.appendChild(sty);
//   }, []);

//   const notify = useCallback((msg, type = 'ok') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3200);
//   }, []);

//   /* ── AUTH ── */
//   const doLogin = (email, pw) => {
//     const u = users.find(x => x.email === email && x.password === pw);
//     if (u) { setMe(u); notify(`Welcome back, ${u.name}!`); setPage('home'); }
//     else notify('Invalid email or password', 'error');
//   };

//   const doRegister = (name, email, pw) => {
//     if (!name || !email || !pw) return notify('All fields required', 'error');
//     if (pw.length < 6) return notify('Password min 6 characters', 'error');
//     if (users.find(u => u.email === email)) return notify('Email already registered', 'error');
//     const u = { id: _uid++, name, email, password: pw, isAdmin: false };
//     setUsers(p => [...p, u]);
//     setMe(u);
//     notify(`Account created! Welcome, ${name}!`);
//     setPage('home');
//   };

//   const doLogout = () => { setMe(null); setPage('home'); notify('Logged out'); };

//   /* ── REVIEWS ── */
//   const submitReview = (dest, rating, text) => {
//     const sentiment = getSentiment(text);
//     if (editRev) {
//       setReviews(p => p.map(r => r.id === editRev.id ? { ...r, destination: dest, rating, text, sentiment } : r));
//       setEditRev(null);
//       notify('Review updated!');
//     } else {
//       setReviews(p => [...p, {
//         id: _rid++, userId: me.id, userName: me.name,
//         destination: dest, rating, text, sentiment,
//         date: new Date().toISOString().slice(0, 10),
//       }]);
//       notify('Review submitted!');
//     }
//     setPage('reviews');
//   };

//   const deleteReview = (id) => { setReviews(p => p.filter(r => r.id !== id)); notify('Review deleted'); };

//   /* ── FILTERED REVIEWS ── */
//   const filtered = useMemo(() => {
//     let r = [...reviews];
//     if (search) r = r.filter(x => x.destination.toLowerCase().includes(search.toLowerCase()) || x.userName.toLowerCase().includes(search.toLowerCase()));
//     if (filterRating) r = r.filter(x => x.rating === filterRating);
//     if (sortBy === 'high') r.sort((a, b) => b.rating - a.rating);
//     else if (sortBy === 'low') r.sort((a, b) => a.rating - b.rating);
//     else r.sort((a, b) => new Date(b.date) - new Date(a.date));
//     return r;
//   }, [reviews, search, filterRating, sortBy]);

//   /* ── ANALYTICS ── */
//   const analytics = useMemo(() => {
//     const destMap = {};
//     reviews.forEach(r => {
//       if (!destMap[r.destination]) destMap[r.destination] = { total: 0, count: 0 };
//       destMap[r.destination].total += r.rating;
//       destMap[r.destination].count++;
//     });
//     const avgRatings = Object.entries(destMap)
//       .map(([d, { total, count }]) => ({ destination: d, avgRating: +(total / count).toFixed(1), count }))
//       .sort((a, b) => b.avgRating - a.avgRating);

//     const pos = reviews.filter(r => r.sentiment === 'positive').length;
//     const neg = reviews.filter(r => r.sentiment === 'negative').length;
//     const sentiment = [{ name: 'Positive', value: pos }, { name: 'Negative', value: neg }];

//     const monthMap = {};
//     reviews.forEach(r => { const m = r.date.slice(0, 7); monthMap[m] = (monthMap[m] || 0) + 1; });
//     const timeline = Object.entries(monthMap)
//       .sort(([a], [b]) => a.localeCompare(b))
//       .map(([m, v]) => ({ month: m, reviews: v }));

//     const avgAll = +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
//     const posPercent = Math.round((pos / reviews.length) * 100);

//     return { avgRatings, sentiment, timeline, avgAll, posPercent };
//   }, [reviews]);

//   /* ───────── NAV ───────── */
//   const Nav = () => (
//     <nav style={{
//       background: 'rgba(8,15,30,0.96)', backdropFilter: 'blur(12px)',
//       position: 'sticky', top: 0, zIndex: 100,
//       height: 60, padding: '0 28px',
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       borderBottom: '1px solid rgba(245,166,35,0.1)',
//     }}>
//       <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: C.accent, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
//         ✦ TourReview
//       </button>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//         {[['home','Home'],['reviews','Reviews'],['dashboard','Analytics'],...(me?.isAdmin ? [['admin','Admin']] : [])].map(([id, label]) => (
//           <button key={id} onClick={() => setPage(id)} style={{ ...S.btnGhost, color: page === id ? C.accent : C.muted, background: page === id ? C.accentDim : 'transparent', border: page === id ? `1px solid rgba(245,166,35,0.25)` : '1px solid transparent' }}>
//             {label}
//           </button>
//         ))}
//         {me ? (
//           <>
//             <button onClick={() => { setEditRev(null); setPage('submit'); }} style={{ ...S.btnGhost, color: C.text, marginLeft: 4 }}>+ Review</button>
//             <div style={{ fontSize: 12, color: C.accent, padding: '5px 12px', background: C.accentDim, borderRadius: 20, marginLeft: 4, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {me.name}
//             </div>
//             <button onClick={doLogout} style={{ ...S.btnDanger, marginLeft: 4 }}>Logout</button>
//           </>
//         ) : (
//           <button onClick={() => setPage('auth')} style={{ ...S.btnPrimary, marginLeft: 8, padding: '7px 18px' }}>Sign In</button>
//         )}
//       </div>
//     </nav>
//   );

//   /* ───────── HOME ───────── */
//   const Home = () => (
//     <div>
//       {/* Hero */}
//       <div style={{ background: `linear-gradient(160deg, #080F1E 0%, #0D1B35 50%, #080F1E 100%)`, padding: '72px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 60% 60% at 15% 50%, rgba(245,166,35,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 85% 50%, rgba(232,101,74,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />
//         <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', animation: 'fadeUp 0.7s ease' }}>
//           <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, fontWeight: 700, marginBottom: 18, opacity: 0.8 }}>✦ DISCOVER · REVIEW · ANALYZE</div>
//           <h1 style={{ ...S.h1, fontSize: 52, background: `linear-gradient(135deg, ${C.text} 40%, ${C.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
//             Tour Review<br />Analytics
//           </h1>
//           <p style={{ color: '#7A8FA5', fontSize: 16, lineHeight: 1.7, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
//             Share travel experiences. Discover top-rated destinations. Understand sentiment through visual analytics.
//           </p>
//           <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
//             <button style={S.btnPrimary} onClick={() => setPage(me ? 'submit' : 'auth')}>✏ Write a Review</button>
//             <button style={S.btnOutline} onClick={() => setPage('dashboard')}>⬡ View Analytics</button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Bar */}
//       <div style={{ background: 'rgba(245,166,35,0.04)', borderTop: '1px solid rgba(245,166,35,0.1)', borderBottom: '1px solid rgba(245,166,35,0.1)' }}>
//         <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '22px 24px', textAlign: 'center' }}>
//           {[
//             ['Total Reviews', reviews.length],
//             ['Destinations', [...new Set(reviews.map(r => r.destination))].length],
//             ['Avg Rating', analytics.avgAll + ' ★'],
//             ['Positive', analytics.posPercent + '%'],
//           ].map(([label, val]) => (
//             <div key={label}>
//               <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.accent }}>{val}</div>
//               <div style={{ fontSize: 11, color: '#556070', letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent + Top */}
//       <div style={S.section}>
//         <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
//           <div>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
//               <h2 style={S.h2}>Recent Reviews</h2>
//               <button style={S.btnOutline} onClick={() => setPage('reviews')}>View all →</button>
//             </div>
//             <div style={{ display: 'grid', gap: 16 }}>
//               {[...reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4).map(r => (
//                 <ReviewCard key={r.id} r={r} user={me} onEdit={rv => { setEditRev(rv); setPage('submit'); }} onDelete={deleteReview} />
//               ))}
//             </div>
//           </div>
//           <div>
//             <h2 style={{ ...S.h2, marginBottom: 24 }}>Top Destinations</h2>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//               {analytics.avgRatings.slice(0, 6).map((d, i) => (
//                 <div key={d.destination} style={{ ...S.card, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: i === 0 ? `3px solid ${C.accent}` : `1px solid ${C.cardBorder}` }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                     <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{['🏆','🥈','🥉','④','⑤','⑥'][i]}</span>
//                     <div>
//                       <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{d.destination}</div>
//                       <div style={{ fontSize: 11, color: C.muted }}>{d.count} reviews</div>
//                     </div>
//                   </div>
//                   <div style={{ color: C.accent, fontWeight: 700, fontSize: 15 }}>{d.avgRating}★</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   /* ───────── AUTH ───────── */
//   const Auth = () => {
//     const [n, setN] = useState(''); const [e, setE] = useState(''); const [p, setP] = useState('');
//     return (
//       <div style={{ maxWidth: 460, margin: '56px auto', padding: '0 24px' }}>
//         <div style={S.card}>
//           <div style={{ display: 'flex', marginBottom: 24, borderBottom: `1px solid ${C.cardBorder}` }}>
//             {[['login','Sign In'],['register','Create Account']].map(([id, label]) => (
//               <button key={id} onClick={() => setAuthTab(id)} style={{ flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${authTab === id ? C.accent : 'transparent'}`, color: authTab === id ? C.accent : C.muted, padding: '10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: -1, transition: 'all 0.2s' }}>
//                 {label}
//               </button>
//             ))}
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//             {authTab === 'register' && (
//               <div><label style={S.label}>Full Name</label><input style={S.input} value={n} onChange={ev => setN(ev.target.value)} placeholder="Your name" /></div>
//             )}
//             <div><label style={S.label}>Email</label><input style={S.input} type="email" value={e} onChange={ev => setE(ev.target.value)} placeholder="you@example.com" /></div>
//             <div><label style={S.label}>Password</label><input style={S.input} type="password" value={p} onChange={ev => setP(ev.target.value)} placeholder="••••••••" /></div>
//             <button style={S.btnPrimary} onClick={() => authTab === 'login' ? doLogin(e, p) : doRegister(n, e, p)}>
//               {authTab === 'login' ? 'Sign In' : 'Create Account'}
//             </button>
//           </div>
//           <div style={{ marginTop: 20, padding: 14, background: 'rgba(245,166,35,0.05)', borderRadius: 8, fontSize: 12, color: C.dim, lineHeight: 1.8 }}>
//             <span style={{ color: C.accent, fontWeight: 600 }}>Demo credentials:</span><br />
//             Admin: admin@tour.com / admin123<br />
//             User: priya@example.com / pass123
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* ───────── REVIEWS LIST ───────── */
//   const ReviewsList = () => (
//     <div style={S.section}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
//         <h2 style={S.h2}>All Reviews <span style={{ fontSize: 15, color: C.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>({filtered.length})</span></h2>
//         {me && <button style={S.btnPrimary} onClick={() => { setEditRev(null); setPage('submit'); }}>+ Write Review</button>}
//       </div>
//       <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
//         <input style={{ ...S.input, maxWidth: 280 }} placeholder="🔍 Search destination or user…" value={search} onChange={ev => setSearch(ev.target.value)} />
//         <select value={sortBy} onChange={ev => setSortBy(ev.target.value)} style={{ ...S.input, maxWidth: 190, cursor: 'pointer' }}>
//           <option value="date">Sort: Newest first</option>
//           <option value="high">Sort: Highest rating</option>
//           <option value="low">Sort: Lowest rating</option>
//         </select>
//         <select value={filterRating} onChange={ev => setFilterRating(Number(ev.target.value))} style={{ ...S.input, maxWidth: 160, cursor: 'pointer' }}>
//           <option value={0}>All ratings</option>
//           {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} ★</option>)}
//         </select>
//       </div>
//       {filtered.length === 0 ? (
//         <div style={{ textAlign: 'center', color: C.muted, padding: '60px 0', fontStyle: 'italic' }}>No reviews match your filters.</div>
//       ) : (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 18 }}>
//           {filtered.map(r => (
//             <ReviewCard key={r.id} r={r} user={me} onEdit={rv => { setEditRev(rv); setPage('submit'); }} onDelete={deleteReview} />
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   /* ───────── SUBMIT REVIEW ───────── */
//   const SubmitReview = () => {
//     const [dest, setDest] = useState(editRev?.destination || '');
//     const [rating, setRating] = useState(editRev?.rating || 0);
//     const [text, setText] = useState(editRev?.text || '');
//     const liveSentiment = text.length > 5 ? getSentiment(text) : null;

//     return (
//       <div style={{ maxWidth: 620, margin: '0 auto', padding: '44px 24px' }}>
//         <h2 style={{ ...S.h2, marginBottom: 6 }}>{editRev ? 'Edit Review' : 'Write a Review'}</h2>
//         <p style={{ color: C.muted, marginBottom: 32, fontSize: 14 }}>Share your travel experience with the community</p>
//         <div style={S.card}>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//             <div>
//               <label style={S.label}>Destination</label>
//               <input style={S.input} value={dest} onChange={ev => setDest(ev.target.value)} placeholder="e.g. Taj Mahal, Goa Beaches…" list="dests" />
//               <datalist id="dests">{DESTINATIONS.map(d => <option key={d} value={d} />)}</datalist>
//             </div>
//             <div>
//               <label style={S.label}>Your Rating</label>
//               <Stars rating={rating} onChange={setRating} size={26} />
//               {rating > 0 && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{['','Terrible','Poor','Average','Good','Excellent'][rating]}</div>}
//             </div>
//             <div>
//               <label style={S.label}>Review Text</label>
//               <textarea
//                 style={{ ...S.input, minHeight: 130, resize: 'vertical', lineHeight: 1.65 }}
//                 value={text}
//                 onChange={ev => setText(ev.target.value)}
//                 placeholder="Describe your experience in detail…"
//               />
//               {liveSentiment && (
//                 <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
//                   <span style={{ color: C.muted }}>Sentiment detected:</span>
//                   <span style={S.badge(liveSentiment)}>{liveSentiment === 'positive' ? '▲' : '▼'} {liveSentiment}</span>
//                 </div>
//               )}
//             </div>
//             <div style={{ display: 'flex', gap: 12 }}>
//               <button
//                 style={{ ...S.btnPrimary, opacity: (!dest || !rating || text.length < 10) ? 0.5 : 1 }}
//                 onClick={() => dest && rating && text.length >= 10 && submitReview(dest, rating, text)}
//               >
//                 {editRev ? 'Update Review' : 'Submit Review'}
//               </button>
//               <button style={S.btnOutline} onClick={() => { setEditRev(null); setPage('reviews'); }}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* ───────── DASHBOARD ───────── */
//   const Dashboard = () => (
//     <div style={S.section}>
//       <h2 style={{ ...S.h2, marginBottom: 4 }}>Analytics Dashboard</h2>
//       <p style={{ color: C.muted, fontSize: 14, marginBottom: 36 }}>
//         {reviews.length} reviews · {[...new Set(reviews.map(r => r.destination))].length} destinations
//       </p>

//       {/* KPI Cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
//         {[
//           { label: 'Total Reviews', val: reviews.length, icon: '📝', accent: C.blue },
//           { label: 'Destinations', val: [...new Set(reviews.map(r => r.destination))].length, icon: '📍', accent: C.accent },
//           { label: 'Avg Rating', val: analytics.avgAll + ' ★', icon: '⭐', accent: C.accent },
//           { label: 'Positive', val: analytics.posPercent + '%', icon: '✓', accent: C.green },
//         ].map(k => (
//           <div key={k.label} style={{ ...S.card, borderLeft: `3px solid ${k.accent}`, paddingTop: 20 }}>
//             <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
//             <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: k.accent }}>{k.val}</div>
//             <div style={{ fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: 0.5 }}>{k.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Bar + Pie */}
//       <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
//         <div style={S.card}>
//           <h3 style={{ ...S.h3, fontSize: 15, marginBottom: 20 }}>Average Rating per Destination</h3>
//           <ResponsiveContainer width="100%" height={280}>
//             <BarChart data={analytics.avgRatings} margin={{ left: -20, bottom: 55 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
//               <XAxis dataKey="destination" tick={{ fill: C.muted, fontSize: 11 }} angle={-35} textAnchor="end" />
//               <YAxis domain={[0, 5]} tick={{ fill: C.muted, fontSize: 11 }} />
//               <Tooltip content={<ChartTooltip />} />
//               <Bar dataKey="avgRating" name="Avg Rating" fill={C.accent} radius={[5, 5, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//         <div style={S.card}>
//           <h3 style={{ ...S.h3, fontSize: 15, marginBottom: 4 }}>Sentiment Breakdown</h3>
//           <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
//             {analytics.sentiment.map(s => (
//               <span key={s.name} style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
//                 <span style={{ width: 9, height: 9, borderRadius: 2, background: s.name === 'Positive' ? C.green : C.coral, display: 'inline-block' }} />
//                 {s.name} ({s.value})
//               </span>
//             ))}
//           </div>
//           <ResponsiveContainer width="100%" height={260}>
//             <PieChart>
//               <Pie data={analytics.sentiment} cx="50%" cy="50%" innerRadius={65} outerRadius={105} dataKey="value"
//                 label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={{ stroke: C.muted }}>
//                 <Cell fill={C.green} />
//                 <Cell fill={C.coral} />
//               </Pie>
//               <Tooltip content={<ChartTooltip />} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Line Chart */}
//       <div style={{ ...S.card, marginBottom: 20 }}>
//         <h3 style={{ ...S.h3, fontSize: 15, marginBottom: 20 }}>Review Volume Over Time</h3>
//         <ResponsiveContainer width="100%" height={220}>
//           <LineChart data={analytics.timeline} margin={{ left: -20, right: 20 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
//             <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} />
//             <YAxis tick={{ fill: C.muted, fontSize: 11 }} />
//             <Tooltip content={<ChartTooltip />} />
//             <Line type="monotone" dataKey="reviews" name="Reviews" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 4 }} activeDot={{ r: 6, fill: C.coral }} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Leaderboard Table */}
//       <div style={S.card}>
//         <h3 style={{ ...S.h3, fontSize: 15, marginBottom: 20 }}>Destination Leaderboard</h3>
//         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//           <thead>
//             <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
//               {['Rank', 'Destination', 'Avg Rating', 'Reviews', 'Score'].map(h => (
//                 <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: C.dim, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {analytics.avgRatings.map((d, i) => (
//               <tr key={d.destination} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
//                 <td style={{ padding: '13px 12px', fontSize: 17 }}>{['🏆','🥈','🥉','④','⑤','⑥','⑦'][i] || i + 1}</td>
//                 <td style={{ padding: '13px 12px', fontWeight: 500, color: C.text }}>{d.destination}</td>
//                 <td style={{ padding: '13px 12px', color: C.accent }}>{'★'.repeat(Math.round(d.avgRating))} {d.avgRating}</td>
//                 <td style={{ padding: '13px 12px', color: C.muted }}>{d.count}</td>
//                 <td style={{ padding: '13px 12px' }}>
//                   <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, width: 80, overflow: 'hidden' }}>
//                     <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.accent}, ${C.coral})`, borderRadius: 3, width: `${(d.avgRating / 5) * 100}%` }} />
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   /* ───────── ADMIN PANEL ───────── */
//   const Admin = () => {
//     if (!me?.isAdmin) return (
//       <div style={{ ...S.section, textAlign: 'center', paddingTop: 80 }}>
//         <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
//         <h2 style={S.h2}>Access Denied</h2>
//         <p style={{ color: C.muted, marginTop: 8 }}>Admin credentials required</p>
//         <button style={{ ...S.btnPrimary, marginTop: 24 }} onClick={() => setPage('auth')}>Sign in as Admin</button>
//       </div>
//     );
//     return (
//       <div style={S.section}>
//         <h2 style={{ ...S.h2, marginBottom: 8 }}>Admin Panel</h2>
//         <p style={{ color: C.muted, fontSize: 14, marginBottom: 36 }}>Manage users and review moderation</p>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
//           {/* Users */}
//           <div>
//             <h3 style={{ ...S.h3, marginBottom: 16 }}>Registered Users ({users.filter(u => !u.isAdmin).length})</h3>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//               {users.filter(u => !u.isAdmin).map(u => (
//                 <div key={u.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                     <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.accentDim, border: `1px solid rgba(245,166,35,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: C.accent }}>
//                       {u.name[0]}
//                     </div>
//                     <div>
//                       <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{u.name}</div>
//                       <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
//                     </div>
//                   </div>
//                   <div style={{ textAlign: 'right' }}>
//                     <div style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{reviews.filter(r => r.userId === u.id).length}</div>
//                     <div style={{ fontSize: 10, color: C.dim }}>reviews</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           {/* Reviews */}
//           <div>
//             <h3 style={{ ...S.h3, marginBottom: 16 }}>All Reviews ({reviews.length})</h3>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
//               {[...reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => (
//                 <div key={r.id} style={{ ...S.card, padding: '14px 16px' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
//                     <div>
//                       <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{r.destination}</span>
//                       <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{'★'.repeat(r.rating)}</span>
//                     </div>
//                     <button style={S.btnDanger} onClick={() => deleteReview(r.id)}>Delete</button>
//                   </div>
//                   <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>by {r.userName} · {r.date}</div>
//                   <div style={{ fontSize: 12, color: '#6A7A8A', lineHeight: 1.5 }}>{r.text.slice(0, 90)}…</div>
//                   <div style={{ marginTop: 8 }}><span style={S.badge(r.sentiment)}>{r.sentiment}</span></div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* ───────── RENDER ───────── */
//   return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh', color: C.text }}>
//       <Toast n={toast} />
//       <Nav />
//       {page === 'home' && <Home />}
//       {page === 'auth' && <Auth />}
//       {page === 'reviews' && <ReviewsList />}
//       {page === 'submit' && (me ? <SubmitReview /> : (setPage('auth'), null))}
//       {page === 'dashboard' && <Dashboard />}
//       {page === 'admin' && <Admin />}
//       <footer style={{ textAlign: 'center', padding: '32px 24px', color: '#3A4A5C', fontSize: 12, borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 40 }}>
//         Tour Review Analytics · Academic Project · Built with React + Recharts
//       </footer>
//     </div>
//   );
// }
