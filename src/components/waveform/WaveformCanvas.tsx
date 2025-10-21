import { useEffect, useRef, useCallback } from 'react';

interface WaveformCanvasProps {
  waveformData: number[];
  trimStart: number;
  trimEnd: number;
  currentTime: number;
  duration: number;
  zoom: number;
  scrollOffset: number;
  gridSize: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const WaveformCanvas = ({
  waveformData,
  trimStart,
  trimEnd,
  currentTime,
  duration,
  zoom,
  scrollOffset,
  gridSize,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}: WaveformCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    if (duration > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridInterval = gridSize;
      const pixelsPerSecond = (width / duration) * zoom;
      
      for (let i = 0; i <= duration; i += gridInterval) {
        const x = (i * pixelsPerSecond) - scrollOffset;
        if (x >= 0 && x <= width) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(formatTime(i), x + 2, 12);
        }
      }
    }

    // Waveform
    const barWidth = (width / waveformData.length) * zoom;
    const trimStartX = (trimStart / 100) * width;
    const trimEndX = (trimEnd / 100) * width;

    waveformData.forEach((value, index) => {
      const x = (index * barWidth) - scrollOffset;
      if (x < -barWidth || x > width) return;

      const barHeight = (value * (height * 0.8)) / 2;
      const y = height / 2;

      const isInTrimRange = x >= trimStartX && x <= trimEndX;
      const gradient = ctx.createLinearGradient(0, y - barHeight, 0, y + barHeight);
      
      if (isInTrimRange) {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.9)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(100, 100, 100, 0.3)');
        gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 100, 100, 0.3)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y - barHeight, Math.max(barWidth - 0.5, 1), barHeight * 2);
    });

    // Trim region overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, trimStartX, height);
    ctx.fillRect(trimEndX, 0, width - trimEndX, height);

    // Trim markers
    const markerHeight = height;
    
    // Start marker
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fillRect(trimStartX - 2, 0, 4, markerHeight);
    ctx.fillStyle = 'rgba(139, 92, 246, 1)';
    ctx.fillRect(trimStartX - 6, 0, 12, 30);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀', trimStartX, 20);

    // End marker
    ctx.fillStyle = 'rgba(251, 146, 60, 0.3)';
    ctx.fillRect(trimEndX - 2, 0, 4, markerHeight);
    ctx.fillStyle = 'rgba(251, 146, 60, 1)';
    ctx.fillRect(trimEndX - 6, 0, 12, 30);
    ctx.fillStyle = 'white';
    ctx.fillText('▶', trimEndX, 20);

    // Playhead
    if (duration > 0) {
      const playheadX = ((currentTime / duration) * width);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(playheadX, 15, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'start';
  }, [waveformData, trimStart, trimEnd, currentTime, duration, zoom, scrollOffset, gridSize]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64 cursor-grab active:cursor-grabbing rounded-lg"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default WaveformCanvas;
