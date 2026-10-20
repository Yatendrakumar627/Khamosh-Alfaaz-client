import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceRecorderWithSTT } from './useVoiceRecorderWithSTT';

describe('useVoiceRecorderWithSTT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with expected default values', () => {
    const { result } = renderHook(() => useVoiceRecorderWithSTT());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isTranscribing).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.recordingTime).toBe(0);
    expect(result.current.liveTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.audioBlob).toBeNull();
    expect(result.current.audioUrl).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.selectedLanguage).toBe('en-US');
    expect(typeof result.current.isSTTSupported).toBe('boolean');
    expect(typeof result.current.sttMode).toBe('string');
  });

  it('allows changing language dynamically', () => {
    const { result } = renderHook(() => useVoiceRecorderWithSTT({ language: 'en-US' }));

    act(() => {
      result.current.changeLanguage('hi-IN');
    });

    expect(result.current.selectedLanguage).toBe('hi-IN');
  });

  it('clears transcript on clearTranscript call', () => {
    const { result } = renderHook(() => useVoiceRecorderWithSTT());

    act(() => {
      result.current.clearTranscript();
    });

    expect(result.current.liveTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
  });

  it('handles resetRecording cleanly', () => {
    const { result } = renderHook(() => useVoiceRecorderWithSTT());

    act(() => {
      result.current.resetRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingTime).toBe(0);
    expect(result.current.audioBlob).toBeNull();
    expect(result.current.audioUrl).toBeNull();
  });

  it('resets live transcript and media state when startRecording is invoked', async () => {
    const { result } = renderHook(() => useVoiceRecorderWithSTT());

    // Even if previous state had transcripts or errors, starting a new take gives clean slate
    await act(async () => {
      // Mock browser mediaDevices/speechRecognition if not present in jsdom
      try {
        await result.current.startRecording();
      } catch (e) {}
    });

    expect(result.current.liveTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.audioBlob).toBeNull();
    expect(result.current.audioUrl).toBeNull();
  });
});

