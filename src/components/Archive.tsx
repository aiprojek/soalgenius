import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Exam } from '../types';
import { PlusIcon, EditIcon, TrashIcon, PrintIcon, CopyIcon, ShuffleIcon, MenuIcon, FilterIcon } from './Icons';
import Modal from './Modal';

interface ArchiveProps {
  exams: Exam[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (exam: Exam) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onGenerateVariant: (id: string) => void;
  activeView: string;
}

const ExamCard: React.FC<{
    exam: Exam;
    onPreview: (exam: Exam) => void;
    onDuplicate: (id: string) => void;
    onGenerateVariant: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ exam, onPreview, onDuplicate, onGenerateVariant, onEdit, onDelete }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { label: 'Pratinjau / Cetak', icon: <PrintIcon className="w-4 h-4"/>, action: () => onPreview(exam) },
        { label: 'Ubah', icon: <EditIcon className="w-4 h-4"/>, action: () => onEdit(exam.id) },
        { label: 'Salin Ujian', icon: <CopyIcon className="w-4 h-4"/>, action: () => onDuplicate(exam.id) },
        { label: 'Buat Varian Acak', icon: <ShuffleIcon className="w-4 h-4"/>, action: () => onGenerateVariant(exam.id) },
        { label: 'Hapus', icon: <TrashIcon className="w-4 h-4 text-red-500"/>, action: () => onDelete(exam.id), isDestructive: true },
    ];

    return (
        <div className="p-4 border rounded-lg flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2 flex-wrap">
                    <span>{exam.title}</span>
                    {exam.status === 'draft' && <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Draft</span>}
                    {exam.status === 'finished' && <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Selesai</span>}
                </h3>
                <p className="text-sm text-gray-800">{exam.subject} - {exam.grade}</p>
                {exam.description && <p className="text-sm text-gray-600 mt-1 italic">"{exam.description}"</p>}
                <p className="text-xs text-gray-500 mt-1">Dibuat: {new Date(exam.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
            <div className="relative flex-shrink-0" ref={menuRef}>
                <button onClick={() => setMenuOpen(prev => !prev)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                    <MenuIcon className="w-5 h-5" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border py-1">
                        {menuItems.map(item => (
                            <button 
                                key={item.label}
                                onClick={() => { item.action(); setMenuOpen(false); }}
                                className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm ${item.isDestructive ? 'text-red-600' : 'text-gray-700'} hover:bg-gray-100`}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Archive({ exams, onEdit, onDelete, onPreview, onCreateNew, onDuplicate, onGenerateVariant, activeView }: ArchiveProps) {
    const [filterSubject, setFilterSubject] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'finished'>('all');
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);

    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const subjectMatch = filterSubject ? exam.subject === filterSubject : true;
            const gradeMatch = filterGrade ? exam.grade === filterGrade : true;
            const statusMatch = filterStatus === 'all' ? true : exam.status === filterStatus;
            return subjectMatch && gradeMatch && statusMatch;
        }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [exams, filterSubject, filterGrade, filterStatus]);

    const uniqueSubjects = useMemo(() => [...new Set(exams.map(e => e.subject).filter(Boolean))].sort(), [exams]);
    const uniqueGrades = useMemo(() => [...new Set(exams.map(e => e.grade).filter(Boolean))].sort(), [exams]);

    const activeFilterCount = [filterSubject, filterGrade, filterStatus !== 'all'].filter(Boolean).length;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Arsip Ujian</h2>
                <button onClick={() => setFilterModalOpen(true)} className="relative flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors border shadow-sm">
                    <FilterIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Filter</span>
                    {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>}
                </button>
            </div>

            <div className="space-y-4">
                {filteredExams.length > 0 ? filteredExams.map(exam => (
                    <ExamCard 
                        key={exam.id}
                        exam={exam}
                        onPreview={onPreview}
                        onDuplicate={onDuplicate}
                        onGenerateVariant={onGenerateVariant}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )) : (
                    <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900">Belum Ada Ujian</h3>
                        <p className="text-gray-700 mt-2">Klik tombol + di pojok kanan bawah untuk memulai.</p>
                    </div>
                )}
            </div>

            {isFilterModalOpen && (
                <Modal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} title="Filter Arsip Ujian" size="md">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                                <option value="">Semua Mapel</option>
                                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Jenjang</label>
                            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                                <option value="">Semua Kelas</option>
                                {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'finished')} className="p-2 border rounded-md w-full bg-white">
                                <option value="all">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="finished">Selesai</option>
                            </select>
                        </div>
                        <div className="pt-4 border-t flex justify-end">
                             <button onClick={() => setFilterModalOpen(false)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Terapkan</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Floating Action Button */}
            {activeView === 'archive' && (
                 <button 
                    onClick={onCreateNew} 
                    className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 z-30"
                    title="Buat Ujian Baru"
                    aria-label="Buat Ujian Baru"
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            )}
        </div>
    );
}