import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { EffectSettings } from './EffectSettings';

interface EqualizerTabProps {
  effects: EffectSettings;
  setEffects: React.Dispatch<React.SetStateAction<EffectSettings>>;
}

const EqualizerTab = ({ effects, setEffects }: EqualizerTabProps) => {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Эквалайзер</Label>
        <Switch
          checked={effects.equalizer.enabled}
          onCheckedChange={(checked) =>
            setEffects(prev => ({ ...prev, equalizer: { ...prev.equalizer, enabled: checked } }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Бас (60-250 Hz)</Label>
            <span className="text-sm text-muted-foreground">{effects.equalizer.bass > 0 ? '+' : ''}{effects.equalizer.bass} dB</span>
          </div>
          <Slider
            value={[effects.equalizer.bass]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, equalizer: { ...prev.equalizer, bass: val[0] } }))}
            min={-12}
            max={12}
            step={0.5}
            disabled={!effects.equalizer.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Средние (250-4k Hz)</Label>
            <span className="text-sm text-muted-foreground">{effects.equalizer.mid > 0 ? '+' : ''}{effects.equalizer.mid} dB</span>
          </div>
          <Slider
            value={[effects.equalizer.mid]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, equalizer: { ...prev.equalizer, mid: val[0] } }))}
            min={-12}
            max={12}
            step={0.5}
            disabled={!effects.equalizer.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Высокие (4k-12k Hz)</Label>
            <span className="text-sm text-muted-foreground">{effects.equalizer.treble > 0 ? '+' : ''}{effects.equalizer.treble} dB</span>
          </div>
          <Slider
            value={[effects.equalizer.treble]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, equalizer: { ...prev.equalizer, treble: val[0] } }))}
            min={-12}
            max={12}
            step={0.5}
            disabled={!effects.equalizer.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Присутствие (12k+ Hz)</Label>
            <span className="text-sm text-muted-foreground">{effects.equalizer.presence > 0 ? '+' : ''}{effects.equalizer.presence} dB</span>
          </div>
          <Slider
            value={[effects.equalizer.presence]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, equalizer: { ...prev.equalizer, presence: val[0] } }))}
            min={-12}
            max={12}
            step={0.5}
            disabled={!effects.equalizer.enabled}
          />
        </div>
      </div>
    </div>
  );
};

export default EqualizerTab;
