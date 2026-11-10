/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Compass,
  HardDriveDownload, 
  CalendarDays, 
  Bookmark, 
  History, 
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { ActiveView } from '../types/dictionary';

interface ToolRailProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  bookmarkCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  installedCorporaCount: number;
}

export const ToolRail: React.FC<ToolRailProps> = ({
  activeView,
  onViewChange,
  bookmarkCount,
  isDark,
  onToggleTheme,
  installedCorporaCount,
}) => {
  const navItems = [
    { id: 'dictionary' as ActiveView, label: 'Dictionary', icon: BookOpen, shortcut: 'Ctrl+1' },
    { id: 'browse' as ActiveView, label: 'Browse', icon: Compass, shortcut: 'Ctrl+2' },
    { 
      id: 'corpora' as ActiveView, 
      label: 'Dictionaries', 
      icon: HardDriveDownload, 
      shortcut: 'Ctrl+3',
      badge: `${installedCorporaCount}`
    },
    { id: 'word-of-day' as ActiveView, label: 'Word of the Day', icon: CalendarDays, shortcut: 'Ctrl+4' },
    { 
      id: 'bookmarks' as ActiveView, 
      label: 'Bookmarks', 
      icon: Bookmark, 
      shortcut: 'Ctrl+5',
      badge: bookmarkCount > 0 ? `${bookmarkCount}` : undefined
    },
    { id: 'history' as ActiveView, label: 'History', icon: History, shortcut: 'Ctrl+6' },
  ];

  return (
    <aside className="w-14 sm:w-16 flex flex-col items-center justify-between py-3 border-r border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F0F3FA] dark:bg-[#1E222D] text-[#787B86] shrink-0 select-none z-20 transition-colors duration-150">
      {/* Top Primary Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={`${item.label} (${item.shortcut})`}
              className={`relative group w-11 h-11 flex flex-col items-center justify-center rounded-md transition-all duration-150 ${
                isActive 
                  ? 'bg-[#2962FF] text-white shadow-sm' 
                  : 'hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] hover:text-[#131722] dark:hover:text-[#D1D4DC] text-[#787B86]'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />
              {item.badge && (
                <span className={`absolute -top-1 -right-1 text-[10px] font-mono px-1 rounded-full ${
                  isActive ? 'bg-[#FFFFFF] dark:bg-[#131722] text-[#2962FF]' : 'bg-[#2962FF] text-white'
                }`}>
                  {item.badge}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute left-14 ml-2 px-2.5 py-1 bg-[#FFFFFF] dark:bg-[#131722] text-xs font-medium text-[#131722] dark:text-[#D1D4DC] rounded border border-[#E0E3EB] dark:border-[#2A2E39] shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
                <span className="ml-1.5 text-[10px] text-[#787B86] font-mono">{item.shortcut}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Utility Tools */}
      <div className="flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-[#E0E3EB] dark:border-[#2A2E39]">
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={() => onViewChange('settings')}
          title="Settings & Shortcuts"
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
            activeView === 'settings' 
              ? 'bg-[#E0E3EB] dark:bg-[#2A2E39] text-[#2962FF]' 
              : 'text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
