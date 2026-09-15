import { Link } from 'react-router-dom';
import { Feather, LockKeyhole, BookOpen, Globe2 } from 'lucide-react';

const PILLARS = [
  {
    icon: Globe2,
    title: 'Read openly',
    text: 'Anyone can come here and quietly read what others couldn\'t say — no account, no name, just words.',
  },
  {
    icon: LockKeyhole,
    title: 'Write privately',
    text: 'Your diary stays yours. A private username and PIN protect every entry you keep to yourself.',
  },
  {
    icon: BookOpen,
    title: 'Share if you choose',
    text: 'Some thoughts can be left for strangers. Mark an entry public and it appears in the quiet Explore pages.',
  },
];

export const About = () => (
  <div className="visitor-about" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
    <header style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
      <div className="welcome-emblem" style={{
        width: '72px', height: '72px', borderRadius: '50%', border: '2px solid var(--gold)',
        backgroundColor: 'var(--paper)', color: 'var(--accent)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <Feather size={30} style={{ color: 'var(--gold)' }} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 12px' }}>
        A quiet corner on the internet
      </h1>
      <div className="gold-rule" style={{ margin: '0 auto 16px', maxWidth: '160px' }}>
        <span className="diamond" />
      </div>
      <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--ink-muted)', lineHeight: 1.85 }}>
        "Khamosh Alfaaz" means silent words. This space is built on one small idea:
        anyone can come here and quietly read what others couldn't say.
        And when they're ready, they can start writing their own story.
      </p>
    </header>

    <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {PILLARS.map(pillar => {
        const Icon = pillar.icon;
        return (
          <div key={pillar.title} className="paper-texture" style={{ padding: '24px 22px', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Icon size={20} style={{ color: 'var(--gold)' }} />
            <h2 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: '1.12rem', fontWeight: 600, color: 'var(--ink)' }}>
              {pillar.title}
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              {pillar.text}
            </p>
          </div>
        );
      })}
    </section>

    <section style={{ textAlign: 'center', padding: '30px 0 10px' }}>
      <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--ink)' }}>
        Your story starts with a single line.
        <br />
        No one else has to know it — unless you decide.
      </p>
      <Link to="/login" className="visitor-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '13px 30px', borderRadius: '10px', textDecoration: 'none', backgroundColor: 'var(--gold)', color: 'var(--paper-dark)', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 18px rgba(216,168,91,0.35)' }}>
        Start Writing →
      </Link>
    </section>
  </div>
);

export default About;