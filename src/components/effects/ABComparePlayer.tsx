import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';

interface ABComparePlayerProps {
  track: Track;
  hasEffects: boolean;
}

const ABComparePlayer = ({ track, hasEffects }: ABComparePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<'A' | 'B'>('A');
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.audioUrl);
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const updateTime = () => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      updateTime();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const switchMode = (newMode: 'A' | 'B') => {
    if (!hasEffects && newMode === 'B') {
      toast.info('Сначала примените эффекты для сравнения');
      return;
    }

    const wasPlaying = isPlaying;
    const currentPosition = currentTime;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setMode(newMode);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = currentPosition;
        if (wasPlaying) {
          audioRef.current.play();
        }
      }
    }, 100);

    toast.success(newMode === 'A' ? '🎵 Оригинал' : '✨ С эффектами');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Headphones" className="text-primary" size={20} />
            <Label className="font-semibold">A/B Сравнение</Label>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'A' ? 'default' : 'outline'}
              onClick={() => switchMode('A')}
              className={mode === 'A' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
            >
              <Icon name="Music" size={14} className="mr-1" />
              A: Оригинал
            </Button>
            <Button
              size="sm"
              variant={mode === 'B' ? 'default' : 'outline'}
              onClick={() => switchMode('B')}
              className={mode === 'B' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
              disabled={!hasEffects}
            >
              <Icon name="Sparkles" size={14} className="mr-1" />
              B: С эффектами
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <Icon name="Volume2" className="text-muted-foreground" size={18} />
            <Slider
              value={[volume]}
              onValueChange={(val) => setVolume(val[0])}
              max={100}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{volume}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
          <div className={`p-3 rounded-lg border transition-all ${
            mode === 'A' 
              ? 'bg-primary/10 border-primary/50' 
              : 'bg-background/30 border-border/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Music" size={14} className={mode === 'A' ? 'text-primary' : 'text-muted-foreground'} />
              <span className="text-xs font-semibold">Режим A</span>
            </div>
            <p className="text-xs text-muted-foreground">Оригинальный трек</p>
          </div>

          <div className={`p-3 rounded-lg border transition-all ${
            mode === 'B' 
              ? 'bg-secondary/10 border-secondary/50' 
              : 'bg-background/30 border-border/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Sparkles" size={14} className={mode === 'B' ? 'text-secondary' : 'text-muted-foreground'} />
              <span className="text-xs font-semibold">Режим B</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {hasEffects ? 'Обработанный трек' : 'Примените эффекты'}
            </p>
          </div>
        </div>

        {!hasEffects && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" className="text-primary mt-0.5 flex-shrink-0" size={14} />
              <p className="text-xs text-muted-foreground">
                Примените эффекты, чтобы активировать режим B и сравнить звучание
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ABComparePlayer;
