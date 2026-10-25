import { useEffect, useState } from 'react';

const PAIRS = [['#6d5dfc', '#a78bfa'], ['#ec4899', '#f97316'], ['#06b6d4', '#3b82f6'], ['#10b981', '#84cc16'], ['#f59e0b', '#ef4444']];
export const grad = (i = 0) => `linear-gradient(135deg, ${PAIRS[i % PAIRS.length][0]}, ${PAIRS[i % PAIRS.length][1]})`;
const hash = (s) => [...(s || '?')].reduce((a, c) => a + c.charCodeAt(0), 0);
export const pctOf = (r) => (r.total ? Math.round((r.score / r.total) * 100) : 0);
export const scoreColor = (p) => (p >= 75 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444');

export function Avatar({ name, size = 40 }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: grad(hash(name)) }}>{initials}</div>;
}

export function Stat({ icon: Icon, label, value, i = 0 }) {
  return (
    <div className="stat" style={{ background: grad(i) }}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Ring({ pct, size = 64, stroke = 7 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(pct), 80); return () => clearTimeout(t); }, [pct]);
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--soft)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreColor(pct)} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <span style={{ fontSize: size * 0.26 }}>{pct}%</span>
    </div>
  );
}

export function Bar({ pct }) {
  return <div className="bar"><i style={{ width: pct + '%', background: scoreColor(pct) }} /></div>;
}

export function Empty({ icon: Icon, title, text }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={30} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function PageTitle({ title, sub, children }) {
  return (
    <div className="page-title">
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      <div>{children}</div>
    </div>
  );
}
