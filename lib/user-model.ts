export interface UserPreference {
  visitPeriod: string;      // 想了解的年代
  zodiacSign: string;       // 生肖
  mbtiType: string;         // MBTI类型
  visitDuration: number;    // 参观时间（分钟）
}

// 用户信息类型
export interface User {
  id: string;               // 唯一ID
  nickname: string;         // 唯一昵称
  preferences: UserPreference;
  selectedArtifacts: string[]; // 预选的藏品ID
  favoriteArtifacts: string[]; // 收藏的藏品ID
  visitSummary?: string;    // 参观总结
  createdAt: number;        // 创建时间戳
  updatedAt: number;        // 更新时间戳
}

// 生肖选项
export const ZODIAC_SIGNS = [
  { id: 'rat', name: '鼠' },
  { id: 'ox', name: '牛' },
  { id: 'tiger', name: '虎' },
  { id: 'rabbit', name: '兔' },
  { id: 'dragon', name: '龙' },
  { id: 'snake', name: '蛇' },
  { id: 'horse', name: '马' },
  { id: 'goat', name: '羊' },
  { id: 'monkey', name: '猴' },
  { id: 'rooster', name: '鸡' },
  { id: 'dog', name: '狗' },
  { id: 'pig', name: '猪' }
];

// MBTI类型选项
export const MBTI_TYPES = [
  { id: 'INTJ', name: 'INTJ - 建筑师' },
  { id: 'INTP', name: 'INTP - 逻辑学家' },
  { id: 'ENTJ', name: 'ENTJ - 指挥官' },
  { id: 'ENTP', name: 'ENTP - 辩论家' },
  { id: 'INFJ', name: 'INFJ - 提倡者' },
  { id: 'INFP', name: 'INFP - 调停者' },
  { id: 'ENFJ', name: 'ENFJ - 主人公' },
  { id: 'ENFP', name: 'ENFP - 活动家' },
  { id: 'ISTJ', name: 'ISTJ - 物流师' },
  { id: 'ISFJ', name: 'ISFJ - 守卫者' },
  { id: 'ESTJ', name: 'ESTJ - 总经理' },
  { id: 'ESFJ', name: 'ESFJ - 执政官' },
  { id: 'ISTP', name: 'ISTP - 鉴赏家' },
  { id: 'ISFP', name: 'ISFP - 探险家' },
  { id: 'ESTP', name: 'ESTP - 企业家' },
  { id: 'ESFP', name: 'ESFP - 表演者' }
]; 