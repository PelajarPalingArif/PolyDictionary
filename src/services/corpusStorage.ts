/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AVAILABLE_CORPUS_PACKAGES } from '../data/downloadableCorpora';
import { enrichCjkEntry, CURATED_CJK_EXEMPLARS } from '../data/cjkLexiconEnricher';
import { CorpusPackage, DictionaryEntry, DefinitionItem, LanguageCode, SearchSuggestionItem, RawCjkEntry } from '../types/dictionary';

const STORAGE_KEY_PACKAGES = 'polydict_installed_packages';
const STORAGE_KEY_CUSTOM_ENTRIES = 'polydict_custom_entries';
const STORAGE_KEY_DOWNLOADED_ENTRIES = 'polydict_downloaded_entries';

// In-memory cache for the 102,000+ Webster partitioned letter dictionaries
const letterCache: Record<string, Record<string, string>> = {};

interface CjkCacheItem {
  list: RawCjkEntry[];
  map: Map<string, RawCjkEntry>;
}

// In-memory cache for comprehensive CJK lexicons (443,000+ entries)
const cjkLexiconCache: Record<string, CjkCacheItem> = {};

export async function loadCjkLexicon(lang: 'ja' | 'zh' | 'ko'): Promise<CjkCacheItem | null> {
  if (cjkLexiconCache[lang]) {
    return cjkLexiconCache[lang];
  }

  try {
    const resp = await fetch(`/dict/${lang}.json`);
    if (resp.ok) {
      const list: RawCjkEntry[] = await resp.json();
      const map = new Map<string, RawCjkEntry>();
      for (const item of list) {
        const wKey = item.w.toLowerCase();
        if (!map.has(wKey)) map.set(wKey, item);

        if (item.m) {
          const mKey = item.m.toLowerCase();
          if (!map.has(mKey)) map.set(mKey, item);
        }
        if (item.r) {
          const rKey = item.r.toLowerCase();
          if (!map.has(rKey)) map.set(rKey, item);
        }
        if (item.h) {
          const hKey = item.h.toLowerCase();
          if (!map.has(hKey)) map.set(hKey, item);
        }
        if (item.t) {
          const tKey = item.t.toLowerCase();
          if (!map.has(tKey)) map.set(tKey, item);
        }
      }
      const cacheItem = { list, map };
      cjkLexiconCache[lang] = cacheItem;
      return cacheItem;
    }
  } catch (e) {
    console.warn(`Could not load /dict/${lang}.json`, e);
  }

  return null;
}

export function formatCjkToDictionaryEntry(raw: RawCjkEntry, lang: 'ja' | 'zh' | 'ko'): DictionaryEntry {
  const meta = {
    ja: {
      corpusId: 'lang-ja',
      corpusName: 'Japanese – English Dictionary',
      sourceName: 'EDICT2 / JMdict'
    },
    zh: {
      corpusId: 'lang-zh',
      corpusName: 'Chinese (Simplified) – English Dictionary',
      sourceName: 'CC-CEDICT'
    },
    ko: {
      corpusId: 'lang-ko',
      corpusName: 'Korean – English Dictionary',
      sourceName: 'KENGDIC'
    }
  }[lang];

  let pos: DefinitionItem['partOfSpeech'] = 'noun';
  if (raw.pos === 'verb' || raw.pos === 'adjective' || raw.pos === 'adverb' || raw.pos === 'interjection' || raw.pos === 'conjunction' || raw.pos === 'preposition') {
    pos = raw.pos;
  }

  let etymology: string | undefined;
  if (lang === 'ko' && raw.h) {
    etymology = `Historical Hanja roots: ${raw.h}`;
  } else if (lang === 'zh' && raw.t) {
    etymology = `Traditional Chinese counterpart: ${raw.t}`;
  }

  const { definitions, examples } = enrichCjkEntry(raw, lang);
  const synonyms = CURATED_CJK_EXEMPLARS[raw.w]?.synonyms || [];
  const antonyms = CURATED_CJK_EXEMPLARS[raw.w]?.antonyms || [];

  return {
    id: `${lang}-${raw.w}`,
    word: raw.w,
    language: lang,
    reading: raw.r,
    romanization: raw.m,
    phonetic: `/${raw.m || raw.r}/`,
    syllables: raw.m || raw.r,
    corpusId: meta.corpusId,
    corpusName: meta.corpusName,
    sourceName: meta.sourceName,
    etymology,
    meanings: [
      {
        partOfSpeech: pos,
        definitions,
        examples,
        synonyms,
        antonyms
      }
    ]
  };
}

export function getCorpusPackages(): CorpusPackage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PACKAGES);
    if (!stored) {
      return AVAILABLE_CORPUS_PACKAGES;
    }
    const installedIds: string[] = JSON.parse(stored);
    return AVAILABLE_CORPUS_PACKAGES.map(pkg => ({
      ...pkg,
      installed: pkg.isDefault || installedIds.includes(pkg.id)
    }));
  } catch {
    return AVAILABLE_CORPUS_PACKAGES;
  }
}

export function saveInstalledPackages(packages: CorpusPackage[]) {
  try {
    const installedIds = packages.filter(p => p.installed && !p.isDefault).map(p => p.id);
    localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(installedIds));
  } catch (e) {
    console.error('Failed to save installed packages', e);
  }
}

export function getDownloadedEntries(): DictionaryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DOWNLOADED_ENTRIES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveDownloadedEntries(entries: DictionaryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DOWNLOADED_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save downloaded entries', e);
  }
}

export function getCustomEntries(): DictionaryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_ENTRIES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomEntries(entries: DictionaryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save custom entries', e);
  }
}

export function getAllActiveEntries(): DictionaryEntry[] {
  const packages = getCorpusPackages();
  const installedPackageIds = new Set(packages.filter(p => p.installed).map(p => p.id));
  
  const storedDownloaded = getDownloadedEntries();
  const downloadedEntries = storedDownloaded.filter(e => installedPackageIds.has(e.corpusId));
  const customEntries = getCustomEntries();

  return [...downloadedEntries, ...customEntries];
}

/**
 * Loads a letter chunk from /dict/{letter}.json (102,000+ words)
 */
export async function loadLetterChunk(letter: string): Promise<Record<string, string>> {
  const cleanLetter = letter.toLowerCase();
  if (letterCache[cleanLetter]) {
    return letterCache[cleanLetter];
  }

  try {
    const resp = await fetch(`/dict/${cleanLetter}.json`);
    if (resp.ok) {
      const data = await resp.json();
      letterCache[cleanLetter] = data;
      return data;
    }
  } catch (e) {
    console.warn(`Could not load /dict/${cleanLetter}.json`, e);
  }

  return {};
}

// Well-known author citations and Bible abbreviations in Webster 1913
const CITATION_REGEX = /\b(Shak|Milton|Landor|Howell|T\.\s*Arnold|Arnold|Bacon|Cowper|Spenser|Pope|Johnson|Dryden|Swift|Fuller|Locke|Blackstone|Chaucer|Macaulay|Tennyson|Wordsworth|Byron|Burke|Addison|Coleridge|South|Sir\s+W\.\s*Scott|Scott|Gay|Prior|Hooker|Clarendon|Atterbury|Burnet|Tillotson|Matt|Gen|Prov|Kings|Job|Rom|Luke|John|Cor|Deut|Psa|Isa|Jer|Ezek|Dan|Hos|Mic|Hab|Zech|Mal|Acts|Rev)\.?\s*$/i;

