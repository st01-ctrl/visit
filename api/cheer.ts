import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'POST 요청만 지원합니다.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'GEMINI_API_KEY가 Vercel 환경 변수에 설정되어 있지 않습니다. Vercel 프로젝트 대시보드 > Settings > Environment Variables에서 GEMINI_API_KEY를 추가해주세요.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: '유효한 JSON 형식이 아닙니다.' });
    }
  }

  const { emotion, content, date, title, structured } = body || {};

  if (!content && !structured) {
    return res.status(400).json({
      ok: false,
      error: '일기 내용을 입력해주세요.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let diaryDetailsText = '';
    if (structured) {
      diaryDetailsText = `
[오늘 한 운동 및 몸의 감각]
- 오늘 한 운동: ${structured.exerciseName || '(기재 안 함)'}
- 운동 시간: ${structured.exerciseDuration || '(기재 안 함)'}
- 운동 후 느낌: ${structured.exerciseFeeling || '(기재 안 함)'}

[오늘 내 기분의 감각적 표현]
- 맛으로 표현한 오늘의 기분: ${structured.moodTaste || '(기재 안 함)'}
- 날씨로 표현한 오늘의 기분: ${structured.moodWeather || '(기재 안 함)'}

[오늘의 감사, 다행, 선행 회고]
1. 오늘 감사했던 일 1가지:
   ${structured.gratitude || '(작성 없음)'}
2. 다행이었던 일 2가지:
   - 첫 번째: ${structured.relief1 || '(작성 없음)'}
   - 두 번째: ${structured.relief2 || '(작성 없음)'}
3. 선행을 베풀었던 일 1가지:
   ${structured.kindness || '(작성 없음)'}
4. 그럼에도 불구하고 다행이었던 점 1가지:
   ${structured.silverLining || '(작성 없음)'}

[강한 감정을 불러일으켰던 사건 되돌아보기]
- 사건의 때: ${structured.episodeTime || '오늘'}
- 장소: ${structured.episodePlace || '(장소 미기재)'}
- 관련된 인물: ${structured.episodePeople || '(인물 미기재)'}
- 그때 내 마음속 생각:
  "${structured.episodeInnerFeeling || '(작성 없음)'}"
- 가장 강하게 느낀 대표 감정: ${structured.episodeEmotion || emotion || '알 수 없음'}
- 그때 내가 한 행동:
  "${structured.episodeActionTaken || '(작성 없음)'}"
- 앞으로 똑같은 일이 생겼을 때 어떻게 하면 좋을지 (나의 다짐):
  "${structured.episodeFutureAction || '(작성 없음)'}"
`;
    } else {
      diaryDetailsText = `
일기 내용:
"""
${content}
"""`;
    }

    const prompt = `
당신은 사용자의 지친 마음을 다정하게 감싸안아주고, 오늘 하루를 진심으로 인정해주며, 내일을 기대하게 만드는 따뜻한 감정 비서 '온기(Warmth)'입니다.

[사용자의 일기 정보]
- 날짜: ${date || '오늘'}
- 제목: ${title ? title : '(제목 없음)'}
- 선택한 대표 감정: ${emotion || '알 수 없음'}
${diaryDetailsText}

[답장 지침]
1. 사용자가 오늘 실천한 운동과 몸의 느낌(예: ${structured?.exerciseName || ''}, ${structured?.exerciseFeeling || ''})을 칭찬하고, 오늘 하루를 표현한 맛(${structured?.moodTaste || ''})과 날씨(${structured?.moodWeather || ''})라는 시적이고 다정한 비유를 답장 편지 속에 자연스럽게 언급하며 공감해주세요.
2. 사용자가 정성껏 기록한 [감사한 일, 다행이었던 일, 베푼 선행, 그럼에도 불구하고 찾은 다행스러운 점]을 하나하나 따뜻하게 칭찬하고 지지해주세요. 사소해 보일지라도 선행을 베풀고 감사를 찾아낸 사용자의 고운 마음에 크게 공감해주세요.
3. [강한 감정을 불러일으켰던 사건]에 대해:
   - 그때 마음속에 소용돌이쳤던 감정과 행동을 절대 비난하지 말고, "그 상황이라면 당연히 그런 마음이 들 수밖에 없었을 거예요"라며 깊이 안아주세요.
   - 사용자가 스스로 성찰하여 적은 [앞으로 똑같은 일이 생겼을 때 어떻게 하면 좋을지]에 대해 "정말 훌륭하고 성숙한 생각이에요"라며 격려하고, 사용자가 실천하기 쉽도록 따뜻한 보충 조언을 덧붙여주세요.
4. 반드시 "내일을 위한 긍정적인 행동 1가지"를 구체적이고 부담 없는 작은 실천으로 제안해주세요.
5. 마음에 힘이 되는 한 줄 비타민 문구, 오늘 밤이나 내일 어울리는 따뜻한 차 종류, 감성적인 해시태그를 포함해주세요.
`.trim();

    // 503 과부하 대비 모델 자동 대체 체인
    const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let cheerData: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: '당신은 언제나 사용자의 편에서 온 마음으로 위로와 긍정 에너지를 건네는 다정한 AI 감정 비서입니다. 답변은 따뜻하고 품격 있는 문체로 작성하세요.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                comfortingMessage: {
                  type: Type.STRING,
                  description: '사용자의 감정을 어루만지고 다정하게 위로해주는 따뜻한 편지글 (존댓말, 2~4문단).',
                },
                tomorrowAction: {
                  type: Type.STRING,
                  description: '내일을 위한 긍정적이고 실천하기 쉬운 작은 행동 1가지.',
                },
                vitaminQuote: {
                  type: Type.STRING,
                  description: '마음의 비타민이 되는 짧고 인상적인 한 줄 응원 문장.',
                },
                emotionAnalysis: {
                  type: Type.STRING,
                  description: '오늘 사용자의 마음에 대한 한 줄의 따뜻한 공감 요약.',
                },
                recommendedTea: {
                  type: Type.STRING,
                  description: '마음을 편안하게 해주는 추천 차나 음료 (예: 캐모마일 티, 따뜻한 꿀배차).',
                },
                keywordTag: {
                  type: Type.STRING,
                  description: '따뜻한 응원 해시태그 (예: #수고했어_오늘도).',
                },
              },
              required: [
                'comfortingMessage',
                'tomorrowAction',
                'vitaminQuote',
                'emotionAnalysis',
                'recommendedTea',
                'keywordTag',
              ],
            },
          },
        });

        const responseText = response.text?.trim() || '{}';
        cheerData = JSON.parse(responseText);
        break; // 성공 시 루프 탈출
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Vercel] Model ${model} failed, trying next candidate...`, err?.message || err);
      }
    }

    if (!cheerData) {
      throw lastError || new Error('모든 AI 모델 연결에 실패했습니다.');
    }

    return res.status(200).json({
      ok: true,
      cheer: cheerData,
    });
  } catch (error: any) {
    console.error('Vercel Gemini API Error:', error);
    
    // 에러 메시지 사용자 친화적 가공
    let friendlyMessage = 'AI 비서와의 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    const rawMsg = error?.message || '';
    if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
      friendlyMessage = '현재 구글 AI 서버에 일시적인 접속량이 많습니다. 2~3초 후 [AI 비서에게 일기 보여주기] 버튼을 한 번 더 눌러주세요.';
    } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      friendlyMessage = 'API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.';
    } else if (rawMsg.includes('API key') || rawMsg.includes('API_KEY')) {
      friendlyMessage = 'API 키가 올바르지 않거나 권한이 없습니다. Vercel 환경 변수를 확인해주세요.';
    }

    return res.status(500).json({
      ok: false,
      error: friendlyMessage,
    });
  }
}
