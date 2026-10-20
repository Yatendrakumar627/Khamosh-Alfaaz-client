import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  Languages,
  Sparkles,
  Volume2,
  ChevronDown,
  Info,
  Check,
  Headphones,
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
 * Features:
 * - Real-time speech recognition with auto-insertion into writing canvas
 * - Smart emotion and sensation-aware auto-punctuation (questions, joy, shock, yearning)
 * - Live sound wave bars reacting to user's speech amplitude
 * - Live interim transcript preview pill
 * - Multi-language selector (English, Hindi, Urdu, Arabic, Spanish)
 * - One-click Smart Punctuate for existing canvas content
 * - Post-recording audio playback preview
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
    recordingTime,
    liveTranscript,
    interimTranscript,
    audioBlob,
    audioUrl,
    isSTTSupported,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    changeLanguage,
  } = useVoiceRecorderWithSTT({
    language: selectedLang,
    enablePunctuation: true,
    recordAudio: true,
    onFinalTranscriptChunk: (chunk) => {
      if (autoInsert && onContentChange && chunk) {
        const nextContent = appendTranscriptToContent(contentRef.current, chunk);
        onContentChange(nextContent);
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

  const handleLanguageSelect = (code) => {
    setSelectedLang(code);
    changeLanguage(code);
    setShowLangMenu(false);
  };

  const handleManualInsert = (textToInsert) => {
    if (!textToInsert || !onContentChange) return;
    const nextContent = appendTranscriptToContent(contentRef.current, textToInsert);
    onContentChange(nextContent);
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

  // Number of soundwave bars to display
  const waveBars = [
    Math.min(100, Math.max(15, audioLevel * 0.9)),
    Math.min(100, Math.max(25, audioLevel * 1.3)),
    Math.min(100, Math.max(10, audioLevel * 0.7)),
    Math.min(100, Math.max(30, audioLevel * 1.5)),
    Math.min(100, Math.max(18, audioLevel * 1.1)),
  ];

  return (
    <div className={`voice-writing-toolbar ${className}`}>
      {/* Main Bar */}
      <div className="voice-toolbar-main">
        {/* Left: Mic Activation Button */}
        <div className="voice-toolbar-left">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`voice-mic-trigger ${isRecording ? 'recording' : ''}`}
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop voice dictation' : 'Start voice dictation'}
            title={
              isRecording
                ? 'Stop Voice Typing (Recording in progress)'
                : isSTTSupported
                ? 'Speak to Write — Real-time Voice to Text'
                : 'Microphone recording'
            }
          >
            <div className="mic-icon-wrapper">
              {isRecording ? <Square size={14} className="stop-icon" /> : <Mic size={16} />}
              {isRecording && <span className="mic-pulse-ring" />}
            </div>
            <span className="voice-trigger-text">
              {isRecording ? (
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

          {/* Audio Visualizer Wave (Only while recording) */}
          {isRecording && (
            <div className="voice-soundwave" aria-label="Microphone activity visualizer">
              {waveBars.map((height, i) => (
                <span
                  key={i}
                  className="soundwave-bar"
                  style={{
                    height: `${Math.max(4, Math.round(height * 0.22))}px`,
                    animationDuration: `${0.4 + i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Controls & Language Selection */}
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
              <Languages size={14} className="voice-lang-icon" />
              <span className="voice-lang-label">
                <span className="voice-lang-flag">{currentLangObj.flag}</span>
                <span className="voice-lang-text-desktop">{currentLangObj.label.split(' ')[0]}</span>
                <span className="voice-lang-text-mobile">
                  {currentLangObj.code.slice(0, 2).toUpperCase()}
                </span>
              </span>
              <ChevronDown size={12} className={`voice-chevron ${showLangMenu ? 'open' : ''}`} />
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
                    <span className="voice-lang-item-flag">{item.flag}</span>
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
          {Boolean(content && content.trim()) && !isRecording && (
            <button
              type="button"
              className={`voice-tool-btn smart-punctuate ${smartPunctuateSuccess ? 'active' : ''}`}
              onClick={handleSmartPunctuate}
              title="Smart Punctuate: Intelligently adds punctuation according to sentence emotion, tone, and logical flow"
              aria-label="Smart Punctuate text"
            >
              <Sparkles size={13} className="gold-icon" />
              <span className="btn-label-compact voice-text-desktop">
                {smartPunctuateSuccess ? 'Punctuated!' : 'Smart Punctuate'}
              </span>
            </button>
          )}

          {/* Reset / Retake Button if recorded */}
          {(liveTranscript || audioUrlCached || audioUrl) && !isRecording && (
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

          {/* Audio Preview Toggle Button */}
          {(audioUrl || audioUrlCached) && !isRecording && (
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

      {/* STT Unsupported Warning */}
      {!isSTTSupported && (
        <div className="voice-support-hint">
          <Info size={13} />
          <span>
            Live Speech-to-Text works best on Chrome, Edge, and Safari. Your browser can still record studio audio notes.
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
            Speak naturally into your microphone. Khamosh Alfaaz automatically detects sentence emotions, sensations, questions, and yearnings to insert punctuation smartly and logically. You can also say commands explicitly:
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

      {/* Live Interim Transcript Bubble (Subtitles as you speak) */}
      {isRecording && (interimTranscript || liveTranscript) && (
        <div className="voice-live-subtitles" aria-live="polite">
          <div className="voice-subtitles-indicator">
            <Sparkles size={13} className="sparkle-anim" />
            <span>Live Dictation</span>
          </div>
          <p className="voice-subtitles-text">
            {liveTranscript && <span className="final-part">{liveTranscript} </span>}
            {interimTranscript && <span className="interim-part">{interimTranscript}</span>}
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
