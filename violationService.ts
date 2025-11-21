import { Violation, ViolationType } from '../types';
import { apiService } from './apiService';

export const violationService = {
  getAllViolationTypes: async (): Promise<ViolationType[]> => {
    return apiService.getAllViolationTypes();
  },

  addViolationType: async (name: string): Promise<ViolationType> => {
    return apiService.addViolationType(name);
  },

  updateViolationType: async (updatedType: ViolationType): Promise<ViolationType | null> => {
    return apiService.updateViolationType(updatedType);
  },

  deleteViolationType: async (id: string): Promise<boolean> => {
    return apiService.deleteViolationType(id);
  },

  getAllViolations: async (): Promise<Violation[]> => {
    return apiService.getAllViolations();
  },

  addViolation: async (newViolation: Omit<Violation, 'id'>): Promise<Violation> => {
    return apiService.addViolation(newViolation);
  },

  updateViolation: async (updatedViolation: Violation): Promise<Violation | null> => {
    return apiService.updateViolation(updatedViolation);
  },

  deleteViolation: async (id: string): Promise<boolean> => {
    return apiService.deleteViolation(id);
  },
};