function detectPos(paragraph: string): DefinitionItem['partOfSpeech'] {
  const p = paragraph.trim().replace(/^\d+\.\s*/, '').trim();

  if (/^(?:\((?:v\.|v\.?\s*t\.?|v\.?\s*i\.?|verb)\)|\bv\.?\s*t\.?\b|\bv\.?\s*i\.?\b|\bverb\b)/i.test(p)) {
    return 'verb';
  }
  if (/^(?:\((?:a|adj)\.?\)|\b(?:adj|a)\.\s+)/i.test(p)) {
    return 'adjective';
  }
  if (/^(?:\((?:adv)\.?\)|\badv\.\s+)/i.test(p)) {
    return 'adverb';
  }
  if (/^(?:\((?:prep)\.?\)|\bprep\.\s+)/i.test(p)) return 'preposition';
  if (/^(?:\((?:conj)\.?\)|\bconj\.\s+)/i.test(p)) return 'conjunction';
  if (/^(?:\((?:interj)\.?\)|\binterj\.\s+)/i.test(p)) return 'interjection';
  if (/^(?:\((?:n)\.?\)|\bn\.\s+)/i.test(p)) return 'noun';

  const domainMatch = p.match(/^(\((?:Zoöl|Bot|Anat|Med|Min|Chem|Astron|Geol|Mach|Law|Arch|Mil|Naut|Gram|Mus|Phys|Opt|Paint|Print|Sculp|Theol|Eccl)\.\)\s*)+/i);
  let afterDomain = p;
  if (domainMatch) {
    afterDomain = p.slice(domainMatch[0].length).trim();
  }

  if (/^to\b/i.test(afterDomain)) {
    return 'verb';
  }

  if (/^(?:characterized by|of or pertaining to|pertaining to|having the|capable of|received by|belonging to|situated in|relating to|noting or|expressive of|tending to|causing|producing|growing|encompassing|disposed to|fitted to|subject to|destitute of)\b/i.test(afterDomain)) {
    return 'adjective';
  }

  if (/^in a\s+\w+\s+(?:manner|way|state|direction|degree)\b/i.test(afterDomain)) {
    return 'adverb';
  }

  if (/^(?:ah|alas|oh|hail|lo|hark)\b/i.test(afterDomain)) {
    return 'interjection';
  }

  return 'noun';
}

function splitSequentialSenses(text: string): string[] {
  const earlyOne = text.match(/^(?:(?:\([^)]+\)|\[[^\]]+\]|[A-Za-z.,\s]{1,30})\s+)?1\.\s+/);
  if (!earlyOne) return [text];

  const chunks: string[] = [];
  let currentSense = 1;
  let remaining = text.slice(earlyOne[0].length);

  while (true) {
    const nextSense = currentSense + 1;
    const nextRegex = new RegExp('(?:^|\\s)' + nextSense + '\\.\\s+');
    const match = remaining.match(nextRegex);
    if (match && match.index !== undefined) {
      const senseText = remaining.slice(0, match.index).trim();
      chunks.push(senseText);
      remaining = remaining.slice(match.index + match[0].length).trim();
      currentSense = nextSense;
    } else {
      chunks.push(remaining.trim());
      break;
    }
  }
  return chunks;
}

function separateCompoundsAndNotes(chunk: string, word: string): { mainText: string; compounds: string[] } {
  let mainText = chunk.trim();
  const compounds: string[] = [];

  // 1. Split off dashed compounds e.g. " -- Compound, def"
  if (mainText.includes(' -- ')) {
    const parts = mainText.split(/\s+--\s+/);
    mainText = parts[0].trim();
    for (let i = 1; i < parts.length; i++) {
      const c = parts[i].trim();
      if (c) compounds.push(c);
    }
  }

  // 2. Notes: "Note: ..."
  const noteIdx = mainText.search(/\bNote:\s+/);
  if (noteIdx !== -1) {
    const note = mainText.slice(noteIdx).trim();
    mainText = mainText.slice(0, noteIdx).trim();
    compounds.push(note);
  }

  // 3. Un-dashed compound phrase at end of definition
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const compRegex = new RegExp(
    `(?:\\.\\s+|;\\s+)((?:(?:${escapedWord}\\b|${escapedWord}['’]s\\b)[^,;]+|[A-Z][\\p{L}'’\\s]+\\([^)]+\\)),\\s+[a-z].+)$`,
    'u'
  );
  const match = mainText.match(compRegex);
  if (match && match.index !== undefined && match[1].length > 25) {
    const c = match[1].trim();
    if (!c.startsWith('as,') && !c.startsWith('so,') && !CITATION_REGEX.test(c) && !c.includes('"') && !c.includes('“')) {
      mainText = mainText.slice(0, match.index + 1).trim();
      compounds.push(c);
    }
  }

  return { mainText, compounds };
}

