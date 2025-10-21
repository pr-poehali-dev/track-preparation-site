import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { EffectSettings } from './EffectSettings';

interface CompressorTabProps {
  effects: EffectSettings;
  setEffects: React.Dispatch<React.SetStateAction<EffectSettings>>;
}

const CompressorTab = ({ effects, setEffects }: CompressorTabProps) => {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Компрессор</Label>
        <Switch
          checked={effects.compressor.enabled}
          onCheckedChange={(checked) =>
            setEffects(prev => ({ ...prev, compressor: { ...prev.compressor, enabled: checked } }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Порог (Threshold)</Label>
            <span className="text-sm text-muted-foreground">{effects.compressor.threshold} dB</span>
          </div>
          <Slider
            value={[effects.compressor.threshold]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, compressor: { ...prev.compressor, threshold: val[0] } }))}
            min={-40}
            max={0}
            disabled={!effects.compressor.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Соотношение (Ratio)</Label>
            <span className="text-sm text-muted-foreground">{effects.compressor.ratio}:1</span>
          </div>
          <Slider
            value={[effects.compressor.ratio]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, compressor: { ...prev.compressor, ratio: val[0] } }))}
            min={1}
            max={20}
            disabled={!effects.compressor.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Атака (Attack)</Label>
            <span className="text-sm text-muted-foreground">{effects.compressor.attack} ms</span>
          </div>
          <Slider
            value={[effects.compressor.attack]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, compressor: { ...prev.compressor, attack: val[0] } }))}
            min={0.1}
            max={100}
            step={0.1}
            disabled={!effects.compressor.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Восстановление (Release)</Label>
            <span className="text-sm text-muted-foreground">{effects.compressor.release} ms</span>
          </div>
          <Slider
            value={[effects.compressor.release]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, compressor: { ...prev.compressor, release: val[0] } }))}
            min={1}
            max={1000}
            disabled={!effects.compressor.enabled}
          />
        </div>
      </div>
    </div>
  );
};

export default CompressorTab;
