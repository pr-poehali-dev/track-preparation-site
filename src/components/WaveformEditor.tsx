import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';

interface WaveformEditorProps {
  track: Track | null;
  onUpdate: (track: Track) => void;
}

const WaveformEditor = ({ track, onUpdate }: WaveformEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (track) {
      loadAudioData(track.audioUrl);
      setTrimStart(0);
      setTrimEnd(100);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [track]);

  const loadAudioData = async (url: string) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 500;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const multiplier = Math.pow(Math.max(...filteredData), -1);
      const normalizedData = filteredData.map(n => n * multiplier);
      setWaveformData(normalizedData);

      drawWaveform(normalizedData, 0);
    } catch (error) {
      console.error('Error loading audio:', error);
      toast.error('Ошибка загрузки аудио');
    }
  };

  const drawWaveform = (data: number[], playheadPosition: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const barWidth = width / data.length;

    ctx.clearRect(0, 0, width, height);

    const trimStartPos = (trimStart / 100) * width;
    const trimEndPos = (trimEnd / 100) * width;

    ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.fillRect(0, 0, trimStartPos, height);
    ctx.fillRect(trimEndPos, 0, width - trimEndPos, height);

    data.forEach((value, index) => {
      const barHeight = (value * (height - padding * 2)) / 2;
      const x = index * barWidth;
      const y = height / 2;

      const isInTrimRange = x >= trimStartPos && x <= trimEndPos;
      const gradient = ctx.createLinearGradient(0, y - barHeight, 0, y + barHeight);
      
      if (isInTrimRange) {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
        gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
      } else {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.2)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y - barHeight, barWidth - 1, barHeight * 2);
    });

    const playheadX = (playheadPosition / 100) * width;
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(trimStartPos, 0);
    ctx.lineTo(trimStartPos, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(trimEndPos, 0);
    ctx.lineTo(trimEndPos, height);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const togglePlayPause = () => {
    if (!track) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(track.audioUrl);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !track) return;
    const progress = (audioRef.current.currentTime / track.duration) * 100;
    setCurrentTime(progress);
    drawWaveform(waveformData, progress);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!track || !audioRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * track.duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(percentage);
    drawWaveform(waveformData, percentage);
  };

  const handleTrimStartChange = (value: number[]) => {
    const newStart = Math.min(value[0], trimEnd - 5);
    setTrimStart(newStart);
    drawWaveform(waveformData, currentTime);
  };

  const handleTrimEndChange = (value: number[]) => {
    const newEnd = Math.max(value[0], trimStart + 5);
    setTrimEnd(newEnd);
    drawWaveform(waveformData, currentTime);
  };

  const applyTrim = () => {
    if (!track) return;

    const startTime = (trimStart / 100) * track.duration;
    const endTime = (trimEnd / 100) * track.duration;
    const newDuration = endTime - startTime;

    toast.success(`Трек обрезан: ${startTime.toFixed(1)}с - ${endTime.toFixed(1)}с`);
  };

  const resetTrim = () => {
    setTrimStart(0);
    setTrimEnd(100);
    drawWaveform(waveformData, currentTime);
    toast.info('Обрезка сброшена');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="Waveform" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Выберите трек для редактирования формы волны</p>
        </CardContent>
      </Card>
    );
  }

  const startTime = (trimStart / 100) * track.duration;
  const endTime = (trimEnd / 100) * track.duration;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Waveform" className="text-primary" />
          Редактор формы волны
        </CardTitle>
        <CardDescription>
          {track.title} • {track.artist}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-48 bg-background/50 rounded-lg border border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} className="mr-2" />
            {isPlaying ? 'Пауза' : 'Воспроизвести'}
          </Button>

          <div className="text-sm text-muted-foreground">
            {formatTime((currentTime / 100) * track.duration)} / {formatTime(track.duration)}
          </div>
        </div>

        <div className="space-y-6 p-6 bg-background/50 rounded-lg border border-border/50">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Icon name="ScissorsLineDashed" size={16} className="text-primary" />
                Начало обрезки
              </label>
              <span className="text-sm text-muted-foreground">
                {formatTime(startTime)}
              </span>
            </div>
            <Slider
              value={[trimStart]}
              onValueChange={handleTrimStartChange}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Icon name="ScissorsLineDashed" size={16} className="text-secondary" />
                Конец обрезки
              </label>
              <span className="text-sm text-muted-foreground">
                {formatTime(endTime)}
              </span>
            </div>
            <Slider
              value={[trimEnd]}
              onValueChange={handleTrimEndChange}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-sm">
              <span className="text-muted-foreground">Длительность после обрезки: </span>
              <span className="font-semibold text-primary">
                {formatTime(endTime - startTime)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={applyTrim}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              <Icon name="Check" className="mr-2" size={16} />
              Применить обрезку
            </Button>
            <Button onClick={resetTrim} variant="outline">
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <Icon name="Timer" className="mx-auto mb-1 text-primary" size={20} />
            <p className="text-xs text-muted-foreground">Оригинал</p>
            <p className="font-semibold">{formatTime(track.duration)}</p>
          </div>
          <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg text-center">
            <Icon name="Scissors" className="mx-auto mb-1 text-secondary" size={20} />
            <p className="text-xs text-muted-foreground">После обрезки</p>
            <p className="font-semibold">{formatTime(endTime - startTime)}</p>
          </div>
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <Icon name="Percent" className="mx-auto mb-1 text-primary" size={20} />
            <p className="text-xs text-muted-foreground">Сохранено</p>
            <p className="font-semibold">{((trimEnd - trimStart)).toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaveformEditor;
