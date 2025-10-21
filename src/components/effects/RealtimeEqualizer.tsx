import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';

interface RealtimeEqualizerProps {
  track: Track;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

const RealtimeEqualizer = ({ track, enabled, onEnabledChange }: RealtimeEqualizerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [bands, setBands] = useState<EQBand[]>([
    { frequency: 60, gain: 0, label: 'Суб-бас' },
    { frequency: 170, gain: 0, label: 'Бас' },
    { frequency: 310, gain: 0, label: 'Низ-сред' },
    { frequency: 600, gain: 0, label: 'Средние' },
    { frequency: 1000, gain: 0, label: 'Сред' },
    { frequency: 3000, gain: 0, label: 'Верх-сред' },
    { frequency: 6000, gain: 0, label: 'Присутств.' },
    { frequency: 12000, gain: 0, label: 'Высокие' },
    { frequency: 14000, gain: 0, label: 'Воздух' },
  ]);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioElement = new Audio(track.audioUrl);
    audioElement.crossOrigin = 'anonymous';
    audioElementRef.current = audioElement;

    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', () => {
      setCurrentTime(audioElement.currentTime);
    });

    audioElement.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    const audioContext = audioContextRef.current;
    const source = audioContext.createMediaElementSource(audioElement);
    sourceNodeRef.current = source;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNodeRef.current = gainNode;

    filtersRef.current = bands.map((band) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = band.frequency;
      filter.Q.value = 1.0;
      filter.gain.value = band.gain;
      return filter;
    });

    let currentNode: AudioNode = source;
    filtersRef.current.forEach((filter) => {
      currentNode.connect(filter);
      currentNode = filter;
    });

    currentNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return () => {
      audioElement.pause();
      audioElement.src = '';
      source.disconnect();
      filtersRef.current.forEach(filter => filter.disconnect());
      gainNode.disconnect();
    };
  }, [track.audioUrl]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    bands.forEach((band, index) => {
      if (filtersRef.current[index]) {
        filtersRef.current[index].gain.value = enabled ? band.gain : 0;
      }
    });
  }, [bands, enabled]);

  const handleBandChange = (index: number, gain: number) => {
    setBands(prev => prev.map((band, i) => i === index ? { ...band, gain } : band));
  };

  const togglePlayPause = async () => {
    const audio = audioElementRef.current;
    if (!audio) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audio.pause();
    } else {
      await audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetEQ = () => {
    setBands(prev => prev.map(band => ({ ...band, gain: 0 })));
  };

  const handleSeek = (value: number[]) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-lg font-semibold">Реал-тайм эквалайзер</Label>
          <div className="px-2 py-1 bg-primary/20 rounded text-xs font-semibold text-primary">
            Live Preview
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      <div className="p-4 bg-background/50 border border-border/50 rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlayPause}
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
          </Button>

          <div className="flex-1 space-y-2">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-32">
            <Icon name="Volume2" size={16} className="text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={(val) => setVolume(val[0] / 100)}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-background/80 to-primary/5 border border-border/50 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon name="Sliders" className="text-primary" size={20} />
            <span className="font-semibold">9-полосный эквалайзер</span>
          </div>
          <Button onClick={resetEQ} variant="outline" size="sm">
            <Icon name="RotateCcw" className="mr-2" size={14} />
            Сбросить
          </Button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {bands.map((band, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-center">{band.label}</div>
              <div className="text-xs text-muted-foreground mb-2">{band.frequency}Hz</div>
              
              <div className="relative h-48 w-full flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-lg" />
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={band.gain}
                  onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                  disabled={!enabled}
                  className="h-full w-8 appearance-none bg-transparent cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
                  style={{
                    background: `linear-gradient(to top, 
                      hsl(var(--primary)) 0%, 
                      hsl(var(--primary) / 0.5) 50%, 
                      hsl(var(--secondary)) 100%)`
                  }}
                />
              </div>
              
              <div className={`text-sm font-bold min-w-[3rem] text-center ${
                band.gain > 0 ? 'text-green-500' : band.gain < 0 ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)} dB
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Icon name="Info" className="text-primary mt-0.5 flex-shrink-0" size={16} />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">Реал-тайм режим:</span> Изменяйте частоты во время воспроизведения и слышите результат мгновенно. 
          Используйте для точной настройки звучания трека.
        </p>
      </div>
    </div>
  );
};

export default RealtimeEqualizer;
