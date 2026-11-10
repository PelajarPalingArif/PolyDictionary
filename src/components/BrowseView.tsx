/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Compass, 
  Shuffle, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { DictionaryEntry, LanguageCode, BookmarkItem, RawCjkEntry } from '../types/dictionary';
import { speechService } from '../services/speechService';
import { 
  loadLetterChunk, 
  loadCjkLexicon, 
  parseWebsterRawDefinition, 
  formatCjkToDictionaryEntry,
  getCorpusPackages 
} from '../services/corpusStorage';

interface BrowseViewProps {
  onSelectWord: (word: string, language: LanguageCode) => void;
  bookmarks: BookmarkItem[];
  onToggleBookmark: (entry: DictionaryEntry) => void;
  initialLanguage?: LanguageCode;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Japanese Gojuon (五十音) phonetic rows
const GOJUON_ROWS = [
  { id: 'a', label: 'あ行', rom: 'A', regex: /^[あいうえおぁぃぅぇぉアイウエオァィゥェォ]/, sub: ['あ', 'い', 'う', 'え', 'お'] },
  { id: 'ka', label: 'か行', rom: 'Ka', regex: /^[かきくけこがぎぐげごカキクケコガギグゲゴ]/, sub: ['か', 'き', 'く', 'け', 'こ'] },
  { id: 'sa', label: 'さ行', rom: 'Sa', regex: /^[さしすせそざじずぜぞサシスセソザジズゼゾ]/, sub: ['さ', 'し', 'す', 'せ', 'そ'] },
  { id: 'ta', label: 'た行', rom: 'Ta', regex: /^[たちつてとだぢづでどタチツテトダヂヅデド]/, sub: ['た', 'ち', 'つ', 'て', 'と'] },
  { id: 'na', label: 'な行', rom: 'Na', regex: /^[なにぬねのナニヌネノ]/, sub: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { id: 'ha', label: 'は行', rom: 'Ha', regex: /^[はひふへほばびぶべぼぱぴぷぺぽハヒフヘホバビブベボパピプペポ]/, sub: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { id: 'ma', label: 'ま行', rom: 'Ma', regex: /^[まみむめもマミムメモ]/, sub: ['ま', 'み', 'む', 'め', 'も'] },
  { id: 'ya', label: 'や行', rom: 'Ya', regex: /^[やゆよゃゅょヤユヨャュョ]/, sub: ['や', 'ゆ', 'よ'] },
  { id: 'ra', label: 'ら行', rom: 'Ra', regex: /^[らりるれろラリルレロ]/, sub: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { id: 'wa', label: 'わ行', rom: 'Wa/N', regex: /^[わをんワヲン]/, sub: ['わ', 'を', 'ん'] }
];

// Chinese Major Kangxi Radicals (部首)
const CHINESE_RADICALS = [
  { char: '氵', name: '水 Water', regex: /[氵水]/ },
  { char: '亻', name: '人 Person', regex: /[亻人]/ },
  { char: '木', name: '木 Wood', regex: /[木]/ },
  { char: '口', name: '口 Mouth', regex: /[口]/ },
  { char: '扌', name: '手 Hand', regex: /[扌手]/ },
  { char: '心', name: '心 Heart', regex: /[心忄]/ },
  { char: '艹', name: '草 Flora', regex: /[艹草]/ },
  { char: '火', name: '火 Fire', regex: /[火灬]/ },
  { char: '讠', name: '言 Speech', regex: /[讠言]/ },
  { char: '饣', name: '食 Food', regex: /[饣食]/ },
  { char: '日', name: '日 Sun', regex: /[日]/ },
  { char: '女', name: '女 Woman', regex: /[女]/ },
  { char: '钅', name: '金 Metal', regex: /[钅金]/ },
  { char: '土', name: '土 Earth', regex: /[土]/ }
];

// Korean Hangul Choseong (초성) initial consonants
const KOREAN_CHOSEONG_TABS = [
  { char: 'ㄱ', name: '기역 (G/K)', match: ['ㄱ', 'ㄲ'] },
  { char: 'ㄴ', name: '니은 (N)', match: ['ㄴ'] },
  { char: 'ㄷ', name: '디귿 (D/T)', match: ['ㄷ', 'ㄸ'] },
  { char: 'ㄹ', name: '리을 (R/L)', match: ['ㄹ'] },
  { char: 'ㅁ', name: '미음 (M)', match: ['ㅁ'] },
  { char: 'ㅂ', name: '비읍 (B/P)', match: ['ㅂ', 'ㅃ'] },
  { char: 'ㅅ', name: '시옷 (S)', match: ['ㅅ', 'ㅆ'] },
  { char: 'ㅇ', name: '이응 (Silent)', match: ['ㅇ'] },
  { char: 'ㅈ', name: '지읒 (J)', match: ['ㅈ', 'ㅉ'] },
  { char: 'ㅊ', name: '치읓 (Ch)', match: ['ㅊ'] },
  { char: 'ㅋ', name: '키읔 (K)', match: ['ㅋ'] },
  { char: 'ㅌ', name: '티읕 (T)', match: ['ㅌ'] },
  { char: 'ㅍ', name: '피읖 (P)', match: ['ㅍ'] },
  { char: 'ㅎ', name: '히읗 (H)', match: ['ㅎ'] }
];

const CHOSEONG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getHangulChoseong(char: string): string | null {
  if (!char) return null;
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  return CHOSEONG_LIST[Math.floor(code / (21 * 28))] || null;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  onSelectWord,
  bookmarks,
  onToggleBookmark,
  initialLanguage = 'en'
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(initialLanguage);
  
  // English browsing states
  const [enLetter, setEnLetter] = useState<string>('a');
  const [enChunk, setEnChunk] = useState<Record<string, string>>({});
  const [enPrefix, setEnPrefix] = useState<string>('all');
  
  // Japanese browsing states
  const [jaMode, setJaMode] = useState<'gojuon' | 'romaji'>('gojuon');
  const [jaRow, setJaRow] = useState<string>('a');
  const [jaSubKana, setJaSubKana] = useState<string>('all');
  const [jaRomajiLetter, setJaRomajiLetter] = useState<string>('a');
  
  // Chinese browsing states
  const [zhMode, setZhMode] = useState<'pinyin' | 'radical'>('pinyin');
  const [zhPinyinLetter, setZhPinyinLetter] = useState<string>('a');
  const [zhRadical, setZhRadical] = useState<string>('氵');

  // Korean browsing states
  const [koMode, setKoMode] = useState<'choseong' | 'romaji'>('choseong');
  const [koChoseong, setKoChoseong] = useState<string>('ㄱ');
  const [koRomajiLetter, setKoRomajiLetter] = useState<string>('a');

  // Shared browsing states
  const [posFilter, setPosFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 40;

  // Selected entry for the inspector
  const [activeEntry, setActiveEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Cached CJK lists
  const [cjkData, setCjkData] = useState<{ ja: RawCjkEntry[]; zh: RawCjkEntry[]; ko: RawCjkEntry[] }>({
    ja: [],
    zh: [],
    ko: []
  });

  // Load English chunk when enLetter changes
  useEffect(() => {
    if (selectedLanguage === 'en') {
      setIsLoading(true);
      loadLetterChunk(enLetter).then(chunk => {
        setEnChunk(chunk);
        setCurrentPage(0);
        setIsLoading(false);
      });
    }
  }, [selectedLanguage, enLetter]);

  // Load CJK lexicons on demand
  useEffect(() => {
    if (['ja', 'zh', 'ko'].includes(selectedLanguage)) {
      const lang = selectedLanguage as 'ja' | 'zh' | 'ko';
      if (cjkData[lang].length === 0) {
        setIsLoading(true);
        loadCjkLexicon(lang).then(res => {
          if (res) {
            setCjkData(prev => ({ ...prev, [lang]: res.list }));
          }
          setIsLoading(false);
        });
      }
    }
  }, [selectedLanguage, cjkData]);

  // Pre-sort all English keys for the loaded letter alphabetically
  const sortedEnKeys = useMemo(() => {
    if (selectedLanguage !== 'en') return [];
    return Object.keys(enChunk).sort((a, b) => a.localeCompare(b, 'en'));
  }, [selectedLanguage, enChunk]);

  // English sub-prefixes computed from all keys of current letter
  const enSubPrefixes = useMemo(() => {
    if (selectedLanguage !== 'en' || sortedEnKeys.length === 0) return [];
    const prefixSet = new Set<string>();
    sortedEnKeys.forEach(w => {
      const clean = w.replace(/[^a-z]/gi, '').toLowerCase();
      if (clean.length >= 2 && clean.startsWith(enLetter.toLowerCase())) {
        prefixSet.add(clean.slice(0, 2));
      }
    });
    return Array.from(prefixSet).sort();
  }, [selectedLanguage, sortedEnKeys, enLetter]);

  // Compute filtered & sorted English candidate list
  const enWordList = useMemo(() => {
    if (selectedLanguage !== 'en') return [];
    if (enPrefix === 'all') {
      return sortedEnKeys;
    }
    return sortedEnKeys.filter(k => {
      const clean = k.replace(/[^a-z]/gi, '').toLowerCase();
      return clean.startsWith(enPrefix.toLowerCase()) || k.toLowerCase().startsWith(enPrefix.toLowerCase());
    });
  }, [selectedLanguage, sortedEnKeys, enPrefix]);

  // Compute Japanese candidate list sorted by kana reading
  const jaWordList = useMemo(() => {
    if (selectedLanguage !== 'ja' || cjkData.ja.length === 0) return [];
    let list = cjkData.ja;

    if (jaMode === 'gojuon') {
      const rowObj = GOJUON_ROWS.find(r => r.id === jaRow);
      if (rowObj) {
        if (jaSubKana !== 'all') {
          list = list.filter(item => {
            const r = item.r || item.w;
            return r.startsWith(jaSubKana);
          });
        } else {
          list = list.filter(item => {
            const r = item.r || item.w;
            return rowObj.regex.test(r);
          });
        }
      }
    } else {
      list = list.filter(item => {
        const m = (item.m || '').toLowerCase();
        return m.startsWith(jaRomajiLetter.toLowerCase());
      });
    }

    if (posFilter !== 'all') {
      list = list.filter(item => item.pos === posFilter);
    }

    // Sort alphabetically by kana reading or romaji
    return [...list].sort((x, y) => {
      if (jaMode === 'romaji') {
        return (x.m || x.w).localeCompare(y.m || y.w, 'en');
      }
      return (x.r || x.w).localeCompare(y.r || y.w, 'ja');
    });
  }, [selectedLanguage, cjkData.ja, jaMode, jaRow, jaSubKana, jaRomajiLetter, posFilter]);

  // Compute Chinese candidate list sorted by pinyin or character
  const zhWordList = useMemo(() => {
    if (selectedLanguage !== 'zh' || cjkData.zh.length === 0) return [];
    let list = cjkData.zh;

    if (zhMode === 'pinyin') {
      list = list.filter(item => {
        const m = (item.m || '').toLowerCase();
        return m.startsWith(zhPinyinLetter.toLowerCase());
      });
    } else {
      const radObj = CHINESE_RADICALS.find(r => r.char === zhRadical);
      if (radObj) {
        list = list.filter(item => radObj.regex.test(item.w));
      }
    }

    if (posFilter !== 'all') {
      list = list.filter(item => item.pos === posFilter);
    }

    // Sort by pinyin or character
    return [...list].sort((x, y) => {
      if (zhMode === 'pinyin') {
        return (x.m || x.w).localeCompare(y.m || y.w, 'zh');
      }
      return x.w.localeCompare(y.w, 'zh');
    });
  }, [selectedLanguage, cjkData.zh, zhMode, zhPinyinLetter, zhRadical, posFilter]);

  // Compute Korean candidate list sorted by Hangul alphabetical order
  const koWordList = useMemo(() => {
    if (selectedLanguage !== 'ko' || cjkData.ko.length === 0) return [];
    let list = cjkData.ko;

    if (koMode === 'choseong') {
      const tabObj = KOREAN_CHOSEONG_TABS.find(t => t.char === koChoseong);
      if (tabObj) {
        list = list.filter(item => {
          const c = getHangulChoseong(item.w.charAt(0));
          return c ? tabObj.match.includes(c) : false;
        });
      }
    } else {
      list = list.filter(item => {
        const m = (item.m || '').toLowerCase();
        return m.startsWith(koRomajiLetter.toLowerCase());
      });
    }

    if (posFilter !== 'all') {
      list = list.filter(item => item.pos === posFilter);
    }

    // Sort alphabetically by Hangul word or Romanization
    return [...list].sort((x, y) => {
      if (koMode === 'romaji') {
        return (x.m || x.w).localeCompare(y.m || y.w, 'en');
      }
      return x.w.localeCompare(y.w, 'ko');
    });
  }, [selectedLanguage, cjkData.ko, koMode, koChoseong, koRomajiLetter, posFilter]);

  // Unified items count & paginated slice
  const totalCount = useMemo(() => {
    if (selectedLanguage === 'en') return enWordList.length;
    if (selectedLanguage === 'ja') return jaWordList.length;
    if (selectedLanguage === 'zh') return zhWordList.length;
    if (selectedLanguage === 'ko') return koWordList.length;
    return 0;
  }, [selectedLanguage, enWordList, jaWordList, zhWordList, koWordList]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentSlice = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    if (selectedLanguage === 'en') return enWordList.slice(start, end);
    if (selectedLanguage === 'ja') return jaWordList.slice(start, end);
    if (selectedLanguage === 'zh') return zhWordList.slice(start, end);
    if (selectedLanguage === 'ko') return koWordList.slice(start, end);
    return [];
  }, [selectedLanguage, enWordList, jaWordList, zhWordList, koWordList, currentPage]);

  // Automatically select the first entry when page or list changes if activeEntry is empty
  const handleSelectEntryFromItem = useCallback((item: string | RawCjkEntry) => {
    if (typeof item === 'string') {
      // English
      const rawText = enChunk[item] || '';
      if (rawText) {
        const parsed = parseWebsterRawDefinition(rawText, item);
        setActiveEntry(parsed);
      }
    } else {
      // CJK
      const parsed = formatCjkToDictionaryEntry(item, selectedLanguage as 'ja' | 'zh' | 'ko');
      setActiveEntry(parsed);
    }
  }, [enChunk, selectedLanguage]);

  useEffect(() => {
    if (currentSlice.length > 0 && !activeEntry) {
      handleSelectEntryFromItem(currentSlice[0]);
    }
  }, [currentSlice, activeEntry, handleSelectEntryFromItem]);

  // Pick random word (Serendipity)
  const handleSurpriseMe = () => {
    if (selectedLanguage === 'en' && enWordList.length > 0) {
      const idx = Math.floor(Math.random() * enWordList.length);
      const word = enWordList[idx];
      handleSelectEntryFromItem(word);
    } else if (selectedLanguage === 'ja' && jaWordList.length > 0) {
      const idx = Math.floor(Math.random() * jaWordList.length);
      handleSelectEntryFromItem(jaWordList[idx]);
    } else if (selectedLanguage === 'zh' && zhWordList.length > 0) {
      const idx = Math.floor(Math.random() * zhWordList.length);
      handleSelectEntryFromItem(zhWordList[idx]);
    } else if (selectedLanguage === 'ko' && koWordList.length > 0) {
      const idx = Math.floor(Math.random() * koWordList.length);
      handleSelectEntryFromItem(koWordList[idx]);
    }
  };

  const handlePronounce = async () => {
    if (!activeEntry) return;
    setIsSpeaking(true);
    await speechService.speak(activeEntry.word, activeEntry.language);
    setIsSpeaking(false);
  };

  const handleCopy = () => {
    if (!activeEntry) return;
    const primaryDef = activeEntry.meanings[0]?.definitions[0] || '';
    const textToCopy = `${activeEntry.word} (${activeEntry.meanings[0]?.partOfSpeech || ''}): ${primaryDef}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBookmarked = activeEntry 
    ? bookmarks.some(b => b.word.toLowerCase() === activeEntry.word.toLowerCase()) 
    : false;

  const packages = getCorpusPackages();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-hidden select-none transition-colors duration-150">
      {/* Top Header Bar */}
      <div className="p-3.5 border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F0F3FA] dark:bg-[#1E222D] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#2962FF]/10 text-[#2962FF] flex items-center justify-center border border-[#2962FF]/20 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#131722] dark:text-white uppercase tracking-wider font-mono">
                Browse Dictionary
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Offline
              </span>
            </div>
            <p className="text-[11px] text-[#787B86]">
              Browse words alphabetically, by sound, or by writing system without typing
            </p>
          </div>
        </div>

        {/* Right Tools: Language Picker & Surprise Me */}
        <div className="flex items-center gap-2">
          {/* Language Selector Tabs */}
          <div className="flex items-center bg-[#FFFFFF] dark:bg-[#131722] p-1 rounded-md border border-[#E0E3EB] dark:border-[#2A2E39] text-xs shadow-sm">
            {[
              { code: 'en' as LanguageCode, label: 'English', flag: '🇬🇧', count: '208k' },
              { code: 'ja' as LanguageCode, label: '日本語', flag: '🇯🇵', count: '215k' },
              { code: 'zh' as LanguageCode, label: '中文', flag: '🇨🇳', count: '121k' },
              { code: 'ko' as LanguageCode, label: '한국어', flag: '🇰🇷', count: '106k' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  setCurrentPage(0);
                  setActiveEntry(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39]'
                }`}
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.label}</span>
                <span className={`text-[10px] font-mono opacity-80 ${selectedLanguage === lang.code ? 'text-white' : 'text-[#787B86]'}`}>
                  {lang.count}
                </span>
              </button>
            ))}
          </div>

          {/* Surprise Me / Random Word Button */}
          <button
            onClick={handleSurpriseMe}
            title="Pick a random word from current category"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#2962FF] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Surprise Me</span>
          </button>
        </div>
      </div>

      {/* Sub-Header: Linguistic Category Index Bar */}
      <div className="px-4 py-2.5 bg-[#F8F9FD] dark:bg-[#1E222D]/70 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex flex-col gap-2 shrink-0">
        {/* ENGLISH INDEX BAR */}
        {selectedLanguage === 'en' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] font-mono text-[#787B86] mr-1 shrink-0">Letter:</span>
              {ALPHABET.map(letter => {
                const l = letter.toLowerCase();
                const isActive = enLetter === l;
                return (
                  <button
                    key={letter}
                    onClick={() => {
                      setEnLetter(l);
                      setEnPrefix('all');
                      setCurrentPage(0);
                      setActiveEntry(null);
                    }}
                    className={`w-7 h-7 shrink-0 rounded flex items-center justify-center text-xs font-bold font-mono transition-all ${
                      isActive
                        ? 'bg-[#2962FF] text-white shadow-sm scale-105'
                        : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white hover:border-[#2962FF]'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* English Sub-Prefix Jump Bar */}
            {enSubPrefixes.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                <span className="text-[#787B86] shrink-0">Starts with:</span>
                <button
                  onClick={() => { setEnPrefix('all'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    enPrefix === 'all' 
                      ? 'bg-[#2962FF] text-white' 
                      : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86]'
                  }`}
                >
                  All ({enLetter.toUpperCase()}*)
                </button>
                {enSubPrefixes.map(sub => (
                  <button
                    key={sub}
                    onClick={() => { setEnPrefix(sub); setCurrentPage(0); }}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                      enPrefix === sub
                        ? 'bg-[#2962FF] text-white'
                        : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JAPANESE INDEX BAR (Kana Rows / Romaji) */}
        {selectedLanguage === 'ja' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-mono text-[#787B86] shrink-0">Kana Rows (五十音):</span>
                {jaMode === 'gojuon' && GOJUON_ROWS.map(row => {
                  const isActive = jaRow === row.id;
                  return (
                    <button
                      key={row.id}
                      onClick={() => {
                        setJaRow(row.id);
                        setJaSubKana('all');
                        setCurrentPage(0);
                        setActiveEntry(null);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold shrink-0 transition-all ${
                        isActive
                          ? 'bg-[#2962FF] text-white shadow-sm'
                          : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                      }`}
                    >
                      <span>{row.label}</span>
                      <span className="text-[10px] font-mono ml-1 opacity-75">({row.rom})</span>
                    </button>
                  );
                })}

                {jaMode === 'romaji' && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {ALPHABET.map(letter => {
                      const l = letter.toLowerCase();
                      const isActive = jaRomajiLetter === l;
                      return (
                        <button
                          key={letter}
                          onClick={() => {
                            setJaRomajiLetter(l);
                            setCurrentPage(0);
                            setActiveEntry(null);
                          }}
                          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold ${
                            isActive
                              ? 'bg-[#2962FF] text-white'
                              : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86]'
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-[#FFFFFF] dark:bg-[#131722] p-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39] text-[10px] font-mono shrink-0">
                <button
                  onClick={() => { setJaMode('gojuon'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded ${jaMode === 'gojuon' ? 'bg-[#2962FF] text-white' : 'text-[#787B86]'}`}
                >
                  五十音
                </button>
                <button
                  onClick={() => { setJaMode('romaji'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded ${jaMode === 'romaji' ? 'bg-[#2962FF] text-white' : 'text-[#787B86]'}`}
                >
                  Romaji
                </button>
              </div>
            </div>

            {/* Japanese Sub-Kana Drilldown */}
            {jaMode === 'gojuon' && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-[#787B86] font-mono shrink-0">Sub-Kana:</span>
                <button
                  onClick={() => { setJaSubKana('all'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    jaSubKana === 'all' 
                      ? 'bg-[#2962FF] text-white' 
                      : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86]'
                  }`}
                >
                  All {GOJUON_ROWS.find(r => r.id === jaRow)?.label}
                </button>
                {GOJUON_ROWS.find(r => r.id === jaRow)?.sub.map(kana => (
                  <button
                    key={kana}
                    onClick={() => { setJaSubKana(kana); setCurrentPage(0); }}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${
                      jaSubKana === kana
                        ? 'bg-[#2962FF] text-white'
                        : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                    }`}
                  >
                    {kana}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHINESE INDEX BAR (Pinyin Initial / Common Radicals) */}
        {selectedLanguage === 'zh' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-[11px] font-mono text-[#787B86] shrink-0">
                  {zhMode === 'pinyin' ? 'Pinyin (A–Z):' : 'Radicals (部首):'}
                </span>

                {zhMode === 'pinyin' && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {ALPHABET.filter(l => !['I', 'U', 'V'].includes(l)).map(letter => {
                      const l = letter.toLowerCase();
                      const isActive = zhPinyinLetter === l;
                      return (
                        <button
                          key={letter}
                          onClick={() => {
                            setZhPinyinLetter(l);
                            setCurrentPage(0);
                            setActiveEntry(null);
                          }}
                          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold ${
                            isActive
                              ? 'bg-[#2962FF] text-white shadow-sm'
                              : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}

                {zhMode === 'radical' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {CHINESE_RADICALS.map(rad => {
                      const isActive = zhRadical === rad.char;
                      return (
                        <button
                          key={rad.char}
                          onClick={() => {
                            setZhRadical(rad.char);
                            setCurrentPage(0);
                            setActiveEntry(null);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 shrink-0 ${
                            isActive
                              ? 'bg-[#2962FF] text-white shadow-sm'
                              : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                          }`}
                        >
                          <span className="text-sm font-bold text-blue-500 dark:text-blue-400">{rad.char}</span>
                          <span className="text-[10px] font-mono opacity-80">{rad.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-[#FFFFFF] dark:bg-[#131722] p-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39] text-[10px] font-mono shrink-0">
                <button
                  onClick={() => { setZhMode('pinyin'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded ${zhMode === 'pinyin' ? 'bg-[#2962FF] text-white' : 'text-[#787B86]'}`}
                >
                  拼音 Pinyin
                </button>
                <button
                  onClick={() => { setZhMode('radical'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded ${zhMode === 'radical' ? 'bg-[#2962FF] text-white' : 'text-[#787B86]'}`}
                >
                  部首 Radical
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KOREAN INDEX BAR (Hangul Consonants / Romanization) */}
        {selectedLanguage === 'ko' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-mono text-[#787B86] shrink-0">
                  {koMode === 'choseong' ? 'Hangul Consonants (초성):' : 'Romanization (A–Z):'}
                </span>

                {koMode === 'choseong' && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {KOREAN_CHOSEONG_TABS.map(tab => {
                      const isActive = koChoseong === tab.char;
                      return (
                        <button
                          key={tab.char}
                          onClick={() => {
                            setKoChoseong(tab.char);
                            setCurrentPage(0);
                            setActiveEntry(null);
                          }}
                          className={`px-2 py-1 rounded text-xs font-bold font-mono shrink-0 transition-all ${
                            isActive
                              ? 'bg-[#2962FF] text-white shadow-sm'
                              : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                          }`}
                        >
                          <span className="text-sm font-bold">{tab.char}</span>
                          <span className="text-[10px] opacity-75 ml-1 hidden sm:inline">{tab.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {koMode === 'romaji' && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {ALPHABET.map(letter => {
                      const l = letter.toLowerCase();
                      const isActive = koRomajiLetter === l;
                      return (
                        <button
                          key={letter}
                          onClick={() => {
                            setKoRomajiLetter(l);
                            setCurrentPage(0);
                            setActiveEntry(null);
                          }}
                          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold ${
                            isActive
                              ? 'bg-[#2962FF] text-white shadow-sm'
                              : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white'
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-[#FFFFFF] dark:bg-[#131722] p-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39] text-[10px] font-mono shrink-0">
                <button
                  onClick={() => { setKoMode('choseong'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded ${koMode === 'choseong' ? 'bg-[#2962FF] text-white' : 'text-[#787B86]'}`}
                >
                  Hangul (초성)
                </button>
                <button
                  onClick={() => { setKoMode('romaji'); setCurrentPage(0); }}
                  className={`px-2 py-0.5 rounded ${koMode === 'romaji' ? 'bg-[#2962FF] text-white' : 'text-[#787B86]'}`}
                >
                  Romanization
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Browse Stream vs Right Entry Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Word Stream List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#E0E3EB] dark:border-[#2A2E39] flex flex-col bg-[#FFFFFF] dark:bg-[#131722] shrink-0">
          {/* List Meta Header */}
          <div className="px-3.5 py-2 border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F0F3FA]/70 dark:bg-[#1E222D]/50 flex items-center justify-between text-xs font-mono text-[#787B86]">
            <span>
              {totalCount.toLocaleString()} words found
            </span>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>

          {/* Words Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E0E3EB]/70 dark:divide-[#2A2E39]/70">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#787B86] flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#2962FF] border-t-transparent rounded-full animate-spin" />
                <span>Loading words...</span>
              </div>
            ) : currentSlice.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#787B86]">
                No entries found in this category.
              </div>
            ) : (
              currentSlice.map((item, idx) => {
                const isString = typeof item === 'string';
                const word = isString ? item : item.w;
                const reading = !isString ? item.r : undefined;
                const rom = !isString ? item.m : undefined;
                const pos = !isString ? item.pos : undefined;
                const glossPreview = !isString 
                  ? (item.d && item.d[0] ? item.d[0] : '') 
                  : (enChunk[word] ? enChunk[word].slice(0, 70).replace(/\[.*?\]/g, '').trim() : '');

                const isSelected = activeEntry && activeEntry.word.toLowerCase() === word.toLowerCase();

                return (
                  <button
                    key={`${word}_${idx}`}
                    onClick={() => handleSelectEntryFromItem(item)}
                    className={`w-full px-3.5 py-2.5 text-left flex flex-col gap-0.5 transition-all group ${
                      isSelected
                        ? 'bg-[#2962FF]/10 border-l-4 border-[#2962FF]'
                        : 'hover:bg-[#F0F3FA] dark:hover:bg-[#1E222D]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold truncate ${
                        isSelected 
                          ? 'text-[#2962FF] dark:text-blue-400 font-bold' 
                          : 'text-[#131722] dark:text-[#D1D4DC] group-hover:text-[#2962FF]'
                      }`}>
                        {word}
                      </span>
                      {pos && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                          {pos}
                        </span>
                      )}
                    </div>

                    {(reading || rom) && (
                      <div className="text-[11px] font-mono text-[#787B86] flex items-center gap-1.5">
                        {reading && <span>{reading}</span>}
                        {reading && rom && <span>·</span>}
                        {rom && <span>{rom}</span>}
                      </div>
                    )}

                    {glossPreview && (
                      <p className="text-[11px] text-[#787B86] line-clamp-1 mt-0.5">
                        {glossPreview}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          <div className="p-2 border-t border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F0F3FA] dark:bg-[#1E222D] flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#131722] text-[#787B86] hover:text-[#131722] dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="text-[11px] font-mono text-[#787B86]">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#131722] text-[#787B86] hover:text-[#131722] dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Entry Inspector */}
        <div className="hidden md:flex flex-1 flex-col overflow-y-auto p-5 sm:p-7 bg-[#FFFFFF] dark:bg-[#131722]">
          {activeEntry ? (
            <div className="max-w-3xl flex flex-col gap-5">
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
                <div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-extrabold text-[#131722] dark:text-white tracking-tight">
                      {activeEntry.word}
                    </h2>
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {activeEntry.language.toUpperCase()}
                    </span>
                  </div>

                  {/* Reading / Phonetics */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-[#787B86]">
                    {activeEntry.reading && (
                      <span className="px-2 py-0.5 bg-[#F0F3FA] dark:bg-[#1E222D] rounded border border-[#E0E3EB] dark:border-[#2A2E39] text-[#2962FF] font-semibold">
                        Reading: {activeEntry.reading}
                      </span>
                    )}
                    {activeEntry.romanization && (
                      <span className="px-2 py-0.5 bg-[#F0F3FA] dark:bg-[#1E222D] rounded border border-[#E0E3EB] dark:border-[#2A2E39]">
                        Rom: {activeEntry.romanization}
                      </span>
                    )}
                    {activeEntry.phonetic && (
                      <span className="text-[#2962FF] font-sans text-sm">
                        /{activeEntry.phonetic.replace(/^\/|\/$/g, '')}/
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Pronounce, Bookmark, Copy, Open in Search */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#F0F3FA] dark:bg-[#1E222D] rounded-md border border-[#E0E3EB] dark:border-[#2A2E39] p-1">
                    <button
                      onClick={handlePronounce}
                      title={`Audio Pronunciation (${speechService.getEngine() === 'kokoro' ? 'Kokoro Neural' : 'Browser Speech'})`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        isSpeaking ? 'bg-[#2962FF] text-white animate-pulse' : 'text-[#131722] dark:text-[#D1D4DC] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39]'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#2962FF]" />
                      <span>Pronounce</span>
                      {speechService.getEngine() === 'kokoro' && (activeEntry.language === 'en' || activeEntry.language.startsWith('en')) && (
                        <span 
                          className="text-[9px] px-1 py-0.2 rounded font-mono font-medium bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 flex items-center gap-0.5"
                          title="Kokoro Neural"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI</span>
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(activeEntry)}
                    title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                    className={`p-2 rounded-md border transition-colors ${
                      isBookmarked
                        ? 'bg-[#2962FF]/10 border-[#2962FF] text-[#2962FF]'
                        : 'bg-[#F0F3FA] dark:bg-[#1E222D] border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                    }`}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-[#2962FF]" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    title="Copy Definition"
                    className="p-2 rounded-md bg-[#F0F3FA] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onSelectWord(activeEntry.word, activeEntry.language)}
                    title="Open in full Dictionary Search View"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-md shadow-sm transition-colors ml-1"
                  >
                    <span>Open in Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Meanings & Definitions */}
              <div className="flex flex-col gap-5">
                {activeEntry.meanings.map((meaning, mIdx) => (
                  <div key={mIdx} className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2962FF] bg-[#2962FF]/10 px-2 py-0.5 rounded">
                        {meaning.partOfSpeech}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 pl-1">
                      {meaning.definitions.map((def, dIdx) => (
                        <div key={dIdx} className="flex gap-2.5 text-sm">
                          <span className="font-mono text-xs text-[#787B86] pt-0.5 shrink-0">
                            {dIdx + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="text-[#131722] dark:text-[#D1D4DC] leading-relaxed">
                              {def}
                            </p>
                            {meaning.examples[dIdx] && (
                              <p className="mt-1.5 text-xs text-[#6A6D78] dark:text-[#787B86] italic pl-3 border-l-2 border-[#E0E3EB] dark:border-[#2A2E39]">
                                "{meaning.examples[dIdx]}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Synonyms & Antonyms */}
                    {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
                      <div className="mt-2 pt-2 border-t border-[#E0E3EB]/60 dark:border-[#2A2E39]/60 flex flex-wrap gap-2 text-xs">
                        {meaning.synonyms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[#787B86] font-mono mr-1">Synonyms:</span>
                            {meaning.synonyms.map((syn, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => onSelectWord(syn, activeEntry.language)}
                                className="px-2 py-0.5 bg-[#F0F3FA] dark:bg-[#1E222D] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#131722] dark:text-[#D1D4DC] hover:text-[#2962FF] border border-[#E0E3EB] dark:border-[#2A2E39] rounded text-[11px] transition-colors"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#787B86] gap-3">
              <BookOpen className="w-10 h-10 stroke-1 text-[#2962FF]/50" />
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-[#131722] dark:text-[#D1D4DC]">
                  Select a word from the list
                </p>
                <p className="text-xs text-[#787B86] mt-1">
                  Click any word on the left to read its definition, pronunciation, and examples.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
