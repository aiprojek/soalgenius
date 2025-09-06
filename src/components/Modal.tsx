import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end sm:items-center sm:p-4" onClick={onClose}>
      <div className={`bg-white shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-full rounded-t-lg sm:rounded-lg sm:max-h-[90vh]`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-3 sm:p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-3xl font-light leading-none">&times;</button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}