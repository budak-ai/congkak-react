import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ConcedeConfirmModal.css';

const ConcedeConfirmModal = ({ isOpen, player, onConfirm, onCancel }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const isUpper = player === 'UPPER';
  const playerName = isUpper
    ? (language === 'BM' ? 'GELAP' : 'DARK')
    : (language === 'BM' ? 'PUTIH' : 'WHITE');

  const message = language === 'BM'
    ? `${playerName} mahu mengalah?`
    : `${playerName} wants to concede?`;

  const confirmText = language === 'BM' ? 'Ya, Mengalah' : 'Yes, Concede';
  const cancelText = language === 'BM' ? 'Batal' : 'Cancel';

  return (
    <div className="concede-confirm-overlay">
      <div className={`concede-confirm-modal ${isUpper ? 'concede-confirm-modal--upper' : 'concede-confirm-modal--lower'}`}>
        <div className="concede-confirm-icon">
          <i className="fa fa-flag"></i>
        </div>
        <div className="concede-confirm-message">{message}</div>
        <div className="concede-confirm-actions">
          <button
            className="concede-confirm-btn concede-confirm-btn--yes"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="concede-confirm-btn concede-confirm-btn--no"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConcedeConfirmModal;
