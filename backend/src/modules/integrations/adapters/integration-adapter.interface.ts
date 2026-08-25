export interface AdapterCapabilities {
  students: boolean;
  faculty: boolean;
  departments: boolean;
  programs: boolean;
  courses: boolean;
  subjects: boolean;
  sections: boolean;
  academicPeriods: boolean;
  timetable: boolean;
  attendance: boolean;
  exams: boolean;
  results: boolean;
}

export interface RawStudentRecord {
  externalId: string;
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentCode?: string;
  programCode?: string;
  sectionName?: string;
  currentSemester?: number;
  admissionYear?: number;
}

export interface RawFacultyRecord {
  externalId: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentCode?: string;
  designation?: string;
}

export interface RawDepartmentRecord {
  externalId: string;
  code: string;
  name: string;
}

export interface RawProgramRecord {
  externalId: string;
  code: string;
  name: string;
  departmentCode: string;
  degreeType: string;
  durationYears: number;
}

export interface RawCourseRecord {
  externalId: string;
  code: string;
  name: string;
  programCode: string;
  departmentCode: string;
  credits: number;
}

export interface RawSubjectRecord {
  externalId: string;
  code: string;
  name: string;
  courseCode: string;
  type: string; // CORE, ELECTIVE, LAB
  credits: number;
  semesterNumber?: number;
}

export interface RawSectionRecord {
  externalId: string;
  name: string;
  programCode: string;
  academicYearName: string;
  semesterNumber: number;
}

export interface RawTimetableRecord {
  externalId: string;
  sectionName: string;
  programCode: string;
  subjectCode: string;
  facultyEmployeeId?: string;
  dayOfWeek: number; // 1-7
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  building?: string;
}

export interface RawAttendanceRecord {
  externalId: string;
  studentExternalId: string;
  subjectCode: string;
  date: string; // YYYY-MM-DD
  period: number;
  status: string; // Present, Absent, A, P, etc.
}

export interface RawExamRecord {
  externalId: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
}

export interface RawExamScheduleRecord {
  externalId: string;
  examExternalId: string;
  subjectCode: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface RawResultRecord {
  externalId: string;
  studentExternalId: string;
  examExternalId: string;
  subjectCode: string;
  marks: number;
  maxMarks: number;
  grade?: string;
  gradePoint?: number;
}

export interface IntegrationAdapter {
  readonly providerId: string;
  getCapabilities(): AdapterCapabilities;
  testConnection(): Promise<{
    success: boolean;
    latencyMs: number;
    error?: string;
  }>;
  getStudents(
    cursor?: string,
  ): Promise<{ data: RawStudentRecord[]; nextCursor?: string }>;
  getFaculty(
    cursor?: string,
  ): Promise<{ data: RawFacultyRecord[]; nextCursor?: string }>;
  getDepartments(): Promise<RawDepartmentRecord[]>;
  getPrograms(): Promise<RawProgramRecord[]>;
  getCourses(): Promise<RawCourseRecord[]>;
  getSubjects(): Promise<RawSubjectRecord[]>;
  getSections(): Promise<RawSectionRecord[]>;
  getTimetable(sectionName?: string): Promise<RawTimetableRecord[]>;
  getAttendance(
    startDate?: string,
    endDate?: string,
  ): Promise<RawAttendanceRecord[]>;
  getExams(): Promise<RawExamRecord[]>;
  getExamSchedules(examId?: string): Promise<RawExamScheduleRecord[]>;
  getResults(examId?: string): Promise<RawResultRecord[]>;
}
