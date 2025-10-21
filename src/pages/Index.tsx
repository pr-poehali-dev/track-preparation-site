import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadSection from '@/components/UploadSection';
import LibrarySection from '@/components/LibrarySection';
import EditorSection from '@/components/EditorSection';
import MetadataSection from '@/components/MetadataSection';
import ExportSection from '@/components/ExportSection';
import PreviewSection from '@/components/PreviewSection';
import StatsSection from '@/components/StatsSection';
import AudioPlayer from '@/components/AudioPlayer';

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
          <TabsList className="grid w-full grid-cols-7 bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20">
              Загрузка
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary/20">
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-primary/20">
              Редактор
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
      </div>
    </div>
  );
};

export default Index;