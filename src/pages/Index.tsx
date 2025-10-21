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

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState('library');

  const handleTrackUpload = (newTracks: Track[]) => {
    setTracks(prev => [...prev, ...newTracks]);
    setActiveTab('library');
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleTrackUpdate = (updatedTrack: Track) => {
    setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
    setCurrentTrack(updatedTrack);
  };

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
          <TabsList className="grid w-full grid-cols-9 bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20">
              Загрузка
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary/20">
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-primary/20">
              Обложка
            </TabsTrigger>
            <TabsTrigger value="waveform" className="data-[state=active]:bg-primary/20">
              Форма волны
            </TabsTrigger>
            <TabsTrigger value="effects" className="data-[state=active]:bg-primary/20">
              Эффекты
            </TabsTrigger>
            <TabsTrigger value="metadata" className="data-[state=active]:bg-primary/20">
              Метаданные
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-primary/20">
              Экспорт
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-primary/20">
              Превью
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary/20">
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

          <TabsContent value="editor" className="animate-fade-in">
            <EditorSection track={currentTrack} onUpdate={handleTrackUpdate} />
          </TabsContent>

          <TabsContent value="waveform" className="animate-fade-in">
            <WaveformEditor track={currentTrack} onUpdate={handleTrackUpdate} />
          </TabsContent>

          <TabsContent value="effects" className="animate-fade-in">
            <AudioEffectsSection track={currentTrack} onUpdate={handleTrackUpdate} />
          </TabsContent>

          <TabsContent value="metadata" className="animate-fade-in">
            <MetadataSection track={currentTrack} onUpdate={handleTrackUpdate} />
          </TabsContent>

          <TabsContent value="export" className="animate-fade-in">
            <ExportSection track={currentTrack} />
          </TabsContent>

          <TabsContent value="preview" className="animate-fade-in">
            <PreviewSection track={currentTrack} />
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <StatsSection tracks={tracks} />
          </TabsContent>
        </Tabs>

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