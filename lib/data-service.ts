import { cache } from 'react'

// 定义藏品类型
export interface Artifact {
  id: string;
  name: string;
  fullName: string;
  period: string;
  description: string;
  dimensions: string;
  image: string;
  localImage: string;
  interestingFacts: string;
  culturalContext: string;
  location: string;
  displayPeriod?: string; // 用于显示的朝代（可能经过处理）
  originalPeriod?: string; // 保存原始朝代信息
}

// 定义问答题类型
export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  artifactId: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

// 数据存储
let artifactsCache: Artifact[] | null = null;
let quizzesCache: Quiz[] | null = null;

// 生肖与相关关键词映射
const zodiacKeywords: Record<string, string[]> = {
  'rat': ['鼠', '老鼠', '子鼠'],
  'ox': ['牛', '水牛', '丑牛'],
  'tiger': ['虎', '老虎', '寅虎'],
  'rabbit': ['兔', '兔子', '卯兔'],
  'dragon': ['龙', '辰龙'],
  'snake': ['蛇', '巳蛇'],
  'horse': ['马', '午马'],
  'goat': ['羊', '未羊', '山羊'],
  'monkey': ['猴', '申猴', '猴子'],
  'rooster': ['鸡', '酉鸡', '公鸡', '母鸡'],
  'dog': ['狗', '戌狗', '犬'],
  'pig': ['猪', '亥猪', '野猪']
};

// 生肖相关藏品数据缓存
let zodiacArtifactsCache: Record<string, string[]> | null = null;
let artifactsWithZodiacCache: any[] | null = null;

/**
 * 修复图片路径
 */
export const fixImagePath = (artifact: Artifact): Artifact => {
  if (!artifact) return artifact;
  
  const newArtifact = { ...artifact };
  
  // 处理图片路径问题
  if (newArtifact.localImage && newArtifact.localImage.includes('museum_images/')) {
    newArtifact.localImage = newArtifact.localImage.replace('museum_images/', '');
  }
  
  return newArtifact;
};

/**
 * 获取藏品列表
 */
export const loadArtifacts = async (): Promise<{ artifacts: Artifact[] }> => {
  try {
    const response = await fetch('/data/artifacts.json');
    const data = await response.json();
    
    // 修复所有藏品的图片路径
    data.artifacts = data.artifacts.map(fixImagePath);
    
    return data;
  } catch (error) {
    console.error('Error loading artifacts:', error);
    return { artifacts: [] };
  }
};

/**
 * 从JSON文件加载问答题数据
 */
export const loadQuizzes = cache(async (): Promise<Quiz[]> => {
  // 如果有缓存，直接返回
  if (quizzesCache) {
    return quizzesCache;
  }

  try {
    // 在开发环境中，可以使用相对路径加载JSON
    const res = await fetch('/data/quizzes.json');
    if (!res.ok) {
      throw new Error('Failed to fetch quizzes data');
    }
    
    const data = await res.json();
    const quizzes = data.quizzes || [];
    quizzesCache = quizzes;
    return quizzes;
  } catch (error) {
    console.error('Error loading quizzes:', error);
    return [];
  }
});

/**
 * 获取特定藏品的问答题
 */
export const getQuizzesForArtifact = async (artifactId: string): Promise<Quiz[]> => {
  const quizzes = await loadQuizzes();
  return quizzes.filter(quiz => quiz.artifactId === artifactId);
};

/**
 * 根据ID获取藏品
 */
export const getArtifactById = async (id: string): Promise<Artifact | null> => {
  const artifacts = await loadArtifacts();
  const artifact = artifacts.artifacts.find(a => a.id === id);
  return artifact ? fixImagePath(artifact) : null;
};

/**
 * 获取随机问答题
 */
