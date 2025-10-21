import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlaybackControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onStop,
  onSeek,
  onVolumeChange
}: PlaybackControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={onPlayPause}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <Icon name={isPlaying ? "Pause" : "Play"} className="mr-2" size={20} />
          {isPlaying ? 'Пауза' : 'Воспроизвести'}
        </Button>
        
        <Button
          onClick={onStop}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <Icon name="Square" className="mr-2" size={20} />
          Стоп
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
          onValueChange={(values) => {
            const newTime = (values[0] / 100) * duration;
            onSeek(newTime);
          }}
          max={100}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Icon name="Volume2" size={16} />
          Громкость: {Math.round(volume * 100)}%
        </Label>
        <Slider
          value={[volume * 100]}
          onValueChange={(values) => onVolumeChange(values[0] / 100)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PlaybackControls;
