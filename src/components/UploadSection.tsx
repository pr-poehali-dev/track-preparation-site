import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';

interface UploadSectionProps {
  onUpload: (tracks: Track[]) => void;
}

const UploadSection = ({ onUpload }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.flac', '.m4a', '.ogg'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length === 0) {
      toast.error('Пожалуйста, выберите аудио файлы');
      return;
    }

    const newTracks: Track[] = audioFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      genre: 'Unknown',
      year: new Date().getFullYear().toString(),
      duration: 0,
      format: file.name.split('.').pop()?.toUpperCase() || 'MP3',
      cover: 'https://cdn.poehali.dev/projects/c0c16d96-20da-46bc-8719-3cbe8ca6c4f9/files/f4a8eaeb-79aa-4f1e-a290-11f14e2bd756.jpg',
      audioUrl: URL.createObjectURL(file),
      lyrics: '',
      bpm: 120,
      key: 'C Major'
    }));

    onUpload(newTracks);
    toast.success(`Загружено треков: ${newTracks.length}`);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" className="text-primary" />
          Загрузка треков
        </CardTitle>
        <CardDescription>
          Загрузите аудио файлы для подготовки к релизу
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-border/50 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Icon name="Music" size={48} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Перетащите файлы сюда
              </h3>
              <p className="text-muted-foreground">
                или нажмите кнопку ниже для выбора
              </p>
            </div>
            <Input
              type="file"
              multiple
              accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Icon name="FolderOpen" className="mr-2" />
                Выбрать файлы
              </label>
            </Button>
            <p className="text-sm text-muted-foreground">
              Поддерживаемые форматы: MP3, WAV, FLAC, M4A, OGG
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
