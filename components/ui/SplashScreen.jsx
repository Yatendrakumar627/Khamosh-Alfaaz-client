import { useState, useEffect } from 'react';
import favicon from '../../assets/favicon.png';
import { Feather, Sparkles } from 'lucide-react';

export const SplashScreen = ({ message = 'Opening your diary...' }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isWakingUp = elapsed >= 3;
  const isTakingLonger = elapsed >= 12;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--background, #16120e)',
        color: 'var(--ink, #f5ebd9)',
        padding: '24px',
        textAlign: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(223, 178, 100, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulse 3s ease-in-out infinite alternate',
        }}
      />

      {/* Brand Icon Box */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.25) 0%, rgba(223, 178, 100, 0.06) 100%)',
          border: '1px solid rgba(223, 178, 100, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          animation: 'float 3.5s ease-in-out infinite',
        }}
      >
        <img
          src={favicon}
          alt="Khamosh Alfaaz"
          style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(223, 178, 100, 0.45))' }}
        />
      </div>

      {/* Main Title */}
      <h2
        style={{
          fontFamily: 'var(--font-family-heading, "Playfair Display", serif)',
          fontSize: '1.45rem',
          fontWeight: 600,
          color: 'var(--ink, #f5ebd9)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}
      >
        {isWakingUp ? 'Waking Up the Sanctuary' : 'Khamosh Alfaaz'}
      </h2>

      {/* Dynamic Status Message */}
      <p
        style={{
          fontFamily: 'var(--font-family-ui, "Inter", sans-serif)',
          fontSize: '0.90rem',
          color: 'var(--ink-muted, #a89a85)',
          margin: '0 0 16px',
          maxWidth: '360px',
          lineHeight: 1.5,
          transition: 'all 0.3s ease',
        }}
      >
        {!isWakingUp && message}
        {isWakingUp && !isTakingLonger && 'Our cloud server rests after quiet hours. Starting your peaceful space...'}
        {isTakingLonger && 'Almost there... Re-establishing secure diary connection.'}
      </p>

      {/* Smooth Progress Shimmer Bar */}
      <div
        style={{
          width: '180px',
          height: '3px',
          backgroundColor: 'rgba(223, 178, 100, 0.15)',
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '45%',
            background: 'linear-gradient(90deg, transparent, var(--gold, #dfb264), transparent)',
            borderRadius: '3px',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Elapsed seconds badge during cold wake */}
      {isWakingUp && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            color: 'var(--gold, #dfb264)',
            backgroundColor: 'rgba(223, 178, 100, 0.08)',
            border: '1px solid rgba(223, 178, 100, 0.18)',
            padding: '4px 10px',
            borderRadius: '12px',
          }}
        >
          <Sparkles size={12} />
          <span>Waking up: {elapsed}s</span>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { left: -45%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
