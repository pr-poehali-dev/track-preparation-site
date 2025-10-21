import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';
import { DEFAULT_EFFECT_SETTINGS } from './effects/EffectSettings';
import type { EffectSettings } from './effects/EffectSettings';
import { EFFECT_PRESETS } from './effects/EffectPresets';
import { analyzeAndGetSettings } from './effects/AutoAnalyzer';
import EqualizerTab from './effects/EqualizerTab';
import ReverbTab from './effects/ReverbTab';
import CompressorTab from './effects/CompressorTab';
import MasterTab from './effects/MasterTab';

interface AudioEffectsSectionProps {
  track: Track | null;
  onUpdate: (track: Track) => void;
}

const AudioEffectsSection = ({ track, onUpdate }: AudioEffectsSectionProps) => {
  const [effects, setEffects] = useState<EffectSettings>(DEFAULT_EFFECT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyPreset = (preset: { name: string; settings: Partial<EffectSettings> }) => {
    setEffects(prev => ({
      ...prev,
      ...preset.settings,
      reverb: { ...prev.reverb, ...preset.settings.reverb },
      equalizer: { ...prev.equalizer, ...preset.settings.equalizer },
      compressor: { ...prev.compressor, ...preset.settings.compressor },
      stereo: { ...prev.stereo, ...preset.settings.stereo },
      master: { ...prev.master, ...preset.settings.master }
    }));
    toast.success(`Применен пресет: ${preset.name}`);
  };

  const analyzeAndAutoApply = () => {
    if (!track) return;

    setIsProcessing(true);
    toast.info('Анализирую трек...');

    setTimeout(() => {
      const autoSettings = analyzeAndGetSettings(track);

      setEffects(prev => ({
        ...prev,
        ...autoSettings,
        reverb: { ...prev.reverb, ...autoSettings.reverb },
        equalizer: { ...prev.equalizer, ...autoSettings.equalizer },
        compressor: { ...prev.compressor, ...autoSettings.compressor },
        stereo: { ...prev.stereo, ...autoSettings.stereo },
        master: { ...prev.master, ...autoSettings.master }
      }));

      setIsProcessing(false);
    }, 1500);
  };

  const resetEffects = () => {
    setEffects(DEFAULT_EFFECT_SETTINGS);
    toast.info('Все эффекты сброшены');
  };

  const applyEffects = () => {
    if (!track) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Эффекты применены к треку!');
    }, 2000);
  };

  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="Sliders" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Выберите трек для применения аудио эффектов</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Sliders" className="text-primary" />
          Аудио эффекты и обработка
        </CardTitle>
        <CardDescription>
          {track.title} • {track.artist} • {track.genre}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            onClick={analyzeAndAutoApply}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
          >
            {isProcessing ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" />
                Анализирую...
              </>
            ) : (
              <>
                <Icon name="Sparkles" className="mr-2" />
                Автоматическая обработка
              </>
            )}
          </Button>
          <Button onClick={resetEffects} variant="outline">
            <Icon name="RotateCcw" size={16} />
          </Button>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="Info" className="text-primary mt-0.5 flex-shrink-0" size={16} />
            <div className="text-sm">
              <p className="font-semibold text-primary mb-1">Автоматическая обработка:</p>
              <p className="text-muted-foreground text-xs">
                Анализирует жанр, BPM и тональность трека, затем применяет оптимальные настройки эффектов для профессионального звучания
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-lg font-semibold mb-4 block">Быстрые пресеты</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EFFECT_PRESETS.map((preset, index) => (
              <Button
                key={index}
                onClick={() => applyPreset(preset)}
                variant="outline"
                className="h-auto py-3 flex flex-col items-start hover:border-primary/50"
              >
                <Icon name="Zap" size={14} className="mb-1 text-primary" />
                <span className="text-sm font-semibold">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="eq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="eq">Эквалайзер</TabsTrigger>
            <TabsTrigger value="reverb">Реверберация</TabsTrigger>
            <TabsTrigger value="comp">Компрессор</TabsTrigger>
            <TabsTrigger value="master">Мастеринг</TabsTrigger>
          </TabsList>

          <TabsContent value="eq">
            <EqualizerTab effects={effects} setEffects={setEffects} />
          </TabsContent>

          <TabsContent value="reverb">
            <ReverbTab effects={effects} setEffects={setEffects} />
          </TabsContent>

          <TabsContent value="comp">
            <CompressorTab effects={effects} setEffects={setEffects} />
          </TabsContent>

          <TabsContent value="master">
            <MasterTab effects={effects} setEffects={setEffects} />
          </TabsContent>
        </Tabs>

        <div className="pt-6 border-t border-border/50">
          <Button
            onClick={applyEffects}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Icon name="Check" className="mr-2" />
                Применить все эффекты
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioEffectsSection;
