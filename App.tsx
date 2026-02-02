
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  BarChart2, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Timer, 
  Square, 
  Plus, 
  Trash2, 
  X, 
  Star, 
  Activity, 
  Bell,
  Sparkles,
  Quote,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { HABITS_CONFIG, DEEP_WORK_LIMIT } from './constants';
import { Habit, CheckInData, Achievement, TabType } from './types';
import { getCreatorInspiration } from './geminiService';

// --- 子组件 ---

const WeeklyView: React.FC<{
  currentWeekOffset: number;
  setCurrentWeekOffset: (val: number | ((p: number) => number)) => void;
  checkInData: CheckInData;
  handleCheckIn: (date: string, habitId: string, subOption?: string) => void;
  onGetInspiration: () => void;
  isTimerRunning: boolean;
  timeLeft: number;
  handleTimerClick: () => void;
  formatTime: (s: number) => string;
}> = ({ 
  currentWeekOffset, setCurrentWeekOffset, checkInData, handleCheckIn, 
  onGetInspiration, isTimerRunning, timeLeft, handleTimerClick, formatTime 
}) => {
  const [multiSelect, setMultiSelect] = useState<{ d: string, hId: string } | null>(null);
  
  const dates = useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1 + currentWeekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [currentWeekOffset]);

  const stats = useMemo(() => {
    const totalPossible = dates.length * HABITS_CONFIG.length;
    let completed = 0, perfect = 0;
    dates.forEach(d => {
      let dayCount = 0;
      HABITS_CONFIG.forEach(h => {
        const v = checkInData[d]?.[h.id];
        if (h.isMulti ? (Array.isArray(v) && v.length > 0) : v === true) dayCount++;
      });
      completed += dayCount;
      if (dayCount === HABITS_CONFIG.length) perfect++;
    });
    return { 
      rate: Math.round((completed / totalPossible) * 100) || 0, 
      perfect, 
      total: completed 
    };
  }, [dates, checkInData]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full bg-[#f4f4f7] overflow-hidden">
      {/* 紧凑页眉 */}
      <div className="px-6 pt-4 pb-1 text-center relative">
        <div className="absolute left-6 top-5 flex gap-2">
            <button onClick={() => setCurrentWeekOffset(p => p - 1)} className="p-1 rounded-full hover:bg-white transition-all text-gray-400 active:scale-90"><ChevronLeft size={18}/></button>
        </div>
        <div className="absolute right-6 top-5 flex gap-2">
            <button onClick={() => setCurrentWeekOffset(p => p + 1)} className="p-1 rounded-full hover:bg-white transition-all text-gray-400 active:scale-90"><ChevronRight size={18}/></button>
        </div>
        
        <h1 className="text-lg font-extrabold tracking-tight text-gray-900">打卡日历</h1>
        <div className="flex items-center justify-center mt-0.5 text-gray-400 text-[9px] font-bold tracking-widest uppercase">
          <Calendar size={9} className="mr-1" />
          {dates[0].replace(/-/g, '.')} — {dates[6].replace(/-/g, '.')}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Weekly Table - iPhone 15 适配优化 */}
        <div className="mx-4 mt-1 bg-white rounded-[24px] shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="grid grid-cols-[90px_1fr] bg-gray-50/80 border-b border-gray-100">
            <div className="p-2 text-[8px] font-black text-gray-400 uppercase text-center self-center tracking-wider">项目</div>
            <div className="grid grid-cols-7 py-1.5 border-l border-gray-100">
              {['一', '二', '三', '四', '五', '六', '日'].map((d, i) => (
                <div key={i} className="text-center">
                  <div className="text-[8px] font-bold text-gray-400">{d}</div>
                  <div className={`text-[10px] font-black mt-0.5 leading-none ${todayStr === dates[i] ? 'text-blue-500 font-black' : 'text-gray-900'}`}>
                    {dates[i].split('-')[2]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {HABITS_CONFIG.map(h => (
              <div key={h.id} className="grid grid-cols-[90px_1fr] items-center min-h-[36px]">
                <div className="px-3 text-[10px] font-bold text-gray-700 leading-tight">
                  {h.name}
                </div>
                <div className="grid grid-cols-7 h-full border-l border-gray-50">
                  {dates.map(d => {
                    const val = checkInData[d]?.[h.id];
                    const active = h.isMulti ? (Array.isArray(val) && val.length > 0) : val === true;
                    return (
                      <div key={d} className="flex items-center justify-center">
                        <button 
                          onClick={() => h.isMulti ? setMultiSelect({d, hId: h.id}) : handleCheckIn(d, h.id)}
                          className={`w-[22px] h-[22px] rounded-lg transition-all active:scale-75 flex items-center justify-center ${active ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-transparent'}`}
                        >
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 统计网格 */}
        <div className="grid grid-cols-3 gap-2 px-4 mt-2">
          {[
            { label: '完成率', val: `${stats.rate}%`, color: 'text-blue-600' },
            { label: '完美天数', val: stats.perfect, color: 'text-orange-600' },
            { label: '累计达成', val: stats.total, color: 'text-green-600' }
          ].map(s => (
            <div key={s.label} className="bg-white py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className={`text-base font-black leading-none ${s.color}`}>{s.val}</div>
              <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 心流计时器 */}
        <div className="px-4 mt-2">
          <div className={`relative overflow-hidden rounded-[24px] transition-all duration-700 ${isTimerRunning ? 'bg-orange-600' : 'bg-gray-900'} shadow-lg`}>
            {isTimerRunning && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-1000 ease-linear" 
                  style={{ width: `${(timeLeft / DEEP_WORK_LIMIT) * 100}%` }} 
                />
            )}
            <button 
              onClick={handleTimerClick}
              className="w-full py-4 flex items-center justify-between px-5 transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${isTimerRunning ? 'bg-white/20' : 'bg-orange-500'}`}>
                  {isTimerRunning ? <Square size={16} fill="white" className="text-white"/> : <Timer size={16} className="text-white"/>}
                </div>
                <div className="text-left">
                  <div className="text-[8px] font-black opacity-60 uppercase tracking-widest text-white mb-0.5">家务90分钟倒计时</div>
                  <div className="text-lg font-black font-mono leading-none text-white tracking-tight">
                    {isTimerRunning ? formatTime(timeLeft) : '90:00'}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${isTimerRunning ? 'bg-white/20 text-white' : 'bg-white text-gray-900 shadow-md'}`}>
                {isTimerRunning ? '倒计时中' : '开始'}
              </div>
            </button>
          </div>
        </div>

        {/* 灵感触发按钮 */}
        <div className="mt-4 mb-2 flex justify-center px-4">
          <button 
            onClick={onGetInspiration}
            className="group relative w-full h-[54px] bg-[#007AFF] text-white rounded-[20px] font-black text-base tracking-wide shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles size={18} className="mr-2 text-blue-100 relative z-10" />
            <span className="relative z-10">我是一个创作者</span>
          </button>
        </div>
      </div>

      {/* 多选弹窗 */}
      {multiSelect && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-end">
          <div className="bg-white w-full rounded-t-[32px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-black text-gray-900">身心维护</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">选择今日已完成项目</p>
                </div>
                <button onClick={() => setMultiSelect(null)} className="p-1.5 bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {HABITS_CONFIG.find(h => h.id === multiSelect.hId)?.options?.map(o => {
                const val = checkInData[multiSelect.d]?.[multiSelect.hId];
                const selected = Array.isArray(val) && val.includes(o);
                return (
                  <button 
                    key={o} 
                    onClick={() => handleCheckIn(multiSelect.d, multiSelect.hId, o)} 
                    className={`py-3 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center gap-2 ${selected ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-gray-50 border-transparent text-gray-400'}`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setMultiSelect(null)} 
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-base active:scale-95 transition-transform"
            >
              更新记录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MonthlyView: React.FC<{
  currentMonthOffset: number;
  setCurrentMonthOffset: (val: number | ((p: number) => number)) => void;
  checkInData: CheckInData;
}> = ({ currentMonthOffset, setCurrentMonthOffset, checkInData }) => {
  const data = useMemo(() => {
    const d = new Date(); 
    d.setDate(1); 
    d.setMonth(d.getMonth() + currentMonthOffset);
    const y = d.getFullYear(), m = d.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return { 
      y, 
      m: m + 1, 
      label: d.toLocaleString('zh-CN', { month: 'long', year: 'numeric' }),
      days: Array.from({ length: last }, (_, i) => `${y}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`) 
    };
  }, [currentMonthOffset]);

  return (
    <div className="flex flex-col h-full bg-white px-6">
      <div className="pt-8 pb-4 flex justify-between items-end">
        <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">坚持之墙</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">月度习惯达成概览</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
          <button onClick={() => setCurrentMonthOffset(p => p - 1)} className="p-1 text-gray-400 hover:text-gray-900"><ChevronLeft size={14}/></button>
          <span className="px-1 text-[9px] font-black text-gray-700 font-mono">{data.y} / {String(data.m).padStart(2, '0')}</span>
          <button onClick={() => setCurrentMonthOffset(p => p + 1)} className="p-1 text-gray-400 hover:text-gray-900"><ChevronRight size={14}/></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 grid grid-cols-2 gap-3 content-start">
        {HABITS_CONFIG.map(h => (
          <div key={h.id} className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-[8px] font-black text-gray-400 mb-2 truncate uppercase tracking-widest flex items-center gap-1">
              <Zap size={8} className="text-orange-500" />
              {h.name}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {data.days.map(d => {
                const val = checkInData[d]?.[h.id];
                const done = h.isMulti ? (Array.isArray(val) && val.length > 0) : val === true;
                return (
                    <div 
                        key={d} 
                        className={`aspect-square rounded-[2px] transition-all ${done ? 'bg-blue-500 scale-105' : 'bg-gray-100'}`} 
                        title={d}
                    />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesView: React.FC<{
  notes: Achievement[];
  newNote: string;
  setNewNote: (val: string) => void;
  handleAddNote: () => void;
  onDeleteNote: (id: string) => void;
}> = ({ notes, newNote, setNewNote, handleAddNote, onDeleteNote }) => (
  <div className="flex flex-col h-full bg-[#f4f4f7] px-6 pt-8">
    <div className="mb-4">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">成就墙</h1>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">记录你的每一个创作突破</p>
    </div>

    <div className="bg-white rounded-[24px] p-1 shadow-sm border border-gray-200/50 mb-4 flex items-center gap-2">
      <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600 ml-1"><Star size={18} fill="currentColor"/></div>
      <input 
        type="text" 
        value={newNote} 
        onChange={e => setNewNote(e.target.value)}
        placeholder="今天有哪些高光时刻？" 
        className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-700 placeholder-gray-300 py-3"
        onKeyDown={e => e.key === 'Enter' && handleAddNote()}
      />
      <button onClick={handleAddNote} className="bg-gray-900 text-white p-2.5 rounded-[18px] active:scale-90 transition-all mr-1 shadow-lg shadow-gray-200"><Plus size={20}/></button>
    </div>

    <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pb-20">
      {notes.map(n => (
        <div key={n.id} className="group bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <Trophy size={16}/>
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-sm">{n.title}</h3>
              <p className="text-[8px] text-gray-400 mt-0.5 font-black uppercase tracking-widest">{n.date}</p>
            </div>
          </div>
          <button onClick={() => onDeleteNote(n.id)} className="text-gray-200 hover:text-red-500 p-1.5 transition-all opacity-0 group-hover:opacity-100">
            <Trash2 size={16}/>
          </button>
        </div>
      ))}
      {notes.length === 0 && (
        <div className="text-center py-16 opacity-30">
          <Trophy size={48} strokeWidth={1} className="mx-auto text-gray-300" />
          <p className="text-[10px] font-black uppercase tracking-widest mt-3">暂无成就记录</p>
        </div>
      )}
    </div>
  </div>
);

// --- 主组件 ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [checkInData, setCheckInData] = useState<CheckInData>({});
  const [notes, setNotes] = useState<Achievement[]>([]);
  const [newNote, setNewNote] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(DEEP_WORK_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('creator_orbit_checkins');
    const savedNotes = localStorage.getItem('creator_orbit_notes');
    if (savedData) setCheckInData(JSON.parse(savedData));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('creator_orbit_checkins', JSON.stringify(checkInData));
  }, [checkInData]);

  useEffect(() => {
    localStorage.setItem('creator_orbit_notes', JSON.stringify(notes));
  }, [notes]);

  // 恢复连接 Gemini AI 的灵感功能
  const handleGetInspiration = async () => {
    setIsLoadingAi(true);
    setShowAiModal(true);
    
    // 生成简单的本周汇总供 AI 参考
    const recentCompleted = Object.values(checkInData).slice(-7).reduce((acc, day) => {
      return acc + Object.values(day).filter(v => v === true || (Array.isArray(v) && v.length > 0)).length;
    }, 0);
    
    const summary = `本周已完成 ${recentCompleted} 个习惯打卡项。`;
    const insight = await getCreatorInspiration(summary);
    setInspiration(insight);
    setIsLoadingAi(false);
  };

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowAlarm(true);
      try { 
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock_beep.ogg');
        audio.volume = 0.3;
        audio.play().catch(() => {}); 
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleTimerClick = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTimeLeft(DEEP_WORK_LIMIT);
    } else {
      setIsTimerRunning(true);
    }
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCheckIn = async (date: string, habitId: string, subOption?: string) => {
    setCheckInData(prev => {
      const currentDayData = prev[date] || {};
      let updatedDay;
      
      if (subOption) {
        const currentOptions = (currentDayData[habitId] as string[]) || [];
        const newOptions = currentOptions.includes(subOption) 
          ? currentOptions.filter(o => o !== subOption) 
          : [...currentOptions, subOption];
        updatedDay = { ...currentDayData, [habitId]: newOptions };
      } else {
        updatedDay = { ...currentDayData, [habitId]: !currentDayData[habitId] };
      }
      
      return { ...prev, [date]: updatedDay };
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Achievement = {
      id: Date.now().toString(),
      title: newNote,
      date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      timestamp: Date.now()
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-2 font-sans antialiased">
      {/* iPhone 15 容器 (393x852) */}
      <div className="w-[393px] h-[852px] bg-white rounded-[55px] shadow-2xl relative overflow-hidden border-[10px] border-[#1C1C1E] flex flex-col select-none">
        
        {/* iOS Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1C1C1E] rounded-full z-[150] flex items-center justify-center">
            {isTimerRunning && (
                <div className="flex items-center gap-1.5 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] text-white font-mono font-bold tracking-tight">{formatTime(timeLeft)}</span>
                </div>
            )}
        </div>
        
        {/* iOS Status Bar */}
        <div className="h-10 w-full flex justify-between items-end px-10 pb-1 z-[100] text-gray-900 pointer-events-none">
          <span className="text-[12px] font-black tracking-tighter">9:41</span>
          <div className="flex gap-1 items-center mb-0.5 opacity-80">
            <Activity size={10} strokeWidth={3} />
            <div className="w-4 h-2 border-[1.2px] border-gray-900 rounded-sm relative">
              <div className="absolute inset-px bg-gray-900 rounded-px w-3/4" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'weekly' && (
            <WeeklyView 
              currentWeekOffset={currentWeekOffset} 
              setCurrentWeekOffset={setCurrentWeekOffset}
              checkInData={checkInData} 
              handleCheckIn={handleCheckIn}
              onGetInspiration={handleGetInspiration}
              isTimerRunning={isTimerRunning}
              timeLeft={timeLeft}
              handleTimerClick={handleTimerClick}
              formatTime={formatTime}
            />
          )}
          {activeTab === 'monthly' && (
            <MonthlyView 
              currentMonthOffset={currentMonthOffset} 
              setCurrentMonthOffset={setCurrentMonthOffset} 
              checkInData={checkInData}
            />
          )}
          {activeTab === 'notes' && (
            <NotesView 
              notes={notes} 
              newNote={newNote} 
              setNewNote={setNewNote} 
              handleAddNote={handleAddNote} 
              onDeleteNote={handleDeleteNote}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="h-[80px] apple-blur border-t border-gray-100 flex justify-around items-start pt-3 px-6 z-[100] pb-6">
          {[
            { id: 'weekly', icon: Calendar, label: '打卡' },
            { id: 'monthly', icon: BarChart2, label: '月度' },
            { id: 'notes', icon: Trophy, label: '成就' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id as TabType)} 
              className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === t.id ? 'text-blue-500 scale-110' : 'text-gray-300'}`}
            >
              <t.icon size={20} strokeWidth={activeTab === t.id ? 3 : 2} />
              <span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-900/10 rounded-full z-[110]" />

        {/* 灵感弹窗 */}
        {showAiModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-[200] flex items-center justify-center p-8 transition-all">
            <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Sparkles size={24} /></div>
                <button onClick={() => setShowAiModal(false)} className="p-1 text-gray-300 hover:text-gray-900"><X size={24} /></button>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight relative z-10">创作者灵感</h3>
              <div className="min-h-[100px] flex items-center justify-center relative z-10">
                {isLoadingAi ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">同步 Gemini...</p>
                    </div>
                ) : (
                    <div className="relative">
                        <Quote size={24} className="text-blue-100 absolute -top-6 -left-4 -z-0" />
                        <p className="text-base text-gray-700 leading-relaxed font-bold italic text-center relative z-10">{inspiration}</p>
                    </div>
                )}
              </div>
              <button 
                onClick={() => setShowAiModal(false)} 
                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-[20px] font-black text-base active:scale-95 transition-all shadow-xl"
              >
                收下灵感
              </button>
            </div>
          </div>
        )}

        {/* 闹钟遮罩 */}
        {showAlarm && (
          <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center z-[300] text-white p-10 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white/20 rounded-[32px] flex items-center justify-center mb-8 animate-bounce shadow-2xl border border-white/20 backdrop-blur-sm">
                <Bell size={48} fill="white" className="text-white" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">专注结束</h2>
            <p className="text-lg opacity-80 mb-10 font-medium leading-relaxed">90 分钟的高效产出已达成。请立即离开屏幕，放松身心。</p>
            <button 
                onClick={() => { setShowAlarm(false); setTimeLeft(DEEP_WORK_LIMIT); }} 
                className="bg-white text-red-600 px-12 py-4 rounded-[24px] font-black text-lg active:scale-95 shadow-2xl"
            >
                收到
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
