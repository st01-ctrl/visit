import React from 'react';
import { BookOpen, PenTool, BarChart3, Settings, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  activeTab: 'write' | 'list' | 'stats';
  setActiveTab: (tab: 'write' | 'list' | 'stats') => void;
  diaryCount: number;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  diaryCount,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/70 shadow-xs transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('write')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight font-serif-warm">
                따뜻한 하루 일기
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300/60">
                AI 감정 비서
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              오늘의 감정을 털어놓으면, 내일을 위한 온기를 선물합니다
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'write'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>일기 쓰기</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === 'list'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>일기장</span>
            {diaryCount > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'list' ? 'bg-amber-700/60 text-white' : 'bg-amber-200 text-amber-800'
              }`}>
                {diaryCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">감정 날씨</span>
          </button>
        </nav>

        {/* Utility buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-amber-100/80 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>
          <button
            onClick={onOpenSettings}
            title="설정 및 데이터 관리"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-amber-100/80 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
