import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  RotateCcw,
  Languages,
  Sparkles,
  Volume2,
  ChevronDown,
  Info,
  Check,
  Headphones,
  Loader2,
} from 'lucide-react';
import { useVoiceRecorderWithSTT } from '../../hooks/useVoiceRecorderWithSTT';
import {
  SPEECH_LANGUAGES,
  formatTime,
  appendTranscriptToContent,
  smartPunctuateText,
} from '../../utils/audioUtils';

/**
 * VoiceWritingToolbar
 *
 * An ambient, luxury stationery styled Voice-to-Text Dictation toolbar.
 * Embedded directly above or within the writing canvas in EntryEditor.
 *
 * Professional 3-Zone Justified Layout:
 * - Left Zone: Primary Dictation Action Trigger (Pill button with pulsing indicator)
 * - Center Zone: Dynamic Centerpiece (Live Soundwave / Shimmer Transcribing / Ambient Guide)
 * - Right Zone: Clean Utilities & Language Selector (Zero duplicate codes, screen-bound dropdown)
 */
export const VoiceWritingToolbar = ({
  content = '',
  onContentChange,
  onAudioSave,
  className = '',
}) => {
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [autoInsert, setAutoInsert] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);
  const [audioUrlCached, setAudioUrlCached] = useState(null);

  const langMenuRef = useRef(null);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Handle outside click to close language dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showLangMenu]);

  // Hook instance with callbacks
  const {
    isRecording,
    isTranscribing,
    recordingTime,
    liveTranscript,
    interimTranscript,
    audioBlob,
    audioUrl,
    isSTTSupported,
    isNativeSTT,
    sttMode,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    changeLanguage,
  } = useVoiceRecorderWithSTT({
    language: selectedLang,
    enablePunctuation: true,
    recordAudio: Boolean(onAudioSave),
    onFinalTranscriptChunk: (chunk) => {
      if (autoInsert && onContentChange && chunk) {
        const nextContent = appendTranscriptToContent(contentRef.current, chunk);
        if (nextContent !== contentRef.current) {
          onContentChange(nextContent);
        }
      }
    },
    onComplete: (data) => {
      if (data?.url) {
        setAudioUrlCached(data.url);
      }
      if (onAudioSave) {
        onAudioSave(data);
      }
    },
  });

  const [smartPunctuateSuccess, setSmartPunctuateSuccess] = useState(false);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setAudioUrlCached(null);
      setShowAudioPreview(false);
      startRecording();
    }
  };

  const handleLanguageSelect = (code) => {
    setSelectedLang(code);
    changeLanguage(code);
    setShowLangMenu(false);
  };

  const handleSmartPunctuate = () => {
    if (!contentRef.current || !onContentChange) return;
    const punctuated = smartPunctuateText(contentRef.current, selectedLang, { smart: true });
    if (punctuated && punctuated !== contentRef.current) {
      onContentChange(punctuated);
      setSmartPunctuateSuccess(true);
      setTimeout(() => setSmartPunctuateSuccess(false), 2000);
    }
  };

  const currentLangObj = SPEECH_LANGUAGES.find((l) => l.code === selectedLang) || SPEECH_LANGUAGES[0];

  // Dynamic 7-bar soundwave reacting to speech amplitude
  const waveBars = [
    Math.min(100, Math.max(10, Math.round(audioLevel * 0.75))),
    Math.min(100, Math.max(22, Math.round(audioLevel * 1.2))),
    Math.min(100, Math.max(34, Math.round(audioLevel * 1.5))),
    Math.min(100, Math.max(14, Math.round(audioLevel * 0.9))),
    Math.min(100, Math.max(30, Math.round(audioLevel * 1.35))),
    Math.min(100, Math.max(18, Math.round(audioLevel * 1.05))),
    Math.min(100, Math.max(12, Math.round(audioLevel * 0.7))),
  ];

  return (
    <div className={`voice-writing-toolbar ${className}`}>
      {/* Main Justified Bar */}
      <div className="voice-toolbar-main">
        {/* Left Zone: Action Trigger Button */}
        <div className="voice-toolbar-left">
          <button
            type="button"
            onClick={handleToggleRecording}
            disabled={isTranscribing}
            className={`voice-mic-trigger ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
            aria-pressed={isRecording}
            aria-label={
              isTranscribing
                ? 'Transcribing speech to text'
                : isRecording
                ? 'Stop voice dictation'
                : 'Start voice dictation'
            }
            title={
              isTranscribing
                ? 'Transcribing speech into text...'
                : isRecording
                ? 'Stop Voice Typing (Tap when finished speaking)'
                : 'Speak to Write — Real-time Voice to Text'
            }
          >
            <div className="mic-icon-wrapper">
              {isTranscribing ? (
                <Loader2 size={15} className="spinner-icon spinning" />
              ) : isRecording ? (
                <Square size={13} className="stop-icon" />
              ) : (
                <Mic size={15} />
              )}
              {isRecording && <span className="mic-pulse-ring" />}
            </div>
            <span className="voice-trigger-text">
              {isTranscribing ? (
                <>
                  <span className="voice-text-desktop">Transcribing...</span>
                  <span className="voice-text-mobile">Writing...</span>
                </>
              ) : isRecording ? (
                <>
                  <span className="recording-status-dot" />
                  <span className="voice-text-desktop">Listening </span>
                  <span className="recording-timer">({formatTime(recordingTime)})</span>
                </>
              ) : (
                <>
                  <span className="voice-text-desktop">Voice Typing</span>
                  <span className="voice-text-mobile">Speak</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Center Zone: Dynamic Visualizer or Ambient Guide */}
        <div className="voice-toolbar-center">
          {isRecording ? (
            <div className="voice-soundwave-center" aria-label="Microphone activity visualizer">
              {waveBars.map((height, i) => (
                <span
                  key={i}
                  className="soundwave-bar"
                  style={{
                    height: `${Math.max(4, Math.round(height * 0.22))}px`,
                    animationDuration: `${0.35 + (i % 3) * 0.14}s`,
                  }}
                />
              ))}
            </div>
          ) : isTranscribing ? (
            <div className="voice-status-center transcribing">
              <Sparkles size={12} className="gold-icon sparkle-anim" />
              <span className="center-status-text">Transcribing voice note...</span>
            </div>
          ) : (
            <div className="voice-status-center idle">
              <span className="voice-center-ambient">
                <span className="ambient-pulse-dot" />
                <span className="ambient-text-desktop voice-text-desktop">Speak naturally in {currentLangObj.label.split(' ')[0]}</span>
                <span className="ambient-text-mobile voice-text-mobile">Speak in {currentLangObj.short || 'EN'}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right Zone: Clean Utilities & Language Selector (Zero Duplicates) */}
        <div className="voice-toolbar-right">
          {/* Language Selector Dropdown */}
          <div className="voice-lang-dropdown-anchor" ref={langMenuRef}>
            <button
              type="button"
              className={`voice-lang-btn ${showLangMenu ? 'active' : ''}`}
              onClick={() => setShowLangMenu((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={showLangMenu}
              title="Select speech recognition language"
            >
              <Languages size={13} className="voice-lang-icon" />
              <span className="voice-lang-code-badge">{currentLangObj.short || currentLangObj.code.slice(0, 2).toUpperCase()}</span>
              <span className="voice-lang-text-desktop">{currentLangObj.label.split(' ')[0]}</span>
              <ChevronDown size={11} className={`voice-chevron ${showLangMenu ? 'open' : ''}`} />
            </button>

            {showLangMenu && (
              <div className="voice-lang-menu" role="listbox">
                <div className="voice-lang-menu-header">Dictation Language</div>
                {SPEECH_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={item.code === selectedLang}
                    className={`voice-lang-item ${item.code === selectedLang ? 'selected' : ''}`}
                    onClick={() => handleLanguageSelect(item.code)}
                  >
                    <span className="voice-lang-pill-badge">{item.short || item.code.slice(0, 2).toUpperCase()}</span>
                    <span className="voice-lang-item-name">{item.label}</span>
                    {item.code === selectedLang && <Check size={13} className="voice-lang-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Voice Tips Button */}
          <button
            type="button"
            className={`voice-tool-btn ${showTips ? 'active' : ''}`}
            onClick={() => setShowTips((prev) => !prev)}
            title="Speech to Text Tips & Smart Punctuation Guide"
            aria-label="Voice dictation help"
          >
            <Info size={14} />
          </button>

          {/* Smart Punctuate Button for existing content */}
          {Boolean(content && content.trim()) && !isRecording && !isTranscribing && (
            <button
              type="button"
              className={`voice-tool-btn smart-punctuate ${smartPunctuateSuccess ? 'active' : ''}`}
              onClick={handleSmartPunctuate}
              title="Smart Punctuate: Intelligently formats punctuation according to sentence emotion and flow"
              aria-label="Smart Punctuate text"
            >
              <Sparkles size={13} className="gold-icon" />
              <span className="btn-label-compact voice-text-desktop">
                {smartPunctuateSuccess ? 'Punctuated!' : 'Smart Punctuate'}
              </span>
            </button>
          )}

          {/* Reset / Retake Button if recorded */}
          {(liveTranscript || audioUrlCached || audioUrl) && !isRecording && !isTranscribing && (
            <button
              type="button"
              className="voice-tool-btn reset"
              onClick={() => {
                resetRecording();
                setAudioUrlCached(null);
                setShowAudioPreview(false);
              }}
              title="Reset speech take"
              aria-label="Reset take"
            >
              <RotateCcw size={14} />
              <span className="btn-label-compact voice-text-desktop">Reset</span>
            </button>
          )}

          {/* Audio Preview Toggle Button (if audio was saved) */}
          {(audioUrl || audioUrlCached) && !isRecording && !isTranscribing && (
            <button
              type="button"
              className={`voice-tool-btn audio-toggle ${showAudioPreview ? 'active' : ''}`}
              onClick={() => setShowAudioPreview((prev) => !prev)}
              title="Play recorded audio note"
              aria-label="Preview recorded audio"
            >
              <Headphones size={14} />
              <span className="btn-label-compact voice-text-desktop">Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="voice-error-banner" role="alert">
          <Info size={14} className="voice-error-icon" />
          <span>{error}</span>
          <button
            type="button"
            className="voice-error-dismiss"
            onClick={resetRecording}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Universal Mode Notice (Encouraging banner when on non-Chromium or mobile app without native STT) */}
      {!isNativeSTT && isSTTSupported && !isRecording && !isTranscribing && (
        <div className="voice-support-hint">
          <Sparkles size={13} className="gold-icon" />
          <span>
            Universal Voice Typing enabled. Tap <strong>Speak</strong>, talk naturally, then tap <strong>Stop</strong> to write.
          </span>
        </div>
      )}

      {/* STT Unsupported Warning (Only if neither native STT nor MediaRecorder exist) */}
      {!isSTTSupported && (
        <div className="voice-support-hint">
          <Info size={13} />
          <span>
            Microphone recording is unavailable. Please ensure microphone permissions are granted in your browser settings.
          </span>
        </div>
      )}

      {/* Voice Tips Box */}
      {showTips && (
        <div className="voice-tips-card">
          <div className="voice-tips-header">
            <Sparkles size={14} className="gold-icon" />
            <span>Voice Typing & Smart Emotion Punctuation</span>
          </div>
          <p className="voice-tips-description">
            Speak naturally into your microphone on any device or mobile browser. Khamosh Alfaaz automatically detects emotions, questions, and yearnings to add punctuation logically. You can also say commands explicitly:
          </p>
          <div className="voice-tips-grid">
            <div className="tip-chip">Emotion: Question → <strong>?</strong> / <strong>؟</strong></div>
            <div className="tip-chip">Emotion: Awe / Outcry → <strong>!</strong></div>
            <div className="tip-chip">Emotion: Yearning / Silence → <strong>...</strong></div>
            <div className="tip-chip">"Period" / "Full stop" → <strong>.</strong> / <strong>।</strong> / <strong>۔</strong></div>
            <div className="tip-chip">"Comma" / "Interjection" → <strong>,</strong> / <strong>،</strong></div>
            <div className="tip-chip">"New line" → <strong>↵</strong></div>
          </div>
        </div>
      )}

      {/* Live Interim Transcript Bubble (Subtitles as you speak or while transcribing) */}
      {(isRecording || isTranscribing) && (interimTranscript || liveTranscript || isTranscribing) && (
        <div className="voice-live-subtitles" aria-live="polite">
          <div className="voice-subtitles-indicator">
            <Sparkles size={13} className="sparkle-anim" />
            <span>{isTranscribing ? 'Converting Speech to Text...' : 'Live Dictation'}</span>
          </div>
          <p className="voice-subtitles-text">
            {liveTranscript && <span className="final-part">{liveTranscript} </span>}
            {interimTranscript && <span className="interim-part">{interimTranscript}</span>}
            {isTranscribing && !liveTranscript && (
              <span className="interim-part">Transcribing and styling your voice with emotion punctuation...</span>
            )}
          </p>
        </div>
      )}

      {/* Audio Playback Player Bar */}
      {showAudioPreview && (audioUrl || audioUrlCached) && !isRecording && (
        <div className="voice-audio-preview-drawer">
          <div className="audio-preview-label">
            <Volume2 size={14} className="gold-icon" />
            <span>Recorded Audio Note</span>
          </div>
          <audio
            controls
            src={audioUrl || audioUrlCached}
            className="voice-audio-element"
            preload="metadata"
          />
        </div>
      )}
    </div>
  );
};

export default VoiceWritingToolbar;
