import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Google Sheets Web App POST Proxy (CORS 우회 및 안전한 행 추가)
  app.post('/api/sheets/append', async (req, res) => {
    try {
      const { webAppUrl, payload } = req.body;
      if (!webAppUrl || typeof webAppUrl !== 'string' || !webAppUrl.startsWith('https://script.google.com/')) {
        return res.status(400).json({
          success: false,
          error: '유효한 Google Apps Script Web App URL(https://script.google.com/macros/s/.../exec)을 입력해 주세요.'
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

      return res.json(data);
    } catch (err: any) {
      console.error('Sheets proxy append error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || '구글 시트 연동 요청 실패'
      });
    }
  });

  // 2. Google Sheets Web App GET Proxy (최근 기록 실시간 동기화)
  app.get('/api/sheets/records', async (req, res) => {
    try {
      const webAppUrl = req.query.url as string;
      if (!webAppUrl || typeof webAppUrl !== 'string' || !webAppUrl.startsWith('https://script.google.com/')) {
        return res.status(400).json({
          success: false,
          error: '유효한 Google Apps Script Web App URL을 입력해 주세요.'
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
        return res.json({
          success: false,
          error: '응답 데이터 파싱 실패. Code.gs에 action=read 처리가 포함되어 있는지 확인해 주세요.',
          raw: text
        });
      }

      return res.json(data);
    } catch (err: any) {
      console.error('Sheets proxy records error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || '구글 시트 조회 실패'
      });
    }
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
