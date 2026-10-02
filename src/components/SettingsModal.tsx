import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Key, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { exportDiariesToJSON, importDiariesFromJSON, clearAllDiaries } from '../utils/storage';
import { DiaryEntry } from '../types/diary';
import { playSoftClick } from '../utils/soundEffects';

interface SettingsModalProps {
  onClose: () => void;
  onDiariesUpdated: (diaries: DiaryEntry[]) => void;
  soundEnabled: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onDiariesUpdated,
  soundEnabled,
}) => {
  const [serverStatus, setServerStatus] = useState<{ ok: boolean; hasKey: boolean } | null>(null);
  const [checkingServer, setCheckingServer] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus(data);
        setCheckingServer(false);
      })
      .catch(() => {
        setServerStatus({ ok: false, hasKey: false });
        setCheckingServer(false);
      });
  }, []);

  const handleExport = () => {
    if (soundEnabled) playSoftClick();
    exportDiariesToJSON();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importDiariesFromJSON(text);
        onDiariesUpdated(imported);
        setImportStatus(`성공적으로 ${imported.length}개의 일기를 불러왔습니다!`);
        setTimeout(() => setImportStatus(null), 3500);
      } catch (err: any) {
        setImportStatus(`가져오기 실패: ${err.message || '올바른 JSON 파일이 아닙니다.'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (soundEnabled) playSoftClick();
    clearAllDiaries();
    onDiariesUpdated([]);
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800 font-serif-warm">
                설정 및 보안 안내
              </h2>
              <p className="text-xs text-stone-500">
                로컬 저장소 및 Gemini 환경 변수 설정
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-stone-700">
          
          {/* 1. Privacy & Storage Notice (사용자 요청사항 확인) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% 브라우저 로컬 스토리지 보관 (개인정보 보호)</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              사용자님의 요구에 따라 모든 일기와 AI 답장은 외부 데이터베이스(Firebase 등)로 전송되지 않으며, 
              <strong>오직 현재 사용 중인 브라우저의 localStorage에만 안전하게 보관</strong>됩니다.
            </p>
          </div>

          {/* 2. Gemini API Key Server Status */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Server className="w-4 h-4 text-amber-600" />
                Gemini API 연결 상태
              </span>
              {checkingServer ? (
                <span className="text-xs text-stone-400">확인 중...</span>
              ) : serverStatus?.hasKey ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  API 키 활성화됨
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  키 설정 필요
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              API 키는 코드에 노출되지 않고 안전한 백엔드 프록시(`/api/cheer`)를 통해 Google Gemini와 통신합니다.
            </p>
          </div>

          {/* 3. Vercel & .env Deployment Guide */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Vercel 배포 시 환경 변수 설정 가이드</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Vercel 프로젝트 대시보드의 <strong>Settings &gt; Environment Variables</strong> 메뉴에서 아래 키를 등록하시면 즉시 안전하게 작동합니다:
            </p>
            <div className="bg-stone-900 text-amber-200 p-3 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
              <div><span className="text-stone-400"># 백엔드 서버용</span></div>
              <div>GEMINI_API_KEY="AIzaSy..."</div>
              <div className="pt-1"><span className="text-stone-400"># 프론트엔드 직접 배포용</span></div>
              <div>VITE_GEMINI_API_KEY="AIzaSy..."</div>
            </div>
            <p className="text-[11px] text-stone-500">
              * 프로젝트 루트의 <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">.env.example</code> 파일에도 예시가 작성되어 있습니다.
            </p>
          </div>

          {/* 4. Backup & Restore (JSON Export / Import) */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              일기 데이터 백업 및 복원
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>JSON 파일로 백업 다운로드</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>JSON 백업 파일 복원하기</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-700 font-medium p-2 bg-emerald-50 rounded-lg">
                {importStatus}
              </p>
            )}
          </div>

          {/* 5. Clear All Data */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-600 block">데이터 초기화</span>
              <span className="text-[11px] text-stone-400">로컬 스토리지에 저장된 모든 일기를 영구 삭제합니다</span>
            </div>

            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                >
                  확인 (삭제)
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:bg-stone-100"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                모두 삭제
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-white hover:bg-stone-900 transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
