
export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum PerformanceLevel {
  LOW_RISK = 'Low Risk',
  MEDIUM_RISK = 'Medium Risk',
  HIGH_RISK = 'High Risk'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  department: string;
  phone?: string;
  gender?: string;
  batch?: string;
  designation?: string;
  expertise?: string[];
}

export interface AcademicDetails {
  attendance: number;
  internalMarks: number;
  assignmentScores: number;
  projectMarks: number;
  previousGPA: number;
}

export interface Suggestion {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category?: string;
  actionItems?: string[];
}

export interface PredictionResult {
  level: PerformanceLevel;
  score: number;
  suggestions: Suggestion[];
  modelUsed: string;
  status?: string;
}

export interface StudentRecord extends User {
  academicDetails: AcademicDetails;
  prediction?: PredictionResult;
  remarks?: string;
}
