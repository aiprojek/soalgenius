import React, { useState, useMemo } from 'react';
import type { BankQuestion } from '../types';
import { TrashIcon, EditIcon, TagIcon, SearchIcon } from './Icons';
import { QuestionType } from '../types';

const RawHtmlRenderer: React.FC<{ html: string; className?: string }> = ({ html, className }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

const QuestionTypeBadge: React.FC<{ type: QuestionType }> = ({ type }) => {
    const typeMap: { [key in QuestionType]?: { text: string; className: string } } = {
        [QuestionType.MULTIPLE_CHOICE]: { text: 'Pilihan Ganda', className: 'bg-sky-100 text-sky-800' },
        [QuestionType.MULTIPLE_CHOICE_COMPLEX]: { text: 'PG Kompleks', className: 'bg-cyan-100 text-cyan-800' },
        [QuestionType.TRUE_FALSE]: { text: 'Benar/Salah', className: 'bg-rose-100 text-rose-800' },
        [QuestionType.MATCHING]: { text: 'Menjodohkan', className: 'bg-violet-100 text-violet-800' },
        [QuestionType.SHORT_ANSWER]: { text: 'Isian Singkat', className: 'bg-lime-100 text-lime-800' },
        [QuestionType.ESSAY]: { text: 'Uraian', className: 'bg-amber-100 text-amber-800' },
    };
    const { text, className } = typeMap[type] || { text: 'Lainnya', className: 'bg-gray-100 text-gray-800' };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>{text}</span>;
};

interface QuestionBankProps {
    bank: BankQuestion[];
    deleteQuestionFromBank: (id: string) => void;
    updateQuestionInBank: (question: BankQuestion) => void;
    allExams: { subject: string, grade: string }[];
}

export default function QuestionBank({ bank, deleteQuestionFromBank, updateQuestionInBank, allExams }: QuestionBankProps) {
    const [filterSubject, setFilterSubject] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);

    const filteredBank = useMemo(() => {
        return bank.filter(q => {
            const subjectMatch = filterSubject ? q.subject === filterSubject : true;
            const gradeMatch = filterGrade ? q.grade === filterGrade : true;
            const termMatch = searchTerm ? 
                (q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 (q.tags || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            return subjectMatch && gradeMatch && termMatch;
        });
    }, [bank, filterSubject, filterGrade, searchTerm]);

    const uniqueSubjects = useMemo(() => [...new Set(allExams.map(e => e.subject).concat(bank.map(q => q.subject)))].filter(Boolean).sort(), [allExams, bank]);
    const uniqueGrades = useMemo(() => [...new Set(allExams.map(e => e.grade).concat(bank.map(q => q.grade)))].filter(Boolean).sort(), [allExams, bank]);

    const handleUpdate = () => {
        if (editingQuestion) {
            updateQuestionInBank(editingQuestion);
            setEditingQuestion(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank Soal</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md border">
                 <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                    <option value="">Semua Mapel</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                    <option value="">Semua Kelas</option>
                    {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="relative">
                    <input type="text" placeholder="Cari soal atau tag..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-md w-full bg-white pl-10"/>
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="space-y-4">
                {filteredBank.length > 0 ? filteredBank.map(q => (
                    <div key={q.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="prose prose-sm max-w-none mb-2">
                                     <RawHtmlRenderer html={q.questionText} className="break-words line-clamp-2" />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                    <QuestionTypeBadge type={q.type} />
                                    <span className="font-semibold text-gray-700">{q.subject}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-600">{q.grade}</span>
                                </div>
                                {(q.tags && q.tags.length > 0) && 
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                        <TagIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        {q.tags.map(tag => <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">{tag}</span>)}
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => setEditingQuestion(JSON.parse(JSON.stringify(q)))} className="p-2 text-gray-700 hover:text-green-700" title="Ubah Metadata"><EditIcon className="w-5 h-5" /></button>
                                <button onClick={() => deleteQuestionFromBank(q.id)} className="p-2 text-gray-700 hover:text-red-700" title="Hapus dari Bank"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        {editingQuestion?.id === q.id && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                                <h4 className="font-semibold mb-2">Ubah Metadata Soal</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input type="text" value={editingQuestion.subject} onChange={e => setEditingQuestion({...editingQuestion, subject: e.target.value})} placeholder="Mata Pelajaran" className="p-2 border rounded-md bg-white w-full"/>
                                    <input type="text" value={editingQuestion.grade} onChange={e => setEditingQuestion({...editingQuestion, grade: e.target.value})} placeholder="Kelas/Jenjang" className="p-2 border rounded-md bg-white w-full"/>
                                    <input type="text" value={(editingQuestion.tags || []).join(', ')} onChange={e => setEditingQuestion({...editingQuestion, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} placeholder="Tags (pisahkan koma)" className="p-2 border rounded-md bg-white w-full"/>
                                </div>
                                <div className="flex justify-end gap-2 mt-3">
                                    <button onClick={() => setEditingQuestion(null)} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                                    <button onClick={handleUpdate} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                     <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-900">Bank Soal Kosong</h3>
                        <p className="text-gray-700 mt-2">Buka editor ujian dan gunakan tombol "Simpan ke Bank" pada soal untuk menambahkannya ke sini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}