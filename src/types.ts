import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  careerInterests?: string[];
  careerPreference?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
  };
  notifications?: {
    push?: boolean;
    email?: boolean;
  };
  privacySettings?: {
    profilePublic?: boolean;
  };
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  learningUrl: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  roadmap: RoadmapStep[];
}

export interface SkillProgress {
  id: string;
  userId: string;
  skillName: string;
  progress: number;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Timestamp;
}
