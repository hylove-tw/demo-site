/**
 * Test fixture data for E2E tests
 * Simulates brainwave data in the expected CSV format
 */

// Generate mock brainwave data rows
// Format matches the expected CSV structure with columns like Delta, Theta, Alpha, etc.
export function generateMockBrainwaveData(rowCount: number = 100): string[][] {
  const headers = [
    'Timestamp',
    'Delta',
    'Theta',
    'Alpha',
    'Beta',
    'Gamma',
    'Attention',
    'Meditation',
  ];

  const rows: string[][] = [headers];

  for (let i = 0; i < rowCount; i++) {
    const timestamp = new Date(Date.now() + i * 1000).toISOString();
    const delta = Math.floor(Math.random() * 1000000);
    const theta = Math.floor(Math.random() * 500000);
    const alpha = Math.floor(Math.random() * 300000);
    const beta = Math.floor(Math.random() * 200000);
    const gamma = Math.floor(Math.random() * 100000);
    const attention = Math.floor(Math.random() * 100);
    const meditation = Math.floor(Math.random() * 100);

    rows.push([
      timestamp,
      delta.toString(),
      theta.toString(),
      alpha.toString(),
      beta.toString(),
      gamma.toString(),
      attention.toString(),
      meditation.toString(),
    ]);
  }

  return rows;
}

// Convert data to CSV string
export function toCSV(data: string[][]): string {
  return data.map((row) => row.join(',')).join('\n');
}

// Test user data
export const testUser = {
  id: 'test-user-001',
  name: '測試用戶',
  phone: '0912345678',
  email: 'test@example.com',
  company: {
    name: '測試公司',
    address: '台北市測試區',
    id: 'TEST-001',
    phone: '02-12345678',
    fax: '02-12345679',
  },
};

// Analysis plugin IDs and their expected behaviors
export const analysisPlugins = [
  {
    id: 'yuanshenyin',
    name: '元神音',
    group: '',
    hasCustomParams: true,
    customParams: { title: 'Test Music', bpm: 80, time_signature: '4/4', p1: 'piano', p2: 'guitar', p3: 'bass' },
    requiredFileCount: 2,
  },
  {
    id: 'dualmusic',
    name: '雙人腦波音樂',
    group: '',
    hasCustomParams: true,
    customParams: {
      title: 'Dual Test Music',
      bpm: 90,
      time_signature: '4/4',
      first_p1: 'piano',
      first_p2: 'piano',
      first_p3: 'piano',
      second_p1: 'violin',
      second_p2: 'violin',
      second_p3: 'violin',
    },
    requiredFileCount: 4,
  },
  {
    id: 'hengyunlai',
    name: '亨運來',
    group: '',
    hasCustomParams: false,
  },
  {
    id: 'mindei_normal',
    name: '正念修行',
    group: '利養炁',
    hasCustomParams: false,
  },
  {
    id: 'mindei_movement',
    name: '練炁修行',
    group: '利養炁',
    hasCustomParams: false,
  },
  {
    id: 'mindei_level',
    name: '練炁品階',
    group: '利養炁',
    hasCustomParams: false,
  },
  {
    id: 'zhentianfu',
    name: '貞天賦',
    group: '',
    hasCustomParams: false,
  },
  {
    id: 'emotion_management',
    name: '情緒管理系統',
    group: '易',
    hasCustomParams: false,
  },
  {
    id: 'pet_test',
    name: '寵物評比測試',
    group: '易',
    hasCustomParams: false,
  },
  {
    id: 'beverage_test',
    name: '品茶/品酒/品咖啡評比測試',
    group: '易',
    hasCustomParams: false,
  },
  {
    id: 'perfume_test',
    name: '香水評比測試',
    group: '易',
    hasCustomParams: false,
  },
  {
    id: 'music_test',
    name: '音樂演奏/歌曲演唱評比測試',
    group: '易',
    hasCustomParams: false,
  },
  {
    id: 'video_test',
    name: '短視頻廣告評比測試',
    group: '易',
    hasCustomParams: false,
  },
  {
    id: 'zhenbaoqi',
    name: '珍寶炁',
    group: '',
    hasCustomParams: false,
  },
  {
    id: 'qingxiangyi',
    name: '情香意',
    group: '',
    hasCustomParams: false,
  },
];
