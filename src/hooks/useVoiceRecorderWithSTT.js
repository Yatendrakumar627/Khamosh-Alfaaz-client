import { useState, useRef, useEffect, useCallback } from 'react';
import {
  getSupportedMimeType,
  isSpeechRecognitionSupported,
  getSpeechRecognitionConstructor,
  applyVoicePunctuation,
} from '../utils/audioUtils';

/**
 * Headless hook combining Live Speech-to-Text (STT) and optional Audio Recording.
 *
 * Designed with senior resilience:
 * - Closure-trap safe using mutable refs for all asynchronous callbacks
 * - Auto-reconnection on speech recognition silence timeouts
 * - Real-time interim vs final phrase separation
 * - Sound wave level measurement for dynamic UI feedback
 * - Comprehensive hardware track lifecycle and memory cleanup
 */
export function useVoiceRecorderWithSTT({
  language = 'en-US',
  enablePunctuation = true,
  enableSmartPunctuation = true,
  recordAudio = true,
  onInterim,
  onFinalTranscriptChunk,
  onComplete,
  onError,
} = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isSTTSupported, setIsSTTSupported] = useState(false);
  const [isMediaSupported, setIsMediaSupported] = useState(true);
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
    setIsSTTSupported(isSpeechRecognitionSupported());
    setIsMediaSupported(
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    );
  }, []);

  /**
   * Stop audio visualization loop and close audio context safely.
   */
  const cleanupAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
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
   * Start audio visualization analyser on microphone stream.
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
        // Normalize roughly to 0 - 100
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
   * Initialize or re-create the SpeechRecognition instance.
   */
  const initSpeechRecognition = useCallback((lang) => {
    const SpeechConstructor = getSpeechRecognitionConstructor();
    if (!SpeechConstructor) return null;

    try {
      const recognizer = new SpeechConstructor();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = lang || selectedLangRef.current || 'en-US';

      recognizer.onresult = (event) => {
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
        // 'no-speech' is common and harmless during quiet pauses
        if (e.error === 'no-speech' || e.error === 'aborted') {
          return;
        }

        let userMsg = 'Speech recognition error occurred.';
        if (e.error === 'not-allowed') {
          userMsg = 'Microphone permission denied. Please allow microphone access.';
        } else if (e.error === 'network') {
          userMsg = 'Network error during speech recognition. Please check your connection.';
        } else if (e.error === 'audio-capture') {
          userMsg = 'No microphone device found.';
        } else if (e.error === 'service-not-allowed') {
          userMsg = 'Speech recognition service is currently unavailable.';
        }

        console.warn('Speech recognition error:', e.error);
        setError(userMsg);
        if (onErrorRef.current) {
          onErrorRef.current(userMsg, e.error);
        }
      };

      recognizer.onend = () => {
        // Chromium automatically fires onend on silence.
        // If the user did not manually stop, automatically re-engage recognition.
        if (isRecordingRef.current && !isStoppingManuallyRef.current) {
          try {
            recognizer.start();
          } catch (e) {
            // Already started or busy, ignore
          }
        }
      };

      return recognizer;
    } catch (err) {
      console.warn('Failed to initialize SpeechRecognition:', err);
      return null;
    }
  }, [enablePunctuation, enableSmartPunctuation]);

  /**
   * Start Voice Dictation + Audio Recording
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setInterimTranscript('');
      isStoppingManuallyRef.current = false;

      // 1. Request hardware microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Start audio waveform level analysis
      startAudioAnalyser(stream);

      // 2. Setup MediaRecorder for binary audio capture if requested
      const mimeType = getSupportedMimeType();
      audioChunksRef.current = [];

      if (recordAudio && typeof MediaRecorder !== 'undefined') {
        try {
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

          mediaRecorder.onstop = () => {
            const finalBlob = new Blob(audioChunksRef.current, {
              type: mimeType || 'audio/webm',
            });
            const url = URL.createObjectURL(finalBlob);

            setAudioBlob(finalBlob);
            setAudioUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });

            if (onCompleteRef.current) {
              onCompleteRef.current({
                blob: finalBlob,
                url,
                transcript: liveTranscriptRef.current,
              });
            }

            // Release hardware microphone tracks once recording stops
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
          };

          // Capture slices every 250ms for low-latency memory buffering
          mediaRecorder.start(250);
        } catch (recorderErr) {
          console.warn('MediaRecorder init failed, continuing in STT-only mode:', recorderErr);
        }
      }

      // 3. Initialize and start Web Speech Recognition
      const recognizer = initSpeechRecognition(selectedLangRef.current);
      speechRecognitionRef.current = recognizer;
      if (recognizer) {
        try {
          recognizer.start();
        } catch (sttErr) {
          console.warn('SpeechRecognition start notice:', sttErr);
        }
      }

      isRecordingRef.current = true;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // 4. Start recording timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isDenied
        ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
        : `Could not access microphone: ${err.message || 'Unknown error'}`;
      setError(msg);
      if (onErrorRef.current) onErrorRef.current(msg, err);
      setIsRecording(false);
      isRecordingRef.current = false;
      cleanupAudioAnalyser();
    }
  }, [recordAudio, initSpeechRecognition, startAudioAnalyser, cleanupAudioAnalyser]);

  /**
   * Stop Voice Dictation and audio recording cleanly
   */
  const stopRecording = useCallback(() => {
    isStoppingManuallyRef.current = true;
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    cleanupAudioAnalyser();

    // Stop MediaRecorder (which creates the audio blob)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignored
      }
    } else {
      // If no MediaRecorder was used, stop hardware tracks directly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // Ignored
      }
      speechRecognitionRef.current = null;
    }
  }, [cleanupAudioAnalyser]);

  /**
   * Change spoken language dynamically
   */
  const changeLanguage = useCallback((newLang) => {
    setSelectedLanguage(newLang);
    selectedLangRef.current = newLang;

    // If currently recording, restart recognizer with new language seamlessly
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
   * Reset the whole recorder (audio takes, transcript, timer)
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
  }, [stopRecording, clearTranscript]);

  // Cleanup on unmount (prevent memory leaks and lingering mic indicator)
  useEffect(() => {
    return () => {
      isStoppingManuallyRef.current = true;
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupAudioAnalyser();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
        speechRecognitionRef.current = null;
      }
    };
  }, [cleanupAudioAnalyser]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    liveTranscript,
    interimTranscript,
    audioBlob,
    audioUrl,
    isSTTSupported,
    isMediaSupported,
    selectedLanguage,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    clearTranscript,
    changeLanguage,
  };
}

export default useVoiceRecorderWithSTT;
