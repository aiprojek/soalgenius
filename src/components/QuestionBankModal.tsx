
import React, { useState, useMemo } from 'react';
import type { BankQuestion, Question } from '../types';
import { SearchIcon } from './Icons';
import Modal from './Modal';

const RawHtmlRenderer: React.FC<{ html: string; className?: string }> = ({ html, className }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

interface QuestionBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    bank: BankQuestion[];
    onAddQuestions: (questions: Question[]) => void;
    allExams: { subject: string, grade: string }[];
}

export default function QuestionBankModal({ isOpen, onClose, bank, onAddQuestions, allExams }: QuestionBankModalProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterSubject, setFilterSubject] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBank = useMemo(() => {
        return bank.filter(q => {
            const subjectMatch = filterSubject ? q.subject === filterSubject : true;
            const gradeMatch = filterGrade ? q.grade === filterGrade : true;
            const termMatch = searchTerm ? 
                (q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 q.tags.join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            return subjectMatch && gradeMatch && termMatch;
        });
    }, [bank, filterSubject, filterGrade, searchTerm]);

    const uniqueSubjects = useMemo(() => [...new Set(allExams.map(e => e.subject).concat(bank.map(q => q.subject)))].filter(Boolean).sort(), [allExams, bank]);
    const uniqueGrades = useMemo(() => [...new Set(allExams.map(e => e.grade).concat(bank.map(q => q.grade)))].filter(Boolean).sort(), [allExams, bank]);

    const toggleSelection = (questionId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleAdd = () => {
        const questionsToAdd = bank.filter(q => selectedIds.has(q.id));
        // Create deep copies to prevent reference issues
        const copiedQuestions = JSON.parse(JSON.stringify(questionsToAdd));
        onAddQuestions(copiedQuestions);
        onClose();
        setSelectedIds(new Set());
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pilih Soal dari Bank" size="4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-2 bg-gray-50 rounded-md border sticky top-0">
                 <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                    <option value="">Semua Mapel</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                    <option value="">Semua Kelas</option>
                    {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="relative">
                    <input type="text" placeholder="Cari soal..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-md w-full bg-white pl-10"/>
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {filteredBank.map(q => {
                    const isSelected = selectedIds.has(q.id);
                    return (
                        <div 
                            key={q.id} 
                            onClick={() => toggleSelection(q.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <div className="flex-1 min-w-0">
                                    <RawHtmlRenderer html={q.questionText} className="text-sm break-words line-clamp-2" />
                                    <div className="text-xs text-gray-500 mt-1">{q.subject} - {q.grade}</div>
                                </div>
                            </label>
                        </div>
                    );
                })}
                 {filteredBank.length === 0 && <p className="text-center text-gray-500 py-8">Tidak ada soal yang cocok dengan filter.</p>}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center sticky bottom-0">
                <p className="text-sm font-semibold">{selectedIds.size} soal dipilih</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                    <button onClick={handleAdd} disabled={selectedIds.size === 0} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        Tambahkan ke Ujian
                    </button>
                </div>
            </div>
        </Modal>
    );
}
