import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DiaryForm } from './components/DiaryForm';
import { DiaryList } from './components/DiaryList';
import { EmotionStats } from './components/EmotionStats';
import { AICheerModal } from './components/AICheerModal';
import { DiaryDetailModal } from './components/DiaryDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { DiaryEntry, EmotionType, AICheerResponse, DiaryStructuredData } from './types/diary';
import { getStoredDiaries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from './utils/storage';
import { requestAICheer } from './services/geminiService';
import { playWarmChime } from './utils/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'list' | 'stats'>('write');
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [isLoadingCheer, setIsLoadingCheer] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active AI Cheer Reveal Modal
  const [pendingCheerData, setPendingCheerData] = useState<{
    cheer: AICheerResponse;
    emotion: EmotionType;
    content: string;
    title: string;
    date: string;
    emotionIntensity: number;
    structured?: DiaryStructuredData;
  } | null>(null);

  // Detail Modal for past entries
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<DiaryEntry | null>(null);

  // Settings / Security Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Load diaries on initial mount
  useEffect(() => {
    const loaded = getStoredDiaries();
    setDiaries(loaded);

    const savedSound = localStorage.getItem('warm_diary_sound_enabled');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('warm_diary_sound_enabled', String(nextVal));
  };

  // Handle diary form submission to call Gemini API
  const handleFormSubmit = async (data: {
    emotion: EmotionType;
    content: string;
    title: string;
    date: string;
    emotionIntensity: number;
    structured: DiaryStructuredData;
  }) => {
    setIsLoadingCheer(true);

    try {
      const cheerResponse = await requestAICheer({
        emotion: data.emotion,
        content: data.content,
        date: data.date,
        title: data.title,
        structured: data.structured,
      });

      if (soundEnabled) {
        playWarmChime();
      }

      setPendingCheerData({
        cheer: cheerResponse,
        emotion: data.emotion,
        content: data.content,
        title: data.title,
        date: data.date,
        emotionIntensity: data.emotionIntensity,
        structured: data.structured,
      });
    } finally {
      setIsLoadingCheer(false);
    }
  };

  // Save the cheer response & diary to local storage
  const handleSaveCheerAndClose = (actionCompleted: boolean) => {
    if (!pendingCheerData) return;

    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: pendingCheerData.date,
      createdAt: new Date().toISOString(),
      title: pendingCheerData.title,
      emotion: pendingCheerData.emotion,
      emotionIntensity: pendingCheerData.emotionIntensity,
      content: pendingCheerData.content,
      structured: pendingCheerData.structured,
      cheer: pendingCheerData.cheer,
      isActionCompleted: actionCompleted,
    };

    const updated = addDiaryEntry(newEntry);
    setDiaries(updated);
    setPendingCheerData(null);
    setActiveTab('list');
  };

  // Toggle action completion status
  const handleToggleAction = (id: string) => {
    const target = diaries.find((d) => d.id === id);
    if (!target) return;
    const updated = updateDiaryEntry(id, { isActionCompleted: !target.isActionCompleted });
    setDiaries(updated);
    if (selectedDetailEntry && selectedDetailEntry.id === id) {
      setSelectedDetailEntry({ ...selectedDetailEntry, isActionCompleted: !target.isActionCompleted });
    }
  };

  // Delete an entry
  const handleDeleteEntry = (id: string) => {
    const updated = deleteDiaryEntry(id);
    setDiaries(updated);
    if (selectedDetailEntry && selectedDetailEntry.id === id) {
      setSelectedDetailEntry(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        diaryCount={diaries.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {activeTab === 'write' && (
          <DiaryForm
            onSubmit={handleFormSubmit}
            isLoading={isLoadingCheer}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'list' && (
          <DiaryList
            diaries={diaries}
            onSelectEntry={(entry) => setSelectedDetailEntry(entry)}
            onNavigateToWrite={() => setActiveTab('write')}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'stats' && <EmotionStats diaries={diaries} />}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-amber-200/50 text-center text-xs text-stone-500 bg-amber-50/40">
        <p className="max-w-md mx-auto px-4 leading-relaxed">
          당신의 하루는 언제나 소중합니다. 모든 일기와 감정은 브라우저(localStorage)에만 안전하게 보관됩니다.
        </p>
      </footer>

      {/* AI Cheer Reveal Modal */}
      {pendingCheerData && (
        <AICheerModal
          cheer={pendingCheerData.cheer}
          emotion={pendingCheerData.emotion}
          diaryTitle={pendingCheerData.title}
          diaryContent={pendingCheerData.content}
          structured={pendingCheerData.structured}
          date={pendingCheerData.date}
          onSaveAndClose={handleSaveCheerAndClose}
          onClose={() => setPendingCheerData(null)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Diary Detail Modal */}
      {selectedDetailEntry && (
        <DiaryDetailModal
          entry={selectedDetailEntry}
          onClose={() => setSelectedDetailEntry(null)}
          onToggleAction={handleToggleAction}
          onDelete={handleDeleteEntry}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Settings / Security Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onDiariesUpdated={(updatedList) => setDiaries(updatedList)}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}
