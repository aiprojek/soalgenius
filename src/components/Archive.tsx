
import React, { useState, useMemo } from 'react';
import type { Exam } from '../types';
import { PlusIcon, EditIcon, TrashIcon, PrintIcon, CopyIcon, ShuffleIcon } from './Icons';

interface ArchiveProps {
  exams: Exam[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (exam: Exam) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onGenerateVariant: (id: string) => void;
}

export default function Archive({ exams, onEdit, onDelete, onPreview, onCreateNew, onDuplicate, onGenerateVariant }: ArchiveProps) {
    const [filterSubject, setFilterSubject] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'finished'>('all');

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

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Arsip Soal Ujian</h2>
                <button onClick={onCreateNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>Buat Ujian Baru</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md border">
                 <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="p-2 border rounded-md w-full bg-white"
                >
                    <option value="">Semua Mapel</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="p-2 border rounded-md w-full bg-white"
                >
                    <option value="">Semua Kelas</option>
                    {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'finished')}
                    className="p-2 border rounded-md w-full bg-white"
                >
                    <option value="all">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="finished">Selesai</option>
                </select>
            </div>

            <div className="space-y-4">
                {filteredExams.length > 0 ? filteredExams.map(exam => (
                    <div key={exam.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div>
                            <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2 flex-wrap">
                                <span>{exam.title}</span>
                                {exam.status === 'draft' && <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Draft</span>}
                                {exam.status === 'finished' && <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Selesai</span>}
                            </h3>
                            <p className="text-sm text-gray-800">{exam.subject} - {exam.grade}</p>
                             {exam.description && <p className="text-sm text-gray-600 mt-1 italic">"{exam.description}"</p>}
                            <p className="text-xs text-gray-500 mt-1">Dibuat: {new Date(exam.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                            <button onClick={() => onPreview(exam)} className="p-2 text-gray-700 hover:text-blue-700" title="Cetak/Preview"><PrintIcon className="w-5 h-5" /></button>
                            <button onClick={() => onDuplicate(exam.id)} className="p-2 text-gray-700 hover:text-purple-700" title="Salin"><CopyIcon className="w-5 h-5" /></button>
                            <button onClick={() => onGenerateVariant(exam.id)} className="p-2 text-gray-700 hover:text-blue-700" title="Buat Varian Acak"><ShuffleIcon className="w-5 h-5" /></button>
                            <button onClick={() => onEdit(exam.id)} className="p-2 text-gray-700 hover:text-green-700" title="Ubah"><EditIcon className="w-5 h-5" /></button>
                            <button onClick={() => onDelete(exam.id)} className="p-2 text-gray-700 hover:text-red-700" title="Hapus"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900">Belum Ada Ujian</h3>
                        <p className="text-gray-700 mt-2">Klik "Buat Ujian Baru" untuk memulai.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
