export interface StarVortexUser {
  uid: string;
  displayName: string;
  photoURL: string;
  friendId: string;
  bio?: string;
  aura: number;
  points: number;
  skill: number;
  knowledge: number;
  creation: number;
  linkedApps: string[];
  lastSync?: any;
}

export interface EcosystemActivity {
  id?: string;
  description: string;
  timestamp: any;
  metadata?: {
    app: string;
    xp?: number;
    skillPoints?: number;
  };
}
