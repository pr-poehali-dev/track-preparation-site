import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';

interface WaveformEditorProps {
  track: Track | null;
  onUpdate: (track: Track, action?: string) => void;
}

const WaveformEditor = ({ track, onUpdate }: WaveformEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingRegion, setIsDraggingRegion] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [zoom, setZoom] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(1); // seconds

  useEffect(() => {
    if (track) {
      loadAudioData(track.audioUrl);
      setTrimStart(0);
      setTrimEnd(100);
      setZoom(1);
      setScrollOffset(0);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [track]);

  const loadAudioData = async (url: string) => {
    try {
      const context = new AudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      setDuration(audioBuffer.duration);

      // Генерируем больше точек для детализации
      const rawData = audioBuffer.getChannelData(0);
      const samples = 2000;
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

      // Initialize audio element
      const audio = new Audio(url);
      audio.volume = volume;
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audio.currentTime = 0;
      });
      audioRef.current = audio;
    } catch (error) {
      console.error('Error loading audio:', error);
      toast.error('Ошибка загрузки аудио');
    }
  };

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    if (duration > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridInterval = gridSize; // seconds
      const pixelsPerSecond = (width / duration) * zoom;
      
      for (let i = 0; i <= duration; i += gridInterval) {
        const x = (i * pixelsPerSecond) - scrollOffset;
        if (x >= 0 && x <= width) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          
          // Time labels
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(formatTime(i), x + 2, 12);
        }
      }
    }

    // Waveform
    const barWidth = (width / waveformData.length) * zoom;
    const trimStartX = (trimStart / 100) * width;
    const trimEndX = (trimEnd / 100) * width;

    waveformData.forEach((value, index) => {
      const x = (index * barWidth) - scrollOffset;
      if (x < -barWidth || x > width) return;

      const barHeight = (value * (height * 0.8)) / 2;
      const y = height / 2;

      const isInTrimRange = x >= trimStartX && x <= trimEndX;
      const gradient = ctx.createLinearGradient(0, y - barHeight, 0, y + barHeight);
      
      if (isInTrimRange) {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.9)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(100, 100, 100, 0.3)');
        gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 100, 100, 0.3)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y - barHeight, Math.max(barWidth - 0.5, 1), barHeight * 2);
    });

    // Trim region overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, trimStartX, height);
    ctx.fillRect(trimEndX, 0, width - trimEndX, height);

    // Trim markers
    const markerHeight = height;
    
    // Start marker
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fillRect(trimStartX - 2, 0, 4, markerHeight);
    ctx.fillStyle = 'rgba(139, 92, 246, 1)';
    ctx.fillRect(trimStartX - 6, 0, 12, 30);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀', trimStartX, 20);

    // End marker
    ctx.fillStyle = 'rgba(251, 146, 60, 0.3)';
    ctx.fillRect(trimEndX - 2, 0, 4, markerHeight);
    ctx.fillStyle = 'rgba(251, 146, 60, 1)';
    ctx.fillRect(trimEndX - 6, 0, 12, 30);
    ctx.fillStyle = 'white';
    ctx.fillText('▶', trimEndX, 20);

    // Playhead
    if (duration > 0) {
      const playheadX = ((currentTime / duration) * width);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      
      // Playhead circle
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(playheadX, 15, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'start';
  }, [waveformData, trimStart, trimEnd, currentTime, duration, zoom, scrollOffset, gridSize]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const snapValue = (value: number) => {
    if (!snapToGrid || duration === 0) return value;
    const timeValue = (value / 100) * duration;
    const snappedTime = Math.round(timeValue / gridSize) * gridSize;
    return (snappedTime / duration) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    const startX = (trimStart / 100) * rect.width;
    const endX = (trimEnd / 100) * rect.width;

    if (Math.abs(x - startX) < 15) {
      setIsDraggingStart(true);
    } else if (Math.abs(x - endX) < 15) {
      setIsDraggingEnd(true);
    } else if (x > startX && x < endX) {
      setIsDraggingRegion(true);
      setDragStartX(percentage);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    if (isDraggingStart) {
      const snapped = snapValue(percentage);
      setTrimStart(Math.min(snapped, trimEnd - 0.5));
    } else if (isDraggingEnd) {
      const snapped = snapValue(percentage);
      setTrimEnd(Math.max(snapped, trimStart + 0.5));
    } else if (isDraggingRegion) {
      const delta = percentage - dragStartX;
      const regionSize = trimEnd - trimStart;
      
      let newStart = trimStart + delta;
      let newEnd = trimEnd + delta;
      
      if (newStart < 0) {
        newStart = 0;
        newEnd = regionSize;
      } else if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - regionSize;
      }
      
      setTrimStart(newStart);
      setTrimEnd(newEnd);
      setDragStartX(percentage);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    setIsDraggingRegion(false);
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playSelection = async () => {
    if (!audioRef.current) return;
    
    const startTime = (trimStart / 100) * duration;
    audioRef.current.currentTime = startTime;
    await audioRef.current.play();
    setIsPlaying(true);

    const checkEnd = setInterval(() => {
      if (audioRef.current) {
        const endTime = (trimEnd / 100) * duration;
        if (audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          setIsPlaying(false);
          clearInterval(checkEnd);
        }
      }
    }, 100);
  };

  const handleTimeInput = (value: string, type: 'start' | 'end') => {
    const parts = value.split(':');
    if (parts.length !== 2) return;
    
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    const totalSeconds = mins * 60 + secs;
    const percentage = (totalSeconds / duration) * 100;
    
    if (type === 'start') {
      setTrimStart(Math.min(percentage, trimEnd - 0.5));
    } else {
      setTrimEnd(Math.max(percentage, trimStart + 0.5));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const applyTrim = () => {
    if (!track) return;
    toast.success(`Трек обрезан: ${formatTime((trimStart / 100) * duration)} - ${formatTime((trimEnd / 100) * duration)}`);
    onUpdate(track, 'Трек обрезан');
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

  const startTime = (trimStart / 100) * duration;
  const endTime = (trimEnd / 100) * duration;
  const selectionDuration = endTime - startTime;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Waveform" className="text-primary" />
          Профессиональный редактор формы волны
        </CardTitle>
        <CardDescription>
          {track.title} • {track.artist} • {formatTime(duration)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
          <div>
            <Label className="text-xs text-muted-foreground">Начало</Label>
            <div className="text-lg font-bold text-primary">{formatTime(startTime)}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Конец</Label>
            <div className="text-lg font-bold text-secondary">{formatTime(endTime)}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Длительность</Label>
            <div className="text-lg font-bold">{formatTime(selectionDuration)}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Текущее время</Label>
            <div className="text-lg font-bold text-green-500">{formatTime(currentTime)}</div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative"
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-64 rounded-lg border-2 border-border/50 cursor-crosshair hover:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} className="mr-2" size={20} />
            {isPlaying ? 'Пауза' : 'Воспроизвести'}
          </Button>

          <Button
            onClick={playSelection}
            size="lg"
            variant="outline"
          >
            <Icon name="Play" className="mr-2" size={20} />
            Прослушать выделение
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Label className="text-sm">Сетка:</Label>
            <Button
              onClick={() => setSnapToGrid(!snapToGrid)}
              variant={snapToGrid ? 'default' : 'outline'}
              size="sm"
            >
              <Icon name="Grid3x3" size={16} />
            </Button>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(parseFloat(e.target.value))}
              className="px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="0.1">0.1с</option>
              <option value="0.5">0.5с</option>
              <option value="1">1с</option>
              <option value="5">5с</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/50">
            <Label className="font-semibold flex items-center gap-2">
              <Icon name="Scissors" className="text-primary" size={16} />
              Точная обрезка
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Начало (мм:сс)</Label>
                <Input
                  type="text"
                  placeholder="0:00"
                  defaultValue={`${Math.floor(startTime / 60)}:${Math.floor(startTime % 60).toString().padStart(2, '0')}`}
                  onBlur={(e) => handleTimeInput(e.target.value, 'start')}
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Конец (мм:сс)</Label>
                <Input
                  type="text"
                  placeholder="0:00"
                  defaultValue={`${Math.floor(endTime / 60)}:${Math.floor(endTime % 60).toString().padStart(2, '0')}`}
                  onBlur={(e) => handleTimeInput(e.target.value, 'end')}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/50">
            <Label className="font-semibold flex items-center gap-2">
              <Icon name="Settings" className="text-secondary" size={16} />
              Быстрые действия
            </Label>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => { setTrimStart(0); setTrimEnd(100); }}
                variant="outline"
                size="sm"
              >
                <Icon name="Maximize2" className="mr-2" size={14} />
                Весь трек
              </Button>
              <Button
                onClick={() => {
                  const fadeTime = 2;
                  setTrimStart(0);
                  setTrimEnd(Math.min(100, (fadeTime / duration) * 100));
                }}
                variant="outline"
                size="sm"
              >
                <Icon name="Volume" className="mr-2" size={14} />
                Fade In (2с)
              </Button>
              <Button
                onClick={() => {
                  const fadeTime = 2;
                  setTrimStart(Math.max(0, 100 - (fadeTime / duration) * 100));
                  setTrimEnd(100);
                }}
                variant="outline"
                size="sm"
              >
                <Icon name="VolumeX" className="mr-2" size={14} />
                Fade Out (2с)
              </Button>
              <Button
                onClick={() => {
                  setTrimStart(25);
                  setTrimEnd(75);
                }}
                variant="outline"
                size="sm"
              >
                <Icon name="Disc" className="mr-2" size={14} />
                Середина 50%
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            onClick={applyTrim}
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            <Icon name="Check" className="mr-2" size={20} />
            Применить обрезку
          </Button>
          <Button
            onClick={() => { setTrimStart(0); setTrimEnd(100); }}
            variant="outline"
            size="lg"
          >
            <Icon name="RotateCcw" size={20} />
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Icon name="Info" className="text-primary mt-0.5 flex-shrink-0" size={16} />
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-primary mb-1">Профессиональные функции:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Перетаскивайте маркеры ◀▶ для точной обрезки</li>
              <li>Кликните по выделенной области для перемещения региона</li>
              <li>Используйте сетку для выравнивания по времени</li>
              <li>Вводите точное время в формате мм:сс</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaveformEditor;
