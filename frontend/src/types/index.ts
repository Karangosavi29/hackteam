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

export interface TeammateSuggestion {
  user: User;
  score: number;
  matchDetails: {
    sharedSkills: string[];
    complementaryRole: boolean;
    sameCollege: boolean;
  };
}

export interface TeamSuggestion {
  team: Team;
  score: number;
  matchDetails: {
    roleNeeded: boolean;
    spotsLeft: number;
    sharedSkills: string[];
  };
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