import React, { useState } from 'react';
import { DiaryEntry } from '../types/diary';
import { EMOTIONS } from '../utils/constants';
import { 
  X, 
  Trash2, 
  Calendar, 
  Heart, 
  Lightbulb, 
  CheckCircle2, 
  Coffee, 
  Tag, 
  Sparkles,
  Copy,
  Check,
  Smile,
  Sun,
  Feather,
  Clock,
  MapPin,
  User,
  Compass,
  RotateCcw,
  Sparkle,
  Dumbbell,
  Timer,
  UtensilsCrossed,
  CloudSun
} from 'lucide-react';
import { playSoftClick } from '../utils/soundEffects';

interface DiaryDetailModalProps {
  entry: DiaryEntry;
  onClose: () => void;
  onToggleAction: (id: string) => void;
  onDelete: (id: string) => void;
  soundEnabled: boolean;
}

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({
  entry,
  onClose,
  onToggleAction,
  onDelete,
  soundEnabled,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const emotionMeta = EMOTIONS[entry.emotion];
  const structured = entry.structured;

  const handleCopy = () => {
    if (soundEnabled) playSoftClick();
    if (!entry.cheer) return;
    const text = `💌 [온기 비서의 위로 편지]
${entry.cheer.comfortingMessage}

💡 [내일을 위한 긍정 행동 1가지]
${entry.cheer.tomorrowAction}

🌟 [마음의 비타민]
"${entry.cheer.vitaminQuote}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#faf7f2] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emotionMeta.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${emotionMeta.badgeColor}`}>
                  {emotionMeta.label}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {entry.date}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-800 font-serif-warm mt-1">
                {entry.title || `${entry.date}의 마음 일기`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* User Diary Display */}
          {structured ? (
            <div className="space-y-4">
              
              {/* 0. 오늘 한 운동 (맨 위) */}
              {(structured.exerciseName || structured.exerciseFeeling) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 border border-teal-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-teal-600" />
                      <span>오늘 한 운동</span>
                    </span>
                    {structured.exerciseDuration && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 flex items-center gap-1">
                        <Timer className="w-3 h-3 text-teal-600" />
                        {structured.exerciseDuration}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-stone-700 space-y-1">
                    {structured.exerciseName && (
                      <p><strong className="text-teal-950 font-semibold">운동 종류:</strong> {structured.exerciseName}</p>
                    )}
                    {structured.exerciseFeeling && (
                      <p className="text-stone-600"><strong className="text-teal-950 font-semibold">운동 후 느낌:</strong> {structured.exerciseFeeling}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 0-2. 오늘의 기분을 맛과 날씨로 표현 */}
              {(structured.moodTaste || structured.moodWeather) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {structured.moodTaste && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-amber-800 block">맛으로 표현한 기분</span>
                        <span className="text-xs sm:text-sm font-semibold text-stone-800">"{structured.moodTaste}"</span>
                      </div>
                    </div>
                  )}

                  {structured.moodWeather && (
                    <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center shrink-0">
                        <CloudSun className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-sky-800 block">날씨로 표현한 기분</span>
                        <span className="text-xs sm:text-sm font-semibold text-stone-800">"{structured.moodWeather}"</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 1. 감사 & 다행 & 선행 카드 */}
              <div className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                  <Sparkle className="w-4 h-4 text-amber-600" />
                  <span>오늘의 감사와 긍정 발견</span>
                </h3>

                <div className="space-y-2 text-xs sm:text-sm text-stone-700">
                  {structured.gratitude && (
                    <div className="flex items-start gap-2">
                      <Smile className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-900 font-semibold">감사했던 일:</strong> {structured.gratitude}
                      </div>
                    </div>
                  )}

                  {(structured.relief1 || structured.relief2) && (
                    <div className="flex items-start gap-2">
                      <Sun className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-900 font-semibold">다행이었던 일:</strong>
                        <ul className="list-disc list-inside mt-0.5 text-stone-600 pl-1 space-y-0.5">
                          {structured.relief1 && <li>{structured.relief1}</li>}
                          {structured.relief2 && <li>{structured.relief2}</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {structured.kindness && (
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-900 font-semibold">선행을 베풀었던 일:</strong> {structured.kindness}
                      </div>
                    </div>
                  )}

                  {structured.silverLining && (
                    <div className="flex items-start gap-2">
                      <Feather className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-900 font-semibold">그럼에도 불구하고 다행이었던 점:</strong> {structured.silverLining}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 강한 감정을 불러일으킨 사건 성찰 카드 */}
              {(structured.episodeInnerFeeling || structured.episodeActionTaken || structured.episodeFutureAction) && (
                <div className="p-5 rounded-2xl bg-white border border-indigo-200/90 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>강한 감정을 불러일으켰던 사건 성찰</span>
                  </h3>

                  {/* Context pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 bg-stone-50 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {structured.episodeTime || '시간 미기재'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {structured.episodePlace || '장소 미기재'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {structured.episodePeople || '인물 미기재'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-stone-700">
                    {structured.episodeInnerFeeling && (
                      <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
                        <strong className="text-indigo-900 block font-semibold mb-0.5">그때 내 마음:</strong>
                        <p className="text-stone-700 leading-relaxed font-serif-warm">{structured.episodeInnerFeeling}</p>
                      </div>
                    )}

                    {structured.episodeActionTaken && (
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                        <strong className="text-stone-800 block font-semibold mb-0.5 flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                          그때 내가 한 행동:
                        </strong>
                        <p className="text-stone-600">{structured.episodeActionTaken}</p>
                      </div>
                    )}

                    {structured.episodeFutureAction && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                        <strong className="text-emerald-900 block font-semibold mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          앞으로 똑같은 일이 생겼을 때 나의 지혜:
                        </strong>
                        <p className="text-emerald-900 font-medium">{structured.episodeFutureAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Legacy single-text display */
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                내가 쓴 일기 이야기
              </h3>
              <div className="p-5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif-warm shadow-2xs">
                {entry.content}
              </div>
            </div>
          )}

          {/* AI Cheer Response Section */}
          {entry.cheer ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                  AI 비서 '온기'의 답장
                </h3>
                <button
                  onClick={handleCopy}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사됨' : '편지 복사'}</span>
                </button>
              </div>

              {/* Comfort Letter */}
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200 text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif-warm shadow-2xs">
                {entry.cheer.comfortingMessage}
              </div>

              {/* Tomorrow's Positive Action */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-300 shadow-2xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      내일을 위한 긍정 행동 1가지
                    </span>
                    <p className="text-sm font-semibold text-stone-800 mt-1">
                      {entry.cheer.tomorrowAction}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onToggleAction(entry.id);
                    if (soundEnabled) playSoftClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 flex items-center gap-1.5 transition-all ${
                    entry.isActionCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${entry.isActionCompleted ? 'text-white' : 'text-stone-400'}`} />
                  <span>{entry.isActionCompleted ? '실천 완료!' : '실천하기'}</span>
                </button>
              </div>

              {/* Quotes & Extra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    마음의 비타민
                  </span>
                  <p className="text-stone-700 italic">"{entry.cheer.vitaminQuote}"</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Coffee className="w-3.5 h-3.5 text-amber-700" />
                    <span>추천 온기: <strong>{entry.cheer.recommendedTea}</strong></span>
                  </div>
                  <div className="mt-2 text-amber-800 font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>{entry.cheer.keywordTag}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-semibold">정말 삭제할까요?</span>
                <button
                  onClick={() => {
                    onDelete(entry.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                >
                  네, 삭제
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-stone-600 hover:bg-stone-200"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>일기 삭제</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
