import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import type { Exam, HeaderSettings, HeaderLine, Question, BankQuestion } from './types';
import { useExams } from './hooks/useExams';
import { useQuestionBank } from './hooks/useQuestionBank';
import Archive from './components/Archive';
import Editor from './components/Editor';
import Modal from './components/Modal';
import WelcomeModal from './components/WelcomeModal';
import QuestionBank from './components/QuestionBank';
import Settings from './components/Settings';
import { QuestionType } from './types';
import { SettingsIcon, DownloadIcon, UploadIcon, LogoIcon, PlusIcon, TrashIcon, ZoomInIcon, ZoomOutIcon, FileCodeIcon, PrintIcon, ArchiveIcon, InfoIcon, HeartIcon, MessageSquareIcon, GithubIcon, BookmarkIcon, CheckCircleIcon, WandIcon, CoffeeIcon, DragHandleIcon, EditorIcon, BankIcon, MenuIcon } from './components/Icons';

const RawHtmlRenderer: React.FC<{ html: string; className?: string }> = ({ html, className }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

const AutoFitText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
    const textRef = useRef<HTMLDivElement>(null);

    const fitText = useCallback(() => {
        const el = textRef.current;
        if (!el || !el.parentElement) return;
        const parent = el.parentElement;

        if (parent.clientWidth === 0) {
            setTimeout(fitText, 50); 
            return;
        }

        el.style.visibility = 'hidden';
        el.style.whiteSpace = 'nowrap';
        
        let fontSize = 19; // Default to ~14pt (14 * 4/3 = 18.66px)
        el.style.fontSize = `${fontSize}px`;

        while (el.scrollWidth > parent.clientWidth && fontSize > 8) {
            fontSize -= 0.5;
            el.style.fontSize = `${fontSize}px`;
        }
        
        el.style.visibility = 'visible';
    }, []);

    useLayoutEffect(() => {
        fitText();
    }, [text, fitText]);

    useEffect(() => {
        const handleResize = () => requestAnimationFrame(fitText);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [fitText]);

    return (
        <div ref={textRef} className={`whitespace-nowrap ${className || ''}`}>
            {text}
        </div>
    );
};


const PdfPreview: React.FC<{ exam: Exam, settings: HeaderSettings }> = ({ exam, settings }) => {
    const paperSizeStyles = {
        a4: 'w-[210mm] min-h-[297mm]',
        f4: 'w-[210mm] min-h-[330mm]'
    };
    const fontFamilyStyle = { 
        fontFamily: settings.fontFamily === 'sans' ? '"Liberation Sans", Arial, sans-serif' : '"Liberation Serif", "Times New Roman", serif' 
    };

    return (
        <div 
            className={`bg-white text-black shadow-lg ${paperSizeStyles[settings.paperSize]} overflow-hidden pb-8`}
            style={{ fontSize: '12pt', lineHeight: settings.lineHeight, ...fontFamilyStyle }}
        >
            <div style={{ padding: `${settings.margin}mm`, boxSizing: 'border-box' }}>
                {settings.showHeader && (
                    <div className="grid grid-cols-[auto_1fr_auto] items-center border-b-2 border-black pb-3 mb-4 gap-4">
                         <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                            {settings.showLogo && settings.logo && <img src={settings.logo} alt="Logo" className="h-full w-full object-contain" />}
                        </div>
                        <div className="text-center min-w-0 overflow-hidden">
                            {settings.headerLines.map(line => (
                                <AutoFitText key={line.id} text={line.text} className="font-bold" />
                            ))}
                        </div>
                        <div className="w-20 flex-shrink-0"></div> {/* Spacer for balance */}
                    </div>
                )}
                <h1 className="text-center font-bold text-xl mb-4 break-words">{exam.title}</h1>
                
                <div className="my-4 w-full flex items-stretch gap-4">
                    <div className="flex-1">
                        <div className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 gap-y-1">
                            <div className="font-semibold">Nama</div>
                            <div>:</div>
                            <div className="overflow-hidden whitespace-nowrap leading-tight">..................................................</div>
                            <div className="font-semibold whitespace-nowrap">Mata Pelajaran</div>
                            <div>:</div>
                            <div className="break-words">{exam.subject}</div>
                            <div className="font-semibold whitespace-nowrap">Kelas/Jenjang</div>
                            <div>:</div>
                            <div className="break-words">{exam.grade}</div>
                            <div className="font-semibold">Waktu</div>
                            <div>:</div>
                            <div>{exam.time} Menit</div>
                        </div>
                    </div>
                    <div className="w-28 border-2 border-black p-2 flex-shrink-0">
                        <p className="font-bold text-left" style={{ fontSize: '8pt' }}>NILAI</p>
                    </div>
                </div>


                <div className="mt-6">
                    {exam.sections?.map((section) => (
                        <div key={section.id} className="mb-6" style={{ breakInside: 'avoid' }}>
                            <div className="flex font-bold mb-2">
                               <span className="mr-2">{section.title}.</span>
                               <RawHtmlRenderer html={section.instruction} className="break-words flex-1 min-w-0" />
                            </div>
                            {section.questions.map((q) => {
                                return (
                                    <div key={q.id} className="mb-4 flex items-start mt-2" style={{ breakInside: 'avoid' }}>
                                        <span className="font-bold mr-2">{q.questionNumber}.</span>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            {q.image && (
                                                <div className="my-2 flex justify-center">
                                                    <img src={q.image} alt="Gambar Soal" className="max-w-md max-h-64 object-contain" />
                                                </div>
                                            )}
                                            <RawHtmlRenderer html={q.questionText} className="mb-2 break-words" />
                                            
                                            {q.subQuestions && q.subQuestions.length > 0 && (
                                                <div className="ml-4 space-y-2 mb-2">
                                                    {q.subQuestions.map(subQ => (
                                                        <div key={subQ.id} className="flex items-start">
                                                            <span className="mr-2">{subQ.number}.</span>
                                                             <RawHtmlRenderer html={subQ.text} className="flex-1 break-words" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {(q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.MULTIPLE_CHOICE_COMPLEX) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                                                    {q.options.map((opt) => (
                                                        <div key={opt.id} className="flex items-baseline">
                                                            <span className="flex-shrink-0">{opt.label}.</span>
                                                            <RawHtmlRenderer html={opt.text} className="break-words flex-1 min-w-0 ml-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {q.type === QuestionType.MATCHING && (
                                                <div className="mt-2 flex flex-col sm:flex-row gap-4 sm:gap-8">
                                                    <div className="flex-1 space-y-2">
                                                        {q.matchingPremises?.map((premise, index) => (
                                                            <div key={premise.id} className="flex items-start">
                                                                <span className="mr-2">{index + 1}.</span>
                                                                <RawHtmlRenderer html={premise.text} className="flex-1 break-words" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                         {q.matchingResponses?.map((response, index) => (
                                                            <div key={response.id} className="flex items-start">
                                                                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                                                                <RawHtmlRenderer html={response.text} className="flex-1 break-words" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {q.type === 'ESSAY' && q.includeAnswerSpace && (
                                                <div className="mt-4 grid grid-cols-[auto_1fr] items-start gap-x-2">
                                                    <p className="font-semibold">Jawab:</p>
                                                    <div className="space-y-4">
                                                        <div className="border-b border-dotted border-black" style={{ height: '1.5em' }}></div>
                                                        <div className="border-b border-dotted border-black" style={{ height: '1.5em' }}></div>
                                                        <div className="border-b border-dotted border-black" style={{ height: '1.5em' }}></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AnswerKeyPreview: React.FC<{ exam: Exam, settings: HeaderSettings }> = ({ exam, settings }) => {
    const paperSizeStyles = {
        a4: 'w-[210mm] min-h-[297mm]',
        f4: 'w-[210mm] min-h-[330mm]'
    };
    const fontFamilyStyle = { 
        fontFamily: settings.fontFamily === 'sans' ? '"Liberation Sans", Arial, sans-serif' : '"Liberation Serif", "Times New Roman", serif' 
    };

    return (
        <div 
            className={`bg-white text-black shadow-lg ${paperSizeStyles[settings.paperSize]} overflow-hidden pb-8`}
            style={{ fontSize: '12pt', lineHeight: settings.lineHeight, ...fontFamilyStyle }}
        >
            <div style={{ padding: `${settings.margin}mm`, boxSizing: 'border-box' }}>
                <div className="text-center border-b-2 border-black pb-3 mb-6">
                    <h1 className="text-xl font-bold">KUNCI JAWABAN</h1>
                    <h2 className="text-lg font-semibold mt-2">{exam.title}</h2>
                    <p className="text-sm">{exam.subject} - {exam.grade}</p>
                </div>

                {exam.sections.map(section => (
                    <div key={section.id} className="mb-6" style={{ breakInside: 'avoid' }}>
                        <h3 className="text-lg font-bold mb-3">{section.title}.</h3>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                             {section.questions.map(q => (
                                <React.Fragment key={q.id}>
                                    <div className="font-bold text-right">{q.questionNumber}.</div>
                                    <div>
                                        {q.type === QuestionType.MULTIPLE_CHOICE && (
                                            q.options.find(o => o.id === q.correctAnswerIds?.[0])?.label?.toUpperCase() || <span className="text-red-600 italic">Belum diatur</span>
                                        )}
                                        {q.type === QuestionType.MULTIPLE_CHOICE_COMPLEX && (
                                            (q.correctAnswerIds && q.correctAnswerIds.length > 0) ?
                                            q.options
                                                .filter(o => q.correctAnswerIds?.includes(o.id))
                                                .map(o => o.label.toUpperCase())
                                                .join(', ')
                                            : <span className="text-red-600 italic">Belum diatur</span>
                                        )}
                                        {q.type === QuestionType.TRUE_FALSE && (
                                            q.trueFalseAnswer ? (q.trueFalseAnswer === 'true' ? 'Benar' : 'Salah') : <span className="text-red-600 italic">Belum diatur</span>
                                        )}
                                        {q.type === QuestionType.MATCHING && (
                                            (q.answerKeyMatching && q.answerKeyMatching.length > 0) ?
                                            q.answerKeyMatching.map(pair => {
                                                const premiseIndex = q.matchingPremises?.findIndex(p => p.id === pair.premiseId);
                                                const responseIndex = q.matchingResponses?.findIndex(r => r.id === pair.responseId);
                                                if (premiseIndex === -1 || responseIndex === -1) return null;
                                                return `${premiseIndex + 1}-${String.fromCharCode(65 + responseIndex)}`;
                                            }).filter(Boolean).join(', ')
                                            : <span className="text-red-600 italic">Belum diatur</span>
                                        )}
                                        {(q.type === QuestionType.ESSAY || q.type === QuestionType.SHORT_ANSWER) && (
                                            <RawHtmlRenderer html={q.answerKey || '-'} />
                                        )}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function App() {
    type View = 'archive' | 'editor' | 'preview' | 'bank' | 'settings';
    const [view, setView] = useState<View>('archive');
    const [currentExam, setCurrentExam] = useState<Exam | null>(null);
    const [isPreviewingKey, setIsPreviewingKey] = useState(false);
    const [showIndicator, setShowIndicator] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const defaultHeaderSettings: HeaderSettings = {
        showHeader: true,
        showLogo: true,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGESURBVHhe7dixTsNQEATgd98SAvw/w0sDVAQSNeFjQsU6My3Zdfep9e+NnWmvvfa2U255/1dO5wSAQkAAKCAACAgABAACCgEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIAAQEAALCAAEBAAiggBAQAAoIDcde+1t1/tA2dIeT5gdiueAAAAAElFTkSuQmCC', // Default placeholder
        headerLines: [
            { id: '1', text: 'PEMERINTAH KOTA CONTOH' },
            { id: '2', text: 'DINAS PENDIDIKAN DAN KEBUDAYAAN' },
            { id: '3', text: 'SEKOLAH DASAR NEGERI 1 CONTOH' },
        ],
        paperSize: 'a4',
        pdfQuality: 95,
        fontFamily: 'serif',
        lineHeight: 1.5,
        margin: 20,
    };
    
    const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(() => {
        try {
            const savedSettings = localStorage.getItem('soalgenius-header-settings');
            return savedSettings ? JSON.parse(savedSettings) : defaultHeaderSettings;
        } catch {
            return defaultHeaderSettings;
        }
    });

    useEffect(() => {
        localStorage.setItem('soalgenius-header-settings', JSON.stringify(headerSettings));
    }, [headerSettings]);

    useEffect(() => {
        const hasBeenWelcomed = localStorage.getItem('soalgenius-welcomed');
        if (!hasBeenWelcomed) {
            setWelcomeModalOpen(true);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const previewContentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const content = previewContentRef.current;
        if (view === 'preview' && content) {
            if (window.innerWidth < 768) {
                const parent = content.parentElement;
                if (parent) {
                    const contentWidth = content.getBoundingClientRect().width / zoom;
                    const newZoom = parent.clientWidth / contentWidth;
                    setZoom(newZoom);
                }
            } else {
                setZoom(1);
            }
        }
    }, [view, currentExam, isPreviewingKey]);


    const { 
        exams, addExam, updateExam, deleteExam, duplicateExam, 
        generateVariant, backupData, restoreData 
    } = useExams();
    
    const { bank, addQuestionToBank, updateQuestionInBank, deleteQuestionFromBank } = useQuestionBank();

    const allExamsForMeta = useMemo(() => exams.map(({ subject, grade }) => ({ subject, grade })), [exams]);

    const handleCreateNew = () => {
        setCurrentExam(null);
        setView('editor');
    };

    const handleEdit = (id: string) => {
        const examToEdit = exams.find(e => e.id === id);
        if (examToEdit) {
            setCurrentExam(examToEdit);
            setView('editor');
        }
    };
    
    const handleSaveExam = (examToSave: Exam | Omit<Exam, 'id' | 'createdAt'>) => {
        if ('id' in examToSave && examToSave.id) {
            updateExam(examToSave);
        } else {
            addExam(examToSave as Omit<Exam, 'id' | 'createdAt'>);
        }
        setView('archive');
        displayIndicator('Ujian berhasil disimpan!', 'success');
    };

    const handlePreview = (exam: Exam | Omit<Exam, 'id' | 'createdAt'>) => {
        const fullExam: Exam = 'id' in exam ? exam : { ...exam, id: 'preview-id', createdAt: new Date().toISOString() };
        setCurrentExam(fullExam);
        setView('preview');
        setIsPreviewingKey(false);
        setZoom(1);
    };

    const handleCancelEditor = () => {
        setCurrentExam(null);
        setView('archive');
    };
    
    const displayIndicator = (message: string, type: 'success' | 'error') => {
        setShowIndicator({ message, type });
        setTimeout(() => setShowIndicator(null), 3000);
    };

    const handleRestoreData = (file: File) => {
        restoreData(file, () => {
            displayIndicator('Data berhasil dipulihkan!', 'success');
        });
    };
    
    const handleResetSettings = () => {
        if (window.confirm('Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?')) {
            setHeaderSettings(defaultHeaderSettings);
            displayIndicator('Pengaturan berhasil direset.', 'success');
        }
    };

    const handleCloseWelcomeModal = () => {
        localStorage.setItem('soalgenius-welcomed', 'true');
        setWelcomeModalOpen(false);
    };

    const handleOpenGuideFromWelcome = () => {
        localStorage.setItem('soalgenius-welcomed', 'true');
        setWelcomeModalOpen(false);
        setInfoModalOpen(true);
    };

    const uploadInputRef = useRef<HTMLInputElement>(null);
    const handleTriggerUpload = () => uploadInputRef.current?.click();

    const handlePrint = () => {
        const previewElement = document.getElementById('pdf-preview-content');
        if (!previewElement) return;

        const printWindow = window.open('', '', 'height=800,width=1200');
        if (!printWindow) {
            alert('Gagal membuka jendela cetak. Pastikan pop-up diizinkan.');
            return;
        }

        printWindow.document.write('<!DOCTYPE html><html><head><title>Cetak Ujian</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
        printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } @page { margin: 0; size: auto; } }<\/style>');
        printWindow.document.write('</head><body style="background-color: #f0f0f0;">');
        printWindow.document.write(previewElement.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        printWindow.onload = () => {
             printWindow.focus();
             printWindow.print();
             printWindow.close();
        };
    };

    const handleExportHtml = () => {
        const previewElement = document.getElementById('pdf-preview-content');
        if (!previewElement || !currentExam) {
            displayIndicator('Gagal mengekspor: konten tidak ditemukan.', 'error');
            return;
        }
    
        const allStyles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
            } catch (e) {
              return '';
            }
          })
          .join('');
    
        const contentClone = previewElement.cloneNode(true) as HTMLElement;
        contentClone.style.transform = '';
        contentClone.style.transformOrigin = '';
        contentClone.style.transition = '';
    
        const title = `${isPreviewingKey ? 'Kunci Jawaban' : 'Lembar Soal'} - ${currentExam.title}`;
        
        const htmlString = `
            <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8" /><title>${title}</title><style>${allStyles}</style></head>
            <body class="bg-gray-200 p-8">${contentClone.innerHTML}</body></html>`;
    
        const blob = new Blob([htmlString.trim()], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeTitle = currentExam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.href = url;
        a.download = `${isPreviewingKey ? 'kunci' : 'soal'}_${safeTitle}.html`;
        a.click();
        URL.revokeObjectURL(url);
        displayIndicator('Berhasil diekspor sebagai HTML!', 'success');
    };

    const renderView = () => {
        const archiveProps = {
            exams, 
            onEdit: handleEdit, 
            onDelete: deleteExam, 
            onPreview: handlePreview,
            onCreateNew: handleCreateNew,
            onDuplicate: duplicateExam,
            onGenerateVariant: generateVariant,
        };
        switch (view) {
            case 'editor':
                return <Editor 
                            exam={currentExam} 
                            onSave={handleSaveExam} 
                            onCancel={handleCancelEditor}
                            onPreview={handlePreview}
                            bank={bank}
                            addQuestionToBank={addQuestionToBank}
                            allExamsForMeta={allExamsForMeta}
                            showIndicator={(msg) => displayIndicator(msg, 'success')}
                        />;
            case 'preview':
                if (!currentExam) return <Archive {...archiveProps} />; // Fallback
                return (
                    <div className="bg-gray-200 print:bg-white min-h-screen">
                        <div className="fixed top-16 left-0 right-0 bg-white shadow-md p-2 z-20 no-print flex items-center overflow-x-auto">
                            <div className="flex items-center gap-2 flex-nowrap min-w-max mx-auto px-2">
                                <button onClick={() => setView('archive')} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 flex-shrink-0">&larr; Kembali</button>
                                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                               <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                                   <button onClick={() => setIsPreviewingKey(false)} className={`px-3 py-1 rounded-full text-sm ${!isPreviewingKey ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}>Soal</button>
                                   <button onClick={() => setIsPreviewingKey(true)} className={`px-3 py-1 rounded-full text-sm ${isPreviewingKey ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}>Kunci</button>
                               </div>
                               <div className="w-px h-6 bg-gray-300 mx-2"></div>
                               <div className="flex items-center gap-1">
                                    <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 hover:bg-gray-100 rounded-full" title="Perkecil"><ZoomOutIcon className="w-5 h-5"/></button>
                                    <span className="w-12 text-center text-sm font-semibold">{(zoom * 100).toFixed(0)}%</span>
                                    <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 hover:bg-gray-100 rounded-full" title="Perbesar"><ZoomInIcon className="w-5 h-5"/></button>
                                </div>
                                 <div className="w-px h-6 bg-gray-300 mx-2"></div>
                                <button onClick={handleExportHtml} className="flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-md hover:bg-teal-200 text-sm" title="Ekspor sebagai file HTML mandiri">
                                    <FileCodeIcon className="w-4 h-4"/> Ekspor
                                </button>
                                <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm">
                                    <PrintIcon className="w-4 h-4"/> Cetak
                                </button>
                            </div>
                        </div>

                        <div id="pdf-preview-container" className="pt-16 pb-8 overflow-x-auto">
                             <div 
                                id="pdf-preview-content" 
                                ref={previewContentRef}
                                className="mx-auto"
                                style={{ 
                                    transform: `scale(${zoom})`, 
                                    transformOrigin: 'top center', 
                                    transition: 'transform 0.2s',
                                    paddingTop: `${zoom * 20}px` // Add dynamic padding to center it vertically a bit
                                }}
                            >
                                {isPreviewingKey ? 
                                    <AnswerKeyPreview exam={currentExam} settings={headerSettings} /> :
                                    <PdfPreview exam={currentExam} settings={headerSettings} />
                                }
                            </div>
                        </div>
                    </div>
                );
            case 'bank':
                 return <QuestionBank 
                            bank={bank} 
                            deleteQuestionFromBank={deleteQuestionFromBank}
                            updateQuestionInBank={updateQuestionInBank}
                            allExams={allExamsForMeta}
                        />;
            case 'settings':
                return <Settings 
                            isOpen={true}
                            onClose={() => setView('archive')}
                            settings={headerSettings}
                            onSettingsChange={setHeaderSettings}
                            onReset={handleResetSettings}
                        />;
            case 'archive':
            default:
                return <Archive {...archiveProps} />;
        }
    };
    
    const GuideSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all hover:shadow-sm hover:border-blue-200">
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-3 mb-2">
                {icon}
                <span>{title}</span>
            </h4>
            <div className="text-gray-700 space-y-2 pl-8 prose prose-sm max-w-none">
                {children}
            </div>
        </div>
    );
    
    const mainContentPadding = useMemo(() => {
        let padding = 'py-4 sm:py-8';
        if (view === 'editor' || view === 'archive' || view === 'bank') {
            padding += ' pb-24 md:pb-8';
        }
        if (view === 'preview') {
            return 'p-0';
        }
        return padding;
    }, [view]);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-30 no-print">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('archive')}>
                        <LogoIcon className="w-8 h-8" />
                        <h1 className="text-xl font-bold text-gray-800">SoalGenius</h1>
                    </div>
                     <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => setView('archive')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${(view === 'archive' || view === 'editor' || view === 'preview') ? 'text-blue-700 bg-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <EditorIcon className="w-4 h-4" />
                            Editor Ujian
                        </button>
                        <button onClick={() => setView('bank')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${view === 'bank' ? 'text-blue-700 bg-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BankIcon className="w-4 h-4" />
                            Bank Soal
                        </button>
                    </div>
                    <div className="hidden md:flex items-center gap-1">
                         <input type="file" ref={uploadInputRef} className="hidden" accept=".json" onChange={(e) => e.target.files && handleRestoreData(e.target.files[0])} />
                         <button onClick={handleTriggerUpload} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Pulihkan Data"><UploadIcon className="w-5 h-5"/></button>
                         <button onClick={backupData} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Cadangkan Data"><DownloadIcon className="w-5 h-5"/></button>
                         <button onClick={() => setView('settings')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Pengaturan"><SettingsIcon className="w-5 h-5"/></button>
                         <button onClick={() => setInfoModalOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Tentang Aplikasi"><InfoIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="md:hidden relative" ref={mobileMenuRef}>
                         <button onClick={() => setMobileMenuOpen(p => !p)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" aria-label="Buka menu">
                            <MenuIcon className="w-6 h-6" />
                         </button>
                         {isMobileMenuOpen && (
                             <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border py-1">
                                 <button onClick={() => {setView('settings'); setMobileMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><SettingsIcon className="w-5 h-5"/> Pengaturan</button>
                                 <button onClick={() => {backupData(); setMobileMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><DownloadIcon className="w-5 h-5"/> Cadangkan Data</button>
                                 <button onClick={() => {handleTriggerUpload(); setMobileMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UploadIcon className="w-5 h-5"/> Pulihkan Data</button>
                                 <div className="my-1 h-px bg-gray-200"></div>
                                 <button onClick={() => {setInfoModalOpen(true); setMobileMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><InfoIcon className="w-5 h-5"/> Tentang & Panduan</button>
                             </div>
                         )}
                    </div>
                </nav>
            </header>
            
            <main className={`max-w-7xl mx-auto sm:px-6 lg:px-8 ${mainContentPadding}`}>
                {renderView()}
            </main>

            {view === 'archive' && (
                <button onClick={handleCreateNew} className="md:hidden fixed bottom-20 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center" aria-label="Buat Ujian Baru">
                    <PlusIcon className="w-8 h-8" />
                </button>
            )}

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] h-16 flex justify-around items-center z-30 no-print">
                <button onClick={() => setView('archive')} className={`flex flex-col items-center gap-1 text-xs px-2 py-1 rounded-md ${(view === 'archive' || view === 'editor' || view === 'preview') ? 'text-blue-700' : 'text-gray-600'}`}>
                    <EditorIcon className="w-6 h-6" />
                    <span>Editor Ujian</span>
                </button>
                <button onClick={() => setView('bank')} className={`flex flex-col items-center gap-1 text-xs px-2 py-1 rounded-md ${view === 'bank' ? 'text-blue-700' : 'text-gray-600'}`}>
                    <BankIcon className="w-6 h-6" />
                    <span>Bank Soal</span>
                </button>
            </nav>

            <footer className="text-center py-4 text-sm text-gray-500 no-print hidden md:block">
                 <p>&copy; {new Date().getFullYear()} Soal Genius. Dibuat dengan <HeartIcon className="w-4 h-4 inline text-red-500"/> untuk para pendidik.</p>
            </footer>

            {showIndicator && (
                <div className={`fixed bottom-20 md:bottom-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white ${showIndicator.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-fade-in-out`}>
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>{showIndicator.message}</span>
                    </div>
                </div>
            )}
            
            <WelcomeModal 
                isOpen={isWelcomeModalOpen} 
                onClose={handleCloseWelcomeModal} 
                onOpenGuide={handleOpenGuideFromWelcome} 
            />

            <Modal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} title="Tentang & Panduan SoalGenius" size="3xl">
                <div className="space-y-6 text-gray-700 text-sm">
                    <div className="text-center bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Selamat Datang di SoalGenius! v1.1</h3>
                        <p className="max-w-2xl mx-auto">
                            Aplikasi ini dirancang untuk membantu para pendidik membuat, mengelola, dan mencetak soal ujian dengan lebih mudah dan terstruktur. Setelah dimuat pertama kali, aplikasi dapat dijalankan sepenuhnya <strong>offline</strong> tanpa koneksi internet. Semua data Anda disimpan dengan aman langsung di browser.
                        </p>
                         <div className="mt-4 text-xs text-gray-600 border-t pt-3 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                            <span><strong>Pengembang:</strong> <a href="https://aiprojek01.my.id" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AI Projek</a></span>
                            <span><strong>Lisensi:</strong> <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GNU GPLv3</a></span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <GuideSection title="1. Memulai Ujian Baru" icon={<PlusIcon className="w-5 h-5 text-blue-600" />}>
                            <ul className="list-disc list-outside space-y-1">
                                <li>Dari halaman utama (Arsip), klik tombol <strong>+ (plus)</strong> di pojok kanan bawah (di HP) atau tombol <strong>"Buat Ujian Baru"</strong> di pojok kanan atas (di desktop).</li>
                                <li>Isi informasi dasar ujian seperti <strong>Judul, Mata Pelajaran, Kelas,</strong> dan <strong>Waktu</strong> pengerjaan.</li>
                            </ul>
                        </GuideSection>
                        
                        <GuideSection title="2. Editor Soal" icon={<EditorIcon className="w-5 h-5 text-blue-600" />}>
                             <ul className="list-disc list-outside space-y-1">
                                <li><strong>Navigasi Mobile:</strong> Gunakan <strong>navigasi bawah</strong> untuk berpindah antara 'Editor Ujian' dan 'Bank Soal'. Gunakan <strong>menu titik tiga (⋮)</strong> di kanan atas untuk Backup, Restore, dan Pengaturan.</li>
                                <li><strong>Bagian Soal:</strong> Ujian dapat dibagi menjadi beberapa bagian (misal: A. Pilihan Ganda, B. Esai). Gunakan tombol <strong>"Tambah Bagian Soal Baru"</strong>.</li>
                                <li><strong>Menyusun Ulang:</strong> Tahan dan seret ikon titik-titik ( <DragHandleIcon className="w-4 h-4 inline-block -mt-1"/> ) di samping soal atau bagian untuk mengubah urutannya.</li>
                            </ul>
                        </GuideSection>
                        
                        <GuideSection title="3. Pratinjau, Cetak & Ekspor" icon={<PrintIcon className="w-5 h-5 text-blue-600" />}>
                            <ul className="list-disc list-outside space-y-1">
                                <li>Klik tombol <strong>"Pratinjau"</strong> untuk melihat tampilan dokumen sebelum dicetak.</li>
                                <li>Di perangkat mobile, tampilan akan otomatis disesuaikan dengan lebar layar. Gunakan kontrol zoom untuk memperbesar/memperkecil.</li>
                                <li>Klik <PrintIcon className="w-4 h-4 inline-block -mt-1"/> <strong>"Cetak"</strong>, lalu ubah tujuan (destination) menjadi <strong>"Save as PDF"</strong> untuk menyimpan sebagai PDF.</li>
                            </ul>
                        </GuideSection>
                        
                        <GuideSection title="4. Manajemen Data (PENTING)" icon={<DownloadIcon className="w-5 h-5 text-blue-600" />}>
                             <ul className="list-disc list-outside space-y-1">
                                <li><strong>Cadangkan:</strong> Secara berkala, klik ikon <DownloadIcon className="w-4 h-4 inline-block -mt-1"/> (Cadangkan Data) untuk mengunduh semua data Anda. Simpan file ini di tempat yang aman.</li>
                                <li><strong>Pulihkan:</strong> Untuk memulihkan data, klik ikon <UploadIcon className="w-4 h-4 inline-block -mt-1"/> (Pulihkan Data) dan pilih file `.json` cadangan Anda.</li>
                            </ul>
                        </GuideSection>
                    </div>

                    <div className="flex justify-center items-center gap-6 pt-4 border-t mt-6 text-sm">
                        <a href="https://lynk.id/aiprojek/s/bvBJvdA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium">
                            <CoffeeIcon className="w-5 h-5" /> Traktir Kopi
                        </a>
                        <a href="https://github.com/aiprojek/soalgenius" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium">
                            <GithubIcon className="w-5 h-5" /> Kode Sumber
                        </a>
                        <a href="https.me/aiprojek_community/32" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium">
                            <MessageSquareIcon className="w-5 h-5" /> Beri Masukan
                        </a>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default App;
