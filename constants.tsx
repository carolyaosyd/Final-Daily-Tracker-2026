
import { Habit } from './types';

export const HABITS_CONFIG: Habit[] = [
  { id: 'h1', name: '8:30早起' },
  { id: 'h2', name: 'AI学习' },
  { id: 'h3', name: 'AI公司' },
  { id: 'h4', name: '阅读 (8页+)' },
  { id: 'h5', name: '塔罗学习' },
  { id: 'h6', name: '创作产出' },
  { id: 'h7', name: '身心维护', isMulti: true, options: ['游泳', '羽毛球', '走路', '拉伸', '跳舞', '健身'] },
  { id: 'h8', name: '23:30 前关机' },
];

export const DEEP_WORK_LIMIT = 5400; // 90 分钟
