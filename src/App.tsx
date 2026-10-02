import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Code2,
  FileCode,
  BookOpen,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Share2,
  Link2,
  RefreshCw,
  AlertCircle,
  Database,
  ArrowRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { CODE_GS_CONTENT, INDEX_HTML_CONTENT, SETUP_GUIDE_STEPS } from './data/gasTemplates';

interface LedgerRecord {
  id: string;
  date: string;
  author: string;
  item: string;
  amount: number;
}

const INITIAL_DEMO_RECORDS: LedgerRecord[] = [
  { id: '1', date: '2026-10-01 10:15', author: '엄마', item: '마트 식료품 장보기', amount: 48500 },
  { id: '2', date: '2026-10-01 13:40', author: '아빠', item: '주유소 주유', amount: 65000 },
  { id: '3', date: '2026-10-01 16:20', author: '첫째', item: '문제집 및 학용품', amount: 18000 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture' | 'guide'>('simulator');
  const [codeSubTab, setCodeSubTab] = useState<'codegs' | 'indexhtml'>('codegs');
  
  // Real Google Sheets Web App Connection
  const [webAppUrl, setWebAppUrl] = useState(() => {
    return localStorage.getItem('family_ledger_gas_url') || '';
  });
  const [isUrlEditing, setIsUrlEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState(webAppUrl);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'demo' | 'testing' | 'error'>(
    webAppUrl ? 'connected' : 'demo'
  );
  const [connectionMessage, setConnectionMessage] = useState('');
  
  // Simulator input state
  const [author, setAuthor] = useState(() => localStorage.getItem('family_ledger_saved_author') || '엄마');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('저장되었습니다!');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Google Sheet Records (Live or Demo)
  const [records, setRecords] = useState<LedgerRecord[]>(() => {
    const saved = localStorage.getItem('family_ledger_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DEMO_RECORDS;
      }
    }
    return INITIAL_DEMO_RECORDS;
  });

  const [isFetchingRecords, setIsFetchingRecords] = useState(false);

  // Copy code feedback
  const [copiedCodeGs, setCopiedCodeGs] = useState(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState(false);

  // Guide tracking
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  useEffect(() => {
    localStorage.setItem('family_ledger_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('family_ledger_saved_author', author);
  }, [author]);

  // Sync with real Google Sheet when webAppUrl is set
  const syncWithRealSheet = async (targetUrl = webAppUrl) => {
    if (!targetUrl) return;
    setIsFetchingRecords(true);
    setConnectionStatus('testing');
    try {
      const response = await fetch(`/api/sheets/records?url=${encodeURIComponent(targetUrl)}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.records)) {
        const formatted: LedgerRecord[] = data.records.map((r: any, idx: number) => ({
          id: `live-${idx}-${Date.now()}`,
          date: r.date,
          author: r.author,
          item: r.item,
          amount: Number(r.amount) || 0
        }));
        setRecords(formatted);
        setConnectionStatus('connected');
        setConnectionMessage(`구글 시트와 정상 연동됨 (${formatted.length}개 행 동기화)`);
      } else {
        setConnectionStatus('error');
        setConnectionMessage(data.error || '시트 응답 확인 불가 (Code.gs 최신 코드를 배포했는지 확인하세요)');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionMessage('서버 통신 실패: ' + err.message);
    } finally {
      setIsFetchingRecords(false);
    }
  };

  const handleSaveWebAppUrl = () => {
    const trimmed = tempUrl.trim();
    setWebAppUrl(trimmed);
    localStorage.setItem('family_ledger_gas_url', trimmed);
    setIsUrlEditing(false);
    if (trimmed) {
      syncWithRealSheet(trimmed);
    } else {
      setConnectionStatus('demo');
      setConnectionMessage('');
    }
  };

  const handleClearConnection = () => {
    setWebAppUrl('');
    setTempUrl('');
    localStorage.removeItem('family_ledger_gas_url');
    setConnectionStatus('demo');
    setConnectionMessage('');
    setIsUrlEditing(false);
  };

  const handleCopy = (type: 'codegs' | 'indexhtml') => {
    const text = type === 'codegs' ? CODE_GS_CONTENT : INDEX_HTML_CONTENT;
    navigator.clipboard.writeText(text);
    if (type === 'codegs') {
      setCopiedCodeGs(true);
      setTimeout(() => setCopiedCodeGs(false), 2000);
    } else {
      setCopiedIndexHtml(true);
      setTimeout(() => setCopiedIndexHtml(false), 2000);
    }
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!author.trim()) {
      alert('작성자를 입력해 주세요.');
      return;
    }
    if (!item.trim()) {
      alert('내역을 입력해 주세요.');
      return;
    }
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('올바른 금액을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const payload = {
      author: author.trim(),
      item: item.trim(),
      amount: numAmount
    };

    // 1. If Real Google Apps Script Web App URL is connected
    if (webAppUrl && connectionStatus !== 'error') {
      try {
        const response = await fetch('/api/sheets/append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webAppUrl,
            payload
          })
        });

        const resData = await response.json();
        if (resData.success) {
          const newRecord: LedgerRecord = {
            id: Date.now().toString(),
            date: formattedDate,
            author: author.trim(),
            item: item.trim(),
            amount: numAmount
          };
          setRecords((prev) => [newRecord, ...prev]);
          setItem('');
          setAmount('');
          setToastType('success');
          setToastMessage('구글 시트에 직접 저장되었습니다! ✨');
          setShowToast(true);
        } else {
          setToastType('error');
          setToastMessage('시트 저장 실패: ' + (resData.error || '오류 발생'));
          setShowToast(true);
        }
      } catch (err: any) {
        setToastType('error');
        setToastMessage('전송 오류: ' + err.message);
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
        setTimeout(() => setShowToast(false), 3000);
      }
      return;
    }

    // 2. Demo Mode Simulation
    setTimeout(() => {
      const newRecord: LedgerRecord = {
        id: Date.now().toString(),
        date: formattedDate,
        author: author.trim(),
        item: item.trim(),
        amount: numAmount
      };

      setRecords((prev) => [newRecord, ...prev]);
      setIsSubmitting(false);
      setItem('');
      setAmount('');
      setToastType('success');
      setToastMessage('저장되었습니다! (시뮬레이터)');
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    }, 400);
  };

  const handleAddAmount = (val: number) => {
    const current = parseInt(amount, 10) || 0;
    setAmount((current + val).toString());
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetSheet = () => {
    if (confirm('시트의 데이터를 초기 예시 데이터로 되돌리시겠습니까?')) {
      setRecords(INITIAL_DEMO_RECORDS);
    }
  };

  const handleClearSheet = () => {
    if (confirm('화면의 모든 목록을 비우시겠습니까? (실제 구글 시트 원본 파일 내용은 삭제되지 않습니다)')) {
      setRecords([]);
    }
  };

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. Header (Universal 3-Zone Navigation) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              가
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                가족 가계부 구글 시트 연동 키트
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>모바일 입력 & 시트</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'architecture'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>연동 구조도</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>코드 복사</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>3분 배포 가이드</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Google Sheet Connection Bar (Interactive Real Integration Hook) */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Status indicator & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === 'connected' 
                    ? 'bg-emerald-400 animate-pulse' 
                    : connectionStatus === 'testing'
                    ? 'bg-amber-400 animate-spin'
                    : connectionStatus === 'error'
                    ? 'bg-rose-400'
                    : 'bg-slate-400'
                }`} />
                <span className="text-xs font-semibold tracking-wide">
                  {connectionStatus === 'connected' && '실제 구글 시트 실시간 연동 중'}
                  {connectionStatus === 'testing' && '구글 시트 연결 확인 중...'}
                  {connectionStatus === 'error' && '구글 시트 연동 오류'}
                  {connectionStatus === 'demo' && '시뮬레이터 모드 (URL 미설정)'}
                </span>
              </div>
              <span className="hidden sm:inline text-slate-500">|</span>
              <span className="text-xs text-slate-300">
                {connectionMessage || (
                  webAppUrl 
                    ? '배포된 웹 앱 주소로 실시간 데이터가 저장되고 있습니다.' 
                    : '내 구글 시트의 Apps Script 웹 앱 URL을 등록하면 진짜 시트로 저장됩니다.'
                )}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isUrlEditing ? (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="url"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="h-8 px-2.5 rounded-lg bg-slate-800 text-xs text-white border border-slate-700 w-64 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    onClick={handleSaveWebAppUrl}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    연동 저장
                  </button>
                  <button
                    onClick={() => {
                      setTempUrl(webAppUrl);
                      setIsUrlEditing(false);
                    }}
                    className="h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {webAppUrl ? (
                    <>
                      <button
                        onClick={() => syncWithRealSheet()}
                        disabled={isFetchingRecords}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
                        title="시트 최신 데이터 동기화"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRecords ? 'animate-spin text-emerald-400' : ''}`} />
                        <span>시트 새로고침</span>
                      </button>
                      <button
                        onClick={() => setIsUrlEditing(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>URL 변경</span>
                      </button>
                      <button
                        onClick={handleClearConnection}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-xs text-slate-400 hover:text-rose-300 transition-colors"
                        title="연동 해제하고 시뮬레이터로 복귀"
                      >
                        연동 해제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsUrlEditing(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>내 구글 시트 웹 앱 URL 연결하기</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: SIMULATOR & SPREADSHEET PREVIEW */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            
            {/* Real Connection Status Banner */}
            {webAppUrl ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">내 구글 시트와 실시간 연동 완료!</span>
                    <span className="block text-emerald-700 font-mono text-[11px] mt-0.5 truncate max-w-md">
                      {webAppUrl}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={webAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <span>새 탭에서 모바일 웹 앱 열기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700 text-xs">
                <div className="flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">구글 시트 연동 전 미리보기 상태입니다.</span>
                    <span className="block text-slate-500 mt-0.5">
                      아래 스마트폰에서 입력을 테스트해 볼 수 있으며, [3분 배포 가이드]를 통해 생성된 URL을 연결하면 실제 내 구글 시트로 바로 저장됩니다.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap self-start sm:self-center"
                >
                  3분 배포 방법 보기
                </button>
              </div>
            )}

            {/* Two-column layout: Phone simulator (left) + Live Sheet Viewer (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Phone Simulator Container */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[380px] bg-slate-900 p-3 sm:p-4 rounded-[42px] shadow-2xl border-4 border-slate-800 ring-1 ring-black/10 relative">
                  
                  {/* Phone Speaker & Dynamic Island */}
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700/80" />
                    </div>
                  </div>

                  {/* Phone Screen Frame */}
                  <div className="bg-slate-50 rounded-[32px] overflow-hidden min-h-[580px] flex flex-col relative border border-slate-200/50">
                    
                    {/* Simulated Floating Toast Notification */}
                    {showToast && (
                      <div className={`absolute top-4 left-4 right-4 z-50 py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                        toastType === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {toastType === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-100" />
                        )}
                        <span className="text-center">{toastMessage}</span>
                      </div>
                    )}

                    {/* Mobile App Header */}
                    <div className="pt-6 pb-4 px-5 text-center bg-white border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                        {webAppUrl ? 'LIVE GOOGLE SHEETS' : 'FAMILY LEDGER'}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">우리집 가계부</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {webAppUrl ? '구글 스프레드시트 실시간 동기화' : '구글 시트 연동 초간단 메모'}
                      </p>
                    </div>

                    {/* Mobile App Form Body */}
                    <form onSubmit={handleFormSubmit} className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        
                        {/* 1. 작성자 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            작성자
                          </label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="작성자 이름"
                            className="w-full h-12 px-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            required
                          />
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {['엄마', '아빠', '첫째', '둘째'].map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setAuthor(name)}
                                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                                  author === name
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. 내역 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            내역
                          </label>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => setItem(e.target.value)}
                            placeholder="어디에 썼나요? (예: 장보기, 카페)"
                            className="w-full h-12 px-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        {/* 3. 금액 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            금액 (원)
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full h-12 px-3.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-mono tabular-nums"
                            required
                          />
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {[1000, 5000, 10000, 50000].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleAddAmount(val)}
                                className="px-2 py-1 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:bg-slate-100 active:bg-slate-200"
                              >
                                +{(val / 10000) >= 1 ? `${val / 10000}만` : `${val / 1000}천`}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setAmount('')}
                              className="px-2 py-1 text-[11px] rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
                            >
                              초기화
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-13 mt-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:bg-slate-400"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{webAppUrl ? '구글 시트로 전송 중...' : '저장 중...'}</span>
                          </div>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>시트에 기록하기</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Bottom Home Indicator */}
                    <div className="pb-3 flex justify-center">
                      <div className="w-32 h-1 bg-slate-300 rounded-full" />
                    </div>
                  </div>
                </div>

                <span className="text-xs text-slate-400 mt-3 text-center">
                  스마트폰 화면에 최적화된 큰 글씨와 원터치 버튼 레이아웃입니다.
                </span>
              </div>

              {/* Right Column: Google Spreadsheet Live Table Viewer */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  
                  {/* Spreadsheet Header Bar */}
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        田
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span>스프레드시트 누적 내역</span>
                          {webAppUrl ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              실시간 연동됨
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                              시뮬레이션
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {webAppUrl 
                            ? '구글 시트의 [A열: 날짜, B열: 작성자, C열: 내역, D열: 금액]과 1:1 대응'
                            : '새 기록 제출 시 행(Row)이 자동으로 추가됩니다.'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {webAppUrl && (
                        <button
                          onClick={() => syncWithRealSheet()}
                          disabled={isFetchingRecords}
                          className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium"
                          title="시트 최신 행 새로고침"
                        >
                          <RefreshCw className={`w-3 h-3 ${isFetchingRecords ? 'animate-spin' : ''}`} />
                          <span>새로고침</span>
                        </button>
                      )}
                      <button
                        onClick={handleResetSheet}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
                        title="예시 데이터로 리셋"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>예시 리셋</span>
                      </button>
                      <button
                        onClick={handleClearSheet}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 font-medium"
                        title="테이블 비우기"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>화면 비우기</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">총 기록 건수:</span>
                      <span className="font-mono tabular-nums font-bold text-sm">{records.length}건</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">누적 총 지출:</span>
                      <span className="font-mono tabular-nums font-bold text-base text-emerald-700">
                        {totalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 z-10">
                        <tr>
                          <th className="px-4 py-2.5 w-12 text-center text-slate-400">행</th>
                          <th className="px-4 py-2.5">날짜 (A열)</th>
                          <th className="px-4 py-2.5">작성자 (B열)</th>
                          <th className="px-4 py-2.5">내역 (C열)</th>
                          <th className="px-4 py-2.5 text-right">금액 (D열)</th>
                          <th className="px-3 py-2.5 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">
                              <p>표시할 기록이 없습니다.</p>
                              <p className="text-[11px] mt-1 text-slate-400">
                                왼쪽 모바일 폼에서 새 내역을 입력하고 [시트에 기록하기]를 눌러보세요!
                              </p>
                            </td>
                          </tr>
                        ) : (
                          records.map((r, idx) => (
                            <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 text-center text-slate-400 font-mono">
                                {idx + 2}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                                {r.date}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                                  {r.author}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-800 font-medium">
                                {r.item}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                {r.amount.toLocaleString()}원
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteRecord(r.id)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                  title="목록에서 제거"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>💡 구글 시트 첫 줄(1행)은 <code>[날짜, 작성자, 내역, 금액]</code> 헤더로 자동 생성됩니다.</span>
                    <span className="font-mono text-slate-400">Timezone: Asia/Seoul (KST)</span>
                  </div>
                </div>

                {/* 3 Key Architecture Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      1. 실시간 appendRow() 연동
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      구글 앱스 스크립트 내장 스프레드시트 API를 통해 데이터가 맨 아래 행에 안전하게 추가됩니다.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      2. 완전 무과금 (Zero API Key)
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      별도 유료 API나 인증키 없이, 구글 계정 하나로 가족 누구나 무료로 무제한 사용 가능합니다.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      3. 양방향 조회 및 추가
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      웹 화면에서 입력뿐 아니라 <code>getRecentRecords()</code> 함수로 최근 5건의 지출 내역도 즉시 확인 가능합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARCHITECTURE DIAGRAM */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                구글 스프레드시트 연동 구조 다이어그램
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                사용자의 스마트폰 브라우저부터 구글 스프레드시트 셀에 데이터가 기록되기까지의 전체 흐름입니다.
              </p>
            </div>

            {/* Architecture Visual Diagram */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {/* Step 1: Client */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                    CLIENT LAYER
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    모바일 웹 앱 (Index.html)
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• 작성자, 내역, 금액 3개 항목 입력</li>
                    <li>• 숫자 전용 키패드 (inputmode="numeric")</li>
                    <li>• google.script.run으로 비동기 호출</li>
                    <li>• 저장 완료 시 토스트 알림 & 폼 비우기</li>
                  </ul>
                </div>

                {/* Step 2: Google Apps Script Web App */}
                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 relative">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    SERVERLESS BACKEND
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Apps Script (Code.gs)
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• <code>doGet()</code>: 모바일 화면 제공 / JSON 읽기</li>
                    <li>• <code>doPost()</code>: 외부 앱 데이터 수신</li>
                    <li>• <code>addRecord()</code>: 유효성 검사 & 시간 변환</li>
                    <li>• 한국 표준시(Asia/Seoul KST) 포맷팅</li>
                  </ul>
                </div>

                {/* Step 3: Google Sheets Database */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 relative">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    DATABASE STORAGE
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Google Spreadsheet
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• <code>sheet.appendRow()</code> 맨 아래 행 추가</li>
                    <li>• A열: 날짜 (YYYY-MM-DD HH:mm)</li>
                    <li>• B열: 작성자 / C열: 내역 / D열: 금액</li>
                    <li>• 천단위 콤마 서식 자동 적용</li>
                  </ul>
                </div>

              </div>

              {/* Data Flow Specification Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 text-xs font-bold text-slate-800 border-b border-slate-200">
                  데이터 컬럼 및 스키마 명세
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 font-medium">
                    <div className="col-span-2 font-mono text-emerald-700 font-bold">A열 (Date)</div>
                    <div className="col-span-3 text-slate-800">날짜 및 시간</div>
                    <div className="col-span-7 text-slate-500">Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm')</div>
                  </div>
                  <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 font-medium">
                    <div className="col-span-2 font-mono text-emerald-700 font-bold">B열 (Author)</div>
                    <div className="col-span-3 text-slate-800">작성자</div>
                    <div className="col-span-7 text-slate-500">입력된 이름 (예: 엄마, 아빠)</div>
                  </div>
                  <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 font-medium">
                    <div className="col-span-2 font-mono text-emerald-700 font-bold">C열 (Item)</div>
                    <div className="col-span-3 text-slate-800">내역</div>
                    <div className="col-span-7 text-slate-500">지출 메모 (예: 마트 장보기, 카페)</div>
                  </div>
                  <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 font-medium">
                    <div className="col-span-2 font-mono text-emerald-700 font-bold">D열 (Amount)</div>
                    <div className="col-span-3 text-slate-800">금액</div>
                    <div className="col-span-7 text-slate-500">숫자형 (통화 서식 #,##0 자동 적용)</div>
                  </div>
                </div>
              </div>

              {/* Two Easy Ways to Use */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">A</span>
                    <span>방법 1: 배포된 구글 웹 앱 URL 직접 사용</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Apps Script에서 [배포] 후 생성된 웹 앱 주소를 가족들에게 카카오톡으로 보내면, 브라우저에서 바로 앱이 열리고 <code>google.script.run</code>을 통해 100% 무인증으로 저장됩니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">B</span>
                    <span>방법 2: 이 웹 사이트에 URL 등록하여 사용</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    상단 바의 [내 구글 시트 웹 앱 URL 연결하기]에 발급된 주소를 등록하면, 이 웹 앱의 시뮬레이터 및 테이블이 내 구글 시트와 실시간 연동되어 PC와 모바일 모두에서 사용 가능합니다.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: READY-TO-COPY CODE */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  완성형 소스 코드 (복사 & 붙여넣기)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Google Apps Script 편집기에 파일 2개(<code>Code.gs</code>, <code>Index.html</code>)로 나누어 복사해 붙여넣으시면 바로 연동됩니다.
                </p>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setCodeSubTab('codegs')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    codeSubTab === 'codegs'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>Code.gs (서버 스크립트)</span>
                </button>
                <button
                  onClick={() => setCodeSubTab('indexhtml')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    codeSubTab === 'indexhtml'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Index.html (모바일 웹 화면)</span>
                </button>
              </div>
            </div>

            {/* Code Viewer Card */}
            {codeSubTab === 'codegs' ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">Code.gs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadFile('Code.gs', CODE_GS_CONTENT)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>다운로드</span>
                    </button>
                    <button
                      onClick={() => handleCopy('codegs')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        copiedCodeGs
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      {copiedCodeGs ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Code.gs 전체 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-emerald-300/90 max-h-[560px] overflow-y-auto">
                  <pre>
                    <code>{CODE_GS_CONTENT}</code>
                  </pre>
                </div>

                <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-200">🔍 Code.gs 주요 핵심 구조:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px] sm:text-xs">
                    <li><code>doGet(e)</code>: 모바일 웹 화면 제공 및 <code>?action=read</code> 시 최근 시트 데이터 반환</li>
                    <li><code>doPost(e)</code>: 외부 REST/웹훅 요청을 수신하여 시트에 자동 추가</li>
                    <li><code>addRecord(data)</code>: 시트 맨 아래에 <code>[날짜(KST), 작성자, 내역, 금액]</code>을 appendRow로 추가</li>
                    <li><code>getRecentRecords()</code>: 웹 화면에서 최근 5개 기록을 가져오는 함수</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">Index.html</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadFile('Index.html', INDEX_HTML_CONTENT)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>다운로드</span>
                    </button>
                    <button
                      onClick={() => handleCopy('indexhtml')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        copiedIndexHtml
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-slate-950 hover:bg-blue-400'
                      }`}
                    >
                      {copiedIndexHtml ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Index.html 전체 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-blue-200/90 max-h-[560px] overflow-y-auto">
                  <pre>
                    <code>{INDEX_HTML_CONTENT}</code>
                  </pre>
                </div>

                <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-200">🔍 Index.html 주요 핵심 구조:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px] sm:text-xs">
                    <li>외부 CDN 없이 자체 CSS로 구성되어 모바일 접속 속도가 즉각적입니다.</li>
                    <li><code>inputmode="numeric"</code> 설정으로 모바일에서 숫자 키패드가 바로 뜹니다.</li>
                    <li>제출 시 상단 초록색 토스트 알림이 뜨고, 하단에 최근 저장된 내역 목록이 자동으로 갱신됩니다.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STEP-BY-STEP DEPLOYMENT GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  초보자도 3분 만에 끝내는 구글 시트 배포 가이드
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  아래 4단계를 따라 하시면 모바일 전용 웹 앱 주소(URL)가 바로 생성되고 연동됩니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  진행도: {completedSteps.length} / 4 완료
                </span>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {SETUP_GUIDE_STEPS.map((item) => {
                const isDone = completedSteps.includes(item.step);
                return (
                  <div
                    key={item.step}
                    className={`bg-white rounded-2xl border transition-all ${
                      isDone ? 'border-emerald-200 shadow-xs' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStep(item.step)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4" /> : item.step}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                {item.title}
                              </h3>
                              {isDone && (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  완료됨
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                              {item.summary}
                            </p>
                          </div>
                        </div>

                        {item.step === 2 && (
                          <button
                            onClick={() => handleCopy('codegs')}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Code.gs 복사</span>
                          </button>
                        )}
                        {item.step === 3 && (
                          <button
                            onClick={() => handleCopy('indexhtml')}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Index.html 복사</span>
                          </button>
                        )}
                      </div>

                      {/* Step Detailed Instructions */}
                      <div className="mt-4 pl-11 space-y-2">
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                          {item.details.map((detail, dIdx) => (
                            <li key={dIdx} className="leading-relaxed">
                              {detail}
                            </li>
                          ))}
                        </ul>

                        {item.tip && (
                          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">꿀팁:</span> {item.tip}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Important Notice & Security Warning Bypass Guide */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>⚠️ [필독] 첫 배포 시 구글 보안 경고창 해결 방법</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                처음 배포 시 구글에서 <strong>"확인되지 않은 앱(Google에서 확인하지 않음)"</strong> 경고 화면이 나타납니다. 이는 내가 직접 만든 개인 스크립트이기 때문에 정상적으로 뜨는 구글의 기본 보안 확인 과정입니다.
              </p>
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                <div>1. 로그인 계정 선택 화면에서 본인의 구글 계정을 클릭합니다.</div>
                <div>2. 화면 좌측 하단의 조그만 <strong>[고급 (Advanced)]</strong> 버튼을 클릭합니다.</div>
                <div>3. 맨 아래에 생기는 <strong>[(안전하지 않음)으로 이동]</strong> 링크를 클릭합니다.</div>
                <div>4. 마지막으로 <strong>[허용 (Allow)]</strong> 버튼을 누르면 정상적으로 배포 주소가 발급됩니다!</div>
              </div>
            </div>

            {/* Mobile Home Screen PWA Tip */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Share2 className="w-5 h-5 text-blue-600" />
                <span>스마트폰 홈 화면에 '가족 가계부' 앱 아이콘으로 추가하기</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                배포된 웹 앱 주소를 복사하여 카카오톡으로 가족들에게 공유한 뒤, 아래와 같이 홈 화면에 추가하면 앱스토어에서 앱을 다운받은 것처럼 바로가기 아이콘이 생깁니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 mb-1">🍎 아이폰 (Safari)</div>
                  <p>링크 열기 → 하단 중앙 <strong>[공유]</strong> 아이콘 터치 → <strong>[홈 화면에 추가]</strong> 터치 → 완료</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 mb-1">🤖 안드로이드 갤럭시 (Chrome / 삼성인터넷)</div>
                  <p>링크 열기 → 우측 상단 <strong>[점 3개 (메뉴)]</strong> 터치 → <strong>[홈 화면에 추가]</strong> 터치 → 완료</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>초간단 모바일 가족 가계부</span>
            <span className="mx-2">·</span>
            <span>Google Apps Script 내장 연동 (Zero API Key)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-slate-900 transition-colors"
            >
              모바일 입력
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:text-slate-900 transition-colors"
            >
              연동 구조도
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-slate-900 transition-colors"
            >
              코드 복사
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-900 transition-colors"
            >
              배포 가이드
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
