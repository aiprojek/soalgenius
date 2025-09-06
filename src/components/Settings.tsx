
import React, { useRef } from 'react';
import type { HeaderSettings, HeaderLine } from '../types';
import { TrashIcon, PlusIcon, UploadIcon } from './Icons';
import Modal from './Modal';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    settings: HeaderSettings;
    onSettingsChange: (newSettings: HeaderSettings) => void;
    onReset: () => void;
}

export default function Settings({ isOpen, onClose, settings, onSettingsChange, onReset }: SettingsProps) {
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleFieldChange = <K extends keyof HeaderSettings>(field: K, value: HeaderSettings[K]) => {
        onSettingsChange({ ...settings, [field]: value });
    };

    const handleLineChange = (id: string, text: string) => {
        const newLines = settings.headerLines.map(line => line.id === id ? { ...line, text } : line);
        handleFieldChange('headerLines', newLines);
    };

    const addLine = () => {
        const newLine: HeaderLine = { id: crypto.randomUUID(), text: 'Teks Kop Baru' };
        handleFieldChange('headerLines', [...settings.headerLines, newLine]);
    };

    const removeLine = (id: string) => {
        if (settings.headerLines.length > 1) {
            const newLines = settings.headerLines.filter(line => line.id !== id);
            handleFieldChange('headerLines', newLines);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) { // 500KB limit
            alert('Ukuran logo terlalu besar. Maksimal 500KB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            handleFieldChange('logo', reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeLogo = () => {
        handleFieldChange('logo', null);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };
    
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Kop Surat & Cetak" size="2xl">
            <div className="space-y-6">
                {/* Kop Surat Section */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Kop Surat</h3>
                    <div className="space-y-4">
                         <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={settings.showHeader} onChange={e => handleFieldChange('showHeader', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <span className="font-medium">Tampilkan Kop Surat</span>
                        </label>

                        {settings.showHeader && (
                            <div className="pl-7 space-y-4 border-l-2 ml-2">
                                 <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={settings.showLogo} onChange={e => handleFieldChange('showLogo', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="font-medium">Tampilkan Logo</span>
                                </label>

                                {settings.showLogo && (
                                    <div className="pl-7 space-y-2 border-l-2 ml-2">
                                        <div className="flex items-center gap-4">
                                            {settings.logo ? (
                                                <div className="w-16 h-16 border p-1 rounded-md bg-white flex-shrink-0">
                                                    <img src={settings.logo} alt="Logo Preview" className="w-full h-full object-contain"/>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 border p-1 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                                                    Tanpa Logo
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => logoInputRef.current?.click()} className="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 flex items-center gap-2">
                                                    <UploadIcon className="w-4 h-4"/> Ganti Logo
                                                </button>
                                                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg" className="hidden"/>
                                                {settings.logo && <button onClick={removeLogo} className="text-sm text-red-600 hover:underline">Hapus Logo</button>}
                                                <p className="text-xs text-gray-500">PNG/JPG, maks 500KB.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Baris Teks Kop</label>
                                    <div className="space-y-2">
                                        {settings.headerLines.map((line, index) => (
                                            <div key={line.id} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={line.text}
                                                    onChange={(e) => handleLineChange(line.id, e.target.value)}
                                                    placeholder={`Baris ${index + 1}`}
                                                    className="p-2 border rounded-md w-full bg-white text-sm"
                                                />
                                                <button onClick={() => removeLine(line.id)} disabled={settings.headerLines.length <= 1} className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0 disabled:text-gray-300 disabled:hover:bg-transparent"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                        <button onClick={addLine} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><PlusIcon className="w-4 h-4"/> Tambah Baris</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Paper Settings Section */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Pengaturan Kertas & Cetak</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700">Ukuran Kertas</label>
                            <select id="paperSize" value={settings.paperSize} onChange={e => handleFieldChange('paperSize', e.target.value as 'a4' | 'f4')} className="mt-1 block w-full p-2 border rounded-md bg-white">
                                <option value="a4">A4 (210 x 297 mm)</option>
                                <option value="f4">F4 (210 x 330 mm)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">Jenis Huruf</label>
                            <select id="fontFamily" value={settings.fontFamily} onChange={e => handleFieldChange('fontFamily', e.target.value as 'serif' | 'sans')} className="mt-1 block w-full p-2 border rounded-md bg-white">
                                <option value="serif">Liberation Serif</option>
                                <option value="sans">Liberation Sans</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="margin" className="block text-sm font-medium text-gray-700">Margin Kertas (mm)</label>
                            <input type="number" id="margin" value={settings.margin} onChange={e => handleFieldChange('margin', Number(e.target.value))} className="mt-1 block w-full p-2 border rounded-md bg-white" min="5" max="50" />
                        </div>
                         <div>
                            <label htmlFor="lineHeight" className="block text-sm font-medium text-gray-700">Jarak Antar Baris</label>
                            <input type="number" id="lineHeight" value={settings.lineHeight} onChange={e => handleFieldChange('lineHeight', Number(e.target.value))} className="mt-1 block w-full p-2 border rounded-md bg-white" min="1" max="3" step="0.1"/>
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <button onClick={onReset} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                    Reset ke Default
                </button>
                <button onClick={onClose} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Selesai
                </button>
            </div>
        </Modal>
    );
}
