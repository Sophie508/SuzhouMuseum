import { User, UserPreference } from './user-model';
import { v4 as uuidv4 } from 'uuid';

// 本地存储键名
const USERS_KEY = 'museum_users';
const CURRENT_USER_KEY = 'museum_current_user';

/**
 * 获取所有用户
 */
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

/**
 * 获取当前用户ID
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(CURRENT_USER_KEY);
}

/**
 * 设置当前用户ID
 */
export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

/**
 * 根据ID获取用户
 */
export function getUserById(userId: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.id === userId) || null;
}

/**
 * 根据昵称获取用户
 */
export function getUserByNickname(nickname: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.nickname === nickname) || null;
}

/**
 * 创建用户（确保昵称唯一）
 * 返回创建的用户或null（如果昵称已存在）
 */
export function createUser(nickname: string): User | null {
  // 检查昵称是否已存在
  if (getUserByNickname(nickname)) {
    return null;
  }
  
  const now = Date.now();
  const newUser: User = {
    id: uuidv4(),
    nickname,
    preferences: {
      visitPeriod: '',
      zodiacSign: '',
      mbtiType: '',
      visitDuration: 60,
    },
    selectedArtifacts: [],
    favoriteArtifacts: [],
    createdAt: now,
    updatedAt: now,
  };
  
  // 保存用户
  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);
  
  // 设置为当前用户
  setCurrentUserId(newUser.id);
  
  return newUser;
}

/**
 * 创建用户（确保昵称唯一，自动添加随机后缀）
 */
export function createUserWithUniqueNickname(nickname: string): User {
  let uniqueNickname = nickname;
  let counter = 1;
  
  // 如果昵称已存在，添加随机后缀
  while (getUserByNickname(uniqueNickname)) {
    uniqueNickname = `${nickname}_${counter}`;
    counter++;
  }
  
  // 创建用户（此时昵称已保证唯一）
  const now = Date.now();
  const newUser: User = {
    id: uuidv4(),
    nickname: uniqueNickname,
    preferences: {
      visitPeriod: '',
      zodiacSign: '',
      mbtiType: '',
      visitDuration: 60,
    },
    selectedArtifacts: [],
    favoriteArtifacts: [],
    createdAt: now,
    updatedAt: now,
  };
  
  // 保存用户
  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);
  
  // 设置为当前用户
  setCurrentUserId(newUser.id);
  
  return newUser;
}

/**
 * 更新用户偏好设置
 */
export function updateUserPreferences(userId: string, preferences: Partial<UserPreference>): User | null {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) return null;
  
  // 更新用户偏好
  users[userIndex].preferences = {
    ...users[userIndex].preferences,
    ...preferences
  };
  users[userIndex].updatedAt = Date.now();
  
  // 保存
  saveUsers(users);
  
  return users[userIndex];
}

/**
 * 更新用户选择的藏品
 */
export function updateUserSelectedArtifacts(userId: string, artifactIds: string[]): User | null {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) return null;
  
  // 更新选择的藏品
  users[userIndex].selectedArtifacts = artifactIds;
  users[userIndex].updatedAt = Date.now();
  
  // 保存
  saveUsers(users);
  
  return users[userIndex];
}

/**
 * 更新用户收藏的藏品
 */
export function updateUserFavoriteArtifacts(userId: string, artifactIds: string[]): User | null {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) return null;
  
  // 更新收藏的藏品
  users[userIndex].favoriteArtifacts = artifactIds;
  users[userIndex].updatedAt = Date.now();
  
  // 保存
  saveUsers(users);
  
  return users[userIndex];
}

/**
 * 获取具有相同MBTI的用户收藏的藏品
 */
export function getSimilarMbtiFavorites(mbtiType: string): string[] {
  const users = getAllUsers();
  const similarUsers = users.filter(user => 
    user.preferences.mbtiType === mbtiType
  );
  
  // 获取所有收藏的藏品ID并去重
  const allFavorites = similarUsers.flatMap(user => user.favoriteArtifacts);
  return [...new Set(allFavorites)];
}

/**
 * 获取具有相同生肖的用户收藏的藏品
 */
export function getSimilarZodiacFavorites(zodiacSign: string): string[] {
  const users = getAllUsers();
  const similarUsers = users.filter(user => 
    user.preferences.zodiacSign === zodiacSign
  );
  
  // 获取所有收藏的藏品ID并去重
  const allFavorites = similarUsers.flatMap(user => user.favoriteArtifacts);
  return [...new Set(allFavorites)];
}

/**
 * 更新用户参观总结
 */
export function updateUserVisitSummary(userId: string, summary: string): User | null {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) return null;
  
  // 更新参观总结
  users[userIndex].visitSummary = summary;
  users[userIndex].updatedAt = Date.now();
  
  // 保存
  saveUsers(users);
  
  return users[userIndex];
}

/**
 * 保存用户列表到本地存储
 */
function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
} 