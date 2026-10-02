import { AICheerResponse, EmotionType, DiaryStructuredData } from '../types/diary';

export interface RequestCheerParams {
  emotion: EmotionType;
  content: string;
  date: string;
  title?: string;
  structured?: DiaryStructuredData;
  customApiKey?: string;
}

export async function requestAICheer(params: RequestCheerParams): Promise<AICheerResponse> {
  const { emotion, content, date, title, structured, customApiKey } = params;

  // 1. Try server endpoint first (/api/cheer)
  try {
    const res = await fetch('/api/cheer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotion,
        content,
        date,
        title,
        structured,
        customApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.cheer) {
        return data.cheer as AICheerResponse;
      }
      throw new Error(data.error || 'AI 응원 응답을 받아오지 못했습니다.');
    } else {
      const errorJson = await res.json().catch(() => null);
      const serverErrMsg = errorJson?.error;

      // If server returned an explicit error (like missing key), bubble it up
      if (serverErrMsg) {
        throw new Error(serverErrMsg);
      }
      throw new Error(`서버 요청 실패 (상태 코드: ${res.status})`);
    }
  } catch (err: any) {
    // If server failed, let's check if client has VITE_GEMINI_API_KEY or custom key as fallback for static Vercel deployment
    const fallbackKey = customApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (fallbackKey) {
      return await generateWithDirectGeminiRest(fallbackKey, params);
    }
    throw err;
  }
}

/**
 * Fallback direct Gemini REST call if running in purely static environment (e.g. static Vercel export)
 * Uses standard REST endpoint for gemini-2.5-flash or gemini-2.0-flash / gemini-1.5 / gemini-3.8-flash
 */
async function generateWithDirectGeminiRest(apiKey: string, params: RequestCheerParams): Promise<AICheerResponse> {
  const { emotion, content, date, title, structured } = params;

  let bodyText = content;
  if (structured) {
    bodyText = `
[오늘 한 운동 및 느낌]
- 운동 종류: ${structured.exerciseName || '(없음)'}
- 운동 시간: ${structured.exerciseDuration || '(없음)'}
- 운동 후 느낌: ${structured.exerciseFeeling || '(없음)'}

[오늘 기분의 비유]
- 맛: ${structured.moodTaste || '(없음)'}
- 날씨: ${structured.moodWeather || '(없음)'}

[감사 & 다행 & 선행]
- 오늘 감사했던 일 1가지: ${structured.gratitude}
- 다행이었던 일 2가지: 1) ${structured.relief1} 2) ${structured.relief2}
- 선행을 베풀었던 일 1가지: ${structured.kindness}
- 그럼에도 불구하고 다행이었던 점 1가지: ${structured.silverLining}

[강한 감정을 불러일으킨 사건]
- 때: ${structured.episodeTime}
- 장소: ${structured.episodePlace}
- 인물: ${structured.episodePeople}
- 그때 내 마음: ${structured.episodeInnerFeeling}
- 가장 강하게 느낀 대표 감정: ${structured.episodeEmotion || emotion}
- 그때 내가 한 행동: ${structured.episodeActionTaken}
- 앞으로 똑같은 일이 생겼을 때 어떻게 하면 좋을지: ${structured.episodeFutureAction}
`;
  }

  const prompt = `
당신은 사용자의 지친 마음을 다정하게 감싸안아주고, 오늘 하루를 진심으로 인정해주며, 내일을 기대하게 만드는 다정한 감정 비서 '온기'입니다.

[사용자 일기 정보]
- 날짜: ${date}
- 제목: ${title || '(없음)'}
- 감정: ${emotion}
- 내용:
"""
${bodyText}
"""

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "comfortingMessage": "사용자의 감정을 어루만지고 다정하게 위로해주는 따뜻한 편지글 (존댓말, 2~4문단).",
  "tomorrowAction": "내일을 위한 긍정적이고 실천하기 쉬운 구체적인 작은 행동 1가지.",
  "vitaminQuote": "마음의 비타민이 되는 짧고 인상적인 한 줄 응원 문장.",
  "emotionAnalysis": "오늘 사용자의 마음에 대한 한 줄의 따뜻한 공감 요약.",
  "recommendedTea": "마음을 편안하게 해주는 추천 차나 음료 (예: 캐모마일 티, 따뜻한 꿀배차).",
  "keywordTag": "따뜻한 응원 해시태그 (예: #수고했어_오늘도)."
}
`.trim();

  // Try gemini-2.5-flash or gemini-2.0-flash on Google Generative Language REST
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API 오류 발생 (${res.status})`);
  }

  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini로부터 빈 응답을 받았습니다.');
  }

  return JSON.parse(text) as AICheerResponse;
}
