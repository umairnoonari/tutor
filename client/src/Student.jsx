import { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, LayoutDashboard, MessageCircle, Play, Target, Trophy } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from './api';
import Chat from './Chat';
import { Empty, PageTitle, Ring, Stat, grad, pctOf } from './Ui';

export const tabs = [
  ['overview', 'Overview', LayoutDashboard], ['quizzes', 'Quizzes', BookOpen],
  ['results', 'My results', Trophy], ['chat', 'Chat', MessageCircle],
];

export default function Student({ tab, user, go }) {
  if (tab === 'quizzes') return <Quizzes />;
  if (tab === 'results') return <MyResults />;
  if (tab === 'chat') return <Chat user={user} />;
  return <Overview user={user} go={go} />;
}

function Overview({ user, go }) {
  const [d, setD] = useState(null);
  useEffect(() => { Promise.all([api('/quizzes'), api('/results')]).then(([q, r]) => setD({ q, r })); }, []);
  if (!d) return <p className="muted">Loading…</p>;
  const { q, r } = d;
  const pending = q.filter((x) => !x.done);
  const avg = r.length ? Math.round(r.reduce((a, x) => a + pctOf(x), 0) / r.length) : 0;
  const line = [...r].reverse().map((x) => ({ name: (x.quiz?.title || '').slice(0, 10), pct: pctOf(x) }));
  return (
    <>
      <div className="hero">
        <div><h2>Hi {user.name.split(' ')[0]}, ready to learn?</h2><p>{pending.length ? `${pending.length} quiz${pending.length > 1 ? 'zes are' : ' is'} waiting for you.` : "You're all caught up."}</p></div>
        {pending.length > 0 && <button className="btn light" onClick={() => go('quizzes')}><Play size={18} /> Start now</button>}
      </div>
      <div className="stats">
        <Stat i={0} icon={BookOpen} label="Quizzes" value={q.length} />
        <Stat i={3} icon={CheckCircle2} label="Completed" value={r.length} />
        <Stat i={1} icon={ClipboardCheck} label="Pending" value={pending.length} />
        <Stat i={2} icon={Target} label="Average score" value={r.length ? avg + '%' : '—'} />
      </div>
      <div className="card">
        <h3>My progress</h3>
        {line.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={line}>
              <defs><linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.5} /><stop offset="100%" stopColor="#6d5dfc" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} formatter={(v) => v + '%'} />
              <Area type="monotone" dataKey="pct" stroke="#6d5dfc" strokeWidth={3} fill="url(#gs)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="muted">Complete a quiz to see your progress chart.</p>}
      </div>
    </>
  );
}

function Quizzes() {
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(null);
  const load = () => api('/quizzes').then(setList);
  useEffect(() => { load(); }, []);
  if (open) return <Take quiz={open} onDone={() => { setOpen(null); load(); }} />;
  return (
    <>
      <PageTitle title="My quizzes" sub="Pick a quiz and give it your best" />
      {list && !list.length && <Empty icon={BookOpen} title="No quizzes yet" text="Your tutor hasn't set any quizzes yet." />}
      <div className="cards">
        {list?.map((q, i) => (
          <div className="card quiz-card" key={q._id}>
            <div className="quiz-top" style={{ background: grad(i) }}><BookOpen size={26} /><b>{q.title}</b></div>
            <div className="quiz-meta">
              <span className="chip">{q.questions.length} questions</span>
              {q.done ? <span className="chip done"><CheckCircle2 size={14} /> Completed</span>
                : <button className="btn" onClick={() => setOpen(q)}><Play size={16} /> Start</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Take({ quiz, onDone }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState(quiz.questions.map(() => -1));
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const confetti = useMemo(() => Array.from({ length: 36 }, (_, k) => ({ left: Math.random() * 100, delay: Math.random() * 1.5, c: ['#6d5dfc', '#ec4899', '#22d3ee', '#f59e0b', '#10b981'][k % 5] })), []);
  const q = quiz.questions[i], last = i === quiz.questions.length - 1;
  const answered = ans.filter((a) => a !== -1).length;

  const submit = async () => {
    if (ans.includes(-1) && !confirm('Some questions are unanswered. Submit anyway?')) return;
    try { setRes(await api('/results', 'POST', { quizId: quiz._id, answers: ans })); } catch (e) { setErr(e.message); }
  };

  if (res) {
    const p = Math.round((res.score / res.total) * 100);
    return (
      <div className="card result">
        {p >= 70 && <div className="confetti">{confetti.map((c, k) => <i key={k} style={{ left: c.left + '%', background: c.c, animationDelay: c.delay + 's' }} />)}</div>}
        <Award size={42} color="#f59e0b" />
        <h2>{p >= 90 ? 'Outstanding!' : p >= 70 ? 'Great job!' : p >= 50 ? 'Good effort' : 'Keep practising'}</h2>
        <Ring pct={p} size={150} stroke={12} />
        <p className="muted">You scored <b>{res.score}</b> out of <b>{res.total}</b>. Your tutor can see this result.</p>
        <button className="btn" onClick={onDone}>Back to quizzes</button>
      </div>
    );
  }
  return (
    <div className="card take">
      <div className="take-head"><b>{quiz.title}</b><span className="muted">Question {i + 1} of {quiz.questions.length}</span></div>
      <div className="bar big"><i style={{ width: ((i + 1) / quiz.questions.length) * 100 + '%', background: 'var(--grad)' }} /></div>
      <h2 className="qtext" key={i}>{q.text}</h2>
      {q.options.map((o, k) => (
        <div key={k} className={'option ' + (ans[i] === k ? 'sel' : '')} onClick={() => setAns(ans.map((a, j) => (j === i ? k : a)))}>
          <span className="letter">{'ABCD'[k]}</span>{o}
        </div>
      ))}
      {err && <div className="alert">{err}</div>}
      <div className="take-foot">
        <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={18} /> Back</button>
        <small className="muted">{answered}/{quiz.questions.length} answered</small>
        {last ? <button className="btn" onClick={submit}>Submit</button> : <button className="btn" onClick={() => setI(i + 1)}>Next <ChevronRight size={18} /></button>}
      </div>
    </div>
  );
}

function MyResults() {
  const [list, setList] = useState(null);
  useEffect(() => { api('/results').then(setList); }, []);
  return (
    <>
      <PageTitle title="My results" sub="Every score your tutor has received" />
      {list && !list.length && <Empty icon={Trophy} title="No results yet" text="Finish a quiz and your score will show up here." />}
      <div className="cards">
        {list?.map((r) => (
          <div className="card student-card" key={r._id}>
            <Ring pct={pctOf(r)} size={92} stroke={9} />
            <b>{r.quiz?.title}</b>
            <small className="muted">{r.score}/{r.total} correct · {new Date(r.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </>
  );
}
