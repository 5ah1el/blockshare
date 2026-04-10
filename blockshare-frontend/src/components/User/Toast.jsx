import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000); // Auto-close after 4 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyles = () => {
        switch(type) {
            case 'success':
                return {
                    bg: 'bg-emerald-500',
                    icon: faCheckCircle,
                    borderColor: 'border-emerald-600'
                };
            case 'error':
                return {
                    bg: 'bg-rose-500',
                    icon: faExclamationCircle,
                    borderColor: 'border-rose-600'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500',
                    icon: faExclamationCircle,
                    borderColor: 'border-amber-600'
                };
            default:
                return {
                    bg: 'bg-blue-500',
                    icon: faInfoCircle,
                    borderColor: 'border-blue-600'
                };
        }
    };

    const styles = getToastStyles();

    return (
        <div className={`${styles.bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 min-w-[320px] max-w-md animate-slide-in-right border-l-4 ${styles.borderColor}`}>
            <FontAwesomeIcon icon={styles.icon} className="text-xl flex-shrink-0" />
            <p className="font-bold text-sm flex-1">{message}</p>
            <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </div>
    );
};

export default Toast;
