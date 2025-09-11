import React, { useState, useEffect, useRef } from 'react';
import type { Exam, Question, Option, Section, SubQuestion, BankQuestion, MatchingItem } from '../types';
import { QuestionType } from '../types';
import QuestionBankModal from './QuestionBankModal';
import { PlusIcon, TrashIcon, PrintIcon, BoldIcon, ItalicIcon, UnderlineIcon, PaletteIcon, BookmarkIcon, ArchiveIcon, AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, DragHandleIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

const instructionDefaults: Record<QuestionType, string> = {
    [QuestionType.MULTIPLE_CHOICE]: 'Berilah tanda silang (X) pada pilihan jawaban yang benar!',
    [QuestionType.MULTIPLE_CHOICE_COMPLEX]: 'Pilihlah jawaban yang benar dengan memberi tanda centang (✓). Jawaban benar bisa lebih dari satu.',
    [QuestionType.TRUE_FALSE]: 'Tentukan apakah pernyataan berikut Benar atau Salah!',
    [QuestionType.MATCHING]: 'Jodohkan pernyataan di kolom A dengan jawaban yang sesuai di kolom B!',
    [QuestionType.SHORT_ANSWER]: 'Isilah titik-titik di bawah ini dengan jawaban yang benar dan tepat!',
    [QuestionType.ESSAY]: 'Jawablah pertanyaan di bawah ini dengan benar!',
};

const toRoman = (num: number): string => {
    const map: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let result = '';
    for (const key in map) {
        result += key.repeat(Math.floor(num / map[key]));
        num %= map[key];
    }
    return result;
}

const SimpleEditor: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}> = ({ value, onChange, placeholder, className = '' }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    const execCmd = (command: string, value: string | null = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
        }
    };
    
    const colorInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`border border-gray-300 rounded-lg ${className}`}>
            <div className="flex items-center gap-1 p-1 border-b bg-gray-50 rounded-t-lg flex-nowrap overflow-x-auto">
                <button type="button" onClick={() => execCmd('bold')} className="p-2 hover:bg-gray-200 rounded-md" title="Bold"><BoldIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('italic')} className="p-2 hover:bg-gray-200 rounded-md" title="Italic"><ItalicIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('underline')} className="p-2 hover:bg-gray-200 rounded-md" title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
                <label className="relative p-2 hover:bg-gray-200 rounded-md cursor-pointer" title="Warna Teks">
                    <PaletteIcon className="w-4 h-4"/>
                    <input type="color" ref={colorInputRef} onChange={(e) => execCmd('foreColor', e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
                </label>
                 <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-gray-200 rounded-md" title="Rata Kiri"><AlignLeftIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-gray-200 rounded-md" title="Rata Tengah"><AlignCenterIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-gray-200 rounded-md" title="Rata Kanan"><AlignRightIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('justifyFull')} className="p-2 hover:bg-gray-200 rounded-md" title="Rata Kanan-Kiri"><AlignJustifyIcon className="w-4 h-4" /></button>
            </div>
            <div ref={editorRef} contentEditable onInput={handleInput} className="custom-editor !border-0 !rounded-t-none !shadow-none !ring-0" data-placeholder={placeholder}/>
        </div>
    );
};


