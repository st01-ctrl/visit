import React, { useState } from 'react';
import { AICheerResponse, EmotionType } from '../types/diary';
import { EMOTIONS } from '../utils/constants';
import { 
  Heart, 
  Sparkles, 
  Coffee, 
  CheckCircle2, 
  Copy, 
  Check, 
  BookmarkCheck, 
  ArrowRight, 
  Lightbulb, 
  Tag
} from 'lucide-react';
import { playSoftClick } from '../utils/soundEffects';

interface AICheerModalProps {
  cheer: AICheerResponse;
  emotion: EmotionType;
  diaryTitle?: string;
  diaryContent: string;
  structured?: import('../types/diary').DiaryStructuredData;
  date: string;
  onSaveAndClose: (actionCompleted: boolean) => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const AICheerModal: React.FC<AICheerModalProps> = ({
  cheer,
  emotion,
  diaryTitle,
  diaryContent,
  structured,
  date,
  onSaveAndClose,
  onClose,
  soundEnabled,
}) => {
  const [copied, setCopied] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const emotionMeta = EMOTIONS[emotion];

  const handleCopy = () => {
    if (soundEnabled) playSoftClick();
    const textToCopy = `💌 [온기 비서의 답장]
${cheer.comfortingMessage}

💡 [내일을 위한 긍정 행동 1가지]
${cheer.tomorrowAction}

🌟 [마음의 비타민]
"${cheer.vitaminQuote}"

🍵 추천 차: ${cheer.recommendedTea}
🏷️ ${cheer.keywordTag}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (soundEnabled) playSoftClick();
    onSaveAndClose(actionDone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#faf7f2] rounded-3xl border border-amber-200 shadow-2xl overflow-hidden my-6 transition-all">
        
        {/* Letter Top Stamp Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/25 text-white">
                  온기 우체국 답장 도착
                </span>
                <span className="text-xs text-amber-100">{date}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-warm tracking-tight">
                AI 비서 '온기'가 보낸 위로의 편지
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl" title={emotionMeta.label}>
              {emotionMeta.icon}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Emotion Badge & User Diary Snippet summary */}
          <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${emotionMeta.badgeColor}`}>
                <span>{emotionMeta.icon}</span>
                <span>{emotionMeta.label}의 마음</span>
              </span>
              {diaryTitle && (
                <span className="text-xs font-medium text-stone-500 truncate max-w-[200px]">
                  "{diaryTitle}"
                </span>
              )}
            </div>
            {structured ? (
              <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                {structured.exerciseName && (
                  <p className="line-clamp-1 text-teal-800 font-medium">
                    <span>🏃 운동:</span> {structured.exerciseName} {structured.exerciseDuration && `(${structured.exerciseDuration})`}
                  </p>
                )}
                {(structured.moodTaste || structured.moodWeather) && (
                  <p className="line-clamp-1 text-amber-900 font-medium">
                    <span>🎨 기분의 빛깔:</span> {structured.moodTaste && `[${structured.moodTaste} 맛]`} {structured.moodWeather && `[${structured.moodWeather} 날씨]`}
                  </p>
                )}
                {structured.gratitude && (
                  <p className="line-clamp-1">
                    <span className="font-semibold text-amber-800">감사:</span> {structured.gratitude}
                  </p>
                )}
                {structured.silverLining && (
                  <p className="line-clamp-1">
                    <span className="font-semibold text-emerald-800">다행:</span> {structured.silverLining}
                  </p>
                )}
                {structured.episodeFutureAction && (
                  <p className="line-clamp-1">
                    <span className="font-semibold text-indigo-800">나의 다짐:</span> {structured.episodeFutureAction}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                "{diaryContent}"
              </p>
            )}
          </div>

          {/* 1. Warm Comforting Letter (핵심 기능: 감정을 다정하게 위로) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-amber-200/90 shadow-xs relative">
            {/* Stationery watermarked seal */}
            <div className="absolute top-4 right-4 text-amber-100 pointer-events-none select-none">
              <Sparkles className="w-12 h-12" />
            </div>

            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Heart className="w-4 h-4 fill-amber-600 text-amber-600" />
              <span>To. 오늘 하루를 견뎌낸 소중한 당신에게</span>
            </div>

            <div className="space-y-3.5 text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif-warm">
              {cheer.comfortingMessage}
            </div>

            {/* AI Assistant Sign-off */}
            <div className="mt-5 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-800/80">
              <span className="italic">{cheer.emotionAnalysis}</span>
              <span className="font-semibold">- 당신의 곁에서, 온기 드림 -</span>
            </div>
          </div>

          {/* 2. Positive Action for Tomorrow (핵심 기능: 내일을 위한 긍정 행동 1가지) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 rounded-2xl p-5 border-2 border-dashed border-amber-300 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                    내일을 위한 긍정 행동 1가지
                  </span>
                  <span className="text-[11px] text-stone-500">부담 없이 가볍게</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-stone-800 leading-snug mt-1">
                  {cheer.tomorrowAction}
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  작은 한 걸음이 내일의 기분을 따뜻하게 바꿔줍니다.
                </p>

                {/* Practical commitment button */}
                <button
                  type="button"
                  onClick={() => {
                    setActionDone(!actionDone);
                    if (soundEnabled) playSoftClick();
                  }}
                  className={`mt-3 px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    actionDone
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-stone-700 border-amber-300 hover:bg-amber-100/60'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${actionDone ? 'text-white' : 'text-stone-400'}`} />
                  <span>{actionDone ? '내일 꼭 실천할게요! (약속됨)' : '내일 실천해보기로 약속하기'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Vitamin Quote & Tea recommendation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Vitamin Quote */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80">
              <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                마음의 비타민
              </span>
              <p className="text-xs sm:text-sm font-medium text-stone-700 italic">
                "{cheer.vitaminQuote}"
              </p>
            </div>

            {/* Recommended Tea & Tag */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1 mb-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  오늘의 추천 온기
                </span>
                <p className="text-xs sm:text-sm font-medium text-stone-800">
                  {cheer.recommendedTea}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1 text-[11px] font-bold text-amber-800">
                <Tag className="w-3 h-3 text-amber-600" />
                <span>{cheer.keywordTag}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-100 transition-all shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">편지 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>답장 복사하기</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-all"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>일기장에 소중히 보관하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
