import { useEffect, useState } from 'react';
import { GraduationCap, LogOut, Moon, Sun } from 'lucide-react';
import { api } from './api';
import Login from './Login';
import Tutor, { tabs as tutorTabs } from './Tutor';
import Student, { tabs as studentTabs } from './Student';
import { Avatar } from './Ui';

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('overview');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);

  const logout = () => { localStorage.removeItem('token'); setUser(null); setTab('overview'); };
  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  if (!ready) return <div className="splash"><GraduationCap size={48} /></div>;
  if (!user) return <Login onLogin={(u, t) => { localStorage.setItem('token', t); setUser(u); setTab('overview'); }} />;

  const tabs = user.role === 'tutor' ? tutorTabs : studentTabs;
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="brand-logo"><GraduationCap size={22} /></span><b>Tutor Portal</b></div>
        <nav>
          {tabs.map(([id, label, Icon]) => (
            <button key={id} className={'nav ' + (tab === id ? 'on' : '')} onClick={() => setTab(id)}>
              <Icon size={20} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button className="nav" onClick={toggle}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}<span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span></button>
          <button className="nav" onClick={logout}><LogOut size={20} /><span>Logout</span></button>
        </div>
      </aside>
      <main>
        <div className="topbar">
          <div><small>{user.role === 'tutor' ? 'Tutor workspace' : 'Student workspace'}</small></div>
          <div className="who"><div><b>{user.name}</b><small>{user.email}</small></div><Avatar name={user.name} size={42} /></div>
        </div>
        <div className="page" key={tab}>
          {user.role === 'tutor' ? <Tutor tab={tab} user={user} go={setTab} /> : <Student tab={tab} user={user} go={setTab} />}
        </div>
      </main>
    </div>
  );
}
