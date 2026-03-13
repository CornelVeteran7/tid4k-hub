import { useRef, useCallback, useState, useEffect, useMemo } from 'react';

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

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

  // Track whether document-level touch listeners are currently attached
  const touchListenersAttached = useRef(false);

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

  // Finalize drag (shared by touch and mouse)
  const finalizeDrag = useCallback(() => {
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

  // Stable refs for the document-level handlers so we can add/remove the same function
  const handleTouchMoveRef = useRef<((e: TouchEvent) => void) | null>(null);
  const handleTouchEndRef = useRef<(() => void) | null>(null);

  // Initialize stable handler refs once
  useEffect(() => {
    handleTouchMoveRef.current = (e: TouchEvent) => {
      e.preventDefault(); // blocks scroll
      const touch = e.touches[0];
      const hitIdx = getIdxAtPoint(touch.clientX, touch.clientY);
      if (hitIdx !== null && hitIdx !== overIdxRef.current) {
        overIdxRef.current = hitIdx;
        setOverIdx(hitIdx);
      }
    };

    handleTouchEndRef.current = () => {
      removeTouchListeners();
      finalizeDrag();
      document.body.classList.remove('reorder-dragging');
    };
  }, [getIdxAtPoint, finalizeDrag]);

  const addTouchListeners = useCallback(() => {
    if (touchListenersAttached.current) return;
    touchListenersAttached.current = true;
    if (handleTouchMoveRef.current) {
      document.addEventListener('touchmove', handleTouchMoveRef.current, { passive: false });
    }
    if (handleTouchEndRef.current) {
      document.addEventListener('touchend', handleTouchEndRef.current);
      document.addEventListener('touchcancel', handleTouchEndRef.current);
    }
    document.body.classList.add('reorder-dragging');
  }, []);

  const removeTouchListeners = useCallback(() => {
    if (!touchListenersAttached.current) return;
    touchListenersAttached.current = false;
    if (handleTouchMoveRef.current) {
      document.removeEventListener('touchmove', handleTouchMoveRef.current);
    }
    if (handleTouchEndRef.current) {
      document.removeEventListener('touchend', handleTouchEndRef.current);
      document.removeEventListener('touchcancel', handleTouchEndRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeTouchListeners();
      document.body.classList.remove('reorder-dragging');
    };
  }, [removeTouchListeners]);

  // CRITICAL: Attach document listeners SYNCHRONOUSLY during touchstart,
  // not in a useEffect (which would be async and miss the first touchmove).
  const handleTouchStart = useCallback((idx: number) => (e: React.TouchEvent) => {
    e.preventDefault(); // prevent browser from initiating scroll
    e.stopPropagation();
    dragIdxRef.current = idx;
    overIdxRef.current = null;
    setDragIdx(idx);
    setOverIdx(null);

    // Attach listeners synchronously so the very first touchmove is caught
    addTouchListeners();
  }, [addTouchListeners]);

  const makeDragProps = useCallback((idx: number) => ({
    // HTML5 drag (desktop only — breaks touch on mobile)
    draggable: !isTouchDevice,
    onDragStartCapture: (e: React.DragEvent) => {
      if (isTouchDevice) return;
      dragIdxRef.current = idx;
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOverCapture: (e: React.DragEvent) => {
      if (isTouchDevice) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDropCapture: (e: React.DragEvent) => {
      if (isTouchDevice) return;
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
      if (isTouchDevice) return;
      dragIdxRef.current = null;
      setDragIdx(null);
    },
    // Touch drag (mobile) — start via React; move/end are global (attached synchronously)
    onTouchStart: handleTouchStart(idx),
    ref: (el: HTMLElement | null) => registerRef(idx, el),
  }), [onReorder, handleTouchStart, registerRef]);

  return { makeDragProps, dragIdx, overIdx };
}
