export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { webAppUrl, payload } = req.body || {};
    if (!webAppUrl || typeof webAppUrl !== 'string' || !webAppUrl.startsWith('https://script.google.com/')) {
      return res.status(400).json({
        success: false,
        error: '유효한 Google Apps Script Web App URL이 필요합니다.'
      });
    }

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: true, message: '시트 저장 요청이 전송되었습니다.', raw: text };
    }

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || '구글 시트 연동 실패'
    });
  }
}