function separateDefAndExample(senseText: string): { def: string; ex: string } {
  const text = senseText.trim();
  if (!text) return { def: '', ex: '' };

  const quoteStart = text.search(/[\"“]/);
  if (quoteStart !== -1 && quoteStart > 10) {
    const beforeQuote = text.slice(0, quoteStart).trim();
    const quote = text.slice(quoteStart).trim();
    if (beforeQuote.endsWith('.') || beforeQuote.endsWith(';') || beforeQuote.endsWith(':')) {
      return { def: beforeQuote, ex: quote };
    }
  }

  if (CITATION_REGEX.test(text)) {
    const match = text.match(/^((?:\([^)]*\)|\[[^\]]*\]|[^.?!(\[])+[.?!])\s+([A-Z].+)$/s);
    if (match && match[1].length >= 15 && !match[1].endsWith('Law.)') && !match[1].endsWith('Obs.)')) {
      return { def: match[1].trim(), ex: match[2].trim() };
    }
  }

  const asMatch = text.match(/^(.+?[.?!])\s+(as,\s+.+)$/s);
  if (asMatch && asMatch[1].length >= 15) {
    return { def: asMatch[1].trim(), ex: asMatch[2].trim() };
  }

  return { def: text, ex: '' };
}

function parseParagraph(rawParagraph: string, word: string): {
  pos: DefinitionItem['partOfSpeech'];
  definitions: string[];
  examples: string[];
  synonyms: string[];
  compounds: string[];
} {
  let text = rawParagraph.trim();

  let synonyms: string[] = [];
  const synMatch = text.match(/Syn\.\s*--?\s*([^.\n]+)/);
  if (synMatch) {
    synonyms = synMatch[1]
      .split(/[;,]/)
      .map(s => s.replace(/^To\s+/i, '').replace(/\[.*?\]/g, '').replace(/--.+$/, '').trim())
      .filter(s => s.length > 1 && !s.includes('.') && s.length < 35);
    text = text.replace(/Syn\.\s*--?.+$/, '').trim();
  }

  const pos = detectPos(text);
  const allCompounds: string[] = [];
  const definitions: string[] = [];
  const examples: string[] = [];

  const rawChunks = splitSequentialSenses(text);
  for (const chunk of rawChunks) {
    const { mainText, compounds } = separateCompoundsAndNotes(chunk, word);
    allCompounds.push(...compounds);

    const { def, ex } = separateDefAndExample(mainText);
    if (def) {
      definitions.push(def);
      examples.push(ex);
    }
  }

  return {
    pos,
    definitions,
    examples,
    synonyms,
    compounds: allCompounds
  };
}

/**
 * Accurately parses Webster 1913 raw text into structured definitions & examples
 * - Splits multi-paragraph entries into distinct parts of speech (noun, verb, adjective, adverb, etc.)
 * - Handles sequential numbered senses (1., 2., 3...) without breaking on Bible citations or measurements
 * - Extracts compound phrases, idioms, and notes into an organized 'idiom' section
 * - Cleans and aligns example citations 1-to-1 with definitions
 * - Extracts clean synonyms lists from "Syn. -- ..." blocks
 */
export function parseWebsterRawDefinition(rawText: string, word: string): DictionaryEntry {
  const text = rawText.trim();

  // Modern WordNet / Contemporary Corpus branch
  if (text.startsWith('[Modern Lexicon (WordNet)]')) {
    const lines = text
      .replace(/^\[Modern Lexicon \(WordNet\)\]\s*/, '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const meaningsMap: Record<string, DefinitionItem> = {};

    for (const line of lines) {
      const match = line.match(/^\d+\.\s*\((noun|verb|adjective|adverb)\)\s*(.+?)(?:\s*--\s*(.+))?$/);
      if (match) {
        const rawPos = match[1] as 'noun' | 'verb' | 'adjective' | 'adverb';
        const def = match[2].trim();
        const exp = match[3] ? match[3].replace(/^\"|\"$/g, '').trim() : '';

        if (!meaningsMap[rawPos]) {
          meaningsMap[rawPos] = {
            partOfSpeech: rawPos,
            definitions: [],
            examples: [],
            synonyms: [],
            antonyms: []
          };
        }

        const capitalizedDef = def.charAt(0).toUpperCase() + def.slice(1);
        meaningsMap[rawPos].definitions.push(capitalizedDef);
        if (exp) {
          meaningsMap[rawPos].examples.push(exp);
        }
      }
    }

    const meanings = Object.values(meaningsMap);

    return {
      id: `modern-${word}`,
      word,
      language: 'en',
      phonetic: `/${word}/`,
      syllables: word,
      corpusId: 'base-en',
      corpusName: 'WordNet (Modern English)',
      sourceName: 'WordNet',
      meanings: meanings.length > 0 ? meanings : [
        {
          partOfSpeech: 'noun',
          definitions: [text.replace(/^\[Modern Lexicon \(WordNet\)\]\s*/, '')],
          examples: [],
          synonyms: [],
          antonyms: []
        }
      ]
    };
  }

  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const meaningsMap: Record<string, DefinitionItem> = {};
  const allIdioms: string[] = [];

  for (const p of paragraphs) {
    const parsed = parseParagraph(p, word);
    if (parsed.definitions.length === 0 && parsed.compounds.length === 0) continue;

    if (parsed.definitions.length > 0) {
      if (!meaningsMap[parsed.pos]) {
        meaningsMap[parsed.pos] = {
          partOfSpeech: parsed.pos,
          definitions: [],
          examples: [],
          synonyms: [],
          antonyms: []
        };
      }

      meaningsMap[parsed.pos].definitions.push(...parsed.definitions);
      meaningsMap[parsed.pos].examples.push(...parsed.examples);
      if (parsed.synonyms.length > 0) {
        meaningsMap[parsed.pos].synonyms.push(...parsed.synonyms);
      }
    }

    if (parsed.compounds.length > 0) {
      allIdioms.push(...parsed.compounds);
    }
  }

  if (allIdioms.length > 0) {
    meaningsMap['idiom'] = {
      partOfSpeech: 'idiom',
      definitions: allIdioms.slice(0, 20),
      examples: allIdioms.slice(0, 20).map(() => ''),
      synonyms: [],
      antonyms: []
    };
  }

  const meanings = Object.values(meaningsMap);

  return {
    id: `webster-${word}`,
    word,
    language: 'en',
    phonetic: `/${word}/`,
    syllables: word,
    corpusId: 'base-en',
    corpusName: 'Webster Unabridged',
    sourceName: 'Webster Unabridged',
    meanings: meanings.length > 0 ? meanings : [
      {
        partOfSpeech: 'noun',
        definitions: [text],
        examples: [''],
        synonyms: [],
        antonyms: []
      }
    ]
  };
}

/**
 * Unified lookup function ensuring deterministic priority:
 * 1. Active custom & downloaded entries
 * 2. Comprehensive CJK Lexicons (ja, zh, ko)
 * 3. 102,000+ Webster corpus
 */
export async function lookupWordUnified(
  word: string, 
  targetLang: LanguageCode | 'all',
  activeEntries: DictionaryEntry[]
): Promise<DictionaryEntry | null> {
  const clean = word.trim().toLowerCase();
  if (!clean) return null;

  // 1. Check active entries state (downloaded / custom)
  const activeMatch = activeEntries.find(e => {
    const isMatch = e.word.toLowerCase() === clean || 
                    e.romanization?.toLowerCase() === clean ||
                    e.reading?.toLowerCase() === clean;
    if (targetLang === 'all') return isMatch;
    return isMatch && e.language === targetLang;
  });
  if (activeMatch) return activeMatch;

  // 2b. Check definition keyword matches in active entries (e.g. typing "japan", "moon", "hello")
  if (clean.length >= 3) {
    const defMatch = activeEntries.find(e => {
      if (targetLang !== 'all' && e.language !== targetLang) return false;
      return e.meanings.some(m => m.definitions.some(d => d.toLowerCase().includes(clean)));
    });
    if (defMatch) return defMatch;
  }

  // 3. Fallback to comprehensive CJK Lexicons if target is ja, zh, ko, or all
  const packages = getCorpusPackages();
  const isInstalled = (pkgId: string) => packages.some(p => p.id === pkgId && p.installed);

  const lookupCjk = async (lang: 'ja' | 'zh' | 'ko'): Promise<DictionaryEntry | null> => {
    const lexicon = await loadCjkLexicon(lang);
    if (!lexicon) return null;

    // Direct lookup by native word, reading, romanization, hanja, or traditional
    if (lexicon.map.has(clean)) {
      return formatCjkToDictionaryEntry(lexicon.map.get(clean)!, lang);
    }

    // Lookup by English definition/gloss keyword
    if (clean.length >= 3) {
      // Priority: exact definition match first
      const exactGloss = lexicon.list.find(e => e.d.some(d => d.toLowerCase() === clean));
      if (exactGloss) return formatCjkToDictionaryEntry(exactGloss, lang);

      // Prefix definition match
      const prefixGloss = lexicon.list.find(e => e.d.some(d => d.toLowerCase().startsWith(clean)));
      if (prefixGloss) return formatCjkToDictionaryEntry(prefixGloss, lang);

      // Substring definition match
      const subGloss = lexicon.list.find(e => e.d.some(d => d.toLowerCase().includes(clean)));
      if (subGloss) return formatCjkToDictionaryEntry(subGloss, lang);
    }

    return null;
  };

  if (targetLang === 'ja' && isInstalled('lang-ja')) {
    const jaMatch = await lookupCjk('ja');
    if (jaMatch) return jaMatch;
  } else if (targetLang === 'zh' && isInstalled('lang-zh')) {
    const zhMatch = await lookupCjk('zh');
    if (zhMatch) return zhMatch;
  } else if (targetLang === 'ko' && isInstalled('lang-ko')) {
    const koMatch = await lookupCjk('ko');
    if (koMatch) return koMatch;
  } else if (targetLang === 'all') {
    if (isInstalled('lang-ja')) {
      const jaMatch = await lookupCjk('ja');
      if (jaMatch) return jaMatch;
    }
    if (isInstalled('lang-zh')) {
      const zhMatch = await lookupCjk('zh');
      if (zhMatch) return zhMatch;
    }
    if (isInstalled('lang-ko')) {
      const koMatch = await lookupCjk('ko');
      if (koMatch) return koMatch;
    }
  }

  // 4. Fallback to 102,000+ comprehensive Webster dictionary for English
  if (targetLang === 'en' || targetLang === 'all') {
    const firstChar = clean.charAt(0);
    const chunk = await loadLetterChunk(firstChar);
    if (chunk && chunk[clean]) {
      return parseWebsterRawDefinition(chunk[clean], clean);
    }
  }

  return null;
}

/**
 * Looks up any English word from the comprehensive 102k Webster dataset
 */
export async function lookupComprehensiveWebsterWord(word: string): Promise<DictionaryEntry | null> {
  const clean = word.trim().toLowerCase();
  if (!clean) return null;

  const firstChar = clean.charAt(0);
  const chunk = await loadLetterChunk(firstChar);
  
  if (chunk && chunk[clean]) {
    return parseWebsterRawDefinition(chunk[clean], clean);
  }

  return null;
}

/**
 * Structured word suggestions with exact match first + strict alphabetical order
 * Decouples Language from Source with full metadata
 */
export async function getStructuredWordSuggestions(
  query: string,
  selectedLanguage: LanguageCode | 'all',
  activeEntries: DictionaryEntry[]
): Promise<SearchSuggestionItem[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const langMap: Record<string, { name: string; flag: string }> = {
    en: { name: 'English', flag: '🇬🇧' },
    ja: { name: 'Japanese', flag: '🇯🇵' },
    zh: { name: 'Chinese', flag: '🇨🇳' },
    ko: { name: 'Korean', flag: '🇰🇷' },
    es: { name: 'Spanish', flag: '🇪🇸' },
    fr: { name: 'French', flag: '🇫🇷' },
    de: { name: 'German', flag: '🇩🇪' },
    it: { name: 'Italian', flag: '🇮🇹' },
    pt: { name: 'Portuguese', flag: '🇵🇹' },
    ru: { name: 'Russian', flag: '🇷🇺' },
    ar: { name: 'Arabic', flag: '🇸🇦' },
  };

  const results: SearchSuggestionItem[] = [];
  const seenKeys = new Set<string>();

  const addCandidate = (
    word: string, 
    lang: LanguageCode, 
    source: string, 
    isExact: boolean,
    reading?: string,
    romanization?: string,
    matchedGloss?: string
  ) => {
    const key = `${word.toLowerCase()}__${lang}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      const meta = langMap[lang] || { name: lang.toUpperCase(), flag: '🌐' };
      results.push({
        word,
        language: lang,
        languageName: meta.name,
        languageFlag: meta.flag,
        sourceName: source,
        isExact,
        reading,
        romanization,
        matchedGloss,
      });
    }
  };

  // 1. Gather matching local/downloaded entries across native script, romanization, reading, and gloss
  for (const e of activeEntries) {
    if (selectedLanguage !== 'all' && e.language !== selectedLanguage) continue;

    const wordLower = e.word.toLowerCase();
    const romLower = e.romanization?.toLowerCase() || '';
    const readLower = e.reading?.toLowerCase() || '';
    const primaryGloss = e.meanings[0]?.definitions[0] || '';
    const glossLower = primaryGloss.toLowerCase();

    const isExact = wordLower === clean || romLower === clean || readLower === clean;
    const isPrefix = wordLower.startsWith(clean) || romLower.startsWith(clean) || readLower.startsWith(clean);
    const isGlossMatch = clean.length >= 3 && glossLower.includes(clean);

    if (isExact || isPrefix || isGlossMatch) {
      addCandidate(
        e.word,
        e.language,
        e.sourceName || (e.language === 'en' ? 'Webster Unabridged' : 'Dictionary'),
        isExact,
        e.reading,
        e.romanization,
        primaryGloss
      );
    }
  }

  // 2. If searching CJK (ja, zh, ko) or All, search comprehensive CJK Lexicons
  const packages = getCorpusPackages();
  const isInstalled = (pkgId: string) => packages.some(p => p.id === pkgId && p.installed);

  const searchCjkSuggestions = async (lang: 'ja' | 'zh' | 'ko') => {
    const lexicon = await loadCjkLexicon(lang);
    if (!lexicon) return;

    const sourceName = lang === 'ja' 
      ? 'EDICT2 / JMdict' 
      : lang === 'zh' 
        ? 'CC-CEDICT' 
        : 'KENGDIC';

    // Check exact matches in CJK map
    if (lexicon.map.has(clean)) {
      const item = lexicon.map.get(clean)!;
      addCandidate(item.w, lang, sourceName, true, item.r, item.m, item.d[0]);
    }

    // Prefix and gloss matches
    let count = 0;
    for (let i = 0; i < lexicon.list.length; i++) {
      const item = lexicon.list[i];
      const wLower = item.w.toLowerCase();
      const mLower = item.m ? item.m.toLowerCase() : '';
      const rLower = item.r ? item.r.toLowerCase() : '';
      const firstGloss = item.d[0] || '';
      const glossLower = firstGloss.toLowerCase();

      const isExact = wLower === clean || mLower === clean || rLower === clean;
      const isPrefix = wLower.startsWith(clean) || mLower.startsWith(clean) || rLower.startsWith(clean);
      const isGlossMatch = clean.length >= 3 && (glossLower === clean || glossLower.startsWith(clean) || item.d.some(d => d.toLowerCase().includes(clean)));

      if (isExact || isPrefix || isGlossMatch) {
        addCandidate(item.w, lang, sourceName, isExact, item.r, item.m, firstGloss);
        count++;
        if (count >= 30) break;
      }
    }
  };

  if (selectedLanguage === 'ja' && isInstalled('lang-ja')) {
    await searchCjkSuggestions('ja');
  } else if (selectedLanguage === 'zh' && isInstalled('lang-zh')) {
    await searchCjkSuggestions('zh');
  } else if (selectedLanguage === 'ko' && isInstalled('lang-ko')) {
    await searchCjkSuggestions('ko');
  } else if (selectedLanguage === 'all') {
    if (isInstalled('lang-ja')) await searchCjkSuggestions('ja');
    if (isInstalled('lang-zh')) await searchCjkSuggestions('zh');
    if (isInstalled('lang-ko')) await searchCjkSuggestions('ko');
  }

  // 3. If searching English or All, check 102k Webster chunk
  if (selectedLanguage === 'en' || selectedLanguage === 'all') {
    const firstChar = clean.charAt(0);
    const chunk = await loadLetterChunk(firstChar);
    if (chunk) {
      // Check exact match first
      if (chunk[clean]) {
        const rawExact = chunk[clean] || '';
        const source = rawExact.startsWith('[Modern Lexicon')
          ? 'WordNet (Modern English)'
          : 'Webster Unabridged';
        addCandidate(clean, 'en', source, true);
      }

      // Collect all prefix matches in this chunk
      const websterMatches: string[] = [];
      for (const w of Object.keys(chunk)) {
        if (w.startsWith(clean)) {
          websterMatches.push(w);
        }
      }

      // Sort websterMatches alphabetically
      websterMatches.sort((a, b) => a.localeCompare(b));

      for (const w of websterMatches) {
        const rawEntry = chunk[w] || '';
        const source = rawEntry.startsWith('[Modern Lexicon')
          ? 'WordNet (Modern English)'
          : 'Webster Unabridged';
        addCandidate(w, 'en', source, w === clean);
        if (results.length >= 60) break;
      }
    }
  }

  // 4. Sort ordering:
  // User Requirement: "Exact match first, followed strictly by alphabetical order"
  const exactList = results.filter(r => r.isExact);
  const otherList = results.filter(r => !r.isExact);

  otherList.sort((a, b) => a.word.localeCompare(b.word));

  return [...exactList, ...otherList].slice(0, 10);
}

/**
 * Searches the 102k dataset for autocomplete prefix matches (backward compatible)
 */
export async function searchComprehensiveWordSuggestions(query: string): Promise<string[]> {
  const suggestions = await getStructuredWordSuggestions(query, 'en', []);
  return suggestions.map(s => s.word);
}

/**
 * Generates direct online browser search URLs for leading linguistic dictionaries
 */
export function getOnlineDictionaryUrls(word: string) {
  const encoded = encodeURIComponent(word.trim());
  return {
    merriamWebster: `https://www.merriam-webster.com/dictionary/${encoded}`,
    cambridge: `https://dictionary.cambridge.org/dictionary/english/${encoded}`,
    googleDefine: `https://www.google.com/search?q=define+${encoded}`,
    wiktionary: `https://en.wiktionary.org/wiki/${encoded}`,
  };
}

export function searchDictionaryEntries(
  query: string, 
  language: LanguageCode | 'all', 
  entries: DictionaryEntry[]
): DictionaryEntry[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const filtered = language === 'all' 
    ? entries 
    : entries.filter(e => e.language === language);

  const exact = filtered.filter(e => e.word.toLowerCase() === clean);
  const prefix = filtered.filter(e => 
    e.word.toLowerCase().startsWith(clean) && e.word.toLowerCase() !== clean
  );
  const substring = filtered.filter(e => 
    e.word.toLowerCase().includes(clean) && 
    !e.word.toLowerCase().startsWith(clean)
  );

  return [...exact, ...prefix, ...substring];
}

export async function installCorpusPackage(pkgId: string): Promise<{ success: boolean; entriesAdded: number }> {
  const packages = getCorpusPackages();
  const targetPkg = packages.find(p => p.id === pkgId);
  const updated = packages.map(p => p.id === pkgId ? { ...p, installed: true } : p);
  saveInstalledPackages(updated);

  // Preload the lexicon for the installed package
  if (pkgId === 'lang-ja') await loadCjkLexicon('ja');
  else if (pkgId === 'lang-zh') await loadCjkLexicon('zh');
  else if (pkgId === 'lang-ko') await loadCjkLexicon('ko');

  return {
    success: true,
    entriesAdded: targetPkg ? targetPkg.entryCount : 0
  };
}

export function uninstallCorpusPackage(pkgId: string): boolean {
  const packages = getCorpusPackages();
  const target = packages.find(p => p.id === pkgId);
  if (target?.isDefault) return false;

  const updated = packages.map(p => p.id === pkgId ? { ...p, installed: false } : p);
  saveInstalledPackages(updated);

  // Clear memory cache if package is removed
  if (pkgId === 'lang-ja') delete cjkLexiconCache['ja'];
  else if (pkgId === 'lang-zh') delete cjkLexiconCache['zh'];
  else if (pkgId === 'lang-ko') delete cjkLexiconCache['ko'];

  const currentDownloaded = getDownloadedEntries();
  const filtered = currentDownloaded.filter(e => e.corpusId !== pkgId);
  saveDownloadedEntries(filtered);

  return true;
}
