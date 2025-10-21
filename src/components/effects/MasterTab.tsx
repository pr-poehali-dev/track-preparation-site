import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { EffectSettings } from './EffectSettings';

interface MasterTabProps {
  effects: EffectSettings;
  setEffects: React.Dispatch<React.SetStateAction<EffectSettings>>;
}

const MasterTab = ({ effects, setEffects }: MasterTabProps) => {
  return (
    <div className="space-y-4 pt-4">
      <Label className="font-semibold block">Мастеринг</Label>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
          <div>
            <Label className="text-sm font-semibold">Лимитер (-0.3 dB)</Label>
            <p className="text-xs text-muted-foreground">Защита от клиппинга</p>
          </div>
          <Switch
            checked={effects.master.limiter}
            onCheckedChange={(checked) =>
              setEffects(prev => ({ ...prev, master: { ...prev.master, limiter: checked } }))
            }
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
          <div>
            <Label className="text-sm font-semibold">Нормализация</Label>
            <p className="text-xs text-muted-foreground">Оптимизация громкости</p>
          </div>
          <Switch
            checked={effects.master.normalize}
            onCheckedChange={(checked) =>
              setEffects(prev => ({ ...prev, master: { ...prev.master, normalize: checked } }))
            }
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Fade In</Label>
            <span className="text-sm text-muted-foreground">{effects.master.fadeIn} сек</span>
          </div>
          <Slider
            value={[effects.master.fadeIn]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, master: { ...prev.master, fadeIn: val[0] } }))}
            min={0}
            max={10}
            step={0.1}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Fade Out</Label>
            <span className="text-sm text-muted-foreground">{effects.master.fadeOut} сек</span>
          </div>
          <Slider
            value={[effects.master.fadeOut]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, master: { ...prev.master, fadeOut: val[0] } }))}
            min={0}
            max={10}
            step={0.1}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm">Стереобаза</Label>
            <span className="text-sm text-muted-foreground">{effects.stereo.width}%</span>
          </div>
          <Slider
            value={[effects.stereo.width]}
            onValueChange={(val) => setEffects(prev => ({ ...prev, stereo: { ...prev.stereo, width: val[0] } }))}
            min={0}
            max={150}
          />
        </div>
      </div>
    </div>
  );
};

export default MasterTab;
