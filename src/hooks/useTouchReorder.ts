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

  // Global touch listeners — attached to document only during active drag
  useEffect(() => {
    if (dragIdx === null) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // blocks scroll — works because { passive: false }
      const touch = e.touches[0];
      const hitIdx = getIdxAtPoint(touch.clientX, touch.clientY);
      if (hitIdx !== null && hitIdx !== overIdxRef.current) {
        overIdxRef.current = hitIdx;
        setOverIdx(hitIdx);
      }
    };

    const handleTouchEndOrCancel = () => {
      finalizeDrag();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEndOrCancel);
    document.addEventListener('touchcancel', handleTouchEndOrCancel);

    // Add body class to prevent text selection globally during drag
    document.body.classList.add('reorder-dragging');

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEndOrCancel);
      document.removeEventListener('touchcancel', handleTouchEndOrCancel);
      document.body.classList.remove('reorder-dragging');
    };
  }, [dragIdx, getIdxAtPoint, finalizeDrag]);

  const handleTouchStart = useCallback((idx: number) => (_e: React.TouchEvent) => {
    dragIdxRef.current = idx;
    overIdxRef.current = null;
    setDragIdx(idx);
    setOverIdx(null);
  }, []);

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
    // Touch drag (mobile) — only start via React; move/end are global
    onTouchStart: handleTouchStart(idx),
    ref: (el: HTMLElement | null) => registerRef(idx, el),
  }), [onReorder, handleTouchStart, registerRef]);

  return { makeDragProps, dragIdx, overIdx };
}
