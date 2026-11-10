/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  ChevronDown, 
  BookOpen, 
  ExternalLink, 
  Globe, 
  X,
  Sparkles
} from 'lucide-react';
import { DictionaryEntry, LanguageCode, BookmarkItem, SearchSuggestionItem } from '../types/dictionary';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { speechService } from '../services/speechService';
import { 
  lookupWordUnified,
  lookupComprehensiveWebsterWord, 
  getStructuredWordSuggestions,
  getOnlineDictionaryUrls,
  getCorpusPackages
} from '../services/corpusStorage';

interface DictionaryViewProps {
  entries: DictionaryEntry[];
  bookmarks: BookmarkItem[];
  onToggleBookmark: (entry: DictionaryEntry) => void;
  onRecordHistory: (query: string, language: LanguageCode) => void;
  initialQuery?: string;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  entries,
  bookmarks,
  onToggleBookmark,
  onRecordHistory,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || 'moon');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'all'>('en');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<DictionaryEntry | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speechStatus, setSpeechStatus] = useState(() => speechService.getKokoroStatus());

  useEffect(() => {
    return speechService.subscribeStatus(setSpeechStatus);
  }, []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute structured suggestions with exact match first and strict alphabetical order
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length >= 1) {
      let isMounted = true;
      getStructuredWordSuggestions(q, selectedLanguage, entries).then(results => {
        if (isMounted) {
          setSuggestions(results);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, selectedLanguage, entries]);


  // Lookup word with deterministic unified resolution
  const handleLookup = async (word: string, lang?: LanguageCode | 'all') => {
    const targetLang = lang !== undefined ? lang : selectedLanguage;
    const clean = word.trim().toLowerCase();
    if (!clean) return;

    setIsSearchingOnline(true);
    const match = await lookupWordUnified(clean, targetLang, entries);

    if (match) {
      setActiveEntry(match);
      setSearchQuery(match.word);
      onRecordHistory(match.word, match.language);
      if (selectedLanguage !== 'all' && selectedLanguage !== match.language) {
        setSelectedLanguage(match.language);
      }
    } else {
      setActiveEntry(null);
    }

    setIsSearchingOnline(false);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (initialQuery) {
      handleLookup(initialQuery);
    } else if (entries.length > 0 && !activeEntry) {
      handleLookup('moon', 'en');
    }
  }, [initialQuery, entries]);

  const handlePronounce = async (text: string, lang: LanguageCode) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    await speechService.speak(text, lang);
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

  const isBookmarked = activeEntry ? bookmarks.some(b => b.word.toLowerCase() === activeEntry.word.toLowerCase()) : false;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
  const currentEntryLang = activeEntry ? SUPPORTED_LANGUAGES.find(l => l.code === activeEntry.language) : null;

  const packages = getCorpusPackages();
  const totalOfflineWords = packages
    .filter(p => p.installed)
    .reduce((acc, p) => acc + p.entryCount, 0);

  const getLanguageBadge = (langCode: LanguageCode) => {
    const pkg = packages.find(p => p.language === langCode);
    if (!pkg) return 'Online';
    const countK = Math.floor(pkg.entryCount / 1000);
    if (pkg.installed) {
      return `${countK}k Offline`;
    }
    return `${countK}k Avail`;
  };

  const onlineUrls = getOnlineDictionaryUrls(searchQuery);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-hidden transition-colors duration-150">
      {/* Search Header Bar with Language Selector Toggle */}
      <div className="p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F0F3FA] dark:bg-[#1E222D] transition-colors duration-150">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Main Search Input with Inline Language Toggle */}
          <div className="relative flex items-center">
            {/* Inline Language Selector Toggle */}
            <div className="relative shrink-0" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="h-11 px-3 flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-l-md text-xs font-semibold text-[#131722] dark:text-[#D1D4DC] transition-colors border-r-0"
                title="Select dictionary language for lookup"
              >
                <span className="text-base">{selectedLanguage === 'all' ? '🌐' : currentLangObj?.flag || '📖'}</span>
                <span className="uppercase font-mono">{selectedLanguage === 'all' ? 'ALL' : selectedLanguage}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#787B86]" />
              </button>

              {/* Language Selector Dropdown */}
              {isLangDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-md shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#787B86] font-semibold border-b border-[#E0E3EB] dark:border-[#2A2E39] mb-1">
                    Select Input Language
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLanguage('all');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] transition-colors ${
                      selectedLanguage === 'all' ? 'text-[#2962FF] bg-[#2962FF]/10 font-medium' : 'text-[#131722] dark:text-[#D1D4DC]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>All Languages</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#787B86]">
                      {Math.floor(totalOfflineWords / 1000)}k+ Words
                    </span>
                  </button>

                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] transition-colors ${
                        selectedLanguage === lang.code ? 'text-[#2962FF] bg-[#2962FF]/10 font-medium' : 'text-[#131722] dark:text-[#D1D4DC]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#787B86]">
                        {getLanguageBadge(lang.code)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLookup(searchQuery);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={`Search ${selectedLanguage === 'all' ? `${Math.floor(totalOfflineWords / 1000)}k+ words` : `${currentLangObj?.name || 'English'}`} (e.g. moon, 日本, nihon, 中文, hangul)...`}
                className="w-full h-11 pl-4 pr-10 bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-r-md text-sm text-[#131722] dark:text-[#D1D4DC] placeholder-[#787B86] focus:outline-none focus:border-[#2962FF] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions Dropdown with Exact Match First & Strict Alphabetical Order */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-md shadow-2xl py-1 z-40 max-h-72 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.word}_${s.language}_${idx}`}
                    onClick={() => handleLookup(s.word, s.language)}
                    className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Search className="w-3.5 h-3.5 text-[#787B86] group-hover:text-[#2962FF] shrink-0" />
                      <div className="flex items-baseline gap-2 truncate">
                        <span className="text-sm font-semibold text-[#131722] dark:text-[#D1D4DC] group-hover:text-[#2962FF] dark:group-hover:text-white shrink-0">
                          {s.word}
                        </span>
                        {(s.reading || s.romanization) && (
                          <span className="text-xs text-[#787B86] font-mono shrink-0">
                            ({s.reading ? `${s.reading} · ` : ''}{s.romanization})
                          </span>
                        )}
                        {s.matchedGloss && (
                          <span className="text-xs text-[#787B86] truncate hidden sm:inline">
                            — {s.matchedGloss}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Distinct Dual Badges: Language badge & Source badge separated */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Language Badge */}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                        <span>{s.languageFlag}</span>
                        <span>{s.languageName}</span>
                      </span>

                      {/* Source Badge */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#6A6D78] dark:text-[#9EA2B0] bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
                        {s.sourceName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Ticker Chips */}
        </div>
      </div>

      {/* Main Stacked Workspace: 1. Dictionary Section, 2. Translation Section */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {activeEntry ? (
            <>
              {/* SECTION 1: DICTIONARY (Definitions & Details) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2962FF]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#131722] dark:text-white">
                      Dictionary (Definitions & Usage)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#131722] dark:text-[#D1D4DC]">
                      Language: <strong className="text-[#2962FF]">{currentEntryLang?.name || activeEntry.language.toUpperCase()}</strong>
                    </span>
                    <span className="text-[#787B86]">·</span>
                    <span className="text-[#787B86]">
                      Source: <strong className="text-[#131722] dark:text-[#D1D4DC]">{activeEntry.sourceName || activeEntry.corpusName || 'Webster Unabridged'}</strong>
                    </span>
                  </div>
                </div>

                {/* Word Header Card */}
                <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-6 shadow-sm transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#131722] dark:text-white tracking-tight">
                          {activeEntry.word}
                        </h1>
                        <span className="text-xl" title={currentEntryLang?.name}>
                          {currentEntryLang?.flag}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                        {activeEntry.reading && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-[#2962FF] border border-blue-500/20">
                            Reading: {activeEntry.reading}
                          </span>
                        )}
                        {activeEntry.romanization && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FFFFFF] dark:bg-[#131722] text-[#787B86] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">
                            Rom: {activeEntry.romanization}
                          </span>
                        )}
                        {activeEntry.syllables && (
                          <span className="text-[#787B86] font-medium tracking-wide">
                            {activeEntry.syllables}
                          </span>
                        )}
                        {(activeEntry.syllables || activeEntry.reading || activeEntry.romanization) && activeEntry.phonetic && <span className="text-[#787B86]">·</span>}
                        {activeEntry.phonetic && (
                          <span className="text-[#2962FF] font-mono font-medium">
                            {activeEntry.phonetic}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions & Audio Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#FFFFFF] dark:bg-[#131722] rounded-md border border-[#E0E3EB] dark:border-[#2A2E39] p-1">
                        <button
                          onClick={() => handlePronounce(activeEntry.word, activeEntry.language)}
                          title={`Listen to pronunciation (${speechService.getEngine() === 'kokoro' ? 'Kokoro Neural Voice' : 'Browser Speech'})`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
                            isSpeaking 
                              ? 'bg-[#2962FF] text-white animate-pulse' 
                              : 'hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#131722] dark:text-[#D1D4DC]'
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-[#2962FF]" />
                          <span className="text-xs font-semibold">
                            {speechStatus.state === 'generating' ? 'Synthesizing...' : isSpeaking ? 'Playing...' : 'Pronounce'}
                          </span>
                          {speechService.getEngine() === 'kokoro' && (activeEntry.language === 'en' || activeEntry.language.startsWith('en')) && (
                            <span 
                              className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 flex items-center gap-1"
                              title="Kokoro 82M Neural Speech Engine"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Neural</span>
                            </span>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => onToggleBookmark(activeEntry)}
                        title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                        className={`p-2 rounded-md border transition-colors ${
                          isBookmarked 
                            ? 'bg-[#2962FF]/10 border-[#2962FF] text-[#2962FF]' 
                            : 'bg-[#FFFFFF] dark:bg-[#131722] border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39]'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-[#2962FF]" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={handleCopy}
                        title="Copy word and definition"
                        className="p-2 rounded-md bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Meanings by Part of Speech */}
                  <div className="mt-4 flex flex-col gap-4">
                    {activeEntry.meanings.map((meaning, mIdx) => (
                      <div key={mIdx} className="pt-2">
                        <div className="flex items-center gap-2 mb-2">
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

                        {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
                          <div className="mt-3 pt-2.5 flex flex-wrap gap-2 text-xs">
                            {meaning.synonyms.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[#787B86] font-mono mr-1">Synonyms:</span>
                                {meaning.synonyms.map((syn, sIdx) => (
                                  <button
                                    key={sIdx}
                                    onClick={() => handleLookup(syn)}
                                    className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#131722] dark:text-[#D1D4DC] hover:text-[#2962FF] border border-[#E0E3EB] dark:border-[#2A2E39] rounded transition-colors text-[11px]"
                                  >
                                    {syn}
                                  </button>
                                ))}
                              </div>
                            )}

                            {meaning.antonyms.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[#787B86] font-mono mr-1">Antonyms:</span>
                                {meaning.antonyms.map((ant, aIdx) => (
                                  <button
                                    key={aIdx}
                                    onClick={() => handleLookup(ant)}
                                    className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#EF5350]/15 text-[#EF5350] border border-[#E0E3EB] dark:border-[#2A2E39] rounded transition-colors text-[11px]"
                                  >
                                    {ant}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {activeEntry.etymology && (
                    <div className="mt-4 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39] text-xs">
                      <span className="text-[#787B86] font-mono uppercase font-semibold mr-2">Origin:</span>
                      <span className="text-[#6A6D78] dark:text-[#787B86]">{activeEntry.etymology}</span>
                    </div>
                  )}

                  {/* Browser Search Quick Links */}
                  <div className="mt-4 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#787B86]">
                      Look up this word on external dictionaries:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={onlineUrls.merriamWebster}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2962FF] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Merriam-Webster</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-[#787B86]">·</span>
                      <a
                        href={onlineUrls.cambridge}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2962FF] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Cambridge</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-[#787B86]">·</span>
                      <a
                        href={onlineUrls.wiktionary}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2962FF] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Wiktionary</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Word Not Found in Local/Webster Corpus -> Default Browser Search Action Suite */
            <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-8 text-center flex flex-col items-center justify-center gap-4 transition-colors duration-150 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-center text-[#787B86]">
                <Globe className="w-6 h-6 text-[#2962FF]" />
              </div>

              <div className="max-w-md">
                <h2 className="text-xl font-bold text-[#131722] dark:text-white mb-1">
                  "{searchQuery}" not found in offline dictionary
                </h2>
                <p className="text-xs text-[#787B86] leading-relaxed">
                  Search for "{searchQuery}" online using these trusted dictionaries:
                </p>
              </div>

              {/* Dedicated Browser Search Launcher Buttons (User Commented Requirement) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-2 text-left">
                <a
                  href={onlineUrls.merriamWebster}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg flex items-center justify-between text-xs transition-colors group shadow-xs"
                >
                  <div>
                    <span className="font-bold text-[#131722] dark:text-white block">Merriam-Webster</span>
                    <span className="text-[11px] text-[#787B86]">Search Merriam-Webster online</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#787B86] group-hover:text-[#2962FF]" />
                </a>

                <a
                  href={onlineUrls.cambridge}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg flex items-center justify-between text-xs transition-colors group shadow-xs"
                >
                  <div>
                    <span className="font-bold text-[#131722] dark:text-white block">Cambridge Dictionary</span>
                    <span className="text-[11px] text-[#787B86]">British & American definitions</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#787B86] group-hover:text-[#2962FF]" />
                </a>

                <a
                  href={onlineUrls.googleDefine}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg flex items-center justify-between text-xs transition-colors group shadow-xs"
                >
                  <div>
                    <span className="font-bold text-[#131722] dark:text-white block">Google Definition Search</span>
                    <span className="text-[11px] text-[#787B86]">Search Google for definitions</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#787B86] group-hover:text-[#2962FF]" />
                </a>

                <a
                  href={onlineUrls.wiktionary}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg flex items-center justify-between text-xs transition-colors group shadow-xs"
                >
                  <div>
                    <span className="font-bold text-[#131722] dark:text-white block">Wiktionary</span>
                    <span className="text-[11px] text-[#787B86]">Multilingual open dictionary</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#787B86] group-hover:text-[#2962FF]" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
