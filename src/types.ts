
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
}

export interface Option {
  id: string;
  label: string;
  text: string;
}

export interface SubQuestion {
  id: string;
  number: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionNumber: string;
  questionText: string;
  image?: string | null;
  options: Option[];
  correctAnswerId?: string;
  includeAnswerSpace?: boolean;
  subQuestions?: SubQuestion[];
  answerKey?: string;
}

export interface Section {
  id:string;
  title: string;
  instruction: string;
  questions: Question[];
}

export type ExamStatus = 'draft' | 'finished';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  time: number; // in minutes
  createdAt: string;
  status: ExamStatus;
  sections: Section[];
  description?: string;
}

export interface HeaderLine {
  id: string;
  text: string;
}

export interface HeaderSettings {
    showHeader: boolean;
    showLogo: boolean;
    headerLines: HeaderLine[];
    logo: string | null;
    paperSize: 'a4' | 'f4';
    pdfQuality: number;
    fontFamily: 'serif' | 'sans';
    lineHeight: number;
    margin: number;
}

export interface BankQuestion extends Question {
  subject: string;
  grade: string;
  tags: string[];
  bankCreatedAt: string;
}
