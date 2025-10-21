import { toast } from 'sonner';
import type { Track } from '@/pages/Index';
import type { EffectSettings } from './EffectSettings';

export const analyzeAndGetSettings = (track: Track): Partial<EffectSettings> => {
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

  return autoSettings;
};
