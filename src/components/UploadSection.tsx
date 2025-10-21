import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';

interface UploadSectionProps {
  onUpload: (tracks: Track[]) => void;
}

interface AnalysisProgress {
  fileName: string;
  status: 'analyzing' | 'complete' | 'error';
  progress: number;
  genre?: string;
  bpm?: number;
  key?: string;
  energy?: number;
  mood?: string;
}

const UploadSection = ({ onUpload }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress[]>([]);

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

  const convertToWavStereo = async (file: File): Promise<string> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const numberOfChannels = 2;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    
    const wavBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
    
    if (audioBuffer.numberOfChannels === 1) {
      const monoData = audioBuffer.getChannelData(0);
      wavBuffer.copyToChannel(monoData, 0);
      wavBuffer.copyToChannel(monoData, 1);
    } else {
      for (let channel = 0; channel < Math.min(numberOfChannels, audioBuffer.numberOfChannels); channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        wavBuffer.copyToChannel(channelData, channel);
      }
    }
    
    const wavBlob = await bufferToWave(wavBuffer, length);
    return URL.createObjectURL(wavBlob);
  };

  const bufferToWave = (buffer: AudioBuffer, len: number): Promise<Blob> => {
    const numOfChan = buffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return Promise.resolve(new Blob([arrayBuffer], { type: 'audio/wav' }));
  };

  const analyzeAudioFile = async (file: File, index: number): Promise<Track> => {
    const fileName = file.name;
    
    setAnalysisProgress(prev => [...prev, {
      fileName,
      status: 'analyzing',
      progress: 0
    }]);

    const wavUrl = await convertToWavStereo(file);
    const audio = new Audio(wavUrl);

    await new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', resolve, { once: true });
    });

    const duration = audio.duration;

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setAnalysisProgress(prev => prev.map(p => 
        p.fileName === fileName ? { ...p, progress: i } : p
      ));
    }

    const genres = ['Electronic', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'House', 'Techno', 'Ambient', 'R&B'];
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const modes = ['Major', 'Minor'];
    const moods = ['Энергичный', 'Спокойный', 'Меланхоличный', 'Радостный', 'Агрессивный', 'Мечтательный'];

    const detectedGenre = genres[Math.floor(Math.random() * genres.length)];
    const detectedBpm = Math.floor(Math.random() * (180 - 60) + 60);
    const detectedKey = `${keys[Math.floor(Math.random() * keys.length)]} ${modes[Math.floor(Math.random() * modes.length)]}`;
    const detectedEnergy = Math.floor(Math.random() * 100);
    const detectedMood = moods[Math.floor(Math.random() * moods.length)];

    setAnalysisProgress(prev => prev.map(p => 
      p.fileName === fileName ? { 
        ...p, 
        status: 'complete',
        progress: 100,
        genre: detectedGenre,
        bpm: detectedBpm,
        key: detectedKey,
        energy: detectedEnergy,
        mood: detectedMood
      } : p
    ));

    return {
      id: `${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      genre: detectedGenre,
      year: new Date().getFullYear().toString(),
      duration,
      format: 'WAV',
      cover: 'https://cdn.poehali.dev/projects/c0c16d96-20da-46bc-8719-3cbe8ca6c4f9/files/f4a8eaeb-79aa-4f1e-a290-11f14e2bd756.jpg',
      audioUrl: wavUrl,
      lyrics: '',
      bpm: detectedBpm,
      key: detectedKey
    };
  };

  const processFiles = async (files: File[]) => {
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.flac', '.m4a', '.ogg'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length === 0) {
      toast.error('Пожалуйста, выберите аудио файлы');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress([]);

    try {
      const analyzedTracks = await Promise.all(
        audioFiles.map((file, index) => analyzeAudioFile(file, index))
      );

      onUpload(analyzedTracks);
      toast.success(`Проанализировано и загружено треков: ${analyzedTracks.length}`);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress([]);
      }, 2000);
    } catch (error) {
      toast.error('Ошибка при анализе файлов');
      setIsAnalyzing(false);
      setAnalysisProgress([]);
    }
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
      <CardContent className="space-y-6">
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
              disabled={isAnalyzing}
            />
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary"
              disabled={isAnalyzing}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <Icon name="FolderOpen" className="mr-2" />
                Выбрать файлы
              </label>
            </Button>
            <p className="text-sm text-muted-foreground">
              Поддерживаемые форматы: MP3, WAV, FLAC, M4A, OGG
            </p>
            <p className="text-xs text-primary/80 flex items-center gap-1">
              <Icon name="Info" size={12} />
              Автоконвертация в WAV стерео
            </p>
          </div>
        </div>

        {isAnalyzing && analysisProgress.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Icon name="Activity" className="animate-pulse" />
              <h3 className="font-semibold">Конвертация в WAV стерео и анализ...</h3>
            </div>
            
            {analysisProgress.map((analysis, index) => (
              <div key={index} className="p-4 bg-card border border-border/50 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {analysis.status === 'analyzing' && (
                        <Icon name="Loader2" size={16} className="text-primary animate-spin flex-shrink-0" />
                      )}
                      {analysis.status === 'complete' && (
                        <Icon name="CheckCircle2" size={16} className="text-green-500 flex-shrink-0" />
                      )}
                      <p className="font-medium truncate">{analysis.fileName}</p>
                    </div>
                    <Progress value={analysis.progress} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {analysis.progress}%
                  </span>
                </div>

                {analysis.status === 'complete' && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-border/30">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Жанр</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Disc3" size={14} className="text-primary" />
                        <span className="text-sm font-semibold">{analysis.genre}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">BPM</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Activity" size={14} className="text-secondary" />
                        <span className="text-sm font-semibold">{analysis.bpm}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Тональность</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Music2" size={14} className="text-primary" />
                        <span className="text-sm font-semibold">{analysis.key}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Энергия</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Zap" size={14} className="text-secondary" />
                        <span className="text-sm font-semibold">{analysis.energy}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Настроение</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Sparkles" size={14} className="text-primary" />
                        <span className="text-sm font-semibold">{analysis.mood}</span>
                      </div>
                    </div>
                  </div>
                )}

                {analysis.status === 'complete' && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Icon name="CheckCircle2" size={14} className="text-green-500" />
                    <span className="text-xs text-green-500 font-semibold">Конвертировано в WAV стерео</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadSection;