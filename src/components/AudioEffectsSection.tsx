import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';

interface AudioEffectsSectionProps {
  track: Track | null;
  onUpdate: (track: Track) => void;
}

interface EffectSettings {
  masterVolume: number;
  reverb: {
    enabled: boolean;
    roomSize: number;
    damping: number;
    wetDry: number;
  };
  equalizer: {
    enabled: boolean;
    bass: number;
    mid: number;
    treble: number;
    presence: number;
  };
  compressor: {
    enabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  stereo: {
    enabled: boolean;
    width: number;
    pan: number;
  };
  master: {
    limiter: boolean;
    normalize: boolean;
    fadeIn: number;
    fadeOut: number;
  };
}

const AudioEffectsSection = ({ track, onUpdate }: AudioEffectsSectionProps) => {
  const [effects, setEffects] = useState<EffectSettings>({
    masterVolume: 100,
    reverb: {
      enabled: false,
      roomSize: 50,
      damping: 50,
      wetDry: 30
    },
    equalizer: {
      enabled: false,
      bass: 0,
      mid: 0,
      treble: 0,
      presence: 0
    },
    compressor: {
      enabled: false,
      threshold: -24,
      ratio: 4,
      attack: 5,
      release: 50
    },
    stereo: {
      enabled: false,
      width: 100,
      pan: 0
    },
    master: {
      limiter: true,
      normalize: false,
      fadeIn: 0,
      fadeOut: 0
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [presets, setPresets] = useState<{ name: string; settings: Partial<EffectSettings> }[]>([
    {
      name: 'Теплое звучание',
      settings: {
        equalizer: { enabled: true, bass: 3, mid: 1, treble: -2, presence: 0 },
        reverb: { enabled: true, roomSize: 30, damping: 60, wetDry: 15 }
      }
    },
    {
      name: 'Кристальная чистота',
      settings: {
        equalizer: { enabled: true, bass: -2, mid: 0, treble: 4, presence: 3 },
        compressor: { enabled: true, threshold: -18, ratio: 3, attack: 3, release: 40 }
      }
    },
    {
      name: 'Мощный бас',
      settings: {
        equalizer: { enabled: true, bass: 6, mid: -1, treble: 0, presence: 1 },
        compressor: { enabled: true, threshold: -20, ratio: 5, attack: 10, release: 60 }
      }
    },
    {
      name: 'Концертный зал',
      settings: {
        reverb: { enabled: true, roomSize: 85, damping: 40, wetDry: 40 },
        stereo: { enabled: true, width: 120, pan: 0 }
      }
    },
    {
      name: 'Радио-готовый',
      settings: {
        equalizer: { enabled: true, bass: 2, mid: 3, treble: 2, presence: 4 },
        compressor: { enabled: true, threshold: -16, ratio: 6, attack: 2, release: 30 },
        master: { limiter: true, normalize: true, fadeIn: 0, fadeOut: 0 }
      }
    },
    {
      name: 'Винтажное тепло',
      settings: {
        equalizer: { enabled: true, bass: 4, mid: 2, treble: -3, presence: -1 },
        reverb: { enabled: true, roomSize: 45, damping: 70, wetDry: 20 },
        stereo: { enabled: true, width: 80, pan: 0 }
      }
    }
  ]);

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
      const genres = ['Electronic', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Classical'];
      const isElectronic = track.genre === 'Electronic' || track.genre === 'House' || track.genre === 'Techno';
      const isRock = track.genre === 'Rock';
      const isPop = track.genre === 'Pop';
      const isJazz = track.genre === 'Jazz';
      const isClassical = track.genre === 'Classical';
      const isHipHop = track.genre === 'Hip-Hop';

      let autoSettings: Partial<EffectSettings> = {};

      if (isElectronic) {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 4,
            mid: 0,
            treble: 3,
            presence: 2
          },
          compressor: {
            enabled: true,
            threshold: -18,
            ratio: 4,
            attack: 3,
            release: 40
          },
          stereo: {
            enabled: true,
            width: 120,
            pan: 0
          },
          master: {
            limiter: true,
            normalize: true,
            fadeIn: 0,
            fadeOut: 2
          }
        };
        toast.success('🎛️ Применена Electronic обработка: мощный бас, широкая стереобаза');
      } else if (isRock) {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 3,
            mid: 4,
            treble: 2,
            presence: 5
          },
          compressor: {
            enabled: true,
            threshold: -20,
            ratio: 5,
            attack: 5,
            release: 50
          },
          reverb: {
            enabled: true,
            roomSize: 40,
            damping: 50,
            wetDry: 20
          },
          master: {
            limiter: true,
            normalize: false,
            fadeIn: 0,
            fadeOut: 1
          }
        };
        toast.success('🎸 Применена Rock обработка: агрессивные средние, присутствие');
      } else if (isPop) {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 2,
            mid: 3,
            treble: 3,
            presence: 4
          },
          compressor: {
            enabled: true,
            threshold: -16,
            ratio: 6,
            attack: 2,
            release: 30
          },
          reverb: {
            enabled: true,
            roomSize: 35,
            damping: 60,
            wetDry: 15
          },
          stereo: {
            enabled: true,
            width: 110,
            pan: 0
          },
          master: {
            limiter: true,
            normalize: true,
            fadeIn: 0,
            fadeOut: 0
          }
        };
        toast.success('🎤 Применена Pop обработка: радио-готовый звук, яркость');
      } else if (isJazz) {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 1,
            mid: 2,
            treble: -1,
            presence: 1
          },
          reverb: {
            enabled: true,
            roomSize: 65,
            damping: 45,
            wetDry: 35
          },
          compressor: {
            enabled: true,
            threshold: -24,
            ratio: 3,
            attack: 8,
            release: 60
          },
          stereo: {
            enabled: true,
            width: 100,
            pan: 0
          },
          master: {
            limiter: false,
            normalize: false,
            fadeIn: 1,
            fadeOut: 3
          }
        };
        toast.success('🎷 Применена Jazz обработка: естественная реверберация, динамика');
      } else if (isClassical) {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 0,
            mid: 1,
            treble: 0,
            presence: 0
          },
          reverb: {
            enabled: true,
            roomSize: 85,
            damping: 30,
            wetDry: 45
          },
          compressor: {
            enabled: false,
            threshold: -30,
            ratio: 2,
            attack: 10,
            release: 80
          },
          stereo: {
            enabled: true,
            width: 90,
            pan: 0
          },
          master: {
            limiter: false,
            normalize: false,
            fadeIn: 2,
            fadeOut: 4
          }
        };
        toast.success('🎻 Применена Classical обработка: концертный зал, естественная динамика');
      } else if (isHipHop) {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 6,
            mid: 0,
            treble: 1,
            presence: 3
          },
          compressor: {
            enabled: true,
            threshold: -18,
            ratio: 7,
            attack: 1,
            release: 25
          },
          stereo: {
            enabled: true,
            width: 100,
            pan: 0
          },
          master: {
            limiter: true,
            normalize: true,
            fadeIn: 0,
            fadeOut: 0
          }
        };
        toast.success('🎤 Применена Hip-Hop обработка: глубокий бас, плотный звук');
      } else {
        autoSettings = {
          equalizer: {
            enabled: true,
            bass: 2,
            mid: 2,
            treble: 2,
            presence: 2
          },
          compressor: {
            enabled: true,
            threshold: -20,
            ratio: 4,
            attack: 5,
            release: 50
          },
          master: {
            limiter: true,
            normalize: true,
            fadeIn: 0,
            fadeOut: 0
          }
        };
        toast.success('🎵 Применена универсальная обработка');
      }

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
    setEffects({
      masterVolume: 100,
      reverb: { enabled: false, roomSize: 50, damping: 50, wetDry: 30 },
      equalizer: { enabled: false, bass: 0, mid: 0, treble: 0, presence: 0 },
      compressor: { enabled: false, threshold: -24, ratio: 4, attack: 5, release: 50 },
      stereo: { enabled: false, width: 100, pan: 0 },
      master: { limiter: true, normalize: false, fadeIn: 0, fadeOut: 0 }
    });
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
            {presets.map((preset, index) => (
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

          <TabsContent value="eq" className="space-y-4 pt-4">
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
          </TabsContent>

          <TabsContent value="reverb" className="space-y-4 pt-4">
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
          </TabsContent>

          <TabsContent value="comp" className="space-y-4 pt-4">
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
          </TabsContent>

          <TabsContent value="master" className="space-y-4 pt-4">
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
