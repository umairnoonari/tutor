import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { api } from './api';
import { Avatar, Empty, PageTitle } from './Ui';

export default function Chat({ user }) {
  const [contacts, setContacts] = useState(null);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const end = useRef(null);

  useEffect(() => {
    api('/messages/contacts').then((c) => { setContacts(c); if (c[0]) setActive(c[0]); });
  }, []);

  // Auto-refresh the open conversation every 3 seconds
  useEffect(() => {
    if (!active) return;
    let stop = false;
    setMsgs([]);
    const pull = async () => {
      try {
        const d = await api('/messages/' + active._id);
        if (!stop) setMsgs((p) => (p.length === d.length && p[p.length - 1]?._id === d[d.length - 1]?._id ? p : d));
      } catch { /* ignore temporary network errors */ }
    };
    pull();
    const t = setInterval(() => { if (!document.hidden) pull(); }, 3000);
    return () => { stop = true; clearInterval(t); };
  }, [active]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !active) return;
    setText('');
    try {
      const m = await api('/messages/' + active._id, 'POST', { text: t });
      setMsgs((p) => (p.some((x) => x._id === m._id) ? p : [...p, m]));
    } catch { setText(t); }
  };

  if (!contacts) return null;
  if (!contacts.length) return <Empty icon={MessageCircle} title="No conversations yet" text={user.role === 'tutor' ? 'Register a student to start chatting.' : 'Your tutor will appear here.'} />;

  return (
    <>
      <PageTitle title="Messages" sub="Chat updates automatically" />
      <div className="chat">
        <aside className="contacts">
          {contacts.map((c) => (
            <div key={c._id} className={'contact ' + (active?._id === c._id ? 'on' : '')} onClick={() => setActive(c)}>
              <Avatar name={c.name} size={42} /><div><b>{c.name}</b><small>{c.email}</small></div>
            </div>
          ))}
        </aside>
        <section className="convo">
          <div className="convo-head"><Avatar name={active?.name} size={38} /><b>{active?.name}</b></div>
          <div className="msgs">
            {!msgs.length && <p className="muted center-t" style={{ margin: 'auto' }}>Say hello to {active?.name?.split(' ')[0]}.</p>}
            {msgs.map((m) => {
              const mine = m.from === user._id;
              return (
                <div key={m._id} className={'msg-row ' + (mine ? 'me' : '')}>
                  {!mine && <Avatar name={active?.name} size={28} />}
                  <div className="bubble">{m.text}<small>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>
                </div>
              );
            })}
            <div ref={end} />
          </div>
          <form className="composer" onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={'Message ' + (active?.name || '')} />
            <button className="btn round" aria-label="Send"><Send size={18} /></button>
          </form>
        </section>
      </div>
    </>
  );
}
