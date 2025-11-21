import { localStorageUtil } from './localStorageUtil';
import { User, Student, ViolationType, Violation, Role } from '../types';
import { LOCAL_STORAGE_KEYS, INITIAL_VIOLATION_TYPES } from '../constants';

const API_LATENCY_MS = 500; // Simulate network latency

// Keys for apiService's internal mock database in localStorage
const MOCK_DB_KEYS = {
  USERS: 'mock_db_users',
  STUDENTS: 'mock_db_students',
  VIOLATION_TYPES: 'mock_db_violation_types',
  VIOLATIONS: 'mock_db_violations',
  CURRENT_USER_TOKEN: 'mock_db_current_user_token', // To store authenticated user ID
};

// Initialize mock DB with default data if empty
const initializeMockDb = () => {
  let users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
  if (users.length === 0) {
    users = [
      { id: 'admin1', username: 'admin', password: 'adminpassword', role: Role.ADMIN },
      { id: 'guru1', username: 'guru', password: 'gurupassword', role: Role.GURU_PIKET },
    ];
    localStorageUtil.save(MOCK_DB_KEYS.USERS, users);
  }

  // Ensure initial violation types are loaded if DB is empty
  const storedViolationTypes = localStorageUtil.load<ViolationType[]>(MOCK_DB_KEYS.VIOLATION_TYPES, []);
  if (storedViolationTypes.length === 0) {
    localStorageUtil.save(MOCK_DB_KEYS.VIOLATION_TYPES, INITIAL_VIOLATION_TYPES);
  }

  localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []); // Initialize with empty array if none
  localStorageUtil.load<Violation[]>(MOCK_DB_KEYS.VIOLATIONS, []); // Initialize with empty array if none
};

initializeMockDb();

const mockApiCall = <T>(data: T, simulateError = false, errorMessage = 'Simulated API error'): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateError) {
        reject(new Error(errorMessage));
      } else {
        resolve(data);
      }
    }, API_LATENCY_MS);
  });
};

