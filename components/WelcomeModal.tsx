import React from 'react';
import Modal from './Modal';
import { CheckCircleIcon, WandIcon, BookOpenIcon, InfoIcon } from './Icons';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
}

const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
    <li className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">{icon}</span>
        <span>{text}</span>
    </li>
);

export default function WelcomeModal({ isOpen, onClose, onOpenGuide }: WelcomeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selamat Datang di SoalGenius!" size="2xl">
        <div className="space-y-6 text-gray-700 text-sm">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">🚀</h3>
                <p className="mt-2">
                    Terima kasih telah memilih <strong>SoalGenius</strong> untuk membantu Anda mempersiapkan soal ujian. 
                    Aplikasi ini dirancang untuk bekerja <strong>sepenuhnya offline</strong>, memastikan data Anda aman di perangkat Anda.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3 text-base">Fitur Saat Ini:</h4>
                    <ul className="space-y-2">
                        <FeatureItem icon={<CheckCircleIcon className="w-4 h-4 text-green-600" />} text="Editor Soal Profesional" />
                        <FeatureItem icon={<CheckCircleIcon className="w-4 h-4 text-green-600" />} text="Bank Soal Pribadi" />
                        <FeatureItem icon={<CheckCircleIcon className="w-4 h-4 text-green-600" />} text="Kustomisasi Kop Surat & Cetak (A4/F4)" />
                        <FeatureItem icon={<CheckCircleIcon className="w-4 h-4 text-green-600" />} text="Ekspor ke HTML & Cetak ke PDF" />
                        <FeatureItem icon={<CheckCircleIcon className="w-4 h-4 text-green-600" />} text="Manajemen Ujian (Salin, Varian Acak)" />
                        <FeatureItem icon={<CheckCircleIcon className="w-4 h-4 text-green-600" />} text="Backup & Pulihkan Data" />
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3 text-base">Fitur Mendatang:</h4>
                    <ul className="space-y-2">
                        <FeatureItem icon={<WandIcon className="w-4 h-4 text-purple-600" />} text="Dukungan Rumus Matematika (KaTeX)" />
                        <FeatureItem icon={<WandIcon className="w-4 h-4 text-purple-600" />} text="Dukungan Tabel di Editor" />
                        <FeatureItem icon={<WandIcon className="w-4 h-4 text-purple-600" />} text="Dukungan Teks Arab (Kanan-ke-Kiri)" />
                        <FeatureItem icon={<WandIcon className="w-4 h-4 text-purple-600" />} text="Impor Soal dari format lain" />
                    </ul>
                </div>
            </div>

            <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs rounded-r-lg">
                <div className="flex items-start gap-2">
                    <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-500"/>
                    <div>
                        <h4 className="font-bold">Perhatian Penting:</h4>
                        <p className="mt-1">
                            Aplikasi ini memerlukan koneksi internet saat pertama kali dibuka. Setelah dimuat, aplikasi dapat berjalan <strong>sepenuhnya offline</strong> dan semua data (ujian, soal, pengaturan) disimpan <strong>secara lokal di browser Anda</strong>. Untuk menghindari kehilangan data, sangat disarankan untuk melakukan <strong>Backup Data</strong> secara berkala.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-center items-center gap-4">
                 <button 
                    onClick={onOpenGuide} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                    <BookOpenIcon className="w-5 h-5" />
                    Lihat Panduan
                </button>
                <button 
                    onClick={onClose} 
                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 font-semibold"
                >
                    Mulai Menggunakan
                </button>
            </div>
        </div>
    </Modal>
  );
}