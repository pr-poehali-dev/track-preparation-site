import { useState, useCallback } from 'react';

interface UseWaveformInteractionProps {
  duration: number;
  snapToGrid: boolean;
  gridSize: number;
}

export const useWaveformInteraction = ({ duration, snapToGrid, gridSize }: UseWaveformInteractionProps) => {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingRegion, setIsDraggingRegion] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const snapValue = useCallback((value: number) => {
    if (!snapToGrid || duration === 0) return value;
    const timeValue = (value / 100) * duration;
    const snappedTime = Math.round(timeValue / gridSize) * gridSize;
    return (snappedTime / duration) * 100;
  }, [snapToGrid, duration, gridSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    const startX = (trimStart / 100) * rect.width;
    const endX = (trimEnd / 100) * rect.width;

    if (Math.abs(x - startX) < 15) {
      setIsDraggingStart(true);
    } else if (Math.abs(x - endX) < 15) {
      setIsDraggingEnd(true);
    } else if (x > startX && x < endX) {
      setIsDraggingRegion(true);
      setDragStartX(percentage);
    }
  }, [trimStart, trimEnd]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    if (isDraggingStart) {
      const newStart = snapValue(Math.max(0, Math.min(percentage, trimEnd - 1)));
      setTrimStart(newStart);
    } else if (isDraggingEnd) {
      const newEnd = snapValue(Math.max(trimStart + 1, Math.min(percentage, 100)));
      setTrimEnd(newEnd);
    } else if (isDraggingRegion) {
      const delta = percentage - dragStartX;
      const regionWidth = trimEnd - trimStart;
      
      let newStart = trimStart + delta;
      let newEnd = trimEnd + delta;
      
      if (newStart < 0) {
        newStart = 0;
        newEnd = regionWidth;
      } else if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - regionWidth;
      }
      
      setTrimStart(snapValue(newStart));
      setTrimEnd(snapValue(newEnd));
      setDragStartX(percentage);
    }
  }, [isDraggingStart, isDraggingEnd, isDraggingRegion, trimStart, trimEnd, dragStartX, snapValue]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    setIsDraggingRegion(false);
  }, []);

  const resetTrim = useCallback(() => {
    setTrimStart(0);
    setTrimEnd(100);
  }, []);

  return {
    trimStart,
    trimEnd,
    setTrimStart,
    setTrimEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetTrim
  };
};
