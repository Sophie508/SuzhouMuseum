import { Artifact, loadArtifacts, getArtifactsByIds, getArtifactsByZodiac, getPersonalizedArtifacts } from './data-service';
import { getCurrentUserId, getUserById, updateUserSelectedArtifacts, updateUserFavoriteArtifacts, getSimilarMbtiFavorites, getSimilarZodiacFavorites } from './user-service';

// 本地存储键名 (旧的方式，为向后兼容保留)
const PRE_VISIT_SELECTED_KEY = 'preVisitSelectedArtifacts';
const FAVORITE_ARTIFACTS_KEY = 'favoriteArtifacts';

// 检查是否为浏览器环境
const isBrowser = typeof window !== 'undefined';

/**
 * 根据用户兴趣标签获取推荐藏品
 */
export async function getRecommendedArtifacts(count: number = 3): Promise<Artifact[]> {
  // 获取当前用户
  const userId = isBrowser ? getCurrentUserId() : null;
  const user = userId ? getUserById(userId) : null;
  
  // 如果有用户且有偏好设置，使用个性化推荐
  if (user && (user.preferences.visitPeriod || user.preferences.zodiacSign)) {
    const personalized = await getPersonalizedArtifacts(
      user.preferences.visitPeriod,
      user.preferences.zodiacSign,
      count
    );
    
    if (personalized.length > 0) {
      return personalized;
    }
  }
  
  // 否则随机推荐
  const artifacts = await loadArtifacts();
  return shuffleArray(artifacts.artifacts).slice(0, count);
}

/**
 * 获取基于生肖推荐的藏品
 */
export async function getZodiacRecommendedArtifacts(zodiacSign: string, count: number = 3): Promise<Artifact[]> {
  const zodiacArtifacts = await getArtifactsByZodiac(zodiacSign);
  
  // 如果有足够的与生肖相关的藏品，返回随机选择的几个
  if (zodiacArtifacts.length >= count) {
    return shuffleArray(zodiacArtifacts).slice(0, count);
  }
  
  // 如果相关藏品不足，补充随机藏品
  const allArtifacts = await loadArtifacts();
  const randomArtifacts = shuffleArray(
    allArtifacts.artifacts.filter((a: Artifact) => !zodiacArtifacts.some(za => za.id === a.id))
  ).slice(0, count - zodiacArtifacts.length);
  
  return [...zodiacArtifacts, ...randomArtifacts];
}

/**
 * 获取MBTI推荐藏品
 */
export const getMbtiRecommendedArtifacts = async (mbtiType: string, count: number = 10): Promise<{artifacts: Artifact[], hasSimilarUsers: boolean}> => {
  try {
    // 在真实应用中，这里应该查询具有相同MBTI类型的用户喜好藏品
    // 由于当前数据库尚未建立，我们模拟"无相似用户"的情况
    
    // 获取所有藏品
    const artifactsData = await loadArtifacts();
    
    // 随机选择一些藏品作为推荐
    const randomArtifacts = artifactsData.artifacts
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
    
    // 返回结果，标记为"无相似用户"
    return {
      artifacts: randomArtifacts,
      hasSimilarUsers: false
    };
  } catch (error) {
    console.error('Error getting MBTI recommended artifacts:', error);
    return { artifacts: [], hasSimilarUsers: false };
  }
};

/**
 * 获取参观前选择的藏品IDs（新版优先使用用户模型，如无则使用旧方式）
 */
export function getPreVisitSelectedIds(): string[] {
  // 服务器端返回空数组
  if (!isBrowser) return [];
  
  // 优先使用用户模型
  const userId = getCurrentUserId();
  const user = userId ? getUserById(userId) : null;
  
  if (user) {
    return user.selectedArtifacts;
  }
  
  // 旧方式兼容
  const saved = localStorage.getItem(PRE_VISIT_SELECTED_KEY);
  return saved ? JSON.parse(saved) : [];
}

/**
 * 设置参观前选择的藏品IDs（新版优先使用用户模型，同时兼容旧方式）
 */
export function setPreVisitSelectedIds(ids: string[]): void {
  // 服务器端不执行任何操作
  if (!isBrowser) return;
  
  // 优先使用用户模型
  const userId = getCurrentUserId();
  if (userId) {
    updateUserSelectedArtifacts(userId, ids);
  }
  
  // 旧方式兼容
  localStorage.setItem(PRE_VISIT_SELECTED_KEY, JSON.stringify(ids));
}

/**
 * 获取收藏的藏品IDs（新版优先使用用户模型，如无则使用旧方式）
 */
export function getFavoriteArtifactIds(): string[] {
  // 服务器端返回空数组
  if (!isBrowser) return [];
  
  // 优先使用用户模型
  const userId = getCurrentUserId();
  const user = userId ? getUserById(userId) : null;
  
  if (user) {
    return user.favoriteArtifacts;
  }
  
  // 旧方式兼容
  const saved = localStorage.getItem(FAVORITE_ARTIFACTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

/**
 * 设置收藏的藏品IDs（新版优先使用用户模型，同时兼容旧方式）
 */
export function setFavoriteArtifactIds(ids: string[]): void {
  // 服务器端不执行任何操作
  if (!isBrowser) return;
  
  // 优先使用用户模型
  const userId = getCurrentUserId();
  if (userId) {
    updateUserFavoriteArtifacts(userId, ids);
  }
  
  // 旧方式兼容
  localStorage.setItem(FAVORITE_ARTIFACTS_KEY, JSON.stringify(ids));
}

/**
 * 切换藏品的收藏状态
 */
export function toggleFavoriteArtifact(id: string): string[] {
  // 服务器端返回空数组
  if (!isBrowser) return [];
  
  const favorites = getFavoriteArtifactIds();
  
  const newFavorites = favorites.includes(id)
    ? favorites.filter(fav => fav !== id)
    : [...favorites, id];
  
  setFavoriteArtifactIds(newFavorites);
  return newFavorites;
}

/**
 * 数组洗牌算法
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 