const QuestionItem: React.FC<{
    question: Question;
    updateQuestion: (q: Question) => void;
    removeQuestion: (id: string) => void;
    onSaveToBank: (q: Question) => void;
}> = ({ question, updateQuestion, removeQuestion, onSaveToBank }) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [justSaved, setJustSaved] = useState(false);

    const handleTextChange = (html: string) => {
        updateQuestion({ ...question, questionText: html });
    };
    
    const handleOptionChange = (optId: string, field: 'text' | 'label', value: string) => {
        const newOptions = question.options.map(opt => opt.id === optId ? {...opt, [field]: value} : opt);
        updateQuestion({ ...question, options: newOptions });
    };
    
    const handleAddOption = () => {
        const nextIndex = question.options.length;
        const defaultLabel = String.fromCharCode(97 + nextIndex);
        
        const newOption: Option = { id: crypto.randomUUID(), text: '', label: defaultLabel };
        updateQuestion({ ...question, options: [...question.options, newOption] });
    };

    const handleRemoveOption = (optId: string) => {
        const newOptions = question.options.filter(opt => opt.id !== optId);
        updateQuestion({ ...question, options: newOptions });
    };
    
    const setCorrectAnswer = (optId: string) => {
        updateQuestion({ ...question, correctAnswerIds: [optId] });
    };

    const toggleCorrectAnswer = (optId: string) => {
        const currentAnswers = question.correctAnswerIds || [];
        const newAnswers = currentAnswers.includes(optId)
            ? currentAnswers.filter(id => id !== optId)
            : [...currentAnswers, optId];
        updateQuestion({ ...question, correctAnswerIds: newAnswers });
    };

    const handleAddSubQuestion = () => {
        const nextChar = String.fromCharCode(97 + (question.subQuestions?.length || 0)); // a, b, c...
        const newSub: SubQuestion = {
            id: crypto.randomUUID(),
            number: nextChar,
            text: '',
        };
        const newSubQuestions = [...(question.subQuestions || []), newSub];
        updateQuestion({ ...question, subQuestions: newSubQuestions });
    };
    
    const handleUpdateSubQuestion = (subId: string, field: 'number' | 'text', value: string) => {
        const newSubQuestions = question.subQuestions?.map(sub => 
            sub.id === subId ? { ...sub, [field]: value } : sub
        );
        updateQuestion({ ...question, subQuestions: newSubQuestions });
    };

    const handleRemoveSubQuestion = (subId: string) => {
        const newSubQuestions = question.subQuestions?.filter(sub => sub.id !== subId);
        updateQuestion({ ...question, subQuestions: newSubQuestions });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) { // 1MB limit
            alert('Ukuran gambar terlalu besar. Maksimal 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updateQuestion({ ...question, image: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        updateQuestion({ ...question, image: null });
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };
    
    const handleSaveToBankClick = () => {
        onSaveToBank(question);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
    };

    // --- Matching Question Handlers ---
    const handleMatchingItemChange = (type: 'premises' | 'responses', id: string, text: string) => {
        const key = type === 'premises' ? 'matchingPremises' : 'matchingResponses';
        const items = (question[key] || []).map(item => item.id === id ? { ...item, text } : item);
        updateQuestion({ ...question, [key]: items });
    };

    const addMatchingItem = (type: 'premises' | 'responses') => {
        const key = type === 'premises' ? 'matchingPremises' : 'matchingResponses';
        const newItem: MatchingItem = { id: crypto.randomUUID(), text: '' };
        updateQuestion({ ...question, [key]: [...(question[key] || []), newItem] });
    };

    const removeMatchingItem = (type: 'premises' | 'responses', id: string) => {
        const key = type === 'premises' ? 'matchingPremises' : 'matchingResponses';
        const items = (question[key] || []).filter(item => item.id !== id);
        updateQuestion({ ...question, [key]: items });
    };

    const handleMatchingAnswerChange = (premiseId: string, responseId: string) => {
        let newAnswers = [...(question.answerKeyMatching || [])];
        const existingIndex = newAnswers.findIndex(ans => ans.premiseId === premiseId);
        if (responseId) { // Add or update answer
            if (existingIndex > -1) newAnswers[existingIndex] = { premiseId, responseId };
            else newAnswers.push({ premiseId, responseId });
        } else { // Remove answer if dropdown is cleared
            if (existingIndex > -1) newAnswers.splice(existingIndex, 1);
        }
        updateQuestion({ ...question, answerKeyMatching: newAnswers });
    };


    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm mt-4">
            <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2 flex-grow">
                    <input
                        type="text"
                        value={question.questionNumber}
                        onChange={(e) => updateQuestion({ ...question, questionNumber: e.target.value })}
                        className="w-12 p-1 border rounded-md bg-white text-center font-bold"
                        aria-label="Nomor Soal"
                    />
                    <label className="font-semibold text-gray-800">.</label>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleSaveToBankClick} className={`p-1 ${justSaved ? 'text-green-600' : 'text-blue-600 hover:bg-blue-100'} rounded-full flex-shrink-0`} title="Simpan ke Bank Soal">
                        <BookmarkIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => removeQuestion(question.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>

            <div className="my-2">
                {question.image ? (
                    <div className="relative group w-fit">
                        <img src={question.image} alt="Lampiran Soal" className="max-w-full max-h-48 rounded-md border object-contain" />
                        <button 
                            onClick={handleRemoveImage} 
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1"
                        >
                            <TrashIcon className="w-3 h-3"/> Hapus
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={() => imageInputRef.current?.click()} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                           <PlusIcon className="w-4 h-4"/> Tambah Gambar
                        </button>
                        <span className="text-xs text-gray-500">(Maks. 1MB)</span>
                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden"
                            aria-label="Upload Gambar Soal"
                        />
                    </div>
                )}
            </div>

            <SimpleEditor
                value={question.questionText}
                onChange={handleTextChange}
                placeholder="Tulis pertanyaan atau instruksi soal di sini..."
            />

            {question.type === QuestionType.MULTIPLE_CHOICE && (
                <div className="mt-4 space-y-2">
                    <h5 className="font-semibold text-sm text-gray-800">Opsi Jawaban:</h5>
                    {question.options.map((opt, optIndex) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={`correct-answer-${question.id}`}
                                checked={question.correctAnswerIds?.[0] === opt.id}
                                onChange={() => setCorrectAnswer(opt.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                title="Tandai sebagai jawaban benar"
                            />
                             <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => handleOptionChange(opt.id, 'label', e.target.value)}
                                className="w-10 p-1 border rounded-md bg-white text-center"
                                aria-label={`Label Opsi ${optIndex + 1}`}
                            />
                            <span className="font-semibold">.</span>
                            <div className="flex-1">
                                <SimpleEditor
                                    value={opt.text}
                                    onChange={(html) => handleOptionChange(opt.id, 'text', html)}
                                    placeholder={`Teks untuk opsi ${opt.label}`}
                                />
                            </div>
                            {question.options.length > 1 &&
                                <button onClick={() => handleRemoveOption(opt.id)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                            }
                        </div>
                    ))}
                    <button onClick={handleAddOption} className="text-sm text-blue-600 hover:underline">+ Tambah Opsi</button>
                </div>
            )}

            {question.type === QuestionType.MULTIPLE_CHOICE_COMPLEX && (
                <div className="mt-4 space-y-2">
                    <h5 className="font-semibold text-sm text-gray-800">Opsi Jawaban (pilih satu atau lebih):</h5>
                    {question.options.map((opt, optIndex) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={question.correctAnswerIds?.includes(opt.id)}
                                onChange={() => toggleCorrectAnswer(opt.id)}
                                className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                title="Tandai sebagai jawaban benar"
                            />
                             <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => handleOptionChange(opt.id, 'label', e.target.value)}
                                className="w-10 p-1 border rounded-md bg-white text-center"
                                aria-label={`Label Opsi ${optIndex + 1}`}
                            />
                            <span className="font-semibold">.</span>
                            <div className="flex-1">
                                <SimpleEditor
                                    value={opt.text}
                                    onChange={(html) => handleOptionChange(opt.id, 'text', html)}
                                    placeholder={`Teks untuk opsi ${opt.label}`}
                                />
                            </div>
                            {question.options.length > 1 &&
                                <button onClick={() => handleRemoveOption(opt.id)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                            }
                        </div>
                    ))}
                    <button onClick={handleAddOption} className="text-sm text-blue-600 hover:underline">+ Tambah Opsi</button>
                </div>
            )}

            {question.type === QuestionType.TRUE_FALSE && (
                <div className="mt-4">
                    <h5 className="font-semibold text-sm text-gray-800 mb-2">Kunci Jawaban:</h5>
                     <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`tf-answer-${question.id}`} value="true" checked={question.trueFalseAnswer === 'true'} onChange={e => updateQuestion({...question, trueFalseAnswer: 'true'})} className="h-4 w-4"/>
                            <span>Benar</span>
                        </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`tf-answer-${question.id}`} value="false" checked={question.trueFalseAnswer === 'false'} onChange={e => updateQuestion({...question, trueFalseAnswer: 'false'})} className="h-4 w-4"/>
                            <span>Salah</span>
                        </label>
                    </div>
                </div>
            )}

            {question.type === QuestionType.MATCHING && (
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kolom A (Premises) */}
                        <div className="space-y-2">
                            <h5 className="font-semibold text-sm text-gray-800">Kolom A (Pernyataan)</h5>
                            {question.matchingPremises?.map((premise, index) => (
                                <div key={premise.id} className="flex items-center gap-2">
                                    <span className="font-semibold">{index + 1}.</span>
                                    <div className="flex-1">
                                        <SimpleEditor value={premise.text} onChange={html => handleMatchingItemChange('premises', premise.id, html)} placeholder="Tulis pernyataan..."/>
                                    </div>
                                    <button onClick={() => removeMatchingItem('premises', premise.id)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                            <button onClick={() => addMatchingItem('premises')} className="text-sm text-blue-600 hover:underline">+ Tambah Pernyataan</button>
                        </div>
                        {/* Kolom B (Responses) */}
                        <div className="space-y-2">
                             <h5 className="font-semibold text-sm text-gray-800">Kolom B (Jawaban)</h5>
                             {question.matchingResponses?.map((response, index) => (
                                <div key={response.id} className="flex items-center gap-2">
                                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                                    <div className="flex-1">
                                        <SimpleEditor value={response.text} onChange={html => handleMatchingItemChange('responses', response.id, html)} placeholder="Tulis jawaban..."/>
                                    </div>
                                    <button onClick={() => removeMatchingItem('responses', response.id)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                            <button onClick={() => addMatchingItem('responses')} className="text-sm text-blue-600 hover:underline">+ Tambah Jawaban</button>
                        </div>
                    </div>
                     {/* Kunci Jawaban */}
                    <div className="pt-4 border-t">
                        <h5 className="font-semibold text-sm text-gray-800 mb-2">Kunci Jawaban (Menjodohkan):</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {question.matchingPremises?.map((premise, index) => (
                                <div key={premise.id} className="flex items-center gap-2">
                                    <label className="font-semibold flex-shrink-0">Soal {index + 1} &rarr;</label>
                                    <select 
                                        value={question.answerKeyMatching?.find(ans => ans.premiseId === premise.id)?.responseId || ''}
                                        onChange={e => handleMatchingAnswerChange(premise.id, e.target.value)}
                                        className="p-1 border rounded-md bg-white w-full"
                                    >
                                        <option value="">Pilih...</option>
                                        {question.matchingResponses?.map((response, rIndex) => (
                                            <option key={response.id} value={response.id}>
                                                Opsi {String.fromCharCode(65 + rIndex)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {(question.type === 'ESSAY' || question.type === 'SHORT_ANSWER') && (
                <div className="mt-4 space-y-3">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
                            <span role="img" aria-label="Key">🔑</span>
                            <span>Kunci Jawaban (tidak akan tercetak)</span>
                        </label>
                         <SimpleEditor
                            value={question.answerKey || ''}
                            onChange={(html) => updateQuestion({ ...question, answerKey: html })}
                            placeholder="Masukkan poin-poin kunci atau jawaban yang diharapkan..."
                            className="bg-gray-50 text-sm"
                        />
                    </div>

                    <div className="pl-4 border-l-2 border-gray-200">
                        <h5 className="font-semibold text-sm text-gray-800 mb-2">Sub Soal (opsional):</h5>
                        {question.subQuestions?.map((sub) => (
                             <div key={sub.id} className="flex items-start gap-2 mb-2">
                                <input
                                    type="text"
                                    value={sub.number}
                                    onChange={(e) => handleUpdateSubQuestion(sub.id, 'number', e.target.value)}
                                    className="w-10 p-1 border rounded-md bg-white text-center"
                                    aria-label="Nomor Sub Soal"
                                />
                                <span className="pt-2">.</span>
                                <div className='flex-1'>
                                    <SimpleEditor
                                        value={sub.text}
                                        onChange={(html) => handleUpdateSubQuestion(sub.id, 'text', html)}
                                        placeholder="Tulis sub pertanyaan di sini..."
                                    />
                                </div>
                                <button onClick={() => handleRemoveSubQuestion(sub.id)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full mt-2"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                        <button onClick={handleAddSubQuestion} className="text-sm text-blue-600 hover:underline mt-2 flex items-center gap-1">
                            <PlusIcon className="w-4 h-4"/> Tambah Sub Soal
                        </button>
                    </div>

                    {question.type === 'ESSAY' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!question.includeAnswerSpace}
                                    onChange={(e) => updateQuestion({ ...question, includeAnswerSpace: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">Sediakan ruang jawaban di lembar soal</span>
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function Editor({ 
    exam, 
    onSave, 
    onCancel,
    onPreview,
    bank,
    addQuestionToBank,
    allExamsForMeta,
    showIndicator,
}: { 
    exam: Exam | null; 
    onSave: (exam: Exam | Omit<Exam, 'id' | 'createdAt'>) => void; 
    onCancel: () => void; 
    onPreview: (exam: Exam) => void;
    bank: BankQuestion[];
    addQuestionToBank: (question: Question, subject: string, grade: string, tags: string[]) => boolean;
    allExamsForMeta: { subject: string, grade: string }[];
    showIndicator: (message: string) => void;
}) {
    const AUTOSAVE_KEY = 'soalgenius-autosave';
    const emptyExam: Omit<Exam, 'id' | 'createdAt'> = { title: '', subject: '', grade: '', time: 90, status: 'draft', description: '', sections: [{ id: crypto.randomUUID(), title: 'I', instruction: '', questions: [] }] };
    const [currentExam, setCurrentExam] = useState<Exam | Omit<Exam, 'id'|'createdAt'>>(exam || emptyExam);
    const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const isMounted = useRef(false);
    const [isBankModalOpen, setBankModalOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<{type: 'section' | 'question', sectionId: string, questionId?: string} | null>(null);
    const [isInfoCollapsed, setInfoCollapsed] = useState(false);

    // On component mount, check for autosaved data
    useEffect(() => {
        try {
            const autosavedData = localStorage.getItem(AUTOSAVE_KEY);
            if (autosavedData) {
                const restoredExam: Exam = JSON.parse(autosavedData);
                if (restoredExam && restoredExam.title !== undefined && restoredExam.sections) {
                    if (window.confirm('Ditemukan draf yang belum disimpan. Apakah Anda ingin memulihkannya?')) setCurrentExam(restoredExam);
                    else localStorage.removeItem(AUTOSAVE_KEY);
                }
            }
        } catch (error) {
            console.error("Gagal memulihkan dari autosave:", error);
            localStorage.removeItem(AUTOSAVE_KEY);
        }
        const mountTimer = setTimeout(() => { isMounted.current = true; }, 500);
        return () => clearTimeout(mountTimer);
    }, []);

    // Autosave logic
    useEffect(() => {
        if (!isMounted.current) return;
        setAutosaveStatus('saving');
        const handler = setTimeout(() => {
            try {
                if (currentExam.title || currentExam.subject || currentExam.grade || currentExam.sections.some(s => s.questions.length > 0)) {
                    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(currentExam));
                    setAutosaveStatus('saved');
                } else setAutosaveStatus('idle');
            } catch (error) {
                console.error("Gagal menyimpan otomatis:", error);
                setAutosaveStatus('error');
            }
        }, 1500);
        return () => clearTimeout(handler);
    }, [currentExam]);

    useEffect(() => {
        if (!exam) setCurrentExam(emptyExam);
        else if ('id' in currentExam && exam.id !== currentExam.id) setCurrentExam(exam);
    }, [exam]);

    const updateExamInfo = <K extends keyof Omit<Exam, 'id'|'createdAt'|'sections'>>(field: K, value: (Omit<Exam, 'id'|'createdAt'|'sections'>)[K]) => setCurrentExam(prev => ({ ...prev, [field]: value }));
    const addSection = () => setCurrentExam(prev => ({...prev, sections: [...prev.sections, { id: crypto.randomUUID(), title: toRoman(prev.sections.length + 1), instruction: '', questions: [] }]}));
    const updateSection = (id: string, field: keyof Section, value: string) => setCurrentExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s) }));
    const removeSection = (id: string) => {
        if (!window.confirm('Yakin ingin menghapus bagian ini beserta semua soal di dalamnya?')) return;
        if (currentExam.sections.length <= 1) { alert("Tidak bisa menghapus satu-satunya bagian soal."); return; }
        setCurrentExam(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    };
    
    const addQuestion = (sectionId: string, type: QuestionType) => {
        setCurrentExam(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    const newQuestion: Question = {
                        id: crypto.randomUUID(),
                        type,
                        questionNumber: (s.questions.length + 1).toString(),
                        questionText: '',
                        image: null,
                        options: type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE_COMPLEX ? Array.from({ length: 4 }, (v, i) => ({ id: crypto.randomUUID(), text: '', label: String.fromCharCode(97 + i) })) : [],
                        correctAnswerIds: [],
                        includeAnswerSpace: false,
                        subQuestions: [],
                        answerKey: '',
                        trueFalseAnswer: type === QuestionType.TRUE_FALSE ? 'true' : null,
                        matchingPremises: type === QuestionType.MATCHING ? Array.from({ length: 3 }, () => ({ id: crypto.randomUUID(), text: '' })) : [],
                        matchingResponses: type === QuestionType.MATCHING ? Array.from({ length: 3 }, () => ({ id: crypto.randomUUID(), text: '' })) : [],
                        answerKeyMatching: [],
                    };

                    const isInstructionEmpty = !s.instruction || (s.instruction.replace(/<[^>]*>?/gm, '').trim() === '');
                    
                    const instruction = isInstructionEmpty ? instructionDefaults[type] : s.instruction;
                    return { ...s, instruction, questions: [...s.questions, newQuestion] };
                }
                return s;
            })
        }));
    };
    
    const updateQuestion = (sectionId: string, updatedQuestion: Question) => setCurrentExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, questions: s.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q) } : s) }));
    const removeQuestion = (sectionId: string, questionId: string) => setCurrentExam(prev => ({...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, questions: s.questions.filter(q => q.id !== questionId).map((q, i) => ({ ...q, questionNumber: (i + 1).toString() })) } : s) }));
    const handleSave = () => { onSave(currentExam); localStorage.removeItem(AUTOSAVE_KEY); };
    const handleCancel = () => { if (!localStorage.getItem(AUTOSAVE_KEY) || window.confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?')) { localStorage.removeItem(AUTOSAVE_KEY); onCancel(); } };
    const handleSaveQuestionToBank = (question: Question) => { if (addQuestionToBank(question, currentExam.subject, currentExam.grade, [])) showIndicator('Soal berhasil disimpan ke bank!'); };
    const handleOpenBankModal = (sectionId: string) => { setActiveSectionId(sectionId); setBankModalOpen(true); };

    const handleAddQuestionsFromBank = (questionsToAdd: Question[]) => {
        if (!activeSectionId) return;
        setCurrentExam(prev => ({...prev, sections: prev.sections.map(s => s.id === activeSectionId ? {...s, questions: [...s.questions, ...questionsToAdd.map((q, i) => ({...q, id: crypto.randomUUID(), questionNumber: (s.questions.length + i + 1).toString()}))]} : s) }));
        setActiveSectionId(null);
    };

    const handleDragStart = (e: React.DragEvent, type: 'section' | 'question', sectionId: string, questionId?: string) => { e.dataTransfer.effectAllowed = 'move'; setDraggedItem({ type, sectionId, questionId }); };
    const handleDragEnd = () => setDraggedItem(null);
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    const handleDrop = (e: React.DragEvent, targetSectionId: string, targetQuestionId?: string) => {
        e.preventDefault();
        if (!draggedItem) return;
        const { type: sourceType, sectionId: sourceSectionId, questionId: sourceQuestionId } = draggedItem;

        setCurrentExam(prev => {
            const newSections = JSON.parse(JSON.stringify(prev.sections));
            // Move Section
            if (sourceType === 'section' && sourceSectionId !== targetSectionId) {
                const sourceIndex = newSections.findIndex((s: Section) => s.id === sourceSectionId);
                const targetIndex = newSections.findIndex((s: Section) => s.id === targetSectionId);
                if (sourceIndex === -1 || targetIndex === -1) return prev;
                const [movedSection] = newSections.splice(sourceIndex, 1);
                newSections.splice(targetIndex, 0, movedSection);
                return { ...prev, sections: newSections.map((s: Section, i: number) => ({ ...s, title: toRoman(i + 1) })) };
            }
            // Move Question
            if (sourceType === 'question' && sourceQuestionId && targetQuestionId && sourceQuestionId !== targetQuestionId) {
                const section = newSections.find((s: Section) => s.id === sourceSectionId);
                if (!section) return prev;
                const sourceIndex = section.questions.findIndex((q: Question) => q.id === sourceQuestionId);
                const targetIndex = section.questions.findIndex((q: Question) => q.id === targetQuestionId);
                if (sourceIndex === -1 || targetIndex === -1) return prev;
                const [movedQuestion] = section.questions.splice(sourceIndex, 1);
                section.questions.splice(targetIndex, 0, movedQuestion);
                section.questions.forEach((q: Question, i: number) => q.questionNumber = (i + 1).toString());
                return { ...prev, sections: newSections };
            }
            return prev;
        });
        handleDragEnd();
    };


    const AutosaveIndicator = () => {
        switch(autosaveStatus) {
            case 'saving': return <span className="text-sm text-gray-500 italic">Menyimpan...</span>;
            case 'saved': return <><span className="text-sm text-green-600 sm:hidden">Disimpan</span><span className="text-sm text-green-600 hidden sm:inline">Perubahan disimpan</span></>;
            case 'error': return <span className="text-sm text-red-600">Gagal</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-40 sm:pb-28">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">{exam ? 'Ubah Ujian' : 'Buat Ujian Baru'}</h2>

            <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
                 <button onClick={() => setInfoCollapsed(prev => !prev)} className="w-full flex justify-between items-center p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Informasi Ujian</h3>
                    {isInfoCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-600"/> : <ChevronUpIcon className="w-5 h-5 text-gray-600"/>}
                </button>
                {!isInfoCollapsed && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Judul Ujian (e.g. Ujian Akhir Semester)" value={currentExam.title} onChange={e => updateExamInfo('title', e.target.value)} className="p-2 border rounded-md bg-white" />
                            <input type="text" placeholder="Mata Pelajaran" value={currentExam.subject} onChange={e => updateExamInfo('subject', e.target.value)} className="p-2 border rounded-md bg-white" />
                            <input type="text" placeholder="Kelas / Jenjang" value={currentExam.grade} onChange={e => updateExamInfo('grade', e.target.value)} className="p-2 border rounded-md bg-white" />
                            <input type="number" placeholder="Waktu (menit)" value={currentExam.time} onChange={e => updateExamInfo('time', Number(e.target.value))} className="p-2 border rounded-md bg-white" />
                        </div>
                         <div className="mt-4">
                            <textarea placeholder="Keterangan (e.g. 'Untuk Remedial', tidak akan dicetak)..." value={currentExam.description || ''} onChange={e => updateExamInfo('description', e.target.value)} className="p-2 border rounded-md bg-white w-full" rows={2}/>
                        </div>
                    </div>
                )}
            </div>
            
            <div>
                {currentExam.sections.map((section, sectionIndex) => (
                    <div key={section.id} draggable onDragStart={(e) => handleDragStart(e, 'section', section.id)} onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, section.id)} onDragOver={handleDragOver} className={`transition-opacity ${draggedItem?.sectionId === section.id ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 relative">
                            <div className="absolute left-0 top-0 bottom-0 flex items-center -ml-8 cursor-grab text-gray-400 hover:text-gray-700" title="Seret untuk menyusun ulang bagian"><DragHandleIcon /></div>
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-xl font-semibold text-gray-800">Bagian Soal {toRoman(sectionIndex + 1)}</h3>
                                {currentExam.sections.length > 1 && <button onClick={() => removeSection(section.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-start">
                                <input type="text" placeholder="Judul (e.g. I, A)" value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)} className="p-2 border rounded-md md:col-span-1 bg-white" />
                                <div className="md:col-span-3"><SimpleEditor value={section.instruction} onChange={(html) => updateSection(section.id, 'instruction', html)} placeholder="Instruksi pengerjaan soal..."/></div>
                            </div>
                            
                            <div>
                            {section.questions.map((q) => (
                                <div key={q.id} draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, 'question', section.id, q.id); }} onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }} onDrop={(e) => { e.stopPropagation(); handleDrop(e, section.id, q.id); }} onDragOver={handleDragOver} className={`relative transition-opacity ${draggedItem?.questionId === q.id ? 'opacity-50' : 'opacity-100'}`}>
                                    <div className="flex items-start gap-2">
                                        <div className="cursor-grab text-gray-400 hover:text-gray-700 pt-5" title="Seret untuk menyusun ulang soal"><DragHandleIcon className="w-5 h-5"/></div>
                                        <div className="flex-1"><QuestionItem question={q} updateQuestion={(uq) => updateQuestion(section.id, uq)} removeQuestion={(qid) => removeQuestion(section.id, qid)} onSaveToBank={handleSaveQuestionToBank}/></div>
                                    </div>
                                </div>
                            ))}
                            </div>

                            <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                                <p className="font-semibold text-gray-800">Tambah Soal:</p>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    <button onClick={() => addQuestion(section.id, QuestionType.MULTIPLE_CHOICE)} className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-sky-200">Pilihan Ganda</button>
                                    <button onClick={() => addQuestion(section.id, QuestionType.MULTIPLE_CHOICE_COMPLEX)} className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-cyan-200">PG Kompleks</button>
                                    <button onClick={() => addQuestion(section.id, QuestionType.TRUE_FALSE)} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-rose-200">Benar-Salah</button>
                                    <button onClick={() => addQuestion(section.id, QuestionType.MATCHING)} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-violet-200">Menjodohkan</button>
                                    <button onClick={() => addQuestion(section.id, QuestionType.SHORT_ANSWER)} className="bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-lime-200">Isian Singkat</button>
                                    <button onClick={() => addQuestion(section.id, QuestionType.ESSAY)} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-200">Uraian</button>
                                    <button onClick={() => handleOpenBankModal(section.id)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-200 flex items-center gap-1.5"><ArchiveIcon className="w-4 h-4"/> Dari Bank Soal</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <button onClick={addSection} className="w-full flex justify-center items-center gap-2 text-blue-600 border-2 border-dashed border-blue-300 rounded-lg py-3 hover:bg-blue-50 transition-colors">
                <PlusIcon className="w-5 h-5" /><span>Tambah Bagian Soal Baru</span>
            </button>

            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10 no-print">
                <div className="max-w-4xl mx-auto p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 hidden sm:inline-block mr-2">Status:</label>
                            <button onClick={() => updateExamInfo('status', 'draft')} className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${currentExam.status === 'draft' ? 'bg-yellow-100 text-yellow-800 font-semibold ring-1 ring-yellow-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Draft</button>
                            <button onClick={() => updateExamInfo('status', 'finished')} className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${currentExam.status === 'finished' ? 'bg-green-100 text-green-800 font-semibold ring-1 ring-green-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Selesai</button>
                        </div>
                        <div className="block sm:hidden"><AutosaveIndicator /></div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="hidden sm:block mr-4"><AutosaveIndicator /></div>
                        <button onClick={handleCancel} className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 text-sm flex-1 sm:flex-initial">Batal</button>
                        <button onClick={() => onPreview(currentExam as Exam)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 text-sm flex-1 sm:flex-initial">
                            <PrintIcon className="w-5 h-5" /><span className="hidden sm:inline">Pratinjau</span>
                        </button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex-1 sm:flex-initial">Simpan</button>
                    </div>
                </div>
            </div>
            {isBankModalOpen && <QuestionBankModal isOpen={isBankModalOpen} onClose={() => setBankModalOpen(false)} bank={bank} onAddQuestions={handleAddQuestionsFromBank} allExams={allExamsForMeta}/>}
        </div>
    );
}