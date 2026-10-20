import { useState } from 'react';
import { Mic, Square, RotateCcw, Volume2, Sparkles, Check, Languages } from 'lucide-react';
import { useVoiceRecorderWithSTT } from '../../hooks/useVoiceRecorderWithSTT';
import { formatTime, SPEECH_LANGUAGES } from '../../utils/audioUtils';

/**
 * VoiceRecorderCard
 *
 * Studio-grade standalone Voice Recorder Card with real-time Speech-to-Text.
 * Implements the architecture from speech_to_text_audio_integration_plan.md.
 */
export const VoiceRecorderCard = ({ onSave, onInsertTranscript, defaultLanguage = 'en-US' }) => {
  const [selectedLang, setSelectedLang] = useState(defaultLanguage);

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
    onComplete: (result) => {
      if (onSave) onSave(result);
    },
  });

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value;
    setSelectedLang(nextLang);
    changeLanguage(nextLang);
  };

  return (
    <div className="voice-recorder-card paper-texture">
      {/* Header */}
      <div className="voice-recorder-header">
        <div className="voice-recorder-title-wrap">
          <div className="voice-recorder-badge-icon">
            <Mic size={17} />
          </div>
          <div>
            <h3 className="voice-recorder-title">Studio Voice Note & Dictation</h3>
            <p className="voice-recorder-subtitle">Record your voice and convert it into text live</p>
          </div>
        </div>

        <div className="voice-recorder-status-wrap">
          <span className={`voice-status-pill ${isRecording ? 'recording' : 'idle'}`}>
            <span className="voice-status-dot" />
            {isRecording ? 'RECORDING LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="voice-error-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={resetRecording} className="voice-error-close">
            ✕
          </button>
        </div>
      )}

      {/* Language select & Controls bar */}
      <div className="voice-recorder-controls-row">
        <div className="voice-recorder-lang-select-wrap">
          <Languages size={15} className="lang-icon" />
          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            className="voice-recorder-lang-select"
            aria-label="Dictation language"
          >
            {SPEECH_LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.flag} {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="voice-recorder-timer-display">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Central Mic Action Arena */}
      <div className="voice-mic-arena">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`voice-arena-mic-btn ${isRecording ? 'active' : ''}`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <Square size={22} /> : <Mic size={24} />}
          {isRecording && (
            <span
              className="arena-pulse-ring"
              style={{
                transform: `scale(${1 + (audioLevel / 100) * 0.4})`,
                opacity: 0.6 + (audioLevel / 100) * 0.4,
              }}
            />
          )}
        </button>

        <span className="voice-arena-label">
          {isRecording ? 'Click to Stop Recording' : 'Click to Speak'}
        </span>

        {audioBlob && !isRecording && (
          <button
            type="button"
            onClick={resetRecording}
            className="voice-retake-btn"
            title="Discard and record a new take"
          >
            <RotateCcw size={14} />
            <span>Retake</span>
          </button>
        )}
      </div>

      {/* Real-Time Live Transcript Subtitle Card */}
      {isSTTSupported && (liveTranscript || interimTranscript) && (
        <div className="voice-transcript-card">
          <div className="voice-transcript-card-header">
            <div className="transcript-header-left">
              <Sparkles size={14} className="gold-icon" />
              <span>Real-Time Transcript</span>
            </div>
            {onInsertTranscript && liveTranscript && !isRecording && (
              <button
                type="button"
                className="voice-insert-text-btn"
                onClick={() => onInsertTranscript(liveTranscript)}
              >
                <Check size={13} />
                <span>Insert into Entry</span>
              </button>
            )}
          </div>
          <p className="voice-transcript-card-text">
            "{liveTranscript}{interimTranscript ? ` ${interimTranscript}...` : ''}"
          </p>
        </div>
      )}

      {/* Playback Preview Once Recorded */}
      {audioUrl && !isRecording && (
        <div className="voice-playback-card">
          <div className="voice-playback-header">
            <Volume2 size={15} className="gold-icon" />
            <h4>Audio Preview</h4>
          </div>
          <audio controls src={audioUrl} className="voice-audio-element" />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorderCard;
