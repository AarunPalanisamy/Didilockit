import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type ModalState =
  | { type: 'verify'; id: string }
  | { type: 'capture'; id: string }
  | { type: 'viewer'; id: string }
  | { type: 'pass'; id: string }
  | { type: 'add' }
  | null;

/**
 * One modal at a time. iOS can't present a modal while another is still
 * dismissing, so on iOS a modal→modal switch closes the current one first
 * and opens the next from that modal's `onDismiss`.
 */
export function useModalFlow() {
  const [modal, setModal] = useState<ModalState>(null);
  const modalRef = useRef<ModalState>(null);
  const queued = useRef<ModalState>(null);

  useEffect(() => {
    modalRef.current = modal;
  }, [modal]);

  const open = useCallback((next: NonNullable<ModalState>) => {
    if (Platform.OS === 'ios' && modalRef.current) {
      queued.current = next;
      setModal(null);
    } else {
      setModal(next);
    }
  }, []);

  const close = useCallback(() => {
    queued.current = null;
    setModal(null);
  }, []);

  /** Wire to every Modal's onDismiss. */
  const onDismiss = useCallback(() => {
    const next = queued.current;
    if (next) {
      queued.current = null;
      setModal(next);
    }
  }, []);

  return { modal, open, close, onDismiss };
}
