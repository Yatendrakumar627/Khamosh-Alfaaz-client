import { describe, it, expect } from 'vitest';
import {
  formatTime,
  isSpeechRecognitionSupported,
  isMobileDevice,
  getSpeechCapabilities,
  applyVoicePunctuation,
  appendTranscriptToContent,
  SPEECH_LANGUAGES,
  detectSentenceEmotion,
  smartPunctuateSentence,
  smartPunctuateText,
  autoCapitalizeText,
  normalizeSpeechText,
  deduplicateTranscriptChunk,
} from './audioUtils';

describe('audioUtils', () => {
  describe('formatTime', () => {
    it('formats seconds into mm:ss', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(9)).toBe('00:09');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(75)).toBe('01:15');
      expect(formatTime(360)).toBe('06:00');
    });

    it('handles negative or invalid seconds gracefully', () => {
      expect(formatTime(-10)).toBe('00:00');
      expect(formatTime(undefined)).toBe('00:00');
    });
  });

  describe('isSpeechRecognitionSupported', () => {
    it('returns false or true depending on window presence', () => {
      const result = isSpeechRecognitionSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isMobileDevice & getSpeechCapabilities', () => {
    it('detects mobile device boolean', () => {
      expect(typeof isMobileDevice()).toBe('boolean');
    });

    it('returns comprehensive capability diagnostics', () => {
      const caps = getSpeechCapabilities();
      expect(caps).toHaveProperty('hasNativeSTT');
      expect(caps).toHaveProperty('hasMediaRecorder');
      expect(caps).toHaveProperty('isMobile');
      expect(caps).toHaveProperty('supportsUniversalSTT');
      expect(caps).toHaveProperty('recommendedMode');
    });
  });

  describe('applyVoicePunctuation', () => {
    it('converts English punctuation voice commands', () => {
      const input = 'Hello world period How are you question mark I am well comma thanks exclamation mark';
      const expected = 'Hello world. How are you? I am well, thanks!';
      expect(applyVoicePunctuation(input, 'en-US')).toBe(expected);
    });

    it('converts new line commands', () => {
      const input = 'First line new line Second line';
      const expected = 'First line\nSecond line';
      expect(applyVoicePunctuation(input, 'en-US')).toBe(expected);
    });

    it('converts Hindi punctuation voice commands', () => {
      const input = 'नमस्ते दोस्तों पूर्ण विराम आप कैसे हैं प्रश्नवाचक';
      const expected = 'नमस्ते दोस्तों। आप कैसे हैं?';
      expect(applyVoicePunctuation(input, 'hi-IN')).toBe(expected);
    });

    it('converts Urdu punctuation voice commands', () => {
      const input = 'آج کا دن اچھا رہا ختمہ کیا حال ہے سوالیہ نشان';
      const expected = 'آج کا دن اچھا رہا۔ کیا حال ہے؟';
      expect(applyVoicePunctuation(input, 'ur-PK')).toBe(expected);
    });
  });

  describe('appendTranscriptToContent', () => {
    it('appends chunk cleanly when content is empty', () => {
      expect(appendTranscriptToContent('', 'First words')).toBe('First words');
      expect(appendTranscriptToContent(null, 'First words')).toBe('First words');
    });

    it('adds single space between words if no trailing space or punctuation exists', () => {
      const existing = 'Today was a productive day';
      const newChunk = 'I wrote some code';
      expect(appendTranscriptToContent(existing, newChunk)).toBe('Today was a productive day I wrote some code');
    });

    it('handles sentences ending with period cleanly', () => {
      const existing = 'Today was a quiet evening.';
      const newChunk = 'The wind was gentle.';
      expect(appendTranscriptToContent(existing, newChunk)).toBe('Today was a quiet evening. The wind was gentle.');
    });

    it('preserves existing trailing newlines without extra space', () => {
      const existing = 'First paragraph.\n\n';
      const newChunk = 'Second paragraph starts here.';
      expect(appendTranscriptToContent(existing, newChunk)).toBe('First paragraph.\n\nSecond paragraph starts here.');
    });

    it('handles right-to-left and custom punctuation marks correctly', () => {
      const existingUrdu = 'کیا تم آ رہے ہو؟';
      const newUrdu = 'مجھے انتظار رہے گا۔';
      expect(appendTranscriptToContent(existingUrdu, newUrdu)).toBe('کیا تم آ رہے ہو؟ مجھے انتظار رہے گا۔');
    });
  });

  describe('autoCapitalizeText', () => {
    it('capitalizes start of string and after terminal punctuation', () => {
      expect(autoCapitalizeText('hello world. this is great! how are you? i am fine.'))
        .toBe('Hello world. This is great! How are you? I am fine.');
    });

    it('capitalizes English pronoun i and contractions', () => {
      expect(autoCapitalizeText("yesterday i thought i'm doing well but i've had doubts"))
        .toBe("Yesterday I thought I'm doing well but I've had doubts");
    });
  });

  describe('detectSentenceEmotion', () => {
    it('detects inquisitive emotion for English questions', () => {
      expect(detectSentenceEmotion('Why did this happen to me', 'en-US').emotion).toBe('inquisitive');
      expect(detectSentenceEmotion('Are you listening to me', 'en-US').punctuation).toBe('?');
      expect(detectSentenceEmotion('What is on your mind today', 'en-US').emotion).toBe('inquisitive');
    });

    it('detects inquisitive emotion for Roman Urdu & Hindi questions', () => {
      expect(detectSentenceEmotion('kya tum theek ho', 'ur-PK').punctuation).toBe('؟');
      expect(detectSentenceEmotion('kyun aisa lagta hai', 'hi-IN').punctuation).toBe('?');
      expect(detectSentenceEmotion('kahan ja rahe ho', 'en-IN').punctuation).toBe('?');
    });

    it('detects inquisitive emotion for Devanagari Hindi and Arabic Script Urdu', () => {
      expect(detectSentenceEmotion('क्या यह सच है', 'hi-IN').punctuation).toBe('?');
      expect(detectSentenceEmotion('کیا یہ سچ ہے', 'ur-PK').punctuation).toBe('؟');
    });

    it('detects exclamative emotion for emotional outcries and sensations', () => {
      expect(detectSentenceEmotion('What a breathtaking sunset', 'en-US').emotion).toBe('exclamative');
      expect(detectSentenceEmotion('What a breathtaking sunset', 'en-US').punctuation).toBe('!');
      expect(detectSentenceEmotion('How beautiful this world is', 'en-US').punctuation).toBe('!');
      expect(detectSentenceEmotion('Wow I cannot believe it', 'en-US').emotion).toBe('exclamative');
      expect(detectSentenceEmotion('वाह कितना प्यारा दिन है', 'hi-IN').punctuation).toBe('!');
      expect(detectSentenceEmotion('واہ کتنا خوبصورت منظر ہے', 'ur-PK').punctuation).toBe('!');
      expect(detectSentenceEmotion('zabardast kaam kiya', 'ur-PK').punctuation).toBe('!');
    });

    it('detects contemplative / melancholic sensation for yearning and trailing thoughts', () => {
      expect(detectSentenceEmotion('I wish things were different', 'en-US').emotion).toBe('contemplative');
      expect(detectSentenceEmotion('I wish things were different', 'en-US').punctuation).toBe('...');
      expect(detectSentenceEmotion('Sometimes I wonder about the past', 'en-US').punctuation).toBe('...');
      expect(detectSentenceEmotion('kash hum phir mil sakein', 'ur-PK').punctuation).toBe('...');
      expect(detectSentenceEmotion('काश वह दिन वापस आ जाएँ', 'hi-IN').punctuation).toBe('...');
      expect(detectSentenceEmotion('کاش تم یہاں ہوتے', 'ur-PK').punctuation).toBe('...');
    });

    it('detects declarative statement for grounded observations', () => {
      expect(detectSentenceEmotion('I wrote five pages today', 'en-US').punctuation).toBe('.');
      expect(detectSentenceEmotion('आज का दिन शांत था', 'hi-IN').punctuation).toBe('।');
      expect(detectSentenceEmotion('آج کا دن پرسکون تھا', 'ur-PK').punctuation).toBe('۔');
    });
  });

  describe('smartPunctuateSentence', () => {
    it('punctuates questions with question marks and capitalizes', () => {
      expect(smartPunctuateSentence('why did you leave me', 'en-US')).toBe('Why did you leave me?');
    });

    it('punctuates exclamations with exclamation marks', () => {
      expect(smartPunctuateSentence('wow what a lovely morning', 'en-US')).toBe('Wow, what a lovely morning!');
    });

    it('punctuates yearning thoughts with emotional ellipsis', () => {
      expect(smartPunctuateSentence('i wish you were here', 'en-US')).toBe('I wish you were here...');
      expect(smartPunctuateSentence('kash sab pehle jaisa ho jaye', 'ur-PK')).toBe('Kash sab pehle jaisa ho jaye...');
    });

    it('inserts introductory pause commas logically', () => {
      expect(smartPunctuateSentence('honestly i felt so lost', 'en-US')).toBe('Honestly, I felt so lost.');
      expect(smartPunctuateSentence('suddenly the wind started blowing', 'en-US')).toBe('Suddenly, the wind started blowing.');
      expect(smartPunctuateSentence('sach kahun toh mujhe darr lag raha tha', 'hi-IN')).toBe('Sach kahun toh, mujhe darr lag raha tha.');
    });

    it('does not duplicate punctuation if sentence is already punctuated', () => {
      expect(smartPunctuateSentence('Are you coming home today?', 'en-US')).toBe('Are you coming home today?');
      expect(smartPunctuateSentence('What a wonderful surprise!', 'en-US')).toBe('What a wonderful surprise!');
    });
  });

  describe('smartPunctuateText & applyVoicePunctuation smart mode', () => {
    it('punctuates multi-sentence thoughts with varying emotions', () => {
      const input = 'today was a heavy day why does everything feel so difficult i wish i had more time';
      const output = smartPunctuateText(input, 'en-US');
      expect(output).toContain('Today was a heavy day.');
      expect(output).toContain('Why does everything feel so difficult?');
      expect(output).toContain('I wish I had more time...');
    });

    it('applyVoicePunctuation with smart option converts commands and adds emotion punctuation', () => {
      const input = 'hello friend period why did you not call me';
      const output = applyVoicePunctuation(input, 'en-US', { smart: true });
      expect(output).toBe('Hello friend. Why did you not call me?');
    });
  });

  describe('SPEECH_LANGUAGES', () => {
    it('includes essential language options including English, Hindi, Urdu', () => {
      const codes = SPEECH_LANGUAGES.map((l) => l.code);
      expect(codes).toContain('en-US');
      expect(codes).toContain('hi-IN');
      expect(codes).toContain('ur-PK');
    });
  });

  describe('normalizeSpeechText', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeSpeechText('Kya kar rahe ho?')).toBe('kya kar rahe ho');
      expect(normalizeSpeechText('Hello, World!...')).toBe('hello world');
      expect(normalizeSpeechText('  آج کا دن۔  ')).toBe('آج کا دن');
    });
  });

  describe('deduplicateTranscriptChunk', () => {
    it('returns empty string for empty input', () => {
      expect(deduplicateTranscriptChunk('', '', '')).toBe('');
      expect(deduplicateTranscriptChunk('   ', '', '')).toBe('');
    });

    it('returns new chunk when there is no prior text', () => {
      expect(deduplicateTranscriptChunk('Kya', '', '')).toBe('Kya');
    });

    it('blocks immediate duplicate of lastFinalChunk', () => {
      expect(deduplicateTranscriptChunk('Kya kar rahe ho', 'Kya kar rahe ho', 'Kya kar rahe ho')).toBe('');
      expect(deduplicateTranscriptChunk('Kya kar rahe ho?', 'Kya kar rahe ho', 'Kya kar rahe ho')).toBe('');
    });

    it('blocks chunk if previousText already ends with it', () => {
      const prev = 'Kal raat sir dard tha. Kya kar rahe ho?';
      expect(deduplicateTranscriptChunk('Kya kar rahe ho', prev, '')).toBe('');
    });

    it('resolves Android Chrome cumulative prefix overlap (root cause reproduction)', () => {
      // Step 1: User says "kya"
      const step1 = deduplicateTranscriptChunk('Kya', '', '');
      expect(step1).toBe('Kya');

      // Step 2: Android sends cumulative "kya kar"
      const step2 = deduplicateTranscriptChunk('Kya kar', 'Kya', 'Kya');
      expect(step2).toBe('kar');

      // Step 3: Android sends cumulative "kya kar rahe ho"
      const step3 = deduplicateTranscriptChunk('Kya kar rahe ho', 'Kya kar', 'kar');
      expect(step3).toBe('rahe ho');

      // Step 4: Android re-sends duplicate final "kya kar rahe ho"
      const step4 = deduplicateTranscriptChunk('Kya kar rahe ho', 'Kya kar rahe ho', 'rahe ho');
      expect(step4).toBe('');
    });

    it('preserves intentional repeated words within the same chunk', () => {
      expect(deduplicateTranscriptChunk('haan haan bilkul', 'Hello', '')).toBe('haan haan bilkul');
      expect(deduplicateTranscriptChunk('very very happy', 'I am', '')).toBe('very very happy');
    });
  });

  describe('appendTranscriptToContent with deduplication', () => {
    it('does not duplicate exact sentence repeated back-to-back', () => {
      const initial = 'Kya kar rahe ho?';
      const result = appendTranscriptToContent(initial, 'Kya kar rahe ho?');
      expect(result).toBe('Kya kar rahe ho?');
    });

    it('merges cumulative prefixes cleanly without repeating words', () => {
      let content = '';
      content = appendTranscriptToContent(content, 'Kya');
      expect(content).toBe('Kya');

      content = appendTranscriptToContent(content, 'Kya kar');
      expect(content).toBe('Kya kar');

      content = appendTranscriptToContent(content, 'Kya kar rahe ho');
      expect(content).toBe('Kya kar rahe ho');

      content = appendTranscriptToContent(content, 'Kya kar rahe ho');
      expect(content).toBe('Kya kar rahe ho');
    });
  });
});
