import { useEffect, useState } from 'react';
import { Award, BarChart3, BookOpen, Check, ClipboardList, LayoutDashboard, MessageCircle, Plus, Target, Trash2, Trophy, UserPlus, Users, X } from 'lucide-react';
import { Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from './api';
import Chat from './Chat';
import { Avatar, Bar, Empty, PageTitle, Ring, Stat, grad, pctOf } from './Ui';

export const tabs = [
  ['overview', 'Overview', LayoutDashboard], ['students', 'Students', Users], ['quizzes', 'Quizzes', BookOpen],
  ['results', 'Results', BarChart3], ['chat', 'Chat', MessageCircle],
];
const tip = { borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.18)' };
const avgOf = (rs) => (rs.length ? Math.round(rs.reduce((a, x) => a + pctOf(x), 0) / rs.length) : 0);

export default function Tutor({ tab, user, go }) {
  if (tab === 'students') return <Students />;
  if (tab === 'quizzes') return <Quizzes />;
  if (tab === 'results') return <Results />;
  if (tab === 'chat') return <Chat user={user} />;
  return <Overview user={user} go={go} />;
}

function Overview({ user, go }) {
  const [d, setD] = useState(null);
  useEffect(() => { Promise.all([api('/students'), api('/quizzes'), api('/results')]).then(([s, q, r]) => setD({ s, q, r })); }, []);
  if (!d) return <p className="muted">Loading…</p>;
  const { s, q, r } = d;
  const perQuiz = q.map((z) => { const rs = r.filter((x) => x.quiz?._id === z._id); return { name: z.title.slice(0, 12), avg: avgOf(rs) }; });
  const timeline = [...r].reverse().slice(-12).map((x) => ({ name: (x.student?.name || '').split(' ')[0], pct: pctOf(x) }));
  const by = {};
  r.forEach((x) => { const k = x.student?._id; if (!k) return; by[k] ??= { name: x.student.name, list: [] }; by[k].list.push(x); });
  const top = Object.values(by).map((v) => ({ name: v.name, avg: avgOf(v.list), n: v.list.length })).sort((a, b) => b.avg - a.avg).slice(0, 5);

  return (
    <>
      <div className="hero">
        <div><h2>Hello, {user.name.split(' ')[0]}</h2><p>{s.length ? `You have ${s.length} student${s.length > 1 ? 's' : ''} and ${r.length} submitted quiz${r.length === 1 ? '' : 'zes'}.` : 'Start by registering your first student.'}</p></div>
        <button className="btn light" onClick={() => go(s.length ? 'quizzes' : 'students')}>{s.length ? <><Plus size={18} /> New quiz</> : <><UserPlus size={18} /> Add student</>}</button>
      </div>
      <div className="stats">
        <Stat i={0} icon={Users} label="Students" value={s.length} />
        <Stat i={1} icon={BookOpen} label="Quizzes" value={q.length} />
        <Stat i={2} icon={ClipboardList} label="Submissions" value={r.length} />
        <Stat i={3} icon={Target} label="Average score" value={r.length ? avgOf(r) + '%' : '—'} />
      </div>
      <div className="cols">
        <div className="card">
          <h3>Average score by quiz</h3>
          {perQuiz.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={perQuiz}>
                <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d5dfc" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" />
                <Tooltip contentStyle={tip} cursor={{ fill: 'var(--soft)' }} formatter={(v) => v + '%'} />
                <RBar dataKey="avg" fill="url(#gb)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="muted">Create a quiz to see scores here.</p>}
        </div>
        <div className="card">
          <h3>Recent scores</h3>
          {timeline.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timeline}>
                <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ec4899" stopOpacity={0.5} /><stop offset="100%" stopColor="#ec4899" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" />
                <Tooltip contentStyle={tip} formatter={(v) => v + '%'} />
                <Area type="monotone" dataKey="pct" stroke="#ec4899" strokeWidth={3} fill="url(#ga)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="muted">No submissions yet.</p>}
        </div>
      </div>
      <div className="card">
        <h3><Trophy size={18} style={{ verticalAlign: -3, color: '#f59e0b' }} /> Top students</h3>
        {!top.length && <p className="muted">Leaderboard appears after the first submission.</p>}
        {top.map((t, i) => (
          <div className="lrow" key={t.name}>
            <span className="rank" style={{ background: grad(i) }}>{i + 1}</span><Avatar name={t.name} size={36} />
            <div style={{ flex: 1 }}><b>{t.name}</b><Bar pct={t.avg} /></div><b>{t.avg}%</b>
          </div>
        ))}
      </div>
    </>
  );
}

function Students() {
  const [list, setList] = useState(null);
  const [res, setRes] = useState([]);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const load = () => { api('/students').then(setList); api('/results').then(setRes); };
  useEffect(load, []);
  const add = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/students', 'POST', f); setF({ name: '', email: '', password: '' }); load(); } catch (e) { setErr(e.message); }
  };
  return (
    <>
      <PageTitle title="Students" sub="Register students and track their progress" />
      <div className="cols narrow">
        <form className="card" onSubmit={add}>
          <h3><UserPlus size={18} style={{ verticalAlign: -3 }} /> Register a student</h3>
          <input placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          <input type="email" placeholder="Email address" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
          <input placeholder="Password (6+ characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
          {err && <div className="alert">{err}</div>}
          <button className="btn"><Plus size={18} /> Register</button>
        </form>
        <div>
          {list && !list.length && <Empty icon={Users} title="No students yet" text="Register your first student using the form." />}
          <div className="cards">
            {list?.map((s) => {
              const rs = res.filter((x) => x.student?._id === s._id);
              return (
                <div className="card student-card" key={s._id}>
                  <Avatar name={s.name} size={56} />
                  <b>{s.name}</b><small className="muted">{s.email}</small>
                  <div className="mini">
                    {rs.length ? <Ring pct={avgOf(rs)} size={58} /> : <span className="chip">No quizzes yet</span>}
                    <span className="chip"><Award size={14} /> {rs.length} done</span>
                  </div>
                  <button className="btn soft-danger" onClick={() => confirm('Remove ' + s.name + '?') && api('/students/' + s._id, 'DELETE').then(load)}><Trash2 size={16} /> Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

const blankQ = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0 });

function Quizzes() {
  const [list, setList] = useState(null);
  const [res, setRes] = useState([]);
  const [title, setTitle] = useState('');
  const [qs, setQs] = useState([blankQ()]);
  const [err, setErr] = useState('');
  const load = () => { api('/quizzes').then(setList); api('/results').then(setRes); };
  useEffect(load, []);
  const upd = (i, fn) => setQs(qs.map((q, j) => (j === i ? fn(q) : q)));
  const save = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/quizzes', 'POST', { title, questions: qs }); setTitle(''); setQs([blankQ()]); load(); } catch (e) { setErr(e.message); }
  };
  return (
    <>
      <PageTitle title="Quizzes" sub="Build a quiz — every student sees it instantly" />
      <div className="cols">
        <form className="card" onSubmit={save}>
          <h3><Plus size={18} style={{ verticalAlign: -3 }} /> New quiz</h3>
          <input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          {qs.map((q, i) => (
            <div className="qbox" key={i}>
              <div className="qhead"><span className="qnum" style={{ background: grad(i) }}>{i + 1}</span>
                {qs.length > 1 && <button type="button" className="icon-btn" aria-label="Remove question" onClick={() => setQs(qs.filter((_, j) => j !== i))}><X size={16} /></button>}
              </div>
              <input placeholder="Type the question" value={q.text} onChange={(e) => upd(i, (x) => ({ ...x, text: e.target.value }))} required />
              {q.options.map((o, k) => (
                <div className="opt-edit" key={k}>
                  <button type="button" className={'letter ' + (q.correctIndex === k ? 'ok' : '')} title="Mark as correct" onClick={() => upd(i, (x) => ({ ...x, correctIndex: k }))}>
                    {q.correctIndex === k ? <Check size={16} /> : 'ABCD'[k]}
                  </button>
                  <input placeholder={`Option ${'ABCD'[k]}`} value={o} required onChange={(e) => upd(i, (x) => ({ ...x, options: x.options.map((v, m) => (m === k ? e.target.value : v)) }))} />
                </div>
              ))}
              <small className="muted">Tap a letter to mark the correct answer.</small>
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => setQs([...qs, blankQ()])}><Plus size={18} /> Add question</button>
          {err && <div className="alert">{err}</div>}
          <button className="btn">Publish quiz</button>
        </form>
        <div>
          {list && !list.length && <Empty icon={BookOpen} title="No quizzes yet" text="Your published quizzes will show up here." />}
          {list?.map((z, i) => {
            const rs = res.filter((x) => x.quiz?._id === z._id);
            return (
              <div className="card quiz-card" key={z._id}>
                <div className="quiz-top" style={{ background: grad(i) }}><BookOpen size={26} /><b>{z.title}</b></div>
                <div className="quiz-meta">
                  <span className="chip">{z.questions.length} questions</span>
                  <span className="chip">{rs.length} submissions</span>
                  {rs.length > 0 && <span className="chip">avg {avgOf(rs)}%</span>}
                  <button className="icon-btn danger" aria-label="Delete quiz" onClick={() => confirm('Delete quiz and its results?') && api('/quizzes/' + z._id, 'DELETE').then(load)}><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Results() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('all');
  useEffect(() => { api('/results').then(setList); }, []);
  if (!list) return null;
  const quizzes = [...new Map(list.filter((r) => r.quiz).map((r) => [r.quiz._id, r.quiz.title]))];
  const shown = filter === 'all' ? list : list.filter((r) => r.quiz?._id === filter);
  return (
    <>
      <PageTitle title="Results" sub="Scores sent in by your students">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All quizzes</option>
          {quizzes.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
        </select>
      </PageTitle>
      {!shown.length && <Empty icon={BarChart3} title="No results yet" text="Scores appear here as soon as students submit." />}
      <div className="card">
        {shown.map((r) => {
          const p = pctOf(r);
          return (
            <div className="lrow" key={r._id}>
              <Avatar name={r.student?.name} size={40} />
              <div style={{ flex: 1 }}>
                <b>{r.student?.name}</b><small className="muted"> · {r.quiz?.title} · {new Date(r.createdAt).toLocaleDateString()}</small>
                <Bar pct={p} />
              </div>
              <div className="score"><b>{r.score}/{r.total}</b><small>{p}%</small></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
