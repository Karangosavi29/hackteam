export interface User {
  _id: string;
  name: string;
  email: string;
  college: string;
  bio: string;
  skills: string[];
  role: 'frontend' | 'backend' | 'fullstack' | 'design' | 'ml' | 'devops' | 'other';
  github: string;
  linkedin: string;
  avatar: string;
  teams: string[];
  interests: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  availability: ('weekdays' | 'weekends' | 'evenings' | 'flexible')[];
  createdAt: string;
}

export interface Hackathon {
  _id: string;
  title: string;
  description: string;
  organizer: Pick<User, '_id' | 'name' | 'email' | 'avatar'>;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  mode: 'online' | 'offline' | 'hybrid';
  location: string;
  maxTeamSize: number;
  minTeamSize: number;
  tags: string[];
  requiredSkills: string[];
  prizePool: string;
  registrationLink: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  hackathon: Pick<Hackathon, '_id' | 'title' | 'startDate' | 'mode' | 'location'>;
  leader: Pick<User, '_id' | 'name' | 'email' | 'avatar' | 'role'>;
  members: Pick<User, '_id' | 'name' | 'email' | 'avatar' | 'role' | 'skills'>[];
  maxSize: number;
  requiredRoles: string[];
  description: string;
  projectIdea: string;
  isOpen: boolean;
  createdAt: string;
}

export interface Request {
  _id: string;
  type: 'join' | 'invite';
  from: Pick<User, '_id' | 'name' | 'email' | 'avatar' | 'role' | 'skills' | 'college'>;
  to: Pick<User, '_id' | 'name' | 'email' | 'avatar'>;
  team: Pick<Team, '_id' | 'name'>;
  hackathon: Pick<Hackathon, '_id' | 'title' | 'startDate' | 'mode'>;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CompatibilityBreakdown {
  skills: number;
  interests: number;
  experience: number;
  availability: number;
  role: number;
  other: number;
}

export interface TeammateSuggestion {
  user: User;
  score: number;
  breakdown: CompatibilityBreakdown;
  reasons: string[];
  matchDetails: {
    sharedSkills: string[];
    complementaryRole: boolean;
    sameCollege: boolean;
  };
}

export interface TeamSuggestion {
  team: Team;
  score: number;
  reasons: string[];
  matchDetails: {
    roleNeeded: boolean;
    spotsLeft: number;
    sharedSkills: string[];
  };
}

export interface CompatibilityResult {
  userA: User;
  userB: User;
  score: number;
  breakdown: CompatibilityBreakdown;
  reasons: string[];
  sharedSkills: string[];
  sharedInterests: string[];
  sharedAvailability: string[];
}

export interface SkillCoverageItem {
  skill: string;
  covered: boolean;
}

export interface TeamSkillCoverage {
  teamId: string;
  hackathonTitle: string;
  requiredSkills: string[];
  coverage: SkillCoverageItem[];
  missingSkills: string[];
  percentage: number;
  compatibilityScore: number | null;
}

export interface Task {
  _id: string;
  team: string;
  title: string;
  description: string;
  assignedTo: Pick<User, '_id' | 'name' | 'avatar' | 'role'> | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdBy: Pick<User, '_id' | 'name' | 'avatar'>;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: Pick<User, '_id' | 'name' | 'avatar'> | null;
  type:
    | 'TEAM_REQUEST'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_REJECTED'
    | 'TEAM_JOINED'
    | 'TEAM_MEMBER_REMOVED'
    | 'TEAM_INVITATION'
    | 'TASK_ASSIGNED'
    | 'TASK_COMPLETED'
    | 'HACKATHON_DEADLINE';
  title: string;
  message: string;
  relatedId: string | null;
  relatedType: 'Team' | 'Request' | 'Task' | 'Hackathon' | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages: number;
  items: T[];
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: Pick<User, '_id' | 'name' | 'avatar'> | null;
  type:
    | 'TEAM_REQUEST'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_REJECTED'
    | 'TEAM_JOINED'
    | 'TEAM_MEMBER_REMOVED'
    | 'TEAM_INVITATION'
    | 'TASK_ASSIGNED'
    | 'TASK_COMPLETED'
    | 'HACKATHON_DEADLINE';
  title: string;
  message: string;
  relatedId: string | null;
  relatedType: 'Team' | 'Request' | 'Task' | 'Hackathon' | null;
  isRead: boolean;
  createdAt: string;
}

export interface Task {
  _id: string;
  team: string;
  title: string;
  description: string;
  assignedTo: Pick<User, '_id' | 'name' | 'avatar' | 'role'> | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdBy: Pick<User, '_id' | 'name' | 'avatar'>;
  createdAt: string;
}

export interface Message {
  _id: string;
  teamId: string;
  senderId: Pick<User, '_id' | 'name' | 'avatar'>;
  message: string;
  createdAt: string;
}