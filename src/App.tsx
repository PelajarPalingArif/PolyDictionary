/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WindowFrame } from './components/WindowFrame';
import { ToolRail } from './components/ToolRail';
import { DictionaryView } from './components/DictionaryView';
import { BrowseView } from './components/BrowseView';
import { CorpusManagerView } from './components/CorpusManagerView';
import { WordOfTheDayView } from './components/WordOfTheDayView';
import { BookmarksView } from './components/BookmarksView';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { 
  ActiveView, 
  BookmarkItem, 
  DictionaryEntry, 
  HistoryItem, 
  LanguageCode 
} from './types/dictionary';
import { getAllActiveEntries, getCorpusPackages } from './services/corpusStorage';

const STORAGE_KEY_BOOKMARKS = 'polydict_bookmarks_v1';
const STORAGE_KEY_HISTORY = 'polydict_history_v1';
const STORAGE_KEY_SETTINGS = 'polydict_settings_v1';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dictionary');
  const [entries, setEntries] = useState<DictionaryEntry[]>(() => getAllActiveEntries());
  const [installedCorporaCount, setInstalledCorporaCount] = useState<number>(() => {
    try {
      return getCorpusPackages().filter(p => p.installed).length;
    } catch {
      return 1;
    }
  });
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Settings
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [accent, setAccent] = useState<'US' | 'UK'>('US');
  const [defaultLanguage, setDefaultLanguage] = useState<LanguageCode>('en');

  // Search state
  const [dictionaryQuery, setDictionaryQuery] = useState<string>('moon');

  // Load entries and corpora stats
  const refreshCorpora = useCallback(() => {
    const all = getAllActiveEntries();
    setEntries(all);
    const pkgs = getCorpusPackages();
    setInstalledCorporaCount(pkgs.filter(p => p.installed).length);
  }, []);

  // Initial load from localStorage
  useEffect(() => {
    refreshCorpora();

    try {
      const storedBookmarks = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));

      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.speechRate) setSpeechRate(parsed.speechRate);
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.defaultLanguage) setDefaultLanguage(parsed.defaultLanguage);
        if (parsed.isDark !== undefined) {
          setIsDark(parsed.isDark);
          if (parsed.isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    } catch (e) {
      console.error('Error loading stored applet state', e);
    }
  }, [refreshCorpora]);

  // Save bookmarks
  const handleToggleBookmark = (entry: DictionaryEntry) => {
    const existingIdx = bookmarks.findIndex(b => b.word.toLowerCase() === entry.word.toLowerCase());
    let updated: BookmarkItem[];
    if (existingIdx >= 0) {
      updated = bookmarks.filter((_, idx) => idx !== existingIdx);
    } else {
      const newBookmark: BookmarkItem = {
        id: `bm-${Date.now()}`,
        word: entry.word,
        language: entry.language,
        phonetic: entry.phonetic,
        primaryPartOfSpeech: entry.meanings[0]?.partOfSpeech || 'word',
        shortDefinition: entry.meanings[0]?.definitions[0] || 'Saved vocabulary item',
        savedAt: Date.now(),
        tags: [entry.language, entry.meanings[0]?.partOfSpeech || 'general']
      };
      updated = [newBookmark, ...bookmarks];
    }
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
  };

  // Record history
  const handleRecordHistory = (query: string, languageOrDetails?: string) => {
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      query,
      language: (languageOrDetails && languageOrDetails.length === 2 ? languageOrDetails : defaultLanguage) as LanguageCode,
      timestamp: Date.now(),
      type: query.startsWith('[Trans]') ? 'translator' : 'dictionary',
      details: languageOrDetails
    };
    const updated = [newHistoryItem, ...history.slice(0, 49)];
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const currentSettings = { speechRate, accent, defaultLanguage, isDark: nextTheme };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(currentSettings));
  };

  // Settings updates
  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ speechRate: rate, accent, defaultLanguage, isDark }));
  };

  const handleAccentChange = (acc: 'US' | 'UK') => {
    setAccent(acc);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ speechRate, accent: acc, defaultLanguage, isDark }));
  };

  const handleDefaultLanguageChange = (lang: LanguageCode) => {
    setDefaultLanguage(lang);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ speechRate, accent, defaultLanguage: lang, isDark }));
  };

  const handleResetAllData = () => {
    if (confirm("Reset all PolyDictionary bookmarks, search history, and settings?")) {
      localStorage.clear();
      setBookmarks([]);
      setHistory([]);
      refreshCorpora();
      window.location.reload();
    }
  };

  const handleLookupWord = (word: string) => {
    setDictionaryQuery(word);
    setActiveView('dictionary');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    handleLookupWord(item.query.replace('[Trans] ', ''));
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveView('dictionary');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        setActiveView('dictionary');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        setActiveView('browse');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        setActiveView('corpora');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '4') {
        e.preventDefault();
        setActiveView('word-of-day');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '5') {
        e.preventDefault();
        setActiveView('bookmarks');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '6') {
        e.preventDefault();
        setActiveView('history');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <WindowFrame
      activeWordCount={entries.length}
      installedCorporaCount={installedCorporaCount}
      onQuickSearchClick={() => setActiveView('dictionary')}
    >
      {/* Left Tool Rail */}
      <ToolRail
        activeView={activeView}
        onViewChange={setActiveView}
        bookmarkCount={bookmarks.length}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        installedCorporaCount={installedCorporaCount}
      />

      {/* Main View Port */}
      <main className="flex-1 flex overflow-hidden">
        {activeView === 'dictionary' && (
          <DictionaryView
            entries={entries}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onRecordHistory={(query, lang) => handleRecordHistory(query, lang)}
            initialQuery={dictionaryQuery}
          />
        )}

        {activeView === 'browse' && (
          <BrowseView
            onSelectWord={(word, lang) => {
              setDictionaryQuery(word);
              setActiveView('dictionary');
            }}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeView === 'corpora' && (
          <CorpusManagerView
            onCorpusUpdated={refreshCorpora}
          />
        )}

        {activeView === 'word-of-day' && (
          <WordOfTheDayView
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onLookupWord={handleLookupWord}
          />
        )}

        {activeView === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onLookupWord={handleLookupWord}
          />
        )}

        {activeView === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
        )}

        {activeView === 'settings' && (
          <SettingsModal
            speechRate={speechRate}
            onSpeechRateChange={handleSpeechRateChange}
            accent={accent}
            onAccentChange={handleAccentChange}
            defaultLanguage={defaultLanguage}
            onDefaultLanguageChange={handleDefaultLanguageChange}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>
    </WindowFrame>
  );
}
