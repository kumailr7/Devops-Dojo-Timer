import React, { useState, useEffect, useRef } from 'react';
import { Zap, Coffee, BarChart2, Settings, User as UserIcon, LogOut, Brain, Tag, Plus, CheckSquare, Sparkles, Sun, Moon, Maximize2, Minimize2 } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { TimerMode, SessionLog, User, AppConfig, Resource, Task } from './types';
import { CircularTimer } from './components/CircularTimer';
import { StatsChart } from './components/StatsChart';
import { SettingsModal } from './components/SettingsModal';
import { CustomTimerModal } from './components/CustomTimerModal';
import { SessionHistoryList } from './components/SessionHistoryList';
import { ResourcesPanel } from './components/ResourcesPanel';
import { PlannerPanel } from './components/PlannerPanel';
import { AIChatPanel } from './components/AIChatPanel';
import { StatsView } from './components/StatsView';
import { generateProductivityInsights, generateTopicSuggestions } from './services/geminiService';

// --- Global Constants ---
const DEFAULT_TIMERS = {
  [TimerMode.FOCUS]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
  [TimerMode.CUSTOM]: 20 * 60,
};

type ViewState = 'dashboard' | 'planner' | 'ai-chat' | 'stats';

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isZenMode, setIsZenMode] = useState(false);
  
  // Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMERS[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [customTimerLabel, setCustomTimerLabel] = useState("");
  
  // Data State
  const [topic, setTopic] = useState("Kubernetes");
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(['DevOps']);
  const [newTag, setNewTag] = useState("");
  const [config, setConfig] = useState<AppConfig>({
    featureFlags: { experimentalAI: true, slackIntegration: false, plannerIntegration: true },
    timers: DEFAULT_TIMERS
  });
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  
  // Session Resources & Planner Data
  const [currentResources, setCurrentResources] = useState<Resource[]>([]);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);

  // Refs for timer and audio
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // --- Effects ---

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('chronos_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark'); // Default to dark
    }

    // Request Notification Permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const savedLogs = localStorage.getItem('chronos_logs');
    const savedUser = localStorage.getItem('chronos_user');
    const savedConfig = localStorage.getItem('chronos_config');
    const savedTasks = localStorage.getItem('chronos_tasks');
    
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTasks) setCurrentTasks(JSON.parse(savedTasks));
    if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        if (!parsedConfig.timers[TimerMode.CUSTOM]) {
            parsedConfig.timers[TimerMode.CUSTOM] = DEFAULT_TIMERS[TimerMode.CUSTOM];
        }
        setConfig(parsedConfig);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chronos_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('chronos_tasks', JSON.stringify(currentTasks));
  }, [currentTasks]);

  useEffect(() => {
      localStorage.setItem('chronos_config', JSON.stringify(config));
  }, [config]);

  // Timer Tick Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // --- Audio / Notification Logic ---

  const initAudioContext = () => {
    if (!audioContextRef.current) {
        const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtor) {
            audioContextRef.current = new AudioCtor();
        }
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  };

  const playNotificationSound = () => {
    try {
        if (!audioContextRef.current) initAudioContext();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const t = ctx.currentTime;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Melodic pattern: C5 -> E5 -> G5 (Success chord)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, t); // C5
        oscillator.frequency.setValueAtTime(659.25, t + 0.2); // E5
        oscillator.frequency.setValueAtTime(783.99, t + 0.4); // G5
        
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.3, t + 0.1);
        gainNode.gain.setValueAtTime(0.3, t + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

        oscillator.start(t);
        oscillator.stop(t + 1.2);
    } catch (error) {
        console.error("Failed to play sound:", error);
    }
  };

  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // --- Handlers ---

  const handleTimerComplete = () => {
    playNotificationSound();
    sendNotification("Time's Up!", `Your ${timerMode.replace('_', ' ').toLowerCase()} session is complete.`);
    
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const newLog: SessionLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      durationSeconds: config.timers[timerMode],
      mode: timerMode,
      sessionLabel: timerMode === TimerMode.CUSTOM ? customTimerLabel : undefined,
      topic: topic,
      tags: tags,
      resources: currentResources, // Save resources from this session
      tasks: currentTasks // Save current state of tasks
    };
    setLogs(prev => [...prev, newLog]);

    // Keep tasks persistent but allow clearing logic if needed later
    setCurrentResources([]); 
    
    // Auto-switch logic
    if (timerMode === TimerMode.FOCUS) {
       setTimerMode(TimerMode.SHORT_BREAK);
       setTimeLeft(config.timers[TimerMode.SHORT_BREAK]);
    } else if (timerMode === TimerMode.CUSTOM) {
       setTimerMode(TimerMode.FOCUS);
       setTimeLeft(config.timers[TimerMode.FOCUS]);
       setCustomTimerLabel("");
    } else {
       setTimerMode(TimerMode.FOCUS);
       setTimeLeft(config.timers[TimerMode.FOCUS]);
    }
  };

  const toggleTimer = () => {
    // Initialize audio context on first user interaction to prevent blocking
    if (!isActive) initAudioContext();
    setIsActive(!isActive);
  };

  const switchMode = (mode: TimerMode) => {
    if (mode === TimerMode.CUSTOM) {
      setShowCustomTimer(true);
      return;
    }
    setIsActive(false);
    setTimerMode(mode);
    setCustomTimerLabel("");
    setTimeLeft(config.timers[mode]);
  };

  const handleStartCustomTimer = (minutes: number, label: string) => {
    const durationSeconds = minutes * 60;
    const newTimers = { ...config.timers, [TimerMode.CUSTOM]: durationSeconds };
    setConfig(prev => ({ ...prev, timers: newTimers }));
    setCustomTimerLabel(label);
    setTimerMode(TimerMode.CUSTOM);
    setTimeLeft(durationSeconds);
    setIsActive(false);
  };

  const handleUpdateTimers = (newTimers: { [key in TimerMode]: number }) => {
    setConfig(prev => ({ ...prev, timers: newTimers }));
    if (!isActive && timerMode !== TimerMode.CUSTOM) {
       setTimeLeft(newTimers[timerMode]);
    }
  };

  const handleLogin = () => {
    // Init audio on login click too, just in case
    initAudioContext();
    const dummyUser: User = {
      id: '123',
      name: 'DevOps Engineer',
      email: 'engineer@dojo.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=DevOps+Dojo&background=6366f1&color=fff'
    };
    setUser(dummyUser);
    localStorage.setItem('chronos_user', JSON.stringify(dummyUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chronos_user');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('chronos_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis("");
    const result = await generateProductivityInsights(logs, topic);
    setAiAnalysis(result);
    setIsAiLoading(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const getTopicSuggestions = async () => {
    if (!topic) return;
    const suggestions = await generateTopicSuggestions(topic);
    setSuggestedTopics(suggestions);
  };

  const toggleFeature = (feature: keyof AppConfig['featureFlags']) => {
    setConfig(prev => ({
        ...prev,
        featureFlags: {
            ...prev.featureFlags,
            [feature]: !prev.featureFlags[feature]
        }
    }));
  };

  // --- Render ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-300 dark:border-slate-700 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center transform rotate-3 shadow-lg shadow-indigo-500/30">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">DevOps Dojo AI</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Master your time with Gemini-powered deep learning sessions.</p>
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
            Enter the Dojo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col md:flex-row overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        currentTimers={config.timers}
        onSave={handleUpdateTimers}
      />
      
      <CustomTimerModal
        isOpen={showCustomTimer}
        onClose={() => setShowCustomTimer(false)}
        onStart={handleStartCustomTimer}
      />

      {/* Sidebar - Hidden in Zen Mode */}
      {!isZenMode && (
        <nav className="w-full md:w-20 lg:w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 z-10 shrink-0 transition-all duration-300 shadow-sm">
          <div className="mb-8 p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1 w-full px-2 lg:px-4 space-y-2">
            <NavButton 
              active={currentView === 'dashboard'} 
              icon={<Zap />} 
              label="Dashboard" 
              onClick={() => setCurrentView('dashboard')}
            />
            <NavButton 
              active={currentView === 'stats'}
              icon={<BarChart2 />} 
              label="Stats" 
              onClick={() => setCurrentView('stats')} 
            />
            <NavButton 
              active={currentView === 'planner'} 
              icon={<CheckSquare />} 
              label="Planner" 
              onClick={() => setCurrentView('planner')}
            />
             <NavButton 
              active={currentView === 'ai-chat'} 
              icon={<Sparkles />} 
              label="DevOps AI" 
              onClick={() => setCurrentView('ai-chat')}
            />
            
            <div className="border-t border-slate-200 dark:border-slate-800 my-4 pt-4">
               <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-4 mb-2 hidden lg:block">Integrations</h3>
               <IntegrationToggle 
                  connected={config.featureFlags.slackIntegration} 
                  label="Slack" 
                  onClick={() => toggleFeature('slackIntegration')}
               />
            </div>
          </div>

          <div className="w-full px-4 mt-auto space-y-4">
            <div className="hidden lg:flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Theme</span>
                <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full" />
              <div className="hidden lg:block overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-700 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-500 ${isZenMode ? 'flex flex-col items-center justify-center' : ''}`}>
        
        {/* Header - Hidden in Zen Mode */}
        <header className={`flex justify-between items-center mb-8 w-full max-w-7xl mx-auto ${isZenMode ? 'mb-4' : ''}`}>
          {!isZenMode && (
            <div>
              <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
                  {currentView === 'dashboard' ? 'DevOps Dojo AI Learning' : 
                   currentView === 'planner' ? 'Task Planner' : 
                   currentView === 'stats' ? 'Analytics & Insights' :
                   'DevOps Dojo AI'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {currentView === 'dashboard' ? `Welcome back, ${user.name.split(' ')[0]} 👋` : 
                   currentView === 'planner' ? 'Manage your learning objectives and tasks' : 
                   currentView === 'stats' ? 'Track your progress and study habits' :
                   'Your intelligent DevOps assistant'}
              </p>
            </div>
          )}
          
          <div className={`flex items-center gap-2 ${isZenMode ? 'w-full justify-end' : ''}`}>
             <button 
                onClick={() => setIsZenMode(!isZenMode)}
                className={`p-2 rounded-lg transition-colors border shadow-sm ${
                    isZenMode 
                    ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-slate-600'
                }`}
                title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            >
                {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {!isZenMode && (
                <>
                <button 
                    onClick={toggleTheme}
                    className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                    <Settings className="w-5 h-5" />
                </button>
                </>
            )}
          </div>
        </header>

        {currentView === 'dashboard' ? (
          <div className={`${isZenMode ? 'w-full max-w-2xl' : 'grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto'}`}>
            {/* Left Column (Main Timer) */}
            <div className="space-y-6 w-full">
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm backdrop-blur-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Current Objective</label>
                  {!isZenMode && (
                    <button onClick={getTopicSuggestions} className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <Brain className="w-3 h-3" /> AI Suggestions
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`w-full bg-transparent font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-indigo-500 transition-colors pb-2 ${isZenMode ? 'text-4xl text-center' : 'text-2xl md:text-3xl'}`}
                  placeholder="What are you learning?"
                />
                {!isZenMode && suggestedTopics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                    {suggestedTopics.map((t, i) => (
                      <button key={i} onClick={() => { setTopic(t); setSuggestedTopics([]); }} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white px-2 py-1 rounded-md transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {!isZenMode && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {tags.map(tag => (
                        <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-200 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-1">
                        #{tag}
                        <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-white">&times;</button>
                        </span>
                    ))}
                    <input 
                        type="text" 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag..."
                        className="bg-transparent text-xs text-slate-500 dark:text-slate-300 focus:outline-none min-w-[60px]"
                    />
                    </div>
                )}
              </div>

              <div className={`bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-300 dark:border-slate-700 relative overflow-hidden transition-all duration-300 ${isZenMode ? 'scale-110 my-10' : 'hover:border-indigo-400 dark:hover:border-slate-600'}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                    timerMode === TimerMode.CUSTOM ? 'from-pink-500 via-purple-500 to-indigo-500' : 'from-indigo-500 via-purple-500 to-pink-500'
                }`}></div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                   <ModeButton mode={TimerMode.FOCUS} current={timerMode} onClick={() => switchMode(TimerMode.FOCUS)} icon={<Zap className="w-4 h-4" />} />
                   <ModeButton mode={TimerMode.SHORT_BREAK} current={timerMode} onClick={() => switchMode(TimerMode.SHORT_BREAK)} icon={<Coffee className="w-4 h-4" />} />
                   <ModeButton mode={TimerMode.LONG_BREAK} current={timerMode} onClick={() => switchMode(TimerMode.LONG_BREAK)} icon={<UserIcon className="w-4 h-4" />} />
                   <button
                      onClick={() => switchMode(TimerMode.CUSTOM)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        timerMode === TimerMode.CUSTOM 
                          ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Custom
                    </button>
                </div>

                <div className="py-8">
                  <CircularTimer 
                    timeLeft={timeLeft} 
                    totalTime={config.timers[timerMode]}
                    mode={timerMode}
                    customLabel={customTimerLabel}
                    isActive={isActive}
                    onToggle={toggleTimer}
                  />
                </div>

                <div className="text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {timerMode === TimerMode.FOCUS ? "Stay focused. Deep work mode engaged." : 
                     timerMode === TimerMode.CUSTOM ? "Running your custom session." :
                     "Time to recharge. Step away from the screen."}
                  </p>
                  <div className="mt-2 text-xs text-slate-400 dark:text-slate-600 font-mono">
                      Target: {Math.floor(config.timers[timerMode] / 60)}m
                  </div>
                </div>
              </div>

              {/* Resources Panel - Hidden in Zen Mode */}
              {!isZenMode && (
                <ResourcesPanel 
                    resources={currentResources}
                    onAddResource={(res) => setCurrentResources(prev => [...prev, res])}
                    onRemoveResource={(id) => setCurrentResources(prev => prev.filter(r => r.id !== id))}
                />
              )}
            </div>

            {/* Right Column - Hidden in Zen Mode */}
            {!isZenMode && (
                <div className="space-y-6">
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                    Weekly Activity
                    </h3>
                    <StatsChart logs={logs} />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <StatBox label="Sessions" value={logs.length} />
                    <StatBox label="Hours" value={(logs.reduce((a,b) => a + b.durationSeconds, 0) / 3600).toFixed(1)} />
                    <StatBox label="Streak" value="3 Days" />
                    </div>
                </div>

                {/* Planner Integration (Small View) */}
                {config.featureFlags.plannerIntegration && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <PlannerPanel 
                            tasks={currentTasks}
                            onAddTask={(task) => setCurrentTasks(prev => [...prev, task])}
                            onUpdateTask={(updatedTask) => setCurrentTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))}
                            onRemoveTask={(id) => setCurrentTasks(prev => prev.filter(t => t.id !== id))}
                            isFullPage={false}
                        />
                    </div>
                )}

                <SessionHistoryList logs={logs} />

                <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-800 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-500/20 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain className="w-32 h-32 text-indigo-500" />
                    </div>
                    
                    <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="bg-indigo-100 dark:bg-indigo-500 text-indigo-700 dark:text-white text-[10px] px-2 py-0.5 rounded-full font-bold">GEMINI 3 PRO</span>
                        AI Coach
                        </h3>
                        <button 
                        onClick={handleAiAnalysis}
                        disabled={isAiLoading || logs.length === 0}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                        >
                        {isAiLoading ? <span className="animate-pulse">Analyzing...</span> : <><Brain className="w-3 h-3" /> Generate Insights</>}
                        </button>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/50 rounded-xl p-4 min-h-[200px] text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
                        {aiAnalysis ? (
                            <div className="whitespace-pre-wrap font-mono text-xs md:text-sm">{aiAnalysis}</div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <p>Complete a few sessions to unlock personalized AI insights.</p>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
                </div>
            )}
          </div>
        ) : currentView === 'planner' ? (
          /* Planner Full Page View */
          <div className="h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4">
            <PlannerPanel 
                tasks={currentTasks}
                onAddTask={(task) => setCurrentTasks(prev => [...prev, task])}
                onUpdateTask={(updatedTask) => setCurrentTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))}
                onRemoveTask={(id) => setCurrentTasks(prev => prev.filter(t => t.id !== id))}
                isFullPage={true}
            />
          </div>
        ) : currentView === 'stats' ? (
          /* Stats Full Page View */
          <div className="h-full animate-in fade-in slide-in-from-bottom-4">
             <StatsView logs={logs} />
          </div>
        ) : (
          /* AI Chat Full Page View */
          <div className="h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4">
             <AIChatPanel currentTopic={topic} />
          </div>
        )}
      </main>
      <SpeedInsights />
    </div>
  );
};

// --- Helper Components ---
const NavButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
    active 
      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold' 
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
  }`}>
    <span className="w-5 h-5 flex justify-center">{icon}</span>
    <span className="hidden lg:block font-medium text-sm">{label}</span>
  </button>
);

const IntegrationToggle: React.FC<{ connected: boolean; label: string; onClick?: () => void }> = ({ connected, label, onClick }) => (
  <div className="hidden lg:flex items-center justify-between px-4 py-2 cursor-pointer group" onClick={onClick}>
    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{label}</span>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${connected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
       <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${connected ? 'left-4.5' : 'left-0.5'}`} style={{ left: connected ? 'calc(100% - 14px)' : '2px' }}></div>
    </div>
  </div>
);

const ModeButton: React.FC<{ mode: TimerMode; current: TimerMode; onClick: () => void; icon: React.ReactNode }> = ({ mode, current, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
      current === mode 
        ? 'bg-indigo-600 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-indigo-500/30' 
        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
    }`}
  >
    {icon}
    {mode === TimerMode.FOCUS ? 'Focus' : mode === TimerMode.SHORT_BREAK ? 'Short' : 'Long'}
  </button>
);

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
    <div className="text-xl font-bold text-slate-800 dark:text-white">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">{label}</div>
  </div>
);

export default App;