import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface EditorControlsProps {
  zoom: number;
  scrollOffset: number;
  snapToGrid: boolean;
  gridSize: number;
  onZoomChange: (zoom: number) => void;
  onScrollChange: (offset: number) => void;
  onSnapToggle: (snap: boolean) => void;
  onGridSizeChange: (size: number) => void;
}

const EditorControls = ({
  zoom,
  scrollOffset,
  snapToGrid,
  gridSize,
  onZoomChange,
  onScrollChange,
  onSnapToggle,
  onGridSizeChange
}: EditorControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Icon name="ZoomIn" size={16} />
          Масштаб: {zoom.toFixed(1)}x
        </Label>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onZoomChange(Math.max(1, zoom - 0.5))}
            variant="outline"
            size="sm"
          >
            <Icon name="ZoomOut" size={16} />
          </Button>
          <Slider
            value={[zoom]}
            onValueChange={(values) => onZoomChange(values[0])}
            min={1}
            max={10}
            step={0.5}
            className="flex-1"
          />
          <Button
            onClick={() => onZoomChange(Math.min(10, zoom + 0.5))}
            variant="outline"
            size="sm"
          >
            <Icon name="ZoomIn" size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Icon name="Move" size={16} />
          Прокрутка
        </Label>
        <Slider
          value={[scrollOffset]}
          onValueChange={(values) => onScrollChange(values[0])}
          min={0}
          max={1000}
          step={10}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <Label className="flex items-center gap-2 cursor-pointer" htmlFor="snap-to-grid">
          <Icon name="Grid3x3" size={16} />
          Привязка к сетке
        </Label>
        <Switch
          id="snap-to-grid"
          checked={snapToGrid}
          onCheckedChange={onSnapToggle}
        />
      </div>

      {snapToGrid && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Icon name="Grid3x3" size={16} />
            Размер сетки: {gridSize}с
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 2, 5].map((size) => (
              <Button
                key={size}
                onClick={() => onGridSizeChange(size)}
                variant={gridSize === size ? "default" : "outline"}
                size="sm"
              >
                {size}с
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorControls;
