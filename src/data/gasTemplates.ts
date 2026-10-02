export const CODE_GS_CONTENT = `/**
 * ============================================================
 * [구글 스프레드시트 데이터베이스 단독 백엔드 API]
 * 파일명: Code.gs
 * ============================================================
 * ※ 중요: HTML 파일(Index.html)을 따로 만들 필요가 전혀 없습니다!
 * 구글 시트 Apps Script에 이 Code.gs 코드 딱 하나만 붙여넣으시면 됩니다.
 * ============================================================
 */

// 1. GET 요청 처리 (연동 상태 확인 및 최신 데이터 조회)
function doGet(e) {
  // Vercel 앱에서 데이터 조회를 요청한 경우 (?action=read)
  if (e && e.parameter && e.parameter.action === 'read') {
    var records = getRecentRecords(50);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      records: records
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 브라우저에서 직접 접속했을 때 뜨는 안내 화면 (별도 HTML 파일 불필요)
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>구글 시트 연동 정상</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:30px;text-align:center;background:#f8fafc;color:#1e293b;">' +
    '<div style="max-width:440px;margin:40px auto;background:#fff;padding:32px 24px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">' +
    '<div style="font-size:36px;margin-bottom:12px;">✅</div>' +
    '<h2 style="color:#059669;margin-bottom:8px;font-size:20px;">구글 시트 데이터베이스 연동 준비 완료!</h2>' +
    '<p style="color:#64748b;font-size:14px;line-height:1.6;margin-top:12px;">버셀(Vercel) 웹 앱과 성공적으로 연결될 준비가 끝났습니다.<br>웹 앱에서 작성자, 내역, 금액을 입력하시면 스프레드시트에 즉시 기록됩니다.</p>' +
    '</div></body></html>'
  );
}

// 2. Vercel 웹 앱에서 전송한 가계부 데이터 수신 및 시트 저장 (POST)
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var result = addRecord(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. 실제 구글 시트에 [날짜, 작성자, 내역, 금액] 행 추가
function addRecord(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트가 비어있을 경우 1행 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['날짜', '작성자', '내역', '금액']);
      sheet.getRange(1, 1, 1, 4)
        .setFontWeight('bold')
        .setBackground('#f3f4f6')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
    
    // 한국 시간(KST) 기준 날짜 및 시간 포맷팅
    var now = new Date();
    var formattedDate = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    
    var author = (data.author || '가족').toString().trim();
    var item = (data.item || '').toString().trim();
    var amount = Number(data.amount) || 0;
    
    if (!item) {
      return { success: false, error: '내역을 입력해 주세요.' };
    }
    if (amount <= 0) {
      return { success: false, error: '올바른 금액을 입력해 주세요.' };
    }
    
    // 구글 시트 맨 아래 행에 [A:날짜, B:작성자, C:내역, D:금액] 추가
    sheet.appendRow([formattedDate, author, item, amount]);
    
    // 금액 열(D열) 천단위 콤마 서식(#,##0) 자동 지정
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 4).setNumberFormat('#,##0');
    
    return {
      success: true,
      message: '저장되었습니다!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// 4. 최근 기록 목록 조회
function getRecentRecords(limit) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    var count = limit || 20;
    var startRow = Math.max(2, lastRow - count + 1);
    var numRows = lastRow - startRow + 1;
    var values = sheet.getRange(startRow, 1, numRows, 4).getValues();
    var list = [];
    
    for (var i = values.length - 1; i >= 0; i--) {
      var d = values[i][0];
      var dateStr = (d instanceof Date) 
        ? Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd HH:mm') 
        : String(d);
        
      list.push({
        date: dateStr,
        author: String(values[i][1] || ''),
        item: String(values[i][2] || ''),
        amount: Number(values[i][3]) || 0
      });
    }
    return list;
  } catch (err) {
    return [];
  }
}
`;

export const INDEX_HTML_CONTENT = `<!-- 
  ※ 참고: Vercel에 React 웹 앱이 이미 배포되어 있다면, 
  구글 스프레드시트에는 이 HTML 파일을 추가하실 필요가 없습니다! 
  구글 시트 Apps Script에는 위의 Code.gs 단 하나만 붙여넣으시면 됩니다.
-->`;

export interface GuideStep {
  step: number;
  title: string;
  summary: string;
  details: string[];
  tip?: string;
}

export const SETUP_GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: 'Code.gs 코드 복사 및 붙여넣기',
    summary: '구글 스프레드시트의 Apps Script 편집기에 Code.gs만 붙여넣습니다.',
    details: [
      '구글 스프레드시트 상단 메뉴 [확장 프로그램] → [Apps Script]를 엽니다.',
      '기존 내용을 모두 지우고, [Code.gs 완성 코드]를 그대로 붙여넣습니다.',
      '★ 중요: HTML 파일은 만들 필요가 없습니다! Code.gs 파일 하나면 끝납니다.',
      'Ctrl + S (Mac은 Cmd + S)를 눌러 저장합니다.'
    ],
    tip: 'HTML 파일이 필요 없는 단독 데이터베이스 API 구조로 동작합니다.'
  },
  {
    step: 2,
    title: '새 버전으로 웹 앱 재배포하기',
    summary: '기존 URL에 변경된 코드가 반영되도록 새 버전으로 배포합니다.',
    details: [
      '우측 상단 파란색 [배포] 버튼 클릭 → [배포 관리]를 선택합니다.',
      '오른쪽 상단의 연필 모양(✏️ 수정) 아이콘을 클릭합니다.',
      '버전(Version) 드롭다운을 눌러 [새 버전(New Version)]을 선택합니다.',
      '액세스 권한: [모든 사용자]인지 확인 후 하단의 [배포] 버튼을 누릅니다.'
    ],
    tip: '새 버전을 선택하고 배포해야 기존 웹 앱 URL에 코드가 즉시 갱신됩니다.'
  },
  {
    step: 3,
    title: 'Vercel 환경 변수 설정 (선택 사항)',
    summary: 'Vercel 대시보드에서 웹 앱 URL을 환경 변수로 등록합니다.',
    details: [
      'Vercel 대시보드(vercel.com)에 로그인 후 해당 프로젝트(visit)를 클릭합니다.',
      '[Settings] → [Environment Variables] 메뉴로 들어갑니다.',
      'Key: VITE_GOOGLE_SHEETS_URL',
      'Value: 본인의 Apps Script 웹 앱 URL (https://script.google.com/macros/s/.../exec)',
      '[Save] 후 상단 [Deployments]에서 최신 배포를 [Redeploy] 하시면 전 세계 모든 기기에서 자동 연동됩니다!'
    ],
    tip: '환경 변수를 등록하지 않아도 웹 화면 상단 바에서 URL을 직접 입력해 영구 저장하실 수도 있습니다.'
  }
];
