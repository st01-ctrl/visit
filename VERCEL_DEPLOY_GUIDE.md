# 🚀 Vercel 배포 완벽 가이드 (따뜻한 하루 일기)

본 프로젝트는 **Vercel 원클릭 배포**에 완벽하게 최적화되어 있습니다.
Vercel의 Serverless Function(`/api/cheer.ts`)과 Vite 프론트엔드가 자동으로 연동되며, API 키가 브라우저에 노출되지 않고 안전하게 작동합니다.

---

## 1. Vercel 배포 3단계 요약

### 1단계: GitHub에 코드 올리기
1. 현재 프로젝트 코드를 본인의 GitHub 저장소(Repository)에 푸시(Push)합니다.

### 2단계: Vercel에서 프로젝트 가져오기 (Import)
1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인합니다.
2. **`Add New...` > `Project`** 를 클릭합니다.
3. GitHub 저장소를 선택하고 **`Import`** 를 누릅니다.
4. **Framework Preset**: 자동으로 `Vite`로 인식됩니다. (별도 변경 불필요)
5. **Root Directory**: `./` (기본값 유지)

### 3단계: 환경 변수(Environment Variables) 등록 ⭐️ 가장 중요!
Vercel 배포 화면의 **`Environment Variables`** 섹션에서 다음 환경 변수를 추가합니다:

| Key (이름) | Value (값) | 설명 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` (본인의 Gemini API 키) | Vercel 서버리스 백엔드용 (권장) |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` (본인의 Gemini API 키) | 프론트엔드 비상용 대체 키 (선택사항) |

> 💡 **Gemini API 키 발급처**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받으실 수 있습니다.

6. **`Deploy`** 버튼을 누르면 약 1분 후 배포가 완료됩니다!

---

## 2. Vercel 배포 시 포함된 핵심 설정 파일들

- `vercel.json`:
  - `dist` 폴더를 정적 에셋으로 서빙하고, SPA 라우팅 새로고침 에러를 방지하도록 리라이트(`rewrites`)가 설정되어 있습니다.
  - `/api/(.*)` 경로를 Vercel 서버리스 함수로 자동 라우팅합니다.
- `/api/cheer.ts`:
  - Vercel의 Serverless Function으로 구동되어 사용자의 요청을 받아 구글 Gemini API를 안전하게 호출합니다.
- `/api/status.ts`:
  - Vercel 환경에서 `GEMINI_API_KEY`가 정상적으로 등록되었는지 체크하는 헬스체크 엔드포인트입니다.
- `.env.example`:
  - 로컬 테스트 및 Vercel 등록 시 참고할 수 있는 환경 변수 예시 파일입니다.

---

## 3. 배포 후 동작 확인

1. Vercel에서 생성된 배포 URL(예: `https://your-diary-app.vercel.app`)로 접속합니다.
2. 우측 상단의 **톱니바퀴 아이콘(⚙️ 설정)**을 클릭합니다.
3. **"Gemini API 연결 상태: API 키 활성화됨"** 초록색 뱃지가 보이면 완벽하게 연동된 상태입니다!
4. 첫 일기를 작성하고 **`[AI 비서에게 일기 보여주기]`**를 눌러 따뜻한 위로 답장을 받아보세요.
