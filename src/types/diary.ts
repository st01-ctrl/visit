export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

export interface AICheerResponse {
  comfortingMessage: string;
  tomorrowAction: string;
  vitaminQuote: string;
  emotionAnalysis: string;
  recommendedTea: string;
  keywordTag: string;
}

export interface DiaryStructuredData {
  // 1. 오늘 한 운동 (맨 위)
  exerciseName?: string;        // 오늘 한 운동 (예: 조깅, 요가, 헬스, 산책)
  exerciseDuration?: string;    // 얼마나 했는지 시간 (예: 30분, 1시간)
  exerciseFeeling?: string;     // 운동 후 느낌 (예: 땀 흘려 개운함, 나른하고 뿌듯함)

  // 2. 오늘의 기분을 맛과 날씨로 표현
  moodTaste?: string;           // 기분의 맛 (구수한, 달콤한, 신, 씁쓸한, 매콤한, 담백한 등)
  moodWeather?: string;         // 기분의 날씨 (먹구름 낀, 화창한, 추운, 포근한, 비 내리는 등)

  // 3. 긍정과 감사
  gratitude: string;            // 오늘 감사했던 일 1가지
  relief1: string;              // 다행이었던 일 첫 번째
  relief2: string;              // 다행이었던 일 두 번째
  kindness: string;             // 선행을 베풀었던 일 1가지
  silverLining: string;         // 그럼에도 불구하고 다행이었던 점 1가지

  // 4. 강한 감정을 불러일으킨 사건 되돌아보기
  episodeTime: string;          // 사건 때
  episodePlace: string;         // 장소
  episodePeople: string;        // 인물 간략히
  episodeInnerFeeling: string;  // 그때 내 마음
  episodeEmotion: EmotionType;  // 가장 강하게 느낀 대표 감정 1가지
  episodeActionTaken: string;   // 그때 내가 한 행동
  episodeFutureAction: string;  // 앞으로 똑같은 일이 생겼을 때 어떻게 하면 좋을지
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  title: string;
  emotion: EmotionType;
  emotionIntensity?: number; // 1 to 5
  content: string;
  structured?: DiaryStructuredData;
  cheer?: AICheerResponse;
  isActionCompleted?: boolean;
}

export interface EmotionMeta {
  type: EmotionType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  description: string;
}
