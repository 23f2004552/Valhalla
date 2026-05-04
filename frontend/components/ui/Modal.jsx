import React, { useEffect, useState } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-[#1c1a18] border border-white/10 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-xl font-serif text-white">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
