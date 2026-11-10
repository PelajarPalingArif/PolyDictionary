/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorpusPackage } from '../types/dictionary';

export const AVAILABLE_CORPUS_PACKAGES: CorpusPackage[] = [
  {
    id: 'base-en',
    name: 'Modern & Webster Unabridged',
    description: 'Over 208,000 English words combining modern WordNet vocabulary with Webster Unabridged.',
    language: 'en',
    entryCount: 208607,
    sizeFormatted: '38.2 MB',
    category: 'general',
    installed: true,
    isDefault: true,
    version: '2026.2',
    lastUpdated: 'Nov 2026'
  },
  {
    id: 'lang-ja',
    name: 'Japanese – English Dictionary (日本語)',
    description: 'Over 215,000 Japanese entries with Kanji, Furigana readings, Romaji, and English meanings from EDICT2 / JMdict.',
    language: 'ja',
    entryCount: 215943,
    sizeFormatted: '26.2 MB',
    category: 'general',
    installed: true,
    version: '2026.2',
    lastUpdated: 'Nov 2026'
  },
  {
    id: 'lang-zh',
    name: 'Chinese (Simplified) – English Dictionary (中文)',
    description: 'Over 121,000 Simplified Chinese entries with Pinyin tone marks, characters, and English meanings from CC-CEDICT.',
    language: 'zh',
    entryCount: 121626,
    sizeFormatted: '14.6 MB',
    category: 'general',
    installed: true,
    version: '2026.2',
    lastUpdated: 'Nov 2026'
  },
  {
    id: 'lang-ko',
    name: 'Korean – English Dictionary (한국어)',
    description: 'Over 106,000 Korean Hangul entries with Romanization, Hanja roots, and English meanings from KENGDIC.',
    language: 'ko',
    entryCount: 106231,
    sizeFormatted: '10.4 MB',
    category: 'general',
    installed: true,
    version: '2026.2',
    lastUpdated: 'Nov 2026'
  }
];
