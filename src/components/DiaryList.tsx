import React, { useState } from 'react';
import { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTIONS } from '../utils/constants';
import { 
  Search, 
  Calendar, 
  Heart, 
  Lightbulb, 
  CheckCircle2, 
  PenTool, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { playSoftClick } from '../utils/soundEffects';

interface DiaryListProps {
  diaries: DiaryEntry[];
  onSelectEntry: (entry: DiaryEntry) => void;
  onNavigateToWrite: () => void;
  soundEnabled: boolean;
}

export const DiaryList: React.FC<DiaryListProps> = ({
  diaries,
  onSelectEntry,
  onNavigateToWrite,
  soundEnabled,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<EmotionType | '전체'>('전체');

  const filteredDiaries = diaries.filter((entry) => {
    const matchesEmotion = selectedFilter === '전체' || entry.emotion === selectedFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.cheer && entry.cheer.comfortingMessage.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.date.includes(searchTerm);

    return matchesEmotion && matchesSearch;
  });

  const filterTabs: ('전체' | EmotionType)[] = ['전체', '기쁨', '지침', '설렘', '불안'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Bar: Search and Emotion Filter Chips */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="일기 내용, 제목, 날짜(2026-10-01) 또는 위로 구절 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
            >
              지우기
            </button>
          )}
        </div>

        {/* Emotion Filter Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              감정:
            </span>
            {filterTabs.map((filter) => {
              const isSelected = selectedFilter === filter;
              const count = filter === '전체' 
                ? diaries.length 
                : diaries.filter(d => d.emotion === filter).length;

              return (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    if (soundEnabled) playSoftClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  {filter !== '전체' && <span>{EMOTIONS[filter].icon}</span>}
                  <span>{filter}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-700/60 text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-stone-500 shrink-0 hidden sm:inline">
            총 {filteredDiaries.length}편의 이야기
          </span>
        </div>

      </div>

      {/* Diary Card List */}
      {filteredDiaries.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-stone-200/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            💌
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800 font-serif-warm mb-1">
              {searchTerm || selectedFilter !== '전체'
                ? '조건에 맞는 일기가 없어요'
                : '아직 기록된 일기가 없어요'}
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              오늘 하루 있었던 일과 마음속 이야기를 적어보세요. 다정한 AI 비서가 당신만을 위한 응원을 준비하고 있어요.
            </p>
          </div>
          <button
            onClick={onNavigateToWrite}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            <PenTool className="w-4 h-4" />
            <span>오늘의 첫 일기 쓰기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDiaries.map((entry) => {
            const emotionMeta = EMOTIONS[entry.emotion];
            return (
              <div
                key={entry.id}
                onClick={() => {
                  if (soundEnabled) playSoftClick();
                  onSelectEntry(entry);
                }}
                className="group bg-white/90 hover:bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${emotionMeta.badgeColor}`}>
                      <span>{emotionMeta.icon}</span>
                      <span>{emotionMeta.label}</span>
                    </span>

                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {entry.date}
                    </span>
                  </div>

                  {/* Diary Title */}
                  <h4 className="text-base font-bold text-stone-800 font-serif-warm group-hover:text-amber-700 transition-colors mb-2 line-clamp-1">
                    {entry.title || `${entry.date}의 마음`}
                  </h4>

                  {/* Exercise & Mood tags if present */}
                  {entry.structured && (entry.structured.exerciseName || entry.structured.moodTaste || entry.structured.moodWeather) && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {entry.structured.exerciseName && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/70 truncate max-w-[180px]">
                          🏃 {entry.structured.exerciseName}
                        </span>
                      )}
                      {entry.structured.moodTaste && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70">
                          맛: {entry.structured.moodTaste}
                        </span>
                      )}
                      {entry.structured.moodWeather && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/70">
                          날씨: {entry.structured.moodWeather}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Diary Body Snippet */}
                  {entry.structured ? (
                    <div className="text-xs text-stone-600 space-y-1 mb-4 bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                      {entry.structured.gratitude && (
                        <p className="line-clamp-1">
                          <span className="font-semibold text-amber-800">감사:</span> {entry.structured.gratitude}
                        </p>
                      )}
                      {(entry.structured.silverLining || entry.structured.relief1) && (
                        <p className="line-clamp-1">
                          <span className="font-semibold text-emerald-800">다행:</span> {entry.structured.silverLining || entry.structured.relief1}
                        </p>
                      )}
                      {entry.structured.episodeFutureAction && (
                        <p className="line-clamp-1">
                          <span className="font-semibold text-indigo-800">다짐:</span> {entry.structured.episodeFutureAction}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-4">
                      {entry.content}
                    </p>
                  )}
                </div>

                {/* AI Cheer Preview & Tomorrow Action */}
                <div className="pt-3 border-t border-stone-100 space-y-2 mt-auto">
                  {entry.cheer ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs text-amber-800/90 font-medium">
                        <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        <span className="line-clamp-1 italic">
                          "{entry.cheer.vitaminQuote}"
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/60">
                        <span className="flex items-center gap-1 text-stone-700 font-medium truncate max-w-[220px]">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{entry.cheer.tomorrowAction}</span>
                        </span>
                        {entry.isActionCompleted && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            실천완료
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-stone-400 italic">기록된 메모</span>
                  )}

                  <div className="flex items-center justify-end text-xs font-semibold text-stone-400 group-hover:text-amber-600 pt-1">
                    <span>자세히 읽기</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
