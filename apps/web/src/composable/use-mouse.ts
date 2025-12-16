import { useState, useCallback, useRef } from 'react';

interface MouseDistance {
  deltaX: number;
  deltaY: number;
  distance: number;
}

interface UseMouseDragOptions {
  canMove?: boolean
  onDragStart?: (e: MouseEvent) => void;
  onDragMove?: (e: MouseEvent, delta: MouseDistance) => void;
  onDragEnd?: (e: MouseEvent, delta: MouseDistance) => void;
}

export function useMouseDrag(options: UseMouseDragOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [delta, setDelta] = useState<MouseDistance>({ deltaX: 0, deltaY: 0, distance: 0 });

  const startPos = useRef({ x: 0, y: 0 });
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const newDelta = { deltaX, deltaY, distance };
    setDelta(newDelta);
    optionsRef.current.onDragMove?.(e, newDelta);
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const finalDelta = { deltaX, deltaY, distance };
    setDelta(finalDelta);
    setIsDragging(false);

    optionsRef.current.onDragEnd?.(e, finalDelta);

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    setDelta({ deltaX: 0, deltaY: 0, distance: 0 });
    setIsDragging(true);

    optionsRef.current.onDragStart?.(e.nativeEvent);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    delta,
    handleMouseDown,
  };
}
