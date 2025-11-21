import { Student } from '../types';
import { apiService } from './apiService';

export const studentService = {
  getAllStudents: async (): Promise<Student[]> => {
    return apiService.getAllStudents();
  },

  getStudentById: async (id: string): Promise<Student | undefined> => {
    return apiService.getStudentById(id);
  },

  addStudent: async (newStudent: Omit<Student, 'id'>): Promise<Student> => {
    return apiService.addStudent(newStudent);
  },

  updateStudent: async (updatedStudent: Student): Promise<Student | null> => {
    return apiService.updateStudent(updatedStudent);
  },

  deleteStudent: async (id: string): Promise<boolean> => {
    return apiService.deleteStudent(id);
  },

  addStudentsFromExcel: async (newStudents: Omit<Student, 'id'>[]): Promise<Student[]> => {
    return apiService.addStudentsFromExcel(newStudents);
  },
};