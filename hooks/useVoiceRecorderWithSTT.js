import { useState, useRef, useEffect, useCallback } from 'react';
import {
  getSupportedMimeType,
  isSpeechRecognitionSupported,
  getSpeechRecognitionConstructor,
  isMobileDevice,
  getSpeechCapabilities,
  applyVoicePunctuation,
} from '../utils/audioUtils';
import { sttApi } from '../services/api';

/**
 * Headless Hook: Universal Speech-to-Text & Voice Recording Engine
 *
 * Senior Engineering Architecture for "Works in All Conditions":
 * 1. Mobile-First Direct Native STT:
 *    - In mobile browsers (Android Chrome, iOS Safari), MediaRecorder and Web Audio
 *      CANNOT compete with the OS speech recognizer without causing hardware audio denial.
 *    - Direct native STT gives SpeechRecognition exclusive microphone access with zero conflicts.
 *    - Recognizer is activated immediately in the synchronous user click tick (prevents iOS user-gesture loss).
 *    - Watchdog auto-restart handles Android Chromium silence drops transparently.
 *
 * 2. Universal Audio Fallback STT:
 *    - On browsers/environments without Web Speech API (Firefox, Android WebViews, standalone apps, Opera):
 *    - Audio is captured via universal MediaRecorder and transcribed via server-side AI fallback (/api/stt/transcribe).
 *    - Users get seamless Voice-to-Text in EVERY browser and mobile device.
 *
 * 3. Dynamic Soundwave Visualizer:
 *    - Native STT mode: Driven dynamically by speech cadence and recognition events.
 *    - Universal mode: Driven by Web Audio Analyser frequency data.
 */
export function useVoiceRecorderWithSTT({
  language = 'en-US',
  enablePunctuation = true,
  enableSmartPunctuation = true,
  recordAudio = false, // Default false for Voice Typing to prevent mobile mic lockouts
  forceUniversal = false,
  onInterim,
  onFinalTranscriptChunk,
  onComplete,
  onError,
} = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isSTTSupported, setIsSTTSupported] = useState(false);
  const [isNativeSTT, setIsNativeSTT] = useState(false);
  const [isMediaSupported, setIsMediaSupported] = useState(true);
  const [sttMode, setSttMode] = useState('native'); // 'native' | 'universal'
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [audioLevel, setAudioLevel] = useState(0);

  // Mutable refs to prevent React state closure traps
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');
  const isRecordingRef = useRef(false);
  const isStoppingManuallyRef = useRef(false);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const visualizerIntervalRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  const selectedLangRef = useRef(selectedLanguage);
  const onFinalChunkRef = useRef(onFinalTranscriptChunk);
  const onInterimRef = useRef(onInterim);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Sync callbacks and language refs
  useEffect(() => {
    selectedLangRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    onFinalChunkRef.current = onFinalTranscriptChunk;
  }, [onFinalTranscriptChunk]);

  useEffect(() => {
    onInterimRef.current = onInterim;
  }, [onInterim]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Check browser API capabilities on mount
  useEffect(() => {
    const caps = getSpeechCapabilities();
    const nativeSupported = caps.hasNativeSTT && !forceUniversal;
    setIsNativeSTT(nativeSupported);
    // STT is supported if either native Web Speech OR Universal MediaRecorder is available
    setIsSTTSupported(caps.supportsUniversalSTT);
    setIsMediaSupported(caps.hasMediaRecorder);
    setSttMode(nativeSupported ? 'native' : caps.hasMediaRecorder ? 'universal' : 'none');
  }, [forceUniversal]);

  /**
   * Stop audio visualization loop and close audio context safely.
   */
  const cleanupAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (visualizerIntervalRef.current) {
      clearInterval(visualizerIntervalRef.current);
      visualizerIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignored
      }
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  /**
   * Start audio visualization analyser on microphone stream (Used in Universal MediaRecorder Mode).
   */
  const startAudioAnalyser = useCallback((stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!isRecordingRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Audio visualization unavailable:', err);
    }
  }, []);

  /**
   * Start non-intrusive soundwave animation for Native STT mode.
   * This allows the waveform bars to bounce dynamically when the user speaks without
   * requesting a separate getUserMedia lock that would mute mobile SpeechRecognition!
   */
  const startNativeSTTVisualizer = useCallback(() => {
    if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current);

    visualizerIntervalRef.current = setInterval(() => {
      if (!isRecordingRef.current) {
        setAudioLevel(0);
        return;
      }

      if (isSpeakingRef.current) {
        // Natural speech bounce: 40% - 95%
        const rand = 45 + Math.floor(Math.random() * 50);
        setAudioLevel(rand);
      } else {
        // Subtle ambient idle breathing: 5% - 15%
        const idle = 5 + Math.floor(Math.random() * 10);
        setAudioLevel(idle);
      }
    }, 120);
  }, []);

  /**
   * Initialize or re-create the SpeechRecognition instance with mobile resilience.
   */
  const initSpeechRecognition = useCallback((lang) => {
    const SpeechConstructor = getSpeechRecognitionConstructor();
    if (!SpeechConstructor) return null;

    try {
      const recognizer = new SpeechConstructor();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = lang || selectedLangRef.current || 'en-US';

      // Visual activity event handlers
      recognizer.onspeechstart = () => {
        isSpeakingRef.current = true;
      };

      recognizer.onspeechend = () => {
        isSpeakingRef.current = false;
      };

      recognizer.onsoundstart = () => {
        isSpeakingRef.current = true;
      };

      recognizer.onsoundend = () => {
        isSpeakingRef.current = false;
      };

      recognizer.onresult = (event) => {
        isSpeakingRef.current = true;
        let interimStr = '';
        let newFinalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || '';

          if (result.isFinal) {
            newFinalChunk += transcriptChunk + ' ';
          } else {
            interimStr += transcriptChunk;
          }
        }

        if (newFinalChunk) {
          const processedChunk = enablePunctuation
            ? applyVoicePunctuation(newFinalChunk, selectedLangRef.current, { smart: enableSmartPunctuation })
            : newFinalChunk;

          const updatedFull = (liveTranscriptRef.current + ' ' + processedChunk).trim();
          liveTranscriptRef.current = updatedFull;
          setLiveTranscript(updatedFull);

          if (onFinalChunkRef.current) {
            onFinalChunkRef.current(processedChunk.trim());
          }
        }

        setInterimTranscript(interimStr);
        if (onInterimRef.current) {
          onInterimRef.current(interimStr);
        }
      };

      recognizer.onerror = (e) => {
        // 'no-speech' and 'aborted' are benign and expected during quiet pauses
        if (e.error === 'no-speech' || e.error === 'aborted') {
          isSpeakingRef.current = false;
          return;
        }

        console.warn('Speech recognition notice:', e.error);

        let userMsg = null;
        if (e.error === 'not-allowed') {
          userMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
        } else if (e.error === 'network') {
          userMsg = 'Network glitch in speech service. Automatically reconnecting...';
        } else if (e.error === 'audio-capture') {
          userMsg = 'Microphone hardware busy or in use by another app.';
        } else if (e.error === 'service-not-allowed') {
          userMsg = 'Browser speech service restricted. Switching to Universal Audio Mode...';
          // Fallback to Universal Mode
          setIsNativeSTT(false);
          setSttMode('universal');
        }

        if (userMsg) {
          setError(userMsg);
          if (onErrorRef.current) {
            onErrorRef.current(userMsg, e.error);
          }
        }
      };

      recognizer.onend = () => {
        isSpeakingRef.current = false;
        // Chromium and Android OS automatically fire onend during pauses or single utterances.
        // If the user did not manually tap stop, automatically and smoothly re-engage recognition!
        if (isRecordingRef.current && !isStoppingManuallyRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecordingRef.current && !isStoppingManuallyRef.current) {
              try {
                recognizer.start();
              } catch (e) {
                // If already active or starting, safely ignore
              }
            }
          }, 60);
        }
      };

      return recognizer;
    } catch (err) {
      console.warn('Failed to initialize SpeechRecognition:', err);
      return null;
    }
  }, [enablePunctuation, enableSmartPunctuation]);

  /**
   * Converts an audio blob into Base64 string for Universal server-side transcription.
   */
  const blobToBase64 = useCallback((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  /**
   * Execute Universal Server Transcription on recorded audio blob.
   */
  const processUniversalTranscription = useCallback(async (blob, mimeType) => {
    if (!blob || blob.size < 1000) return;

    try {
      setIsTranscribing(true);
      setError(null);

      const base64 = await blobToBase64(blob);
      const res = await sttApi.transcribe({
        audioBase64: base64,
        mimeType: mimeType || 'audio/webm',
        language: selectedLangRef.current || 'en-US',
      });

      if (res.data?.success && res.data?.transcript) {
        const rawText = res.data.transcript;
        const processed = enablePunctuation
          ? applyVoicePunctuation(rawText, selectedLangRef.current, { smart: enableSmartPunctuation })
          : rawText;

        const updatedFull = (liveTranscriptRef.current + ' ' + processed).trim();
        liveTranscriptRef.current = updatedFull;
        setLiveTranscript(updatedFull);

        if (onFinalChunkRef.current) {
          onFinalChunkRef.current(processed);
        }

        if (onCompleteRef.current) {
          onCompleteRef.current({
            blob,
            transcript: updatedFull,
          });
        }
      } else if (res.data?.message && res.data?.code === 'NO_PROVIDER_CONFIGURED') {
        // Helpful notification if backend has no key configured yet
        console.info('Universal STT Info:', res.data.message);
      }
    } catch (err) {
      console.warn('Universal STT transcription notice:', err.message);
    } finally {
      setIsTranscribing(false);
    }
  }, [blobToBase64, enablePunctuation, enableSmartPunctuation]);

  /**
   * Start Voice Dictation.
   * Auto-selects the optimal path:
   * - Native STT (Zero-latency direct speech recognition)
   * - Universal STT (MediaRecorder + Server AI transcription)
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setInterimTranscript('');
      isStoppingManuallyRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

      const caps = getSpeechCapabilities();
      const shouldUseNative = caps.hasNativeSTT && !forceUniversal;

      if (shouldUseNative) {
        // ==========================================
        // PATH 1: DIRECT NATIVE SPEECH RECOGNITION
        // ==========================================
        // Crucial for Android & iOS: DO NOT call getUserMedia concurrently!
        // This gives SpeechRecognition 100% exclusive access to mobile hardware mic.
        const recognizer = initSpeechRecognition(selectedLangRef.current);
        speechRecognitionRef.current = recognizer;

        if (recognizer) {
          // Synchronous start call preserves user-gesture token on mobile Safari and Chrome
          try {
            recognizer.start();
          } catch (sttErr) {
            console.warn('SpeechRecognition start notice:', sttErr);
          }
        }

        // Start dynamic, reactive soundwave visualizer
        startNativeSTTVisualizer();

        // Optional desktop-only MediaRecorder if caller explicitly forced recordAudio on non-mobile
        if (recordAudio && !caps.isMobile && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mimeType = getSupportedMimeType();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.start(250);
          } catch (e) {
            // Harmless if mic sharing is blocked on desktop
          }
        }

        setIsNativeSTT(true);
        setSttMode('native');
      } else {
        // ==========================================
        // PATH 2: UNIVERSAL AUDIO RECORDING + STT
        // ==========================================
        // For Firefox, Android WebViews, standalone apps, or when native STT is blocked
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Microphone access is not supported in this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;

        startAudioAnalyser(stream);

        const mimeType = getSupportedMimeType();
        audioChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const finalBlob = new Blob(audioChunksRef.current, {
            type: mimeType || 'audio/webm',
          });
          const url = URL.createObjectURL(finalBlob);

          setAudioBlob(finalBlob);
          setAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });

          // Trigger Universal Server-Side Transcription
          await processUniversalTranscription(finalBlob, mimeType);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        };

        mediaRecorder.start(250);
        setIsNativeSTT(false);
        setSttMode('universal');
      }

      isRecordingRef.current = true;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start recording timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting voice recording:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isDenied
        ? 'Microphone permission was denied. Please allow microphone access in your browser or app settings.'
        : `Could not access microphone: ${err.message || 'Unknown error'}`;
      setError(msg);
      if (onErrorRef.current) onErrorRef.current(msg, err);
      setIsRecording(false);
      isRecordingRef.current = false;
      cleanupAudioAnalyser();
    }
  }, [
    recordAudio,
    forceUniversal,
    initSpeechRecognition,
    startNativeSTTVisualizer,
    startAudioAnalyser,
    processUniversalTranscription,
    cleanupAudioAnalyser,
  ]);

  /**
   * Stop Voice Dictation and wrap up cleanly
   */
  const stopRecording = useCallback(() => {
    isStoppingManuallyRef.current = true;
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');
    isSpeakingRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    cleanupAudioAnalyser();

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // Ignored
      }
      speechRecognitionRef.current = null;
    }

    // Stop MediaRecorder (which triggers onstop and server transcription if universal)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignored
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // If native STT mode completed
      if (onCompleteRef.current) {
        onCompleteRef.current({
          blob: audioBlob,
          url: audioUrl,
          transcript: liveTranscriptRef.current,
        });
      }
    }
  }, [audioBlob, audioUrl, cleanupAudioAnalyser]);

  /**
   * Change spoken language dynamically
   */
  const changeLanguage = useCallback((newLang) => {
    setSelectedLanguage(newLang);
    selectedLangRef.current = newLang;

    // If currently recording with native STT, re-engage with new language
    if (isRecordingRef.current && speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      const recognizer = initSpeechRecognition(newLang);
      speechRecognitionRef.current = recognizer;
      if (recognizer) {
        try {
          recognizer.start();
        } catch (e) {}
      }
    }
  }, [initSpeechRecognition]);

  /**
   * Clear all transcript state
   */
  const clearTranscript = useCallback(() => {
    liveTranscriptRef.current = '';
    setLiveTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Reset recorder completely (takes, transcript, timer)
   */
  const resetRecording = useCallback(() => {
    if (isRecordingRef.current) {
      stopRecording();
    }
    clearTranscript();
    setAudioBlob(null);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setRecordingTime(0);
    setError(null);
    setIsTranscribing(false);
  }, [stopRecording, clearTranscript]);

  // Track unmount cleanup
  useEffect(() => {
    return () => {
      isStoppingManuallyRef.current = true;
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      cleanupAudioAnalyser();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
        speechRecognitionRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cleanupAudioAnalyser]);

  return {
    isRecording,
    isTranscribing,
    isPaused,
    recordingTime,
    liveTranscript,
    interimTranscript,
    audioBlob,
    audioUrl,
    isSTTSupported,
    isNativeSTT,
    isMediaSupported,
    sttMode,
    audioLevel,
    error,
    selectedLanguage,
    startRecording,
    stopRecording,
    resetRecording,
    changeLanguage,
    clearTranscript,
  };
}

export default useVoiceRecorderWithSTT;
