import type { EffectSettings } from './EffectSettings';

export const EFFECT_PRESETS: { name: string; settings: Partial<EffectSettings> }[] = [
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
];
