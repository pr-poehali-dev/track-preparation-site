import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadSection from '@/components/UploadSection';
import LibrarySection from '@/components/LibrarySection';
import EditorSection from '@/components/EditorSection';
import WaveformEditor from '@/components/WaveformEditor';
import AudioEffectsSection from '@/components/AudioEffectsSection';
import MetadataSection from '@/components/MetadataSection';
import ExportSection from '@/components/ExportSection';
import PreviewSection from '@/components/PreviewSection';
import StatsSection from '@/components/StatsSection';
import AudioPlayer from '@/components/AudioPlayer';
import Icon from '@/components/ui/icon';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  duration: number;
  format: string;
  cover: string;
  audioUrl: string;
  lyrics?: string;
  bpm?: number;
  key?: string;
}

interface HistoryEntry {
  timestamp: number;
  action: string;
  track: Track;
}

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState('library');
  const [editTab, setEditTab] = useState('editor');
  const [history, setHistory] = useState<Map<string, HistoryEntry[]>>(new Map());
  const [historyIndex, setHistoryIndex] = useState<Map<string, number>>(new Map());

  const handleTrackUpload = (newTracks: Track[]) => {
    setTracks(prev => [...prev, ...newTracks]);
    setActiveTab('library');
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    if (!history.has(track.id)) {
      const newHistory = new Map(history);
      newHistory.set(track.id, [{ timestamp: Date.now(), action: 'Трек загружен', track }]);
      setHistory(newHistory);
      
      const newIndex = new Map(historyIndex);
      newIndex.set(track.id, 0);
      setHistoryIndex(newIndex);
    }
  };

  const handleTrackUpdate = (updatedTrack: Track, action: string = 'Трек изменён') => {
    setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
    setCurrentTrack(updatedTrack);

    const trackHistory = history.get(updatedTrack.id) || [];
    const currentIndex = historyIndex.get(updatedTrack.id) || 0;
    
    const newHistoryEntry: HistoryEntry = {
      timestamp: Date.now(),
      action,
      track: updatedTrack
    };
    
    const updatedHistory = [...trackHistory.slice(0, currentIndex + 1), newHistoryEntry];
    
    const newHistory = new Map(history);
    newHistory.set(updatedTrack.id, updatedHistory);
    setHistory(newHistory);
    
    const newIndex = new Map(historyIndex);
    newIndex.set(updatedTrack.id, updatedHistory.length - 1);
    setHistoryIndex(newIndex);
  };

  const handleUndo = () => {
    if (!currentTrack) return;
    
    const trackHistory = history.get(currentTrack.id);
    const currentIndex = historyIndex.get(currentTrack.id);
    
    if (!trackHistory || currentIndex === undefined || currentIndex <= 0) return;
    
    const newIndex = currentIndex - 1;
    const previousState = trackHistory[newIndex];
    
    setCurrentTrack(previousState.track);
    setTracks(prev => prev.map(t => t.id === previousState.track.id ? previousState.track : t));
    
    const newIndexMap = new Map(historyIndex);
    newIndexMap.set(currentTrack.id, newIndex);
    setHistoryIndex(newIndexMap);
  };

  const handleRedo = () => {
    if (!currentTrack) return;
    
    const trackHistory = history.get(currentTrack.id);
    const currentIndex = historyIndex.get(currentTrack.id);
    
    if (!trackHistory || currentIndex === undefined || currentIndex >= trackHistory.length - 1) return;
    
    const newIndex = currentIndex + 1;
    const nextState = trackHistory[newIndex];
    
    setCurrentTrack(nextState.track);
    setTracks(prev => prev.map(t => t.id === nextState.track.id ? nextState.track : t));
    
    const newIndexMap = new Map(historyIndex);
    newIndexMap.set(currentTrack.id, newIndex);
    setHistoryIndex(newIndexMap);
  };

  const canUndo = currentTrack && (historyIndex.get(currentTrack.id) || 0) > 0;
  const canRedo = currentTrack && (historyIndex.get(currentTrack.id) || 0) < ((history.get(currentTrack.id) || []).length - 1);

  const handleTrackDelete = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-8 bg-gradient-to-t from-primary to-secondary rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              MusicLab Pro
            </h1>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-8 bg-gradient-to-t from-secondary to-primary rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Профессиональная подготовка треков к релизу
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20">
              <Icon name="Upload" className="mr-2" size={18} />
              Загрузка
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary/20">
              <Icon name="Library" className="mr-2" size={18} />
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary/20">
              <Icon name="BarChart3" className="mr-2" size={18} />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="animate-fade-in">
            <UploadSection onUpload={handleTrackUpload} />
          </TabsContent>

          <TabsContent value="library" className="animate-fade-in">
            <LibrarySection
              tracks={tracks}
              onSelect={handleTrackSelect}
              onDelete={handleTrackDelete}
              currentTrack={currentTrack}
            />
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <StatsSection tracks={tracks} />
          </TabsContent>
        </Tabs>

        {currentTrack && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded-lg shadow-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{currentTrack.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-background/50 rounded-lg border border-border/30">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className={`p-1.5 rounded transition-colors ${
                      canUndo
                        ? 'hover:bg-primary/20 text-foreground'
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                    title="Отменить (Ctrl+Z)"
                  >
                    <Icon name="Undo2" size={16} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className={`p-1.5 rounded transition-colors ${
                      canRedo
                        ? 'hover:bg-primary/20 text-foreground'
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                    title="Вернуть (Ctrl+Y)"
                  >
                    <Icon name="Redo2" size={16} />
                  </button>
                </div>
                
                <button
                  onClick={() => setEditTab('history')}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    editTab === 'history'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background/50 border-border/30 hover:border-primary/50'
                  }`}
                  title="История изменений"
                >
                  <Icon name="History" size={16} />
                </button>
                
                <button
                  onClick={() => setCurrentTrack(null)}
                  className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                <button
                  onClick={() => setEditTab('editor')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    editTab === 'editor'
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Icon name="Image" size={18} />
                  <span className="font-medium">Обложка</span>
                </button>
                <button
                  onClick={() => setEditTab('waveform')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    editTab === 'waveform'
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Icon name="Activity" size={18} />
                  <span className="font-medium">Форма волны</span>
                </button>
                <button
                  onClick={() => setEditTab('effects')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    editTab === 'effects'
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Icon name="Sliders" size={18} />
                  <span className="font-medium">Эффекты</span>
                </button>
                <button
                  onClick={() => setEditTab('metadata')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    editTab === 'metadata'
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Icon name="FileText" size={18} />
                  <span className="font-medium">Метаданные</span>
                </button>
                <button
                  onClick={() => setEditTab('export')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    editTab === 'export'
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Icon name="Download" size={18} />
                  <span className="font-medium">Экспорт</span>
                </button>
                <button
                  onClick={() => setEditTab('preview')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    editTab === 'preview'
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Icon name="Eye" size={18} />
                  <span className="font-medium">Превью</span>
                </button>
              </div>
            </div>

            <div className="animate-fade-in">
              {editTab === 'editor' && <EditorSection track={currentTrack} onUpdate={handleTrackUpdate} />}
              {editTab === 'waveform' && <WaveformEditor track={currentTrack} onUpdate={handleTrackUpdate} />}
              {editTab === 'effects' && <AudioEffectsSection track={currentTrack} onUpdate={handleTrackUpdate} />}
              {editTab === 'metadata' && <MetadataSection track={currentTrack} onUpdate={handleTrackUpdate} />}
              {editTab === 'export' && <ExportSection track={currentTrack} />}
              {editTab === 'preview' && <PreviewSection track={currentTrack} />}
              {editTab === 'history' && (
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Icon name="History" className="text-primary" size={24} />
                    <h2 className="text-2xl font-bold">История изменений</h2>
                  </div>
                  
                  {history.get(currentTrack.id) && history.get(currentTrack.id)!.length > 0 ? (
                    <div className="space-y-2">
                      {history.get(currentTrack.id)!.map((entry, index) => {
                        const isCurrent = historyIndex.get(currentTrack.id) === index;
                        const date = new Date(entry.timestamp);
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                              isCurrent
                                ? 'bg-primary/10 border-primary shadow-md'
                                : 'bg-background/50 border-border/30 hover:border-border/50'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            
                            <div className="flex-1">
                              <p className={`font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                {entry.action}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {date.toLocaleString('ru-RU')}
                              </p>
                            </div>
                            
                            {isCurrent && (
                              <div className="px-2 py-1 bg-primary/20 rounded text-xs font-semibold text-primary">
                                Текущая версия
                              </div>
                            )}
                            
                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  setCurrentTrack(entry.track);
                                  setTracks(prev => prev.map(t => t.id === entry.track.id ? entry.track : t));
                                  const newIndexMap = new Map(historyIndex);
                                  newIndexMap.set(currentTrack.id, index);
                                  setHistoryIndex(newIndexMap);
                                }}
                                className="px-3 py-1 text-xs bg-background hover:bg-primary/20 border border-border/50 hover:border-primary/50 rounded transition-colors"
                              >
                                Восстановить
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Clock" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>История изменений пуста</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <AudioPlayer track={currentTrack} />
          </div>
        )}

        <footer className="mt-16 mb-8 pt-8 border-t border-border/30">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-gradient-to-t from-primary/60 to-secondary/60 rounded-full animate-wave"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                MusicLab Pro
              </span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-gradient-to-t from-secondary/60 to-primary/60 rounded-full animate-wave"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                <Icon name="Music2" size={14} />
                <span>Профессиональный мастеринг</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5 hover:text-secondary transition-colors cursor-pointer">
                <Icon name="Sparkles" size={14} />
                <span>Подготовка к релизу</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                <Icon name="Headphones" size={14} />
                <span>Студийное качество</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Icon name="Heart" size={12} className="text-primary/60" />
              <span>Сделано с любовью к музыке</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;