export type EmployeeAccessLevel = 'Employee' | 'Manager' | 'Admin';

export interface DemoEmployeeProfile {
  employeeId: number;
  employeeNumber: string;
  name: string;
  department: 'R&D Department' | 'Support Department' | 'Account Department' | 'Hardware Department';
  team: string;
  position: string;
  manager: {
    name: string;
    designation: string;
    department: string;
  };
  currentTask: string;
  skills: string[];
  workLocation: string;
  employmentStatus: 'Active' | 'Inactive';
  accessLevel: EmployeeAccessLevel;
  ivrsPermissions: {
    createTicket: boolean;
    viewTickets: boolean;
    viewTasks: boolean;
    callManager: boolean;
  };
}

// Demo Employee Profile – Coral Telecom
export const demoEmployeeRahulSingh: DemoEmployeeProfile = {
  employeeId: 1,
  employeeNumber: 'CT1001',
  name: 'Rahul Singh',
  department: 'R&D Department',
  team: 'AI Team',
  position: 'Software Engineer',
  manager: {
    name: 'Rishi Saini',
    designation: 'AI Team Manager',
    department: 'R&D Department',
  },
  currentTask: 'AI based IVRS development',
  skills: [
    'Artificial Intelligence',
    'Speech-to-Speech Systems',
    'WebRTC',
    'Node.js',
    'Spring Boot',
    'Real-time WebSocket Communication',
  ],
  workLocation: 'Coral Telecom – Head Office',
  employmentStatus: 'Active',
  accessLevel: 'Employee',
  ivrsPermissions: {
    createTicket: true,
    viewTickets: true,
    viewTasks: true,
    callManager: true,
  },
};

export const demoEmployeesByEmployeeNumber: Record<string, DemoEmployeeProfile> = {
  [demoEmployeeRahulSingh.employeeNumber]: demoEmployeeRahulSingh,
};
