import { useState, useEffect } from 'react';
import type { BankQuestion, Question } from '../types';

const STORAGE_KEY = 'soalgenius-question-bank';

export function useQuestionBank() {
  const [bank, setBank] = useState<BankQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        // Sort by creation date, newest first
        return parsed.sort((a, b) => new Date(b.bankCreatedAt).getTime() - new Date(a.bankCreatedAt).getTime());
      }
      return [];
    } catch (error) {
      console.error("Failed to load question bank", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
    } catch (error) {
      console.error("Failed to save question bank", error);
    }
  }, [bank]);

  const addQuestionToBank = (question: Question, subject: string, grade: string, tags: string[]) => {
    const plainTextQuestion = question.questionText.replace(/<[^>]*>?/gm, '');
    if (bank.some(bq => bq.questionText.replace(/<[^>]*>?/gm, '') === plainTextQuestion)) {
        alert('Soal ini tampaknya sudah ada di bank soal.');
        return false;
    }

    const newBankQuestion: BankQuestion = {
      ...JSON.parse(JSON.stringify(question)), // Deep copy the question
      id: crypto.randomUUID(), // New ID for the bank version
      subject: subject || "Umum",
      grade: grade || "Umum",
      tags,
      bankCreatedAt: new Date().toISOString(),
    };
    setBank(prev => [newBankQuestion, ...prev]);
    return true;
  };

  const updateQuestionInBank = (updatedQuestion: BankQuestion) => {
    setBank(prev =>
      prev.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const deleteQuestionFromBank = (questionId: string) => {
    if (window.confirm('Yakin ingin menghapus soal ini secara permanen dari bank soal?')) {
        setBank(prev => prev.filter(q => q.id !== questionId));
    }
  };

  return { bank, addQuestionToBank, updateQuestionInBank, deleteQuestionFromBank };
}