import { useRef, useCallback, useState } from 'react';

interface UseTouchReorderOptions {
  items: string[];
  onReorder: (newOrder: string[]) => void;
}

export function useTouchReorder({ items, onReorder }: UseTouchReorderOptions) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const registerRef = useCallback((idx: number, el: HTMLElement | null) => {
    if (el) cardRefs.current.set(idx, el);
    else cardRefs.current.delete(idx);
  }, []);

  const getIdxAtPoint = useCallback((y: number): number | null => {
    for (const [idx, el] of cardRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) return idx;
    }
    return null;
  }, []);

  const handleTouchStart = useCallback((idx: number) => (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
    setDragIdx(idx);
    setOverIdx(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragIdx === null) return;
    // Prevent scrolling while dragging
    isDragging.current = true;
    e.preventDefault();
    const touch = e.touches[0];
    const hitIdx = getIdxAtPoint(touch.clientY);
    if (hitIdx !== null && hitIdx !== overIdx) {
      setOverIdx(hitIdx);
    }
  }, [dragIdx, overIdx, getIdxAtPoint]);

  const handleTouchEnd = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const newOrder = [...items];
      const [moved] = newOrder.splice(dragIdx, 1);
      newOrder.splice(overIdx, 0, moved);
      onReorder(newOrder);
    }
    setDragIdx(null);
    setOverIdx(null);
    isDragging.current = false;
  }, [dragIdx, overIdx, items, onReorder]);

  // Combined drag props (HTML5 + touch)
  const makeDragProps = useCallback((idx: number) => ({
    // HTML5 drag (desktop)
    draggable: true,
    onDragStartCapture: (e: React.DragEvent) => {
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOverCapture: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDropCapture: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIdx === null || dragIdx === idx) return;
      const newOrder = [...items];
      const [moved] = newOrder.splice(dragIdx, 1);
      newOrder.splice(idx, 0, moved);
      onReorder(newOrder);
      setDragIdx(null);
    },
    onDragEndCapture: () => setDragIdx(null),
    // Touch drag (mobile)
    onTouchStart: handleTouchStart(idx),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    ref: (el: HTMLElement | null) => registerRef(idx, el),
  }), [dragIdx, items, onReorder, handleTouchStart, handleTouchMove, handleTouchEnd, registerRef]);

  return { makeDragProps, dragIdx, overIdx };
}
