import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from '@/pages/Index';
import WaveformCanvas from './waveform/WaveformCanvas';
import PlaybackControls from './waveform/PlaybackControls';
import TrimControls from './waveform/TrimControls';
import EditorControls from './waveform/EditorControls';
import { useAudioPlayer } from './waveform/useAudioPlayer';
import { useWaveformInteraction } from './waveform/useWaveformInteraction';

interface WaveformEditorProps {
  track: Track | null;
  onUpdate: (track: Track, action?: string) => void;
}

const WaveformEditor = ({ track, onUpdate }: WaveformEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(1);

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    waveformData,
    togglePlayPause,
    stop,
    seek,
    changeVolume
  } = useAudioPlayer(track?.audioUrl || null);

  const {
    trimStart,
    trimEnd,
    setTrimStart,
    setTrimEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetTrim
  } = useWaveformInteraction({ duration, snapToGrid, gridSize });

  const applyTrim = async () => {
    if (!track) return;

    try {
      const startTime = (trimStart / 100) * duration;
      const endTime = (trimEnd / 100) * duration;

      const response = await fetch(track.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const startSample = Math.floor(startTime * audioBuffer.sampleRate);
      const endSample = Math.floor(endTime * audioBuffer.sampleRate);
      const newLength = endSample - startSample;
      
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < newLength; i++) {
          newData[i] = oldData[startSample + i];
        }
      }
      
      const offlineContext = new OfflineAudioContext(
        trimmedBuffer.numberOfChannels,
        trimmedBuffer.length,
        trimmedBuffer.sampleRate
      );
      
      const source = offlineContext.createBufferSource();
      source.buffer = trimmedBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      
      const wav = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const newUrl = URL.createObjectURL(blob);
      
      const updatedTrack = {
        ...track,
        audioUrl: newUrl,
        duration: renderedBuffer.duration
      };
      
      onUpdate(updatedTrack, 'trim');
      resetTrim();
      
      toast.success('Обрезка применена успешно');
    } catch (error) {
      console.error('Trim error:', error);
      toast.error('Ошибка при обрезке трека');
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    const channelData = [];
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      channelData.push(buffer.getChannelData(channel));
    }
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return arrayBuffer;
  };

  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="AudioWaveform" className="text-primary" />
            Редактор волновой формы
          </CardTitle>
          <CardDescription>
            Выберите трек для редактирования
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="AudioWaveform" className="text-primary" />
          Редактор волновой формы
        </CardTitle>
        <CardDescription>
          Визуализация и точная обрезка аудио
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div ref={containerRef} className="space-y-4">
          <WaveformCanvas
            waveformData={waveformData}
            trimStart={trimStart}
            trimEnd={trimEnd}
            currentTime={currentTime}
            duration={duration}
            zoom={zoom}
            scrollOffset={scrollOffset}
            gridSize={gridSize}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          <PlaybackControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlayPause={togglePlayPause}
            onStop={stop}
            onSeek={seek}
            onVolumeChange={changeVolume}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrimControls
            trimStart={trimStart}
            trimEnd={trimEnd}
            duration={duration}
            onTrimStartChange={setTrimStart}
            onTrimEndChange={setTrimEnd}
            onApplyTrim={applyTrim}
            onResetTrim={resetTrim}
          />

          <EditorControls
            zoom={zoom}
            scrollOffset={scrollOffset}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            onZoomChange={setZoom}
            onScrollChange={setScrollOffset}
            onSnapToggle={setSnapToGrid}
            onGridSizeChange={setGridSize}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WaveformEditor;
