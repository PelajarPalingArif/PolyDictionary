/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Minus, 
  Square, 
  Copy, 
  X
} from 'lucide-react';

interface WindowFrameProps {
  children: React.ReactNode;
  activeWordCount: number;
  installedCorporaCount: number;
  onQuickSearchClick?: () => void;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  children,
  activeWordCount,
  installedCorporaCount,
  onQuickSearchClick,
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMinimizedNotice, setIsMinimizedNotice] = useState(false);

  const handleMinimize = () => {
    setIsMinimizedNotice(true);
    setTimeout(() => setIsMinimizedNotice(false), 2200);
  };

  const handleMaximizeToggle = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-hidden select-none transition-colors duration-150 ${
      !isMaximized ? 'p-2 sm:p-4 bg-slate-200/80 dark:bg-slate-950/80 backdrop-blur-sm' : ''
    }`}>
      <div className={`flex-1 flex flex-col bg-[#FFFFFF] dark:bg-[#131722] overflow-hidden ${
        !isMaximized ? 'rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] shadow-2xl' : ''
      }`}>
        {/* Windows Title Bar */}
        <header className="h-9 min-h-[36px] bg-[#F0F3FA] dark:bg-[#1E222D] border-b border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between px-3 text-xs z-30 select-none transition-colors duration-150">
          {/* Left: App Brand & Window Title */}
          <div className="flex items-center gap-2.5">
            <img 
              src="/favicon.svg" 
              alt="PolyDictionary Icon" 
              className="w-5 h-5 rounded shadow-sm select-none object-contain" 
            />
            <span className="font-semibold text-[#131722] dark:text-[#D1D4DC] tracking-wide">
              PolyDictionary
            </span>
          </div>

          {/* Right: Windows Chrome Buttons */}
          <div className="flex items-center gap-2">
            {/* Window Action Buttons */}
            <div className="flex items-center -mr-2">
              <button 
                onClick={handleMinimize} 
                title="Minimize"
                className="w-9 h-9 flex items-center justify-center hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleMaximizeToggle} 
                title={isMaximized ? "Restore Down" : "Maximize"}
                className="w-9 h-9 flex items-center justify-center hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-white transition-colors"
              >
                {isMaximized ? (
                  <Copy className="w-3 h-3 rotate-180" />
                ) : (
                  <Square className="w-3 h-3" />
                )}
              </button>
              <button 
                onClick={() => {
                  window.location.reload();
                }} 
                title="Reset Window"
                className="w-9 h-9 flex items-center justify-center hover:bg-[#F23645] hover:text-white text-[#787B86] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Minimized notice banner */}
        {isMinimizedNotice && (
          <div className="bg-[#2962FF] text-white text-xs px-3 py-1 flex items-center justify-between transition-all">
            <span>Window minimized.</span>
            <button onClick={() => setIsMinimizedNotice(false)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Workstation Body */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