export const getRandomQuizzes = async (count: number = 5): Promise<Quiz[]> => {
  const quizzes = await loadQuizzes();
  
  // 如果问题数量不足，直接返回所有问题
  if (quizzes.length <= count) {
    return quizzes;
  }
  
  // 洗牌算法随机抽取问题
  const shuffled = [...quizzes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * 根据ID列表获取藏品
 */
export const getArtifactsByIds = async (ids: string[]): Promise<Artifact[]> => {
  const artifacts = await loadArtifacts();
  const filteredArtifacts = artifacts.artifacts.filter(a => ids.includes(a.id));
  return filteredArtifacts.map(fixImagePath);
};

/**
 * 根据朝代获取藏品
 */
export const getArtifactsByPeriod = async (period: string): Promise<Artifact[]> => {
  const artifacts = await loadArtifacts();
  const filteredArtifacts = artifacts.artifacts.filter(a => {
    const artifactPeriod = a.displayPeriod || a.period;
    return artifactPeriod === period;
  });
  return filteredArtifacts.map(fixImagePath);
};

/**
 * 加载生肖相关的藏品数据
 */
export const loadZodiacArtifacts = cache(async (): Promise<{
  zodiacArtifacts: Record<string, string[]>,
  artifactsWithZodiac: any[],
  stats: any
}> => {
  // 如果有缓存，直接返回
  if (zodiacArtifactsCache && artifactsWithZodiacCache) {
    return {
      zodiacArtifacts: zodiacArtifactsCache,
      artifactsWithZodiac: artifactsWithZodiacCache,
      stats: {} // 统计信息不缓存
    };
  }

  try {
    // 加载生肖相关藏品数据
    const res = await fetch('/data/zodiac_artifacts.json');
    if (!res.ok) {
      throw new Error('Failed to fetch zodiac artifacts data');
    }
    
    const data = await res.json();
    zodiacArtifactsCache = data.zodiacArtifacts || {};
    artifactsWithZodiacCache = data.artifactsWithZodiac || [];
    return data;
  } catch (error) {
    console.error('Error loading zodiac artifacts:', error);
    return {
      zodiacArtifacts: {},
      artifactsWithZodiac: [],
      stats: { error: 'Failed to load zodiac data' }
    };
  }
});

/**
 * 根据生肖获取相关藏品
 */
export const getArtifactsByZodiac = async (zodiacSign: string): Promise<Artifact[]> => {
  try {
    // 加载生肖藏品数据
    const zodiacData = await loadZodiacArtifacts();
    const artifactIds = zodiacData.zodiacArtifacts[zodiacSign] || [];
    
    if (artifactIds.length > 0) {
      // 为生肖类别有超过10件藏品的情况实现随机选择逻辑
      if (artifactIds.length > 10) {
        // 随机打乱并只选择10个
        const shuffledIds = [...artifactIds].sort(() => 0.5 - Math.random()).slice(0, 10);
        return getArtifactsByIds(shuffledIds);
      } else {
        // 如果生肖藏品少于10件，则全部展示
        return getArtifactsByIds(artifactIds);
      }
    }
    
    // 如果没有预处理数据，回退到关键词匹配方法
    const artifacts = await loadArtifacts();
    const keywords = zodiacKeywords[zodiacSign] || [];
    
    // 使用关键词匹配藏品
    const filteredArtifacts = artifacts.artifacts.filter(artifact => {
      const text = `${artifact.name} ${artifact.description} ${artifact.culturalContext || ''}`.toLowerCase();
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });
    
    return filteredArtifacts.map(fixImagePath);
  } catch (error) {
    console.error('Error getting artifacts by zodiac:', error);
    return [];
  }
};

/**
 * 获取个性化藏品
 */
export const getPersonalizedArtifacts = async (
  period: string,
  zodiacSign: string,
  count: number = 6
): Promise<Artifact[]> => {
  const allArtifacts = await loadArtifacts();
  let personalizedItems: Artifact[] = [];
  
  // 如果提供了朝代，优先按朝代筛选
  if (period) {
    const periodArtifacts = await getArtifactsByPeriod(period);
    personalizedItems = periodArtifacts.slice(0, Math.ceil(count / 2));
  }
  
  // 如果提供了生肖，添加生肖相关藏品
  if (zodiacSign) {
    const zodiacArtifacts = await getArtifactsByZodiac(zodiacSign);
    const remainingCount = count - personalizedItems.length;
    personalizedItems = [
      ...personalizedItems,
      ...zodiacArtifacts.slice(0, remainingCount)
    ];
  }
  
  // 如果还不够数量，随机添加一些藏品
  if (personalizedItems.length < count) {
    const remainingCount = count - personalizedItems.length;
    const randomArtifacts = allArtifacts.artifacts
      .filter(a => !personalizedItems.find(p => p.id === a.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount);
    
    personalizedItems = [...personalizedItems, ...randomArtifacts];
  }
  
  return personalizedItems.map(fixImagePath);
}; 