/**
 * Audio and Speech-to-Text Utilities for Khamosh Alfaaz
 * Handles codec negotiation, time formatting, language presets,
 * browser capability detection, and transcript text processing.
 */

export const SPEECH_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸', native: 'English' },
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳', native: 'Indian English' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳', native: 'Hindi' },
  { code: 'ur-PK', label: 'اردو (Urdu)', flag: '🇵🇰', native: 'Urdu' },
  { code: 'ur-IN', label: 'اردو (Urdu - India)', flag: '🇮🇳', native: 'Urdu' },
  { code: 'ar-SA', label: 'العربية (Arabic)', flag: '🇸🇦', native: 'Arabic' },
  { code: 'es-ES', label: 'Español (Spanish)', flag: '🇪🇸', native: 'Spanish' },
];

/**
 * Negotiates the best audio MIME type supported by the user's browser.
 * Returns empty string if MediaRecorder is unavailable.
 */
export function getSupportedMimeType() {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }

  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/aac',
    'audio/wav',
  ];

  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

/**
 * Formats duration in seconds to mm:ss format.
 */
export function formatTime(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Checks if the Web Speech Recognition API is supported by the current browser.
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Get the SpeechRecognition constructor (standard or webkit prefixed).
 */
export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Automatically capitalizes Latin-script sentences cleanly.
 * Formats:
 * - Start of string
 * - After terminal punctuation (. ! ? ... \n)
 * - Standalone English pronoun "i" and common contractions (i'm, i've, i'll, i'd)
 */
export function autoCapitalizeText(text = '') {
  if (!text || typeof text !== 'string') return '';

  let res = text;

  // Capitalize start of text
  res = res.replace(/^(\s*)([a-z])/i, (match, prefix, char) => prefix + char.toUpperCase());

  // Capitalize after terminal punctuation (. ! ? ... \n)
  res = res.replace(/([.!?।۔؟…]\s+)([a-z])/g, (match, punct, char) => punct + char.toUpperCase());
  res = res.replace(/(\n+\s*)([a-z])/g, (match, newline, char) => newline + char.toUpperCase());

  // Capitalize English standalone 'i' pronoun and its contractions
  res = res.replace(/\b(i)('m|'ve|'ll|'d|'d've)?\b/g, (match, p1, p2) => 'I' + (p2 || ''));

  return res;
}

/**
 * Detects the emotional tone, sensation, and syntactic posture of a sentence.
 * Returns { emotion, punctuation, confidence, matchedRule }
 *
 * Classified emotion categories:
 * - 'inquisitive': questions, curiosity, doubts, inquiries ('?', '؟')
 * - 'exclamative': awe, celebration, intense feeling, sudden grief, outrage ('!')
 * - 'contemplative': melancholic yearning, trailing thought, introspective pause ('...')
 * - 'declarative': peaceful reflection, grounded narrative closure ('.', '।', '۔')
 */
export function detectSentenceEmotion(sentence = '', language = 'en-US') {
  if (!sentence || typeof sentence !== 'string') {
    return { emotion: 'declarative', punctuation: '.', confidence: 0, matchedRule: 'empty' };
  }

  const trimmed = sentence.trim();
  const lower = trimmed.toLowerCase();
  const isDevanagari = /[\u0900-\u097F]/.test(trimmed);
  const isPersoArabic = /[\u0600-\u06FF]/.test(trimmed);
  const isUrduLang = language.startsWith('ur');
  const isArabicLang = language.startsWith('ar');
  const isSpanishLang = language.startsWith('es');

  // Script & language sensitive default characters
  const qMark = (isPersoArabic || isUrduLang || isArabicLang) ? '؟' : '?';
  const exMark = '!';
  const ellipsis = '...';
  const defaultPunct = isDevanagari
    ? '।'
    : (isPersoArabic && isUrduLang)
      ? '۔'
      : '.';

  // 1. EXCLAMATIVE / HIGH SENSATION (Checked first to prioritize emotional outcries like "what a...", "how lovely...")
  const enExclamationStarts = /^(what a|what an|how wonderful|how amazing|how beautiful|how lovely|how dare|how could you|how terrible|thank god|thank heavens|never again|so beautiful|so happy|so proud|so angry|can't believe|cannot believe|i love this|i hate this)\b/i;
  const enExclamations = /\b(wow|whoa|omg|oh my god|oh my goodness|good heavens|dear god|yay|hurrah|hurray|eureka|bravo|ouch|alas|damn|holy cow|yikes|hooray|my goodness|unbelievable|astonishing|incredible|terrifying|magnificent|heartbreaking|ecstatic)\b/i;
  const romanUrduExclamations = /\b(wah|waah|arre|arey|haye|hai re|shabash|afsos|ya rab|ya allah|ya khuda|kamaal hai|kamaal|zabardast|shandar|kitna pyara|kitni pyari|kitna khubsurat|kya baat hai|baap re|tauba|subhanallah|mashaallah)\b/i;
  const devanagariExclamations = /(?:^|[\s,।!?])(वाह|अरे|हे भगवान|हाय|शाबाश|अफ़सोस|या अल्लाह|या रब|कमाल है|ज़बरदस्त|कितना सुंदर|कितनी प्यारी|क्या बात है|अद्भुत|बाप रे|तौबा)(?:$|[\s,।!?])/;
  const persoArabicExclamations = /(?:^|[\s،۔!؟])(واہ|ارے|ہائے|شاباش|افسوس|یا اللہ|یا رب|کمال ہے|زبردست|کتنا پیارا|کتنی پیاری|کیا بات ہے|سبحان اللہ|ماشاء اللہ|توبہ)(?:$|[\s،۔!؟])/;
  const spanishExclamations = /\b(guau|dios mío|ay|caramba|vaya|olé|bravo|increíble|maravilloso|qué maravilla|qué horror|genial)\b/i;
  const arabicExclamations = /(سبحان الله|ما شاء الله|يا إلهي|يا الله|رائع|مدهش|يا للهول|عجبًا|ما أجمل)/;

  const isExclamation =
    enExclamationStarts.test(lower) ||
    enExclamations.test(lower) ||
    romanUrduExclamations.test(lower) ||
    devanagariExclamations.test(trimmed) ||
    persoArabicExclamations.test(trimmed) ||
    spanishExclamations.test(lower) ||
    arabicExclamations.test(trimmed);

  if (isExclamation) {
    return {
      emotion: 'exclamative',
      punctuation: exMark,
      confidence: 0.92,
      matchedRule: 'exclamative_sensation',
    };
  }

  // 2. INQUISITIVE / QUESTIONING (Doubt, inquiry, curiosity)
  const enQuestionStart = /^(why|what|where|when|who|whom|whose|which|how|is|are|am|was|were|do|does|did|can|could|would|should|will|won't|haven't|hasn't|hadn't|isn't|aren't|wasn't|weren't|don't|doesn't|didn't|may|might|shall)\b/i;
  const enQuestionPhrases = /\b(do you think|have you ever|what if|how come|is it possible|are you sure|how could|why would|what happened|am i|could it be|anyone there)\b/i;
  const enQuestionEndTags = /\b(right|really|isn't it|aren't you|don't you|won't you|can you|okay|ok)\s*$/i;

  const romanUrduQuestions = /\b(kya|kyun|kyu|kyon|kaise|kaisa|kaisi|kab|kahan|kidhar|kaun|kon|kisne|kisko|kisse|kitna|kitni|kitne|hai na|haina|sach me|kya ye|kya yeh)\b/i;
  const devanagariQuestions = /(?:^|[\s,।!?])(क्या|क्यों|क्यूँ|कैसे|कैसा|कैसी|कब|कहाँ|किधर|कौन|किसने|किसको|किससे|कितना|कितनी|कितने|है ना|सच में)(?:$|[\s,।!?])/;
  const persoArabicQuestions = /(?:^|[\s،۔!؟])(کیا|کیوں|کیسے|کیسا|کیسی|کب|کہاں|کدھر|کون|کس نے|کس کو|کس سے|کتنا|کتنی|کتنے|ہے نا|کیا یہ)(?:$|[\s،۔!؟])/;
  const arabicQuestions = /^(هل|لماذا|كيف|متى|أين|من|ماذا|ما|أ|كم|أي|أليس)\b/;
  const spanishQuestions = /^(¿|por qué|qué|cómo|cuándo|dónde|adónde|quién|quiénes|cuál|cuáles|cuánto|cuánta|acaso|será)\b/i;

  const isQuestion =
    enQuestionStart.test(lower) ||
    enQuestionPhrases.test(lower) ||
    enQuestionEndTags.test(lower) ||
    romanUrduQuestions.test(lower) ||
    devanagariQuestions.test(trimmed) ||
    persoArabicQuestions.test(trimmed) ||
    arabicQuestions.test(trimmed) ||
    spanishQuestions.test(lower);

  if (isQuestion) {
    return {
      emotion: 'inquisitive',
      punctuation: qMark,
      confidence: 0.94,
      matchedRule: 'inquisitive_syntax',
    };
  }

  // 3. CONTEMPLATIVE / MELANCHOLIC / LINGERING SENSATION (Introspective yearning, grief, trailing silence)
  const enContemplative = /^(i wish|if only|maybe one day|sometimes i wonder|sometimes i feel|perhaps|i don't know anymore|lost in thoughts|fading away|in the quiet|silence lingers|i still miss|deep down|remembering the times)\b/i;
  const enContemplativeEnd = /\b(and yet|who knows|just fading|lost forever|in vain|somewhere in time|if only|maybe)\s*$/i;
  const romanUrduContemplative = /\b(kaash|kash|kash ke|shayad|kya pata|tanha|khamosh|yaad aati hai|yaad aata hai|dil chahta hai|bas yun hi|sochta hoon|sochti hoon|kaash aisa hota|akelepan me)\b/i;
  const devanagariContemplative = /(?:^|[\s,।!?])(काश|काश कि|शायद|क्या पता|तन्हा|खामोश|याद आता है|याद आती है|बस यूँ ही|सोचता हूँ|सोचती हूँ|काश ऐसा होता|अकेले में)(?:$|[\s,।!?])/;
  const persoArabicContemplative = /(?:^|[\s،۔!؟])(کاش|کاش کہ|شاید|کیا پتہ|تنہا|خاموش|یاد آتا ہے|یاد آتی ہے|بس یوں ہی|سوچتا ہوں|سوچتی ہوں|کاش ایسا ہوتا|اکیلے پن میں)(?:$|[\s،۔!؟])/;

  const isContemplative =
    enContemplative.test(lower) ||
    enContemplativeEnd.test(lower) ||
    romanUrduContemplative.test(lower) ||
    devanagariContemplative.test(trimmed) ||
    persoArabicContemplative.test(trimmed);

  if (isContemplative) {
    return {
      emotion: 'contemplative',
      punctuation: ellipsis,
      confidence: 0.88,
      matchedRule: 'contemplative_sensation',
    };
  }

  // 4. DECLARATIVE / GROUNDED EMOTION
  return {
    emotion: 'declarative',
    punctuation: defaultPunct,
    confidence: 0.75,
    matchedRule: 'declarative_statement',
  };
}

/**
 * Punctuate a single clause or sentence intelligently based on its tone, syntax, and emotion.
 */
export function smartPunctuateSentence(sentence = '', language = 'en-US', options = {}) {
  if (!sentence || typeof sentence !== 'string') return '';

  let trimmed = sentence.trim();
  if (!trimmed) return '';

  const isDevanagari = /[\u0900-\u097F]/.test(trimmed);
  const isPersoArabic = /[\u0600-\u06FF]/.test(trimmed);
  const isLatin = !isDevanagari && !isPersoArabic;

  // Clean spacing before punctuation marks
  trimmed = trimmed.replace(/\s+([,.:;?!।۔؟،])/g, '$1');

  // Introductory & conversational interjections that take a comma pause
  const isUrdu = language.startsWith('ur') || isPersoArabic;
  const isArabic = language.startsWith('ar');

  if (isPersoArabic || isUrdu) {
    trimmed = trimmed.replace(/^(سچ کہوں تو|دراصل|دیکھو|سنو|ویسے|لیکن|ہاں|نہیں|خیر)\s*(?![,۔!؟:;،])/i, '$1، ');
  } else if (isArabic) {
    trimmed = trimmed.replace(/^(في الحقيقة|بصراحة|فجأة|مع ذلك|علاوة على ذلك|يا ترى)\s*(?![,.،؛؟!])/i, '$1، ');
  } else if (isDevanagari) {
    trimmed = trimmed.replace(/^(सच कहूँ तो|दरअसल|देखो|सुनो|वैसे|लेकिन|हाँ|नहीं|खैर)\s*(?![,।!?:;])/i, '$1, ');
  } else {
    // English / Roman Hindi / Urdu / Spanish
    trimmed = trimmed
      .replace(/^(sach kahun toh|asal mein|dekho|suno|waise|kher|khair|lekin|sach me)\b\s*(?![,!?:;])/i, '$1, ')
      .replace(/^(wow|whoa|omg|oh my god|alas|bravo|yay|arre|arey|wah|honestly|frankly|actually|well|look|listen|suddenly|meanwhile|in fact|to be honest|believe it or not|strangely|thankfully|unfortunately|fortunately|however|moreover|nevertheless|furthermore|by the way|after all|wait|hey|oh|dear diary)\b\s*(?![,!?:;])/i, '$1, ');
  }

  // Check if terminal punctuation already exists
  const hasTerminalPunct = /[.!?।۔؟…]$|\.\.\.$/.test(trimmed);

  if (!hasTerminalPunct) {
    const emotionData = detectSentenceEmotion(trimmed, language);
    trimmed = trimmed + emotionData.punctuation;
  }

  // Spanish opening inverted punctuation support
  if (language.startsWith('es')) {
    if (trimmed.endsWith('?') && !trimmed.startsWith('¿')) {
      trimmed = '¿' + trimmed;
    } else if (trimmed.endsWith('!') && !trimmed.startsWith('¡')) {
      trimmed = '¡' + trimmed;
    }
  }

  // Auto-capitalization for Latin scripts
  if (isLatin && options.autoCapitalize !== false) {
    trimmed = autoCapitalizeText(trimmed);
  }

  return trimmed;
}

/**
 * Splits run-on phrases that clearly transition into questions or emotional exclamations.
 */
function splitRunOnSentences(text = '') {
  if (!text || typeof text !== 'string') return [text];

  const trimmed = text.trim();
  if (!trimmed) return [];

  // Look for strong sentence starters occurring after at least 3 prior words
  // e.g. "I woke up early today why is it so cold outside"
  const tokens = trimmed.split(/\s+/);
  if (tokens.length <= 4) return [trimmed];

  const starters = /^(why|what|where|when|how|kya|kyun|honestly|suddenly|however|kash|काश|کیا|کاش|wow|wah|arre)$/i;
  const twoWordStarters = /^(i wish|if only|maybe one|sometimes i|kash ke|sach kahun|to be)$/i;
  const relativeClausePreceders = /^(know|see|tell|ask|wonder|understand|remember|decide|sure|reason|found)$/i;

  const resultSentences = [];
  let currentWords = [];

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const nextWord = i < tokens.length - 1 ? tokens[i + 1] : '';
    const twoWords = (word + ' ' + nextWord).toLowerCase();
    const prevWord = i > 0 ? tokens[i - 1].toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    const isStarterMatch = starters.test(word) || twoWordStarters.test(twoWords);

    if (
      currentWords.length >= 3 &&
      isStarterMatch &&
      !relativeClausePreceders.test(prevWord)
    ) {
      resultSentences.push(currentWords.join(' '));
      currentWords = [word];
    } else {
      currentWords.push(word);
    }
  }

  if (currentWords.length > 0) {
    resultSentences.push(currentWords.join(' '));
  }

  return resultSentences.length > 0 ? resultSentences : [trimmed];
}

/**
 * Smartly punctuates full text paragraphs according to emotion, syntax, and logical flow.
 */
export function smartPunctuateText(rawText = '', language = 'en-US', options = {}) {
  if (!rawText || typeof rawText !== 'string') return '';

  // 1. First convert explicit verbal commands (period, comma, new line, etc.)
  let processed = applyVoicePunctuation(rawText, language, { smart: false });

  // 2. Process line by line to preserve newlines and paragraphs
  const lines = processed.split(/\r?\n/);
  const punctuatedLines = lines.map((line) => {
    if (!line.trim()) return line;

    // Split on existing terminal punctuation while preserving boundaries
    const sentenceTokens = line.split(/(?<=[.!?।۔؟…])\s+/);

    const punctuatedTokens = sentenceTokens.map((chunk) => {
      if (!chunk.trim()) return chunk;

      // Check for unpunctuated run-on sentences with strong transitions
      const subChunks = splitRunOnSentences(chunk);
      return subChunks
        .map((subChunk) => smartPunctuateSentence(subChunk, language, options))
        .join(' ');
    });

    return punctuatedTokens.join(' ');
  });

  return punctuatedLines.join('\n');
}

/**
 * Converts spoken punctuation commands into punctuation symbols,
 * with optional smart emotion & sensation punctuation.
 *
 * Example (voice commands): "I love coding period" -> "I love coding."
 * Example (smart emotion): "Why did you do that" -> "Why did you do that?"
 */
export function applyVoicePunctuation(rawText = '', language = 'en-US', options = {}) {
  if (!rawText || typeof rawText !== 'string') return '';

  const isSmart = typeof options === 'boolean' ? options : Boolean(options?.smart);

  let processed = rawText;

  // English & general punctuation replacements
  if (language.startsWith('en')) {
    processed = processed
      .replace(/\s+(period|full stop)(\s*)/gi, '.$2')
      .replace(/\s+(comma)(\s*)/gi, ',$2')
      .replace(/\s+(question mark)(\s*)/gi, '?$2')
      .replace(/\s+(exclamation mark|exclamation point)(\s*)/gi, '!$2')
      .replace(/\s+(colon)(\s*)/gi, ':$2')
      .replace(/\s+(semicolon)(\s*)/gi, ';$2')
      .replace(/\s+(new line|next line)\s*/gi, '\n')
      .replace(/\s+(new paragraph)\s*/gi, '\n\n');
  } else if (language.startsWith('hi')) {
    // Hindi voice commands
    processed = processed
      .replace(/\s+(पूर्ण विराम|फुल स्टॉप)(\s*)/gi, '।$2')
      .replace(/\s+(कॉमा|अल्पविराम)(\s*)/gi, ',$2')
      .replace(/\s+(प्रश्नवाचक|क्वेश्चन मार्क)(\s*)/gi, '?$2')
      .replace(/\s+(नई लाइन|अगली लाइन)\s*/gi, '\n');
  } else if (language.startsWith('ur')) {
    // Urdu voice commands
    processed = processed
      .replace(/\s+(ختمہ|فل اسٹاپ)(\s*)/gi, '۔$2')
      .replace(/\s+(کوما|سکتہ)(\s*)/gi, '،$2')
      .replace(/\s+(سوالیہ نشان)(\s*)/gi, '؟$2')
      .replace(/\s+(نئی لائن)\s*/gi, '\n');
  }

  // If smart emotion-based punctuation is requested
  if (isSmart) {
    const opts = typeof options === 'object' ? options : { smart: true };
    processed = smartPunctuateText(processed, language, opts);
  }

  return processed;
}

/**
 * Cleanly merges a newly transcribed phrase into existing content.
 * Handles spacing, capitalization, and newlines naturally.
 */
export function appendTranscriptToContent(currentContent = '', newChunk = '') {
  const trimmedChunk = newChunk.trim();
  if (!trimmedChunk) return currentContent;

  const trimmedContent = currentContent || '';
  if (!trimmedContent) {
    return trimmedChunk;
  }

  // If content ends with newline or space, just append
  if (/[\s\n]$/.test(trimmedContent)) {
    return trimmedContent + trimmedChunk;
  }

  // If ends with sentence punctuation, separate with a single space
  if (/[.!?।۔؟…]$|\.\.\.$/.test(trimmedContent)) {
    return trimmedContent + ' ' + trimmedChunk;
  }

  // Otherwise separate with a single space
  return trimmedContent + ' ' + trimmedChunk;
}

