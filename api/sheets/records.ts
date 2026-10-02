export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const webAppUrl = req.query?.url as string;
    if (!webAppUrl || typeof webAppUrl !== 'string' || !webAppUrl.startsWith('https://script.google.com/')) {
      return res.status(400).json({
        success: false,
        error: '유효한 Google Apps Script Web App URL이 필요합니다.'
      });
    }

    const delimiter = webAppUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${webAppUrl}${delimiter}action=read`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(200).json({
        success: false,
        error: '응답 데이터 파싱 실패. Code.gs에 action=read 코드가 포함되어 있는지 확인해 주세요.',
        raw: text
      });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || '구글 시트 조회 실패'
    });
  }
}