export const apiService = {
  // --- Auth & Users ---
  async login(username: string, password: string): Promise<User | null> {
    const users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password; // Never expose passwords to client
      localStorageUtil.save(MOCK_DB_KEYS.CURRENT_USER_TOKEN, user.id); // Store user ID as token
      return mockApiCall(userWithoutPassword);
    }
    throw new Error('Username atau password salah.'); // Throw error on login failure
  },

  async logout(): Promise<boolean> {
    localStorageUtil.remove(MOCK_DB_KEYS.CURRENT_USER_TOKEN);
    return mockApiCall(true);
  },

  async getAuthenticatedUser(): Promise<User | null> {
    const userId = localStorageUtil.load<string | null>(MOCK_DB_KEYS.CURRENT_USER_TOKEN, null);
    if (userId) {
      const users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
      const user = users.find(u => u.id === userId);
      if (user) {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return mockApiCall(userWithoutPassword);
      }
    }
    return mockApiCall(null);
  },

  async getAllUsers(): Promise<User[]> {
    const users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
    return mockApiCall(users.map(u => {
      const { password, ...rest } = u; // Destructure to exclude password
      return rest;
    }));
  },

  async addUser(newUser: Omit<User, 'id'> & { password: string }): Promise<User> {
    const users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
    if (users.some(u => u.username === newUser.username)) {
      throw new Error('Username sudah ada.'); // Simulate server-side validation
    }
    const userWithId = { ...newUser, id: `user-${Date.now()}` };
    users.push(userWithId as User);
    localStorageUtil.save(MOCK_DB_KEYS.USERS, users);
    const { password, ...rest } = userWithId;
    return mockApiCall(rest as User);
  },

  async updateUser(updatedUser: User & { password?: string }): Promise<User | null> {
    let users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
      const existingUser = users[index];
      // Only update password if provided
      const userToSave = updatedUser.password && updatedUser.password.trim() !== ''
        ? { ...existingUser, ...updatedUser }
        : { ...existingUser, ...updatedUser, password: existingUser.password }; // Keep old password if not updated

      users[index] = userToSave;
      localStorageUtil.save(MOCK_DB_KEYS.USERS, users);
      const { password, ...rest } = users[index];
      return mockApiCall(rest as User);
    }
    throw new Error('Pengguna tidak ditemukan.');
  },

  async deleteUser(userId: string): Promise<boolean> {
    let users = localStorageUtil.load<User[]>(MOCK_DB_KEYS.USERS, []);
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    localStorageUtil.save(MOCK_DB_KEYS.USERS, users);
    return mockApiCall(users.length < initialLength);
  },

  // --- Students ---
  async getAllStudents(): Promise<Student[]> {
    const students = localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []);
    return mockApiCall(students);
  },

  async getStudentById(id: string): Promise<Student | undefined> {
    const students = localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []);
    return mockApiCall(students.find(s => s.id === id));
  },

  async addStudent(newStudent: Omit<Student, 'id'>): Promise<Student> {
    const students = localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []);
    // Basic duplicate check for student name and class
    const exists = students.some(
      (s) => s.name.toLowerCase() === newStudent.name.toLowerCase() && s.className.toLowerCase() === newStudent.className.toLowerCase(),
    );
    if (exists) {
      throw new Error(`Siswa dengan nama "${newStudent.name}" di kelas "${newStudent.className}" sudah ada.`);
    }

    const studentWithId = { ...newStudent, id: `student-${Date.now()}` };
    students.push(studentWithId);
    localStorageUtil.save(MOCK_DB_KEYS.STUDENTS, students);
    return mockApiCall(studentWithId);
  },

  async updateStudent(updatedStudent: Student): Promise<Student | null> {
    let students = localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []);
    const index = students.findIndex(s => s.id === updatedStudent.id);
    if (index > -1) {
      // Check for duplicate on update, excluding the student being updated
      const exists = students.some(
        (s) => s.id !== updatedStudent.id && s.name.toLowerCase() === updatedStudent.name.toLowerCase() && s.className.toLowerCase() === updatedStudent.className.toLowerCase(),
      );
      if (exists) {
        throw new Error(`Siswa dengan nama "${updatedStudent.name}" di kelas "${updatedStudent.className}" sudah ada.`);
      }

      students[index] = updatedStudent;
      localStorageUtil.save(MOCK_DB_KEYS.STUDENTS, students);
      return mockApiCall(updatedStudent);
    }
    throw new Error('Siswa tidak ditemukan.');
  },

  async deleteStudent(id: string): Promise<boolean> {
    let students = localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []);
    const initialLength = students.length;
    students = students.filter(s => s.id !== id);
    localStorageUtil.save(MOCK_DB_KEYS.STUDENTS, students);
    return mockApiCall(students.length < initialLength);
  },

  async addStudentsFromExcel(newStudents: Omit<Student, 'id'>[]): Promise<Student[]> {
    let currentStudents = localStorageUtil.load<Student[]>(MOCK_DB_KEYS.STUDENTS, []);
    const addedStudents: Student[] = [];
    newStudents.forEach(newStudent => {
      const exists = currentStudents.some(
        (s) => s.name.toLowerCase() === newStudent.name.toLowerCase() && s.className.toLowerCase() === newStudent.className.toLowerCase(),
      );
      if (!exists) {
        const studentWithId = { ...newStudent, id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
        currentStudents.push(studentWithId);
        addedStudents.push(studentWithId);
      }
    });
    localStorageUtil.save(MOCK_DB_KEYS.STUDENTS, currentStudents);
    return mockApiCall(addedStudents);
  },

  // --- Violation Types ---
  async getAllViolationTypes(): Promise<ViolationType[]> {
    const types = localStorageUtil.load<ViolationType[]>(MOCK_DB_KEYS.VIOLATION_TYPES, INITIAL_VIOLATION_TYPES);
    return mockApiCall(types);
  },

  async addViolationType(name: string): Promise<ViolationType> {
    const types = localStorageUtil.load<ViolationType[]>(MOCK_DB_KEYS.VIOLATION_TYPES, []);
    if (types.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Jenis pelanggaran sudah ada.');
    }
    const newType: ViolationType = { id: `vtype-${Date.now()}`, name };
    types.push(newType);
    localStorageUtil.save(MOCK_DB_KEYS.VIOLATION_TYPES, types);
    return mockApiCall(newType);
  },

  async updateViolationType(updatedType: ViolationType): Promise<ViolationType | null> {
    let types = localStorageUtil.load<ViolationType[]>(MOCK_DB_KEYS.VIOLATION_TYPES, []);
    const index = types.findIndex(type => type.id === updatedType.id);
    if (index > -1) {
      // Check for duplicate name on update, excluding the type being updated
      const exists = types.some(
        (t) => t.id !== updatedType.id && t.name.toLowerCase() === updatedType.name.toLowerCase(),
      );
      if (exists) {
        throw new Error('Jenis pelanggaran sudah ada.');
      }

      types[index] = updatedType;
      localStorageUtil.save(MOCK_DB_KEYS.VIOLATION_TYPES, types);
      return mockApiCall(updatedType);
    }
    throw new Error('Jenis pelanggaran tidak ditemukan.');
  },

  async deleteViolationType(id: string): Promise<boolean> {
    let types = localStorageUtil.load<ViolationType[]>(MOCK_DB_KEYS.VIOLATION_TYPES, []);
    const initialLength = types.length;
    types = types.filter(type => type.id !== id);
    localStorageUtil.save(MOCK_DB_KEYS.VIOLATION_TYPES, types);
    return mockApiCall(types.length < initialLength);
  },

  // --- Violations ---
  async getAllViolations(): Promise<Violation[]> {
    const violations = localStorageUtil.load<Violation[]>(MOCK_DB_KEYS.VIOLATIONS, []);
    return mockApiCall(violations);
  },

  async addViolation(newViolation: Omit<Violation, 'id'>): Promise<Violation> {
    const violations = localStorageUtil.load<Violation[]>(MOCK_DB_KEYS.VIOLATIONS, []);
    const violationWithId = { ...newViolation, id: `violation-${Date.now()}` };
    violations.push(violationWithId);
    localStorageUtil.save(MOCK_DB_KEYS.VIOLATIONS, violations);
    return mockApiCall(violationWithId);
  },

  async updateViolation(updatedViolation: Violation): Promise<Violation | null> {
    let violations = localStorageUtil.load<Violation[]>(MOCK_DB_KEYS.VIOLATIONS, []);
    const index = violations.findIndex(violation => violation.id === updatedViolation.id);
    if (index > -1) {
      violations[index] = updatedViolation;
      localStorageUtil.save(MOCK_DB_KEYS.VIOLATIONS, violations);
      return mockApiCall(updatedViolation);
    }
    throw new Error('Catatan pelanggaran tidak ditemukan.');
  },

  async deleteViolation(id: string): Promise<boolean> {
    let violations = localStorageUtil.load<Violation[]>(MOCK_DB_KEYS.VIOLATIONS, []);
    const initialLength = violations.length;
    violations = violations.filter(violation => violation.id !== id);
    localStorageUtil.save(MOCK_DB_KEYS.VIOLATIONS, violations);
    return mockApiCall(violations.length < initialLength);
  },
};