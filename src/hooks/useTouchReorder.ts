import { useRef, useCallback, useState, useEffect } from 'react';

interface UseTouchReorderOptions {
  items: string[];
  onReorder: (newOrder: string[]) => void;
}

export function useTouchReorder({ items, onReorder }: UseTouchReorderOptions) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const dragIdxRef = useRef<number | null>(null);
  const overIdxRef = useRef<number | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());

  const registerRef = useCallback((idx: number, el: HTMLElement | null) => {
    if (el) cardRefs.current.set(idx, el);
    else cardRefs.current.delete(idx);
  }, []);

  const getIdxAtPoint = useCallback((x: number, y: number): number | null => {
    for (const [idx, el] of cardRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right) return idx;
    }
    return null;
  }, []);

  // Native touchmove handler attached with { passive: false } so preventDefault works
  const touchMoveHandler = useCallback((e: TouchEvent) => {
    if (dragIdxRef.current === null) return;
    e.preventDefault(); // This now works because listener is non-passive
    const touch = e.touches[0];
    const hitIdx = getIdxAtPoint(touch.clientX, touch.clientY);
    if (hitIdx !== null && hitIdx !== overIdxRef.current) {
      overIdxRef.current = hitIdx;
      setOverIdx(hitIdx);
    }
  }, [getIdxAtPoint]);

  // Attach/detach native touchmove listener on all registered elements
  useEffect(() => {
    const elements = Array.from(cardRefs.current.values());
    elements.forEach(el => {
      el.addEventListener('touchmove', touchMoveHandler, { passive: false });
    });
    return () => {
      elements.forEach(el => {
        el.removeEventListener('touchmove', touchMoveHandler);
      });
    };
  }, [touchMoveHandler, dragIdx]); // re-attach when dragIdx changes (elements may re-render)

  const handleTouchStart = useCallback((idx: number) => (e: React.TouchEvent) => {
    dragIdxRef.current = idx;
    overIdxRef.current = null;
    setDragIdx(idx);
    setOverIdx(null);
  }, []);

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
    // Touch drag (mobile) — only start/end via React; move is native
    onTouchStart: handleTouchStart(idx),
    onTouchEnd: handleTouchEnd,
    ref: (el: HTMLElement | null) => registerRef(idx, el),
  }), [onReorder, handleTouchStart, handleTouchEnd, registerRef]);

  return { makeDragProps, dragIdx, overIdx };
}
