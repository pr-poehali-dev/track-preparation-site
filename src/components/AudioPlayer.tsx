import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';

interface AudioPlayerProps {
  track: Track;
}

const AudioPlayer = ({ track }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [track]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card/95 backdrop-blur-md border-t border-border/50 shadow-2xl">
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 w-64">
            <img
              src={track.cover}
              alt={track.title}
              className="w-14 h-14 rounded-md object-cover shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate text-sm">{track.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 hover:scale-110 transition-all"
                onClick={togglePlay}
              >
                <Icon name={isPlaying ? 'Pause' : 'Play'} className="text-primary" />
              </Button>

              <span className="text-xs text-muted-foreground w-12 text-right">
                {formatTime(currentTime)}
              </span>

              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />

              <span className="text-xs text-muted-foreground w-12">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex justify-center gap-1">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-primary/30 to-secondary/30 rounded-full transition-all"
                  style={{
                    height: `${isPlaying ? Math.random() * 20 + 8 : 8}px`,
                    opacity: currentTime / duration > i / 50 ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-48">
            <Icon name="Volume2" className="text-muted-foreground" size={20} />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
