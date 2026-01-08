// User related types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  totalXP: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalLinks: number;
  totalClicks: number;
  topLink: ShortLink | null;
}

// Link related types
export interface ShortLink {
  id: string;
  originalUrl: string;
  shortSlug: string;
  customAlias?: string;
  createdAt: Date;
  updatedAt: Date;
  clickCount: number;
  userId: string;
  isPasswordProtected: boolean;
  password?: string;
  expiresAt?: Date;
  isActive: boolean;
}

export interface LinkClick {
  id: string;
  linkId: string;
  timestamp: Date;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  referrer: string | null;
  country?: string;
  city?: string;
}

// Gamification types
export interface LevelConfig {
  level: number;
  xpRequired: number;
  name: string;
  description: string;
  unlocks: string[];
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    xpRequired: 0,
    name: 'Newcomer',
    description: 'Welcome to LinkVault!',
    unlocks: ['basic_shortening'],
  },
  {
    level: 5,
    xpRequired: 50,
    name: 'Link Apprentice',
    description: 'Your links are gaining traction!',
    unlocks: ['qr_code_generation'],
  },
  {
    level: 10,
    xpRequired: 200,
    name: 'Link Master',
    description: 'You\'re becoming a pro!',
    unlocks: ['password_protected_links'],
  },
  {
    level: 20,
    xpRequired: 500,
    name: 'Link Legend',
    description: 'The ultimate link master!',
    unlocks: ['custom_aliases'],
  },
];

// Feature unlock check helpers
export const canGenerateQRCode = (xp: number): boolean => xp >= 50;
export const canCreateSecretLinks = (xp: number): boolean => xp >= 200;
export const canUseCustomAliases = (xp: number): boolean => xp >= 500;

// Calculate level from XP
export const calculateLevel = (xp: number): number => {
  if (xp >= 500) return 20;
  if (xp >= 200) return 10;
  if (xp >= 50) return 5;
  return 1;
};

// Get XP needed for next level
export const getNextLevelXP = (currentXP: number): number => {
  if (currentXP >= 500) return 500; // Max level
  if (currentXP >= 200) return 500;
  if (currentXP >= 50) return 200;
  return 50;
};

// Get current level config
export const getCurrentLevelConfig = (xp: number): LevelConfig => {
  const level = calculateLevel(xp);
  return LEVEL_CONFIGS.find(config => config.level === level) || LEVEL_CONFIGS[0];
};

// Get next level config
export const getNextLevelConfig = (xp: number): LevelConfig | null => {
  const currentLevel = calculateLevel(xp);
  return LEVEL_CONFIGS.find(config => config.level > currentLevel) || null;
};
