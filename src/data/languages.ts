/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode, LanguageOption } from '../types/dictionary';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', hasOfflineCorpus: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', hasOfflineCorpus: true },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文', flag: '🇨🇳', hasOfflineCorpus: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', hasOfflineCorpus: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', hasOfflineCorpus: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', hasOfflineCorpus: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', hasOfflineCorpus: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', hasOfflineCorpus: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', hasOfflineCorpus: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', hasOfflineCorpus: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', hasOfflineCorpus: false },
];
