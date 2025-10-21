import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface TrimControlsProps {
  trimStart: number;
  trimEnd: number;
  duration: number;
  onTrimStartChange: (value: number) => void;
  onTrimEndChange: (value: number) => void;
  onApplyTrim: () => void;
  onResetTrim: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TrimControls = ({
  trimStart,
  trimEnd,
  duration,
  onTrimStartChange,
  onTrimEndChange,
  onApplyTrim,
  onResetTrim
}: TrimControlsProps) => {
  const startTime = (trimStart / 100) * duration;
  const endTime = (trimEnd / 100) * duration;
  const trimmedDuration = endTime - startTime;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Icon name="ScissorsLineDashed" size={16} className="text-primary" />
            Начало
          </Label>
          <Input
            type="number"
            value={trimStart.toFixed(1)}
            onChange={(e) => onTrimStartChange(Math.max(0, Math.min(parseFloat(e.target.value) || 0, trimEnd - 1)))}
            step="0.1"
            min="0"
            max={trimEnd - 1}
          />
          <p className="text-xs text-muted-foreground">{formatTime(startTime)}</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Icon name="ScissorsLineDashed" size={16} className="text-secondary" />
            Конец
          </Label>
          <Input
            type="number"
            value={trimEnd.toFixed(1)}
            onChange={(e) => onTrimEndChange(Math.max(trimStart + 1, Math.min(parseFloat(e.target.value) || 100, 100)))}
            step="0.1"
            min={trimStart + 1}
            max="100"
          />
          <p className="text-xs text-muted-foreground">{formatTime(endTime)}</p>
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Длительность после обрезки:</span>
          <span className="font-mono font-semibold">{formatTime(trimmedDuration)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onApplyTrim}
          className="flex-1 bg-gradient-to-r from-primary to-secondary"
        >
          <Icon name="Check" className="mr-2" size={18} />
          Применить обрезку
        </Button>
        
        <Button
          onClick={onResetTrim}
          variant="outline"
          className="flex-1"
        >
          <Icon name="RotateCcw" className="mr-2" size={18} />
          Сбросить
        </Button>
      </div>
    </div>
  );
};

export default TrimControls;
