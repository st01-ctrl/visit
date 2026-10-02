export const CODE_GS_CONTENT = `/**
 * ============================================================
 * [구글 스프레드시트 연동 초간단 가족 가계부/메모]
 * 파일명: Code.gs
 * ============================================================
 * 구조 설명:
 * 1. doGet(e)  : 브라우저 접속 시 모바일 웹 화면 제공
 *                (?action=read 파라미터 시 최근 시트 데이터 JSON 반환)
 * 2. doPost(e) : 외부 앱 또는 API로부터 데이터 수신하여 시트에 추가
 * 3. addRecord(data) : 실제 시트에 [날짜, 작성자, 내역, 금액] appendRow 실행
 * 4. getRecentRecords() : 최근 작성된 기록 조회 함수
 * ============================================================
 */

// 1. 웹 브라우저 접속 처리 (화면 표시 또는 JSON 데이터 조회)
function doGet(e) {
  // 외부나 앱에서 데이터 조회를 요청한 경우 (?action=read)
  if (e && e.parameter && e.parameter.action === 'read') {
    var records = getRecentRecords(50);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      records: records
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 기본 접속: 모바일 웹 앱 HTML 화면 띄우기
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('가족 가계부')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 2. 외부 웹사이트나 API에서 POST로 전송할 때 처리하는 함수
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

// 3. 실제 구글 시트에 행(Row)을 추가하는 핵심 연동 함수
function addRecord(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트가 완전히 비어있을 경우 헤더 행(A1:D1) 자동 생성 및 스타일 적용
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['날짜', '작성자', '내역', '금액']);
      sheet.getRange(1, 1, 1, 4)
        .setFontWeight('bold')
        .setBackground('#f3f4f6')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
    
    // 한국 시간(KST) 기준 날짜 및 시간 포맷팅 (예: 2026-10-01 15:30)
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
    
    // 구글 스프레드시트 맨 아래 행에 추가: [A열, B열, C열, D열]
    sheet.appendRow([formattedDate, author, item, amount]);
    
    // 금액 열(D열) 천단위 콤마 서식(#,##0) 자동 적용
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 4).setNumberFormat('#,##0');
    
    return {
      success: true,
      message: '저장되었습니다!',
      record: {
        date: formattedDate,
        author: author,
        item: item,
        amount: amount,
        row: lastRow
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// 4. 최근 기록 목록 조회 (시트에서 역순으로 가져오기)
function getRecentRecords(limit) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // 헤더만 있거나 빈 시트
    
    var count = limit || 20;
    var startRow = Math.max(2, lastRow - count + 1);
    var numRows = lastRow - startRow + 1;
    
    var values = sheet.getRange(startRow, 1, numRows, 4).getValues();
    var list = [];
    
    // 최신 순으로 반환 (역순)
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

export const INDEX_HTML_CONTENT = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>가족 가계부</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", Roboto, sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: #f8fafc;
      color: #0f172a;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }

    .app-container {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding-top: 10px;
      padding-bottom: 30px;
    }

    .header {
      text-align: center;
      padding: 8px 0;
    }

    .header h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.5px;
    }

    .header p {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .card {
      background: #ffffff;
      border-radius: 20px;
      padding: 24px 20px;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }

    .input-field {
      width: 100%;
      height: 52px;
      padding: 0 16px;
      font-size: 16px;
      color: #0f172a;
      background-color: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      outline: none;
      transition: all 0.2s ease;
    }

    .input-field:focus {
      background-color: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    /* 빠른 작성자 버튼 */
    .quick-authors {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .author-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      color: #475569;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .author-chip:active {
      background: #e2e8f0;
    }

    /* 빠른 금액 증감 버튼 */
    .quick-amounts {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .amount-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 12px;
      color: #475569;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .amount-chip:active {
      background: #e2e8f0;
    }

    /* 제출 버튼 */
    .submit-btn {
      width: 100%;
      height: 54px;
      background: #1e293b;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.15);
      transition: all 0.15s ease;
      margin-top: 4px;
    }

    .submit-btn:hover {
      background: #0f172a;
    }

    .submit-btn:active {
      transform: scale(0.98);
      background: #020617;
    }

    .submit-btn:disabled {
      background: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }

    /* 토스트 알림창 */
    .toast {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background-color: #059669;
      color: #ffffff;
      padding: 14px 24px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.35);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9999;
      pointer-events: none;
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* 최근 기록 미리보기 영역 */
    .recent-section {
      margin-top: 8px;
    }

    .recent-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .recent-title {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
    }

    .refresh-btn {
      background: none;
      border: none;
      font-size: 12px;
      color: #2563eb;
      cursor: pointer;
      font-weight: 500;
    }

    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .recent-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .recent-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .recent-item-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .recent-item-meta {
      font-size: 11px;
      color: #64748b;
    }

    .recent-amount {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      font-variant-numeric: tabular-nums;
    }
  </style>
</head>
<body>

  <div id="toast" class="toast">저장되었습니다!</div>

  <div class="app-container">
    <div class="header">
      <h1>가족 가계부</h1>
      <p>구글 시트로 바로 저장되는 초간단 메모</p>
    </div>

    <div class="card">
      <!-- 1. 작성자 -->
      <div class="form-group">
        <label class="label" for="author">작성자</label>
        <input 
          type="text" 
          id="author" 
          class="input-field" 
          placeholder="이름 (예: 아빠, 엄마)" 
          autocomplete="off"
        >
        <div class="quick-authors">
          <button type="button" class="author-chip" onclick="setAuthor('아빠')">아빠</button>
          <button type="button" class="author-chip" onclick="setAuthor('엄마')">엄마</button>
          <button type="button" class="author-chip" onclick="setAuthor('첫째')">첫째</button>
          <button type="button" class="author-chip" onclick="setAuthor('둘째')">둘째</button>
        </div>
      </div>

      <!-- 2. 내역 -->
      <div class="form-group">
        <label class="label" for="item">내역</label>
        <input 
          type="text" 
          id="item" 
          class="input-field" 
          placeholder="어디에 썼나요? (예: 장보기, 카페)" 
          autocomplete="off"
        >
      </div>

      <!-- 3. 금액 -->
      <div class="form-group">
        <label class="label" for="amount">금액 (원)</label>
        <input 
          type="number" 
          inputmode="numeric" 
          id="amount" 
          class="input-field" 
          placeholder="0" 
          pattern="[0-9]*"
        >
        <div class="quick-amounts">
          <button type="button" class="amount-chip" onclick="addAmount(1000)">+1천</button>
          <button type="button" class="amount-chip" onclick="addAmount(5000)">+5천</button>
          <button type="button" class="amount-chip" onclick="addAmount(10000)">+1만</button>
          <button type="button" class="amount-chip" onclick="addAmount(50000)">+5만</button>
          <button type="button" class="amount-chip" onclick="clearAmount()">초기화</button>
        </div>
      </div>

      <!-- 제출 버튼 -->
      <button type="button" id="submitBtn" class="submit-btn" onclick="saveRecord()">
        <span id="btnText">시트에 기록하기</span>
      </button>
    </div>

    <!-- 최근 구글 시트 저장 목록 -->
    <div class="recent-section">
      <div class="recent-header">
        <span class="recent-title">최근 시트 기록</span>
        <button type="button" class="refresh-btn" onclick="loadRecentRecords()">새로고침</button>
      </div>
      <div id="recentList" class="recent-list">
        <div style="text-align: center; color: #94a3b8; font-size: 13px; padding: 16px;">
          기록을 불러오는 중...
        </div>
      </div>
    </div>
  </div>

  <script>
    function setAuthor(name) {
      document.getElementById('author').value = name;
      localStorage.setItem('family_ledger_author', name);
    }

    function addAmount(val) {
      var amtInput = document.getElementById('amount');
      var current = parseInt(amtInput.value, 10) || 0;
      amtInput.value = current + val;
    }

    function clearAmount() {
      document.getElementById('amount').value = '';
    }

    function showToast(msg) {
      var toast = document.getElementById('toast');
      toast.innerText = msg || '저장되었습니다!';
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 2500);
    }

    // 최근 기록 렌더링
    function renderRecentList(list) {
      var container = document.getElementById('recentList');
      if (!list || list.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#94a3b8; font-size:12px; padding:16px;">아직 시트에 기록이 없습니다.</div>';
        return;
      }
      
      var html = '';
      for (var i = 0; i < Math.min(list.length, 5); i++) {
        var r = list[i];
        var amtFormatted = Number(r.amount).toLocaleString() + '원';
        html += '<div class="recent-item">' +
          '<div class="recent-left">' +
            '<span class="recent-item-title">' + (r.item || '-') + '</span>' +
            '<span class="recent-item-meta">' + (r.author || '') + ' · ' + (r.date || '') + '</span>' +
          '</div>' +
          '<span class="recent-amount">' + amtFormatted + '</span>' +
        '</div>';
      }
      container.innerHTML = html;
    }

    function loadRecentRecords() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(list) {
            renderRecentList(list);
          })
          .getRecentRecords(5);
      }
    }

    // 접속 시 초기화
    window.addEventListener('DOMContentLoaded', function() {
      var saved = localStorage.getItem('family_ledger_author');
      if (saved) {
        document.getElementById('author').value = saved;
      }
      loadRecentRecords();
    });

    // 시트 저장 함수
    function saveRecord() {
      var authorInput = document.getElementById('author');
      var itemInput = document.getElementById('item');
      var amountInput = document.getElementById('amount');
      var submitBtn = document.getElementById('submitBtn');
      var btnText = document.getElementById('btnText');

      var author = authorInput.value.trim();
      var item = itemInput.value.trim();
      var amount = amountInput.value.trim();

      if (!author) {
        alert('작성자를 입력해 주세요.');
        authorInput.focus();
        return;
      }
      if (!item) {
        alert('내역을 입력해 주세요.');
        itemInput.focus();
        return;
      }
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        alert('올바른 금액을 입력해 주세요.');
        amountInput.focus();
        return;
      }

      submitBtn.disabled = true;
      btnText.innerText = '시트에 저장 중...';

      var payload = {
        author: author,
        item: item,
        amount: Number(amount)
      };

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(response) {
            submitBtn.disabled = false;
            btnText.innerText = '시트에 기록하기';

            if (response && response.success) {
              showToast('저장되었습니다!');
              itemInput.value = '';
              amountInput.value = '';
              itemInput.focus();
              loadRecentRecords();
            } else {
              alert('저장 실패: ' + (response.error || '알 수 없는 오류'));
            }
          })
          .withFailureHandler(function(err) {
            submitBtn.disabled = false;
            btnText.innerText = '시트에 기록하기';
            alert('오류 발생: ' + err);
          })
          .addRecord(payload);
      }
    }
  </script>
</body>
</html>
`;

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
    title: '구글 스프레드시트 생성',
    summary: '구글 드라이브에서 새 스프레드시트를 생성합니다.',
    details: [
      '구글 드라이브(drive.google.com) 접속 → [+ 새로 만들기] → [Google 스프레드시트]를 생성합니다.',
      '시트 상단 제목을 "가족 가계부" 또는 원하는 이름으로 정합니다.',
      'A열(날짜), B열(작성자), C열(내역), D열(금액) 헤더는 최초 실행 시 자동으로 생성되므로 시트를 비워두셔도 됩니다.'
    ],
    tip: '시트 상단이나 하단에 =SUM(D2:D) 수식을 입력해 두시면 실시간 총 지출액을 한눈에 볼 수 있습니다.'
  },
  {
    step: 2,
    title: 'Apps Script 열고 Code.gs 붙여넣기',
    summary: '상단 메뉴 [확장 프로그램] > [Apps Script]로 편집기를 엽니다.',
    details: [
      '스프레드시트 상단 메뉴 [확장 프로그램] → [Apps Script]를 클릭합니다.',
      '기존 기본 함수 내용을 모두 지우고, [Code.gs 완성 코드]를 그대로 복사하여 붙여넣습니다.',
      '단축키 Ctrl + S (Mac은 Cmd + S)를 눌러 저장합니다.'
    ],
    tip: 'Code.gs에는 웹 브라우저를 띄워주는 doGet()과 시트에 데이터를 추가해 주는 addRecord(), doPost()가 모두 포함되어 있습니다.'
  },
  {
    step: 3,
    title: 'Index.html 파일 추가 및 붙여넣기',
    summary: 'Apps Script 왼쪽 파일 목록에서 HTML 파일을 생성합니다.',
    details: [
      'Apps Script 왼쪽 파일 목록 상단 [+] (파일 추가) 버튼 클릭 → [HTML]을 선택합니다.',
      '파일 이름을 정확히 대소문자 구분하여 "Index"라고 입력 후 엔터를 칩니다.',
      '기존 코드를 모두 지우고, [Index.html 완성 코드]를 전체 복사하여 붙여넣고 저장합니다.'
    ],
    tip: 'Index.html은 모바일 스마트폰 화면에 맞게 깔끔한 큰 버튼과 숫자 키패드로 구성되어 있습니다.'
  },
  {
    step: 4,
    title: '웹 앱으로 배포 및 연동 URL 발급',
    summary: '모든 가족 구성원이 로그인 없이 바로 입력할 수 있도록 배포합니다.',
    details: [
      '우측 상단 파란색 [배포] 버튼 클릭 → [새 배포]를 선택합니다.',
      '톱니바퀴 [유형 선택] 클릭 → [웹 앱]을 선택합니다.',
      '다음과 같이 옵션을 선택합니다:',
      '  - 설명: "가족 가계부 v1"',
      '  - 다음 사용자로 실행: "나 (내 계정)"',
      '  - 액세스 권한이 있는 사용자: "모든 사용자" (★ 중요: 다른 가족들도 별도 권한 설정 없이 입력 가능)',
      '[배포] 클릭 → 최초 1회 [액세스 승인] 창에서 본인 계정 선택 → [고급] → [(안전하지 않음)으로 이동] → [허용]을 누릅니다.',
      '최종 화면에 생성되는 [웹 앱 URL] (https://script.google.com/macros/s/.../exec)을 복사합니다!'
    ],
    tip: '복사한 웹 앱 URL을 본 웹 앱 상단의 [구글 시트 연동 URL 입력] 칸에 붙여넣으시면, 이곳에서도 실시간 시트 데이터가 즉시 연동됩니다!'
  }
];
