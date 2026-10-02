import React from 'react';
import { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTIONS } from '../utils/constants';
import { Heart, Sparkles, CheckCircle2, TrendingUp, Sun, Moon, Compass } from 'lucide-react';

interface EmotionStatsProps {
  diaries: DiaryEntry[];
}

export const EmotionStats: React.FC<EmotionStatsProps> = ({ diaries }) => {
  const total = diaries.length;

  const emotionCounts: Record<EmotionType, number> = {
    기쁨: diaries.filter((d) => d.emotion === '기쁨').length,
    지침: diaries.filter((d) => d.emotion === '지침').length,
    설렘: diaries.filter((d) => d.emotion === '설렘').length,
    불안: diaries.filter((d) => d.emotion === '불안').length,
  };

  const actionCompletedCount = diaries.filter((d) => d.isActionCompleted).length;
  const actionRate = total > 0 ? Math.round((actionCompletedCount / total) * 100) : 0;

  // Find dominant emotion
  let dominantEmotion: EmotionType = '기쁨';
  let maxCount = -1;
  (Object.keys(emotionCounts) as EmotionType[]).forEach((emo) => {
    if (emotionCounts[emo] > maxCount) {
      maxCount = emotionCounts[emo];
      dominantEmotion = emo;
    }
  });

  const getDominantFeedback = () => {
    if (total === 0) return '아직 작성된 일기가 없어요. 오늘의 첫 마음을 남겨보세요!';
    switch (dominantEmotion) {
      case '기쁨':
        return '최근 당신의 일상에는 찬란한 햇살 같은 기쁨이 가득 머물고 있네요! 이 따뜻한 온기가 오래도록 지속되길 응원합니다.';
      case '지침':
        return '최근 몸도 마음도 벅차게 달리며 쉼이 필요한 나날이었군요. 스스로를 채찍질하기보다 충분한 수면과 다정한 위로를 선물해주세요.';
      case '설렘':
        return '두근거리는 기대와 호기심이 당신의 하루를 아름답게 채우고 있어요. 새로운 한 걸음을 내딛는 당신을 열렬히 지지해요!';
      case '불안':
        return '마음 한켠에 걱정과 불안이 자주 찾아왔었군요. 불안은 당신이 삶을 그만큼 소중히 여기고 있다는 증거예요. 당신은 이미 충분히 잘해내고 있어요.';
      default:
        return '다양한 감정들이 조화롭게 당신의 삶을 채워나가고 있습니다.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-400 to-amber-600 text-white shadow-lg shadow-amber-500/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-semibold mb-1">
              <Compass className="w-4 h-4" />
              <span>나의 마음 날씨 리포트</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-warm">
              지금까지 {total}번의 마음을 보듬어주었어요
            </h2>
            <p className="text-sm text-amber-50/90 mt-1 max-w-lg leading-relaxed">
              {getDominantFeedback()}
            </p>
          </div>

          <div className="shrink-0 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/25 text-center min-w-[130px]">
            <span className="text-xs text-amber-100 font-medium block">내일 긍정행동 실천율</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 block">
              {actionRate}%
            </span>
            <span className="text-[11px] text-amber-100">
              {actionCompletedCount}/{total}회 달성
            </span>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Emotion Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['기쁨', '지침', '설렘', '불안'] as EmotionType[]).map((emo) => {
          const meta = EMOTIONS[emo];
          const count = emotionCounts[emo];
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={emo}
              className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl">{meta.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                  {meta.label}
                </span>
              </div>

              <div className="my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-800">{count}</span>
                  <span className="text-xs text-stone-400">편 ({percent}%)</span>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-stone-400 line-clamp-1 mt-1">
                {meta.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gentle Insight & Affirmation Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-800 font-bold text-base sm:text-lg font-serif-warm">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>온기 비서가 전하는 마음 돌봄 팁</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
            <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              모든 감정은 지나가는 날씨예요
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">
              비가 오는 날이 있으면 맑게 개는 날이 있듯이, 지침이나 불안도 잘못된 것이 아닙니다. 
              그저 내 마음에 잠시 구름이 끼었음을 알아차리고 있는 그대로 인정해주는 것만으로도 회복이 시작됩니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/60">
            <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              작은 1가지 행동이 만드는 큰 기적
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">
              AI 비서가 제안하는 내일의 긍정 행동은 결코 거창하지 않습니다. 
              창문 열고 심호흡하기, 따뜻한 차 한 모금 마시기처럼 아주 작은 1가지 행동이 내일의 나를 웃음 짓게 합니다.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
