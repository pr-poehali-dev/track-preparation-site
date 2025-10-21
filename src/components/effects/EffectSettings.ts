export interface EffectSettings {
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

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
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
};
