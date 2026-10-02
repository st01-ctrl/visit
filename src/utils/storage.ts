import { DiaryEntry } from '../types/diary';
import { INITIAL_SAMPLE_DIARIES } from './constants';

const STORAGE_KEY = 'warm_daily_diaries_v1';

export function getStoredDiaries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization with warm sample data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_DIARIES));
      return INITIAL_SAMPLE_DIARIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return [];
  }
}

export function saveDiaries(diaries: DiaryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function addDiaryEntry(entry: DiaryEntry): DiaryEntry[] {
  const current = getStoredDiaries();
  const updated = [entry, ...current];
  saveDiaries(updated);
  return updated;
}

export function updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): DiaryEntry[] {
  const current = getStoredDiaries();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveDiaries(updated);
  return updated;
}

export function deleteDiaryEntry(id: string): DiaryEntry[] {
  const current = getStoredDiaries();
  const updated = current.filter((item) => item.id !== id);
  saveDiaries(updated);
  return updated;
}

export function exportDiariesToJSON(): void {
  const diaries = getStoredDiaries();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(diaries, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `따뜻한_하루일기_백업_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDiariesFromJSON(jsonString: string): DiaryEntry[] {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('유효한 일기 데이터 배열 형식이 아닙니다.');
  }
  // Basic validation
  for (const item of parsed) {
    if (!item.id || !item.content || !item.emotion) {
      throw new Error('일기 데이터 형식이 올바르지 않습니다.');
    }
  }
  saveDiaries(parsed);
  return parsed;
}

export function clearAllDiaries(): void {
  localStorage.removeItem(STORAGE_KEY);
}
