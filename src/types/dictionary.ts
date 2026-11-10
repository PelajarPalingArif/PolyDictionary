/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'it' | 'pt' | 'ru' | 'ar' | 'ko';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  hasOfflineCorpus: boolean;
}

export interface DefinitionItem {
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'idiom' | 'financial' | 'technical';
  definitions: string[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  id: string;
  word: string;
  language: LanguageCode;
  reading?: string;
  romanization?: string;
  phonetic?: string;
  syllables?: string;
  audioPronunciation?: string;
  meanings: DefinitionItem[];
  etymology?: string;
  translationsToEn?: string[];
  corpusId: string;
  corpusName?: string;
  sourceName?: string;
  isCustom?: boolean;
}

export interface RawCjkEntry {
  w: string;
  r: string;
  m: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'interjection' | 'conjunction' | 'preposition' | 'particle';
  d: string[];
  h?: string;
  t?: string;
}

export interface SearchSuggestionItem {
  word: string;
  language: LanguageCode;
  reading?: string;
  romanization?: string;
  matchedGloss?: string;
  languageName: string;
  languageFlag: string;
  sourceName: string;
  isExact?: boolean;
}


export interface CorpusPackage {
  id: string;
  name: string;
  description: string;
  language: LanguageCode;
  targetLanguage?: LanguageCode;
  entryCount: number;
  sizeFormatted: string;
  category: 'general' | 'finance' | 'custom';
  installed: boolean;
  isDefault?: boolean;
  version: string;
  lastUpdated?: string;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  engine: 'Lingva (Free Direct)' | 'Google Web Wrapper' | 'MyMemory (Free)';
  latencyMs: number;
  detectedLang?: string;
  alternatives?: string[];
}

export interface BookmarkItem {
  id: string;
  word: string;
  language: LanguageCode;
  phonetic?: string;
  primaryPartOfSpeech: string;
  shortDefinition: string;
  savedAt: number;
  tags: string[];
  notes?: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  language: LanguageCode;
  timestamp: number;
  type: 'dictionary' | 'translator';
  details?: string;
}

export interface WordOfTheDayItem {
  date: string;
  word: string;
  language: LanguageCode;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  etymology: string;
  quote: {
    text: string;
    author: string;
  };
  difficulty: 'Elementary' | 'Intermediate' | 'Advanced' | 'Master';
}

export type ActiveView = 
  | 'dictionary' 
  | 'browse'
  | 'corpora' 
  | 'word-of-day' 
  | 'bookmarks' 
  | 'history' 
  | 'settings';
