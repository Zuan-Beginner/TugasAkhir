'use client';

import { useEffect, useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, icon, children }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (shouldRender) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} onClick={onClose}>
      <div className={`modal-content ${isClosing ? 'modal-closing' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title">{icon} {title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
