
import { useState, useEffect } from 'react';
import type { Exam, Section, ExamStatus, Question, Option } from '../types';

const STORAGE_KEY = 'soalgenius-exams';

const migrateTextToHtml = (text: string | undefined): string => {
    if (!text) return '';
    // Jika sudah mengandung tag HTML, asumsikan sudah dimigrasi
    if (/<[a-z][\s\S]*>/i.test(text)) {
        return text;
    }
    // Konversi baris baru menjadi tag <br> dan escape karakter HTML dasar
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br />');
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export function useExams() {
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const savedExamsJSON = localStorage.getItem(STORAGE_KEY);
      if (!savedExamsJSON) return [];
      
      const savedExams = JSON.parse(savedExamsJSON);
      if (!Array.isArray(savedExams)) return [];
      
      const migratedExams = savedExams
        .filter(exam => exam && typeof exam === 'object') // Filter out null/invalid entries
        .map((exam: any) => {
            let tempExam = { ...exam };

            // 0. Add status if missing
            if (!tempExam.status) {
                tempExam.status = 'draft';
            }
            
            if (!tempExam.description) {
                tempExam.description = '';
            }

            // 1. Migrate legacy exams with questions at root level to sections
            if (tempExam.questions && !tempExam.sections) {
                const newSection: Section = {
                    id: crypto.randomUUID(),
                    title: 'I',
                    instruction: 'Jawablah pertanyaan-pertanyaan di bawah ini dengan benar!',
                    questions: tempExam.questions,
                };
                delete tempExam.questions;
                tempExam = { ...tempExam, sections: [newSection] };
            }

            // 2. Migrate questions within sections to have new fields for numbering and rich text
            if (tempExam.sections) {
                tempExam.sections = tempExam.sections.map((section: any) => {
                    section.instruction = migrateTextToHtml(section.instruction);
                    if (section.questions) {
                        section.questions = section.questions.map((q: any, index: number) => {
                            // FIX: Removed duplicate `answerKey` and `subQuestions` properties from this object literal.
                            // They were defined twice, causing an error. The definitions that perform HTML migration are kept.
                            const migratedQuestion = {
                                ...q,
                                questionNumber: q.questionNumber || (index + 1).toString(),
                                image: q.image || null,
                                includeAnswerSpace: q.includeAnswerSpace ?? false,
                                // --- Rich text migration ---
                                questionText: migrateTextToHtml(q.questionText),
                                answerKey: migrateTextToHtml(q.answerKey),
                                options: (q.options || []).map((opt: any, optIndex: number) => ({
                                    ...opt,
                                    text: migrateTextToHtml(opt.text),
                                    label: opt.label || String.fromCharCode(97 + optIndex),
                                })),
                                subQuestions: (q.subQuestions || []).map((subQ: any) => ({
                                    ...subQ,
                                    text: migrateTextToHtml(subQ.text),
                                })),
                            };
                            return migratedQuestion;
                        });
                    }
                    return section;
                });
            }
            return tempExam;
        });

      return migratedExams;

    } catch (error) {
      console.error("Failed to load or migrate exams from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    } catch (error) {
      console.error("Failed to save exams to localStorage", error);
    }
  }, [exams]);

  const addExam = (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...exam,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setExams(prevExams => [...prevExams, newExam]);
  };

  const updateExam = (updatedExam: Exam) => {
    setExams(prevExams =>
      prevExams.map(exam => (exam.id === updatedExam.id ? updatedExam : exam))
    );
  };

  const deleteExam = (examId: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus ujian ini? Tindakan ini tidak dapat diurungkan.')) {
        setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
    }
  };
  
  const duplicateExam = (examId: string) => {
    const examToDuplicate = exams.find(exam => exam.id === examId);
    if (!examToDuplicate) return;

    // Deep copy to avoid reference issues
    const newExam = JSON.parse(JSON.stringify(examToDuplicate));

    newExam.id = crypto.randomUUID();
    newExam.createdAt = new Date().toISOString();
    newExam.title = `${newExam.title} (Salinan)`;
    
    setExams(prevExams => [newExam, ...prevExams]);
  };

  const generateVariant = (examId: string) => {
    const examToVary = exams.find(exam => exam.id === examId);
    if (!examToVary) return;

    const newExam: Exam = JSON.parse(JSON.stringify(examToVary));

    newExam.id = crypto.randomUUID();
    newExam.createdAt = new Date().toISOString();
    newExam.title = `${newExam.title} (Varian Acak)`;
    
    newExam.sections = newExam.sections.map((section: Section) => {
        const newQuestions = shuffleArray(section.questions).map((q: Question, index) => {
            const newQ = {...q};
            newQ.questionNumber = (index + 1).toString();
            if (newQ.type === 'MULTIPLE_CHOICE') {
                newQ.options = shuffleArray(newQ.options);
            }
            return newQ;
        });
        return { ...section, questions: newQuestions };
    });
    
    setExams(prevExams => [newExam, ...prevExams]);
  };

  const backupData = () => {
    try {
      const dataStr = JSON.stringify(exams, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soalgenius-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
        alert('Gagal membuat file backup.');
        console.error("Backup failed", error);
    }
  };

  const restoreData = (file: File, onSuccess: () => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error("File content is not a string");
        
        const parsedExams = JSON.parse(result);
        if (!Array.isArray(parsedExams)) throw new Error("Backup file is not an array");

        const restoredExams: Exam[] = parsedExams.map((exam: any) => ({
            ...exam,
            status: exam.status || 'draft',
        }));

        if (restoredExams.every(e => e.id && e.title && e.sections)) {
           if(window.confirm('Data saat ini akan diganti dengan data dari file backup. Lanjutkan?')) {
                setExams(restoredExams);
                onSuccess();
           }
        } else {
            throw new Error("Invalid file format");
        }
      } catch (error) {
        alert('Gagal memulihkan data. Pastikan file backup valid.');
        console.error("Restore failed", error);
      }
    };
    reader.readAsText(file);
  };

  return { exams, addExam, updateExam, deleteExam, duplicateExam, generateVariant, backupData, restoreData };
}
