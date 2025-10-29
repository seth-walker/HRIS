export enum RoleName {
  ADMIN = 'admin',
  HR = 'hr',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  IMPORT = 'import',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  department?: string;
  email?: string;
  phone?: string;
  managerId?: string;
  manager?: Employee;
  directReports?: Employee[];
  teamId?: string;
  team?: Team;
  teamsLed?: Team[];
  hireDate: string;
  salary?: number;
  status: EmploymentStatus;
  userId?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leadId?: string;
  lead?: Employee;
  members?: Employee[];
  parentTeamId?: string;
  parentTeam?: Team;
  subTeams?: Team[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  department?: string;
  teamId?: string;
  children: OrgChartNode[];
}

export interface TeamHierarchyNode {
  id: string;
  name: string;
  description?: string;
  lead?: {
    id: string;
    name: string;
    title: string;
  };
  memberCount: number;
  subTeams: TeamHierarchyNode[];
}
