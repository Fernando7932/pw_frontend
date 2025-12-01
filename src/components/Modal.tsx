import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'border-[#53FC18]';
            case 'error': return 'border-red-500';
            default: return 'border-blue-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`bg-[#191b1f] border ${getBorderColor()} p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100`}>
                <div className="text-center">
                    <div className="text-4xl mb-4">{getIcon()}</div>
                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">{title}</h3>
                    <p className="text-gray-400 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-[#24272c] hover:bg-[#32353b] text-white font-bold rounded uppercase tracking-wider transition-colors border border-[#24272c] hover:border-gray-600"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
