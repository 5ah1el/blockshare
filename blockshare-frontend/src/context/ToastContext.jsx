import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/User/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message) => {
        addToast(message, 'success');
    }, [addToast]);

    const error = useCallback((message) => {
        addToast(message, 'error');
    }, [addToast]);

    const warning = useCallback((message) => {
        addToast(message, 'warning');
    }, [addToast]);

    const info = useCallback((message) => {
        addToast(message, 'info');
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info }}>
            {children}
            {/* Toast Container - Fixed position top-right */}
            <div className="fixed top-4 right-4 z-50 space-y-3">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
