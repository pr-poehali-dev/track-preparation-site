import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { EffectSettings } from './EffectSettings';

interface ReverbTabProps {
  effects: EffectSettings;
  setEffects: React.Dispatch<React.SetStateAction<EffectSettings>>;
}

const ReverbTab = ({ effects, setEffects }: ReverbTabProps) => {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Реверберация</Label>
        <Switch
          checked={effects.reverb.enabled}
          onCheckedChange={(checked) =>
            setEffects(prev => ({ ...prev, reverb: { ...prev.reverb, enabled: checked } }))
          }
        />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Размер помещения</Label>
            <span className="text-sm text-muted-foreground">{effects.reverb.roomSize}%</span>
          </div>
          <Slider
            value={[effects.reverb.roomSize]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, reverb: { ...prev.reverb, roomSize: val[0] } }))}
            min={0}
            max={100}
            disabled={!effects.reverb.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Затухание</Label>
            <span className="text-sm text-muted-foreground">{effects.reverb.damping}%</span>
          </div>
          <Slider
            value={[effects.reverb.damping]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, reverb: { ...prev.reverb, damping: val[0] } }))}
            min={0}
            max={100}
            disabled={!effects.reverb.enabled}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Микс (Wet/Dry)</Label>
            <span className="text-sm text-muted-foreground">{effects.reverb.wetDry}%</span>
          </div>
          <Slider
            value={[effects.reverb.wetDry]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, reverb: { ...prev.reverb, wetDry: val[0] } }))}
            min={0}
            max={100}
            disabled={!effects.reverb.enabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ReverbTab;
