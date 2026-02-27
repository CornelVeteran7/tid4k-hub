import { useRef, useCallback, useState } from 'react';

interface UseTouchReorderOptions {
  items: string[];
  onReorder: (newOrder: string[]) => void;
}

export function useTouchReorder({ items, onReorder }: UseTouchReorderOptions) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // Use refs to avoid stale closure issues in touch handlers
  const dragIdxRef = useRef<number | null>(null);
  const overIdxRef = useRef<number | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());

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
    dragIdxRef.current = idx;
    overIdxRef.current = null;
    setDragIdx(idx);
    setOverIdx(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragIdxRef.current === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const hitIdx = getIdxAtPoint(touch.clientY);
    if (hitIdx !== null && hitIdx !== overIdxRef.current) {
      overIdxRef.current = hitIdx;
      setOverIdx(hitIdx);
    }
  }, [getIdxAtPoint]);

  const handleTouchEnd = useCallback(() => {
    const from = dragIdxRef.current;
    const to = overIdxRef.current;
    if (from !== null && to !== null && from !== to) {
      const newOrder = [...itemsRef.current];
      const [moved] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, moved);
      onReorder(newOrder);
    }
    dragIdxRef.current = null;
    overIdxRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, [onReorder]);

  const makeDragProps = useCallback((idx: number) => ({
    // HTML5 drag (desktop)
    draggable: true,
    onDragStartCapture: (e: React.DragEvent) => {
      dragIdxRef.current = idx;
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOverCapture: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDropCapture: (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIdxRef.current;
      if (from === null || from === idx) return;
      const newOrder = [...itemsRef.current];
      const [moved] = newOrder.splice(from, 1);
      newOrder.splice(idx, 0, moved);
      onReorder(newOrder);
      dragIdxRef.current = null;
      setDragIdx(null);
    },
    onDragEndCapture: () => {
      dragIdxRef.current = null;
      setDragIdx(null);
    },
    // Touch drag (mobile)
    onTouchStart: handleTouchStart(idx),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    ref: (el: HTMLElement | null) => registerRef(idx, el),
  }), [onReorder, handleTouchStart, handleTouchMove, handleTouchEnd, registerRef]);

  return { makeDragProps, dragIdx, overIdx };
}
