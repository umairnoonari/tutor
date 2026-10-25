import { useState } from 'react';
import { BookOpenCheck, Eye, EyeOff, GraduationCap, Lock, Mail, MessageCircle, User, UserPlus } from 'lucide-react';
import { api } from './api';

export default function Login({ onLogin }) {
  const [signup, setSignup] = useState(false);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const d = await api(signup ? '/auth/register-tutor' : '/auth/login', 'POST', f);
      onLogin(d.user, d.token);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="auth">
      <section className="auth-hero">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
        <div className="hero-inner">
          <div className="brand light"><span className="brand-logo"><GraduationCap size={24} /></span><b>Tutor Portal</b></div>
          <h1>Teach smarter.<br />Learn faster.</h1>
          <p>One place for tutors to enrol students, set quizzes, track scores and stay in touch.</p>
          <ul>
            <li><UserPlus size={20} /> Register and manage your students</li>
            <li><BookOpenCheck size={20} /> Build quizzes and see results instantly</li>
            <li><MessageCircle size={20} /> Chat with each student in real time</li>
          </ul>
        </div>
      </section>
      <section className="auth-form">
        <form onSubmit={submit}>
          <h2>{signup ? 'Create your tutor account' : 'Welcome back'}</h2>
          <p className="muted">{signup ? 'Start enrolling students in minutes.' : 'Sign in to continue to your dashboard.'}</p>
          {signup && <div className="field"><User size={18} /><input placeholder="Full name" value={f.name} onChange={set('name')} required /></div>}
          <div className="field"><Mail size={18} /><input type="email" placeholder="Email address" value={f.email} onChange={set('email')} required /></div>
          <div className="field">
            <Lock size={18} />
            <input type={show ? 'text' : 'password'} placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          {err && <div className="alert">{err}</div>}
          <button className="btn big" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
          <button type="button" className="link" onClick={() => { setSignup(!signup); setErr(''); }}>
            {signup ? 'Already have an account? Sign in' : 'I am a tutor — create an account'}
          </button>
          {!signup && <small className="muted center-t">Students: use the login your tutor created for you.</small>}
        </form>
      </section>
    </div>
  );
}
