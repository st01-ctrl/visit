import React, { useState } from 'react';
import { EmotionType, DiaryStructuredData } from '../types/diary';
import { EMOTIONS } from '../utils/constants';
import { 
  Sparkles, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  Loader2, 
  Smile, 
  Sun, 
  Feather, 
  MapPin, 
  Clock, 
  User, 
  Compass, 
  RotateCcw,
  Sparkle,
  Dumbbell,
  Timer,
  UtensilsCrossed,
  CloudSun,
  Flame
} from 'lucide-react';
import { playSoftClick } from '../utils/soundEffects';
import { formatFriendlyErrorMessage } from '../services/geminiService';

interface DiaryFormProps {
  onSubmit: (data: {
    emotion: EmotionType;
    content: string;
    title: string;
    date: string;
    emotionIntensity: number;
    structured: DiaryStructuredData;
  }) => Promise<void>;
  isLoading: boolean;
  soundEnabled: boolean;
}

export const DiaryForm: React.FC<DiaryFormProps> = ({ onSubmit, isLoading, soundEnabled }) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(todayStr);
  const [title, setTitle] = useState<string>('');

  // 1. 오늘 한 운동 (맨 위)
  const [exerciseName, setExerciseName] = useState<string>('');
  const [exerciseDuration, setExerciseDuration] = useState<string>('');
  const [exerciseFeeling, setExerciseFeeling] = useState<string>('');

  // 2. 오늘의 기분을 맛과 날씨로 표현
  const [moodTaste, setMoodTaste] = useState<string>('');
  const [moodWeather, setMoodWeather] = useState<string>('');

  // 3. 긍정과 감사 회고 상태
  const [gratitude, setGratitude] = useState<string>('');
  const [relief1, setRelief1] = useState<string>('');
  const [relief2, setRelief2] = useState<string>('');
  const [kindness, setKindness] = useState<string>('');
  const [silverLining, setSilverLining] = useState<string>('');

  // 4. 강한 감정을 불러일으킨 사건 상태
  const [episodeTime, setEpisodeTime] = useState<string>('');
  const [episodePlace, setEpisodePlace] = useState<string>('');
  const [episodePeople, setEpisodePeople] = useState<string>('');
  const [episodeInnerFeeling, setEpisodeInnerFeeling] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('지침');
  const [emotionIntensity, setEmotionIntensity] = useState<number>(3);
  const [episodeActionTaken, setEpisodeActionTaken] = useState<string>('');
  const [episodeFutureAction, setEpisodeFutureAction] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emotionList: EmotionType[] = ['기쁨', '지침', '설렘', '불안'];

  // 운동 추천 칩
  const exercisePresets = ['산책 🚶', '달리기/조깅 🏃', '헬스/웨이트 🏋️', '요가/필라테스 🧘', '스트레칭 🤸', '자전거 🚴', '수영 🏊'];
  const durationPresets = ['15분', '30분', '45분', '1시간', '1시간 30분+'];
  const feelingPresets = ['땀 흘려 개운함 💦', '다리가 뻐근하지만 뿌듯함 🌿', '몸이 한결 가벼워짐 ✨', '잡생각이 비워짐 🍃'];

  // 기분의 맛 추천 칩 (사용자 요청: 구수한, 달콤한, 신...)
  const tastePresets = [
    { label: '구수한', icon: '🍵' },
    { label: '달콤한', icon: '🍯' },
    { label: '신', icon: '🍋' },
    { label: '씁쓸한', icon: '☕' },
    { label: '매콤한', icon: '🌶️' },
    { label: '담백한', icon: '🍚' },
  ];

  // 기분의 날씨 추천 칩 (사용자 요청: 먹구름 낀, 화창한, 추운...)
  const weatherPresets = [
    { label: '먹구름 낀', icon: '☁️' },
    { label: '화창한', icon: '☀️' },
    { label: '추운', icon: '❄️' },
    { label: '포근한', icon: '🌤️' },
    { label: '비 내리는', icon: '🌧️' },
    { label: '안개 낀', icon: '🌫️' },
  ];

  const handleEmotionSelect = (emo: EmotionType) => {
    setSelectedEmotion(emo);
    if (soundEnabled) playSoftClick();
  };

  // 예시 채워보기
  const handleFillExample = () => {
    if (soundEnabled) playSoftClick();
    setTitle('몸을 움직이고 마음을 정돈한 하루');

    // 운동
    setExerciseName('저녁 가벼운 동네 산책 및 조깅');
    setExerciseDuration('35분');
    setExerciseFeeling('시원한 바람을 맞으며 땀을 흘리니 머릿속 잡생각이 비워지고 몸이 개운해짐');

    // 맛과 날씨
    setMoodTaste('구수한');
    setMoodWeather('화창한');

    // 감사와 긍정
    setGratitude('점심 시간에 동료가 건네준 따뜻한 커피 한 잔과 다정한 말 한마디');
    setRelief1('비가 쏟아지기 직전에 지하철역 안으로 들어갈 수 있었던 것');
    setRelief2('퇴근 후 집에 돌아오니 포근한 침대와 따뜻한 물이 나온 것');
    setKindness('엘리베이터를 타려는 뒷사람을 위해 열림 버튼을 3초간 기다려 눌러준 일');
    setSilverLining('회의가 조금 길어져 피곤했지만, 덕분에 서로의 오해를 명확히 풀 수 있었던 점');

    // 사건 성찰
    setEpisodeTime('오후 3시 회의실에서');
    setEpisodePlace('회사 4층 회의실');
    setEpisodePeople('직장 동료와 팀장님');
    setEpisodeInnerFeeling('예상치 못한 질문을 받고 순간 당황스럽고, 실수하면 어쩌나 하는 마음에 심장이 쿵쾅거렸음');
    setSelectedEmotion('불안');
    setEmotionIntensity(4);
    setEpisodeActionTaken('말문이 막혀 얼버무리다가, 심호흡을 한 번 하고 아는 부분만 솔직하게 말씀드림');
    setEpisodeFutureAction('앞으로 비슷한 상황이 오면 "잠시 확인 후 10분 내로 정확히 답변드리겠습니다"라고 여유 있게 대답하기');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 최소 필요 항목 검증
    if (!gratitude.trim() && !relief1.trim() && !episodeInnerFeeling.trim() && !exerciseName.trim()) {
      setErrorMessage('오늘 한 운동, 감사했던 일 또는 강한 감정이 들었던 사건 중 최소 한 가지를 적어주세요.');
      return;
    }

    if (soundEnabled) playSoftClick();

    const structuredData: DiaryStructuredData = {
      exerciseName: exerciseName.trim(),
      exerciseDuration: exerciseDuration.trim(),
      exerciseFeeling: exerciseFeeling.trim(),
      moodTaste: moodTaste.trim(),
      moodWeather: moodWeather.trim(),
      gratitude: gratitude.trim(),
      relief1: relief1.trim(),
      relief2: relief2.trim(),
      kindness: kindness.trim(),
      silverLining: silverLining.trim(),
      episodeTime: episodeTime.trim(),
      episodePlace: episodePlace.trim(),
      episodePeople: episodePeople.trim(),
      episodeInnerFeeling: episodeInnerFeeling.trim(),
      episodeEmotion: selectedEmotion,
      episodeActionTaken: episodeActionTaken.trim(),
      episodeFutureAction: episodeFutureAction.trim(),
    };

    // 종합 텍스트 생성
    const combinedContent = `
[오늘 한 운동 및 느낌]
• 운동: ${structuredData.exerciseName || '(없음)'} (${structuredData.exerciseDuration || '시간 미기재'})
• 운동 후 느낌: ${structuredData.exerciseFeeling || '(없음)'}

[오늘 내 기분의 비유]
• 맛으로 표현한 기분: ${structuredData.moodTaste || '(없음)'}
• 날씨로 표현한 기분: ${structuredData.moodWeather || '(없음)'}

[오늘의 감사, 다행, 선행]
• 감사했던 일: ${structuredData.gratitude || '(없음)'}
• 다행이었던 일 1: ${structuredData.relief1 || '(없음)'}
• 다행이었던 일 2: ${structuredData.relief2 || '(없음)'}
• 선행을 베풀었던 일: ${structuredData.kindness || '(없음)'}
• 그럼에도 불구하고 다행이었던 점: ${structuredData.silverLining || '(없음)'}

[강한 감정을 불러일으켰던 사건 성찰]
• 사건 때/장소/인물: ${structuredData.episodeTime || '오늘'} | ${structuredData.episodePlace || '일상 속'} | ${structuredData.episodePeople || '주변 사람들'}
• 그때 내 마음: ${structuredData.episodeInnerFeeling || '(작성 없음)'}
• 대표 감정: ${selectedEmotion} (강도: ${emotionIntensity}단계)
• 그때 내가 한 행동: ${structuredData.episodeActionTaken || '(작성 없음)'}
• 앞으로 똑같은 일이 생겼을 때: ${structuredData.episodeFutureAction || '(작성 없음)'}
`.trim();

    try {
      await onSubmit({
        emotion: selectedEmotion,
        content: combinedContent,
        title: title.trim() || `${date}의 마음 일기`,
        date,
        emotionIntensity,
        structured: structuredData,
      });
    } catch (err: any) {
      setErrorMessage(formatFriendlyErrorMessage(err?.message || 'AI 비서와의 연결 중 오류가 발생했습니다.'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-100/80 via-orange-50/70 to-rose-50/60 border border-amber-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <Sun className="w-6 h-6 text-amber-600 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-800 font-serif-warm mb-1">
                운동과 기분의 맛·날씨, 그리고 감사 성찰 일기
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                몸의 감각과 기분의 빛깔을 적고, 오늘의 감사와 사건을 되돌아보세요.
                AI 비서 '온기'가 다정한 위로와 내일의 행동을 선물합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFillExample}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-semibold text-amber-800 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="작성하기 막막할 때 예시 내용을 자동으로 채워줍니다"
          >
            <Sparkle className="w-3.5 h-3.5 text-amber-600" />
            <span>예시 채워보기</span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>모든 작성 내용은 외부 DB 없이 오직 브라우저 내부 로컬 스토리지에만 보관됩니다.</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Date & Title Box */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              일기 날짜
            </label>
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              오늘의 제목 <span className="text-stone-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              placeholder="예: 땀 흘린 후의 개운한 밤, 내 마음을 달래준 시간"
              value={title}
              maxLength={40}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* [NEW 1] 맨 위에 오늘 한 운동 (운동, 시간, 운동 후 느낌) */}
        {/* ========================================================================= */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-teal-200/90 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-teal-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-sm">
              <Dumbbell className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 font-serif-warm flex items-center gap-2">
                <span>오늘 한 운동</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  몸의 활력
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                작은 움직임과 땀방울이 마음에 건강한 활력을 불어넣어 줍니다.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* 운동 종류 & 시간 (2 컬럼) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 오늘 한 운동 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-teal-600" />
                  <span>오늘 한 운동</span>
                </label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="예: 저녁 동네 산책, 헬스 하체 운동, 홈트 요가 30분"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-teal-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all placeholder:text-stone-400"
                />
                {/* 빠른 선택 칩 */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {exercisePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setExerciseName(preset.replace(/[^가-힣a-zA-Z0-9/]/g, '').trim());
                        if (soundEnabled) playSoftClick();
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/70 hover:bg-teal-100/80 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 얼마나 했는지 시간 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-teal-600" />
                  <span>운동 시간</span>
                </label>
                <input
                  type="text"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  placeholder="예: 30분, 1시간"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-teal-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all placeholder:text-stone-400"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {durationPresets.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        setExerciseDuration(dur);
                        if (soundEnabled) playSoftClick();
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200/80 transition-colors"
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 운동 후 느낌 */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-teal-600" />
                <span>운동 후 느낌</span>
              </label>
              <input
                type="text"
                value={exerciseFeeling}
                onChange={(e) => setExerciseFeeling(e.target.value)}
                placeholder="예: 땀을 흘리고 나니 잡생각이 사라지고 개운함, 다리가 뻐근하지만 뿌듯함"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-teal-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all placeholder:text-stone-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {feelingPresets.map((feel) => (
                  <button
                    key={feel}
                    type="button"
                    onClick={() => {
                      setExerciseFeeling(feel.replace(/[💦🌿✨🍃]/g, '').trim());
                      if (soundEnabled) playSoftClick();
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-colors"
                  >
                    {feel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* [NEW 2] 그 아래 오늘의 기분을 맛과 날씨로 표현하기 */}
        {/* ========================================================================= */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-amber-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 font-serif-warm flex items-center gap-2">
                <span>오늘의 기분을 맛과 날씨로 표현하기</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  감각 비유
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                오늘 내 하루의 분위기를 미각과 날씨의 언어로 감각적으로 포착해 보세요.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            
            {/* 맛으로 표현하기 (구수한, 달콤한, 신...) */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
              <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                  <span>맛으로 표현한 오늘의 기분</span>
                </span>
                {moodTaste && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.2 rounded-md">
                    "{moodTaste}"
                  </span>
                )}
              </label>

              <input
                type="text"
                value={moodTaste}
                onChange={(e) => setMoodTaste(e.target.value)}
                placeholder="예: 구수한, 달콤한, 신, 씁쓸한..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all placeholder:text-stone-400"
              />

              {/* 맛 선택 칩 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tastePresets.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMoodTaste(item.label);
                      if (soundEnabled) playSoftClick();
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                      moodTaste === item.label
                        ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                        : 'bg-white text-stone-700 border-amber-200/80 hover:bg-amber-100/70'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 날씨로 표현하기 (먹구름 낀, 화창한, 추운...) */}
            <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-200/80 space-y-2">
              <label className="block text-xs font-bold text-sky-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                  <span>날씨로 표현한 오늘의 기분</span>
                </span>
                {moodWeather && (
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-200/60 px-2 py-0.2 rounded-md">
                    "{moodWeather}"
                  </span>
                )}
              </label>

              <input
                type="text"
                value={moodWeather}
                onChange={(e) => setMoodWeather(e.target.value)}
                placeholder="예: 먹구름 낀, 화창한, 추운, 포근한..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all placeholder:text-stone-400"
              />

              {/* 날씨 선택 칩 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {weatherPresets.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMoodWeather(item.label);
                      if (soundEnabled) playSoftClick();
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                      moodWeather === item.label
                        ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-2xs'
                        : 'bg-white text-stone-700 border-sky-200/80 hover:bg-sky-100/70'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. 오늘의 감사와 긍정 찾기 */}
        {/* ========================================================================= */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-amber-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
              <Smile className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 font-serif-warm flex items-center gap-2">
                <span>오늘의 감사와 긍정 찾기</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  마음의 힘
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                사소한 순간 속에서도 감사와 다행을 발견할 때 마음이 회복됩니다.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* 1. 감사했던 일 1가지 */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>오늘 감사했던 일 1가지</span>
              </label>
              <input
                type="text"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="예: 출근길 아침 공기가 상쾌했던 것, 따뜻한 안부를 물어봐 준 친구의 연락"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-amber-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400"
              />
            </div>

            {/* 2. 다행이었던 일 2가지 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>다행이었던 일 (첫 번째)</span>
                </label>
                <input
                  type="text"
                  value={relief1}
                  onChange={(e) => setRelief1(e.target.value)}
                  placeholder="예: 비가 쏟아지기 전에 집에 도착한 것"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-amber-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>다행이었던 일 (두 번째)</span>
                </label>
                <input
                  type="text"
                  value={relief2}
                  onChange={(e) => setRelief2(e.target.value)}
                  placeholder="예: 까다로운 서류 작성을 마감 전에 무사히 끝낸 것"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-amber-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* 3. 선행을 베풀었던 일 1가지 */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>선행을 베풀었던 일 1가지</span>
              </label>
              <input
                type="text"
                value={kindness}
                onChange={(e) => setKindness(e.target.value)}
                placeholder="예: 무거운 짐을 든 이웃을 위해 문을 잡아드린 것, 힘들어하는 동료에게 음료수 건넨 일"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-amber-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400"
              />
            </div>

            {/* 4. 그럼에도 불구하고 다행이었던 점 1가지 */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Feather className="w-4 h-4 text-emerald-600" />
                <span>그럼에도 불구하고 다행이었던 점 1가지</span>
              </label>
              <textarea
                rows={2}
                value={silverLining}
                onChange={(e) => setSilverLining(e.target.value)}
                placeholder="예: 오늘 계획했던 일을 다 끝내진 못했지만, 무리하지 않고 내 몸을 먼저 챙길 수 있었던 점"
                className="w-full p-3 rounded-xl border border-stone-200 bg-amber-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-stone-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. 강한 감정을 불러일으킨 사건 되돌아보기 (마음 성찰) */}
        {/* ========================================================================= */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-indigo-200/80 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-indigo-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold text-sm">
              <Compass className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 font-serif-warm flex items-center gap-2">
                <span>강한 감정을 불러일으켰던 사건 되돌아보기</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  마음 성찰
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                그때의 상황과 내 감정, 행동을 객관적으로 마주하고 다음의 지혜를 기록합니다.
              </p>
            </div>
          </div>

          <div className="space-y-5 text-sm">
            {/* 사건의 때, 장소, 인물 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>사건 때 (시간/시기)</span>
                </label>
                <input
                  type="text"
                  value={episodeTime}
                  onChange={(e) => setEpisodeTime(e.target.value)}
                  placeholder="예: 오전 11시 회의 도중"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>장소</span>
                </label>
                <input
                  type="text"
                  value={episodePlace}
                  onChange={(e) => setEpisodePlace(e.target.value)}
                  placeholder="예: 회사 사무실, 카페, 집 거실"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>인물 (간략히)</span>
                </label>
                <input
                  type="text"
                  value={episodePeople}
                  onChange={(e) => setEpisodePeople(e.target.value)}
                  placeholder="예: 상사, 친구, 가족, 나 자신"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>

            {/* 그때 내 마음 */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-indigo-500" />
                <span>그때 내 마음 (속마음과 떠오른 생각들)</span>
              </label>
              <textarea
                rows={3}
                value={episodeInnerFeeling}
                onChange={(e) => setEpisodeInnerFeeling(e.target.value)}
                placeholder="예: 내 노력을 몰라주는 것 같아 서운했고, 한편으로는 내가 부족해서 그런가 싶어 자책하는 마음이 들었음..."
                className="w-full p-3.5 rounded-xl border border-stone-200 bg-indigo-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all placeholder:text-stone-400 resize-y"
              />
            </div>

            {/* 가장 강하게 느낀 대표 감정 1가지 (기쁨, 지침, 설렘, 불안) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>가장 강하게 느낀 대표 감정 1가지</span>
                </label>
                <span className="text-xs text-stone-500">
                  선택: <strong className="text-indigo-700 font-bold">{EMOTIONS[selectedEmotion].label}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {emotionList.map((emo) => {
                  const meta = EMOTIONS[emo];
                  const isSelected = selectedEmotion === emo;
                  return (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => handleEmotionSelect(emo)}
                      className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? `${meta.bgColor} ${meta.borderColor} ring-2 ring-indigo-400 font-bold shadow-xs scale-102`
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <span className={isSelected ? meta.color : 'text-stone-700'}>{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 감정의 깊이 */}
              <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs">
                <span className="text-stone-600 font-medium shrink-0">감정 강도: {emotionIntensity}단계</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={emotionIntensity}
                  onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-stone-400 shrink-0">
                  {emotionIntensity <= 2 ? '잔잔함' : emotionIntensity === 3 ? '보통' : '매우 격렬함'}
                </span>
              </div>
            </div>

            {/* 그때 내가 한 행동 */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-stone-500" />
                <span>그때 내가 한 행동</span>
              </label>
              <textarea
                rows={2}
                value={episodeActionTaken}
                onChange={(e) => setEpisodeActionTaken(e.target.value)}
                placeholder="예: 표정이 굳어진 채 아무 말도 하지 않고 자리를 피했음 / 바로 욱해서 목소리를 높였음"
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all placeholder:text-stone-400 resize-none"
              />
            </div>

            {/* 앞으로 똑같은 일이 생겼을 때 어떻게 하면 좋을지 */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>앞으로 똑같은 일이 생겼을 때 어떻게 하면 좋을지 (나의 지혜와 다짐)</span>
              </label>
              <textarea
                rows={3}
                value={episodeFutureAction}
                onChange={(e) => setEpisodeFutureAction(e.target.value)}
                placeholder="예: 감정이 격해질 땐 3초 동안 숨을 깊게 들이마시고, '상대방의 말이 나를 공격하려는 게 아닐 수 있다'고 스스로를 다독이기"
                className="w-full p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/20 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all placeholder:text-stone-400 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-stone-800 text-sm flex items-start justify-between gap-3 shadow-2xs animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <span className="text-lg shrink-0 mt-0.5">💌</span>
              <div>
                <strong className="text-amber-900 font-bold block mb-0.5">안내 말씀</strong>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-stone-400 hover:text-stone-600 text-xs shrink-0 px-2 py-1 rounded-lg hover:bg-amber-100/60"
            >
              닫기
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg cursor-pointer ${
              isLoading
                ? 'bg-amber-400 text-amber-900 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI 비서 '온기'가 나의 운동과 기분, 일기를 읽고 답장 작성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>AI 비서에게 일기 보여주기</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-400 mt-2">
            Google Gemini가 오늘 흘린 땀과 기분의 맛·날씨, 감사와 마음 성찰을 따뜻하게 지지하고 위로해 드립니다
          </p>
        </div>

      </form>
    </div>
  );
};
