import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Lightbulb, 
  Camera, 
  Clock, 
  MessageSquare, 
  Power, 
  Thermometer, 
  Cloud, 
  Bell,
  Palette,
  Send,
  Settings,
  Lock,
  Unlock,
  Fan,
  HardDrive,
  Droplets,
  Check,
  MapPin,
  Activity,
  X
} from 'lucide-react';

// --- Turlari ---
type Tab = 'home' | 'controls' | 'chat';
type Emotion = 'normal' | 'happy' | 'listening' | 'thinking' | 'sad' | 'sleepy' | 'surprised';

// --- Temalar konfiguratsiyasi ---
const themes = {
  emerald: {
    id: 'emerald',
    color: 'bg-[#10b981]',
    text: 'text-[#10b981]',
    bgLight: 'bg-[#10b981]/10',
    border: 'border-[#10b981]/30',
  },
  amber: {
    id: 'amber',
    color: 'bg-[#f59e0b]',
    text: 'text-[#f59e0b]',
    bgLight: 'bg-[#f59e0b]/10',
    border: 'border-[#f59e0b]/30',
  },
  orange: {
    id: 'orange',
    color: 'bg-[#ea580c]',
    text: 'text-[#ea580c]',
    bgLight: 'bg-[#ea580c]/10',
    border: 'border-[#ea580c]/30',
  },
  slate: {
    id: 'slate',
    color: 'bg-[#64748b]',
    text: 'text-[#64748b]',
    bgLight: 'bg-[#64748b]/10',
    border: 'border-[#64748b]/30',
  }
};

type ThemeKey = keyof typeof themes;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [emotion, setEmotion] = useState<Emotion>('normal');
  const [lightOn, setLightOn] = useState(false);
  const [doorLocked, setDoorLocked] = useState(true);
  const [fanOn, setFanOn] = useState(false);
  const [rgbColor, setRgbColor] = useState('off');
  const [alarmTime, setAlarmTime] = useState('');
  const [alarms, setAlarms] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sysStats, setSysStats] = useState({ cpu: 15, ram: 42, temp: 24, hum: 45 });
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: "Tizim tayyor. Qanday yordam bera olaman?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Kamera holati
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFlash, setCameraFlash] = useState(false);

  // Tema holati
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('emerald');
  const t = themes[activeTheme];

  // Soatni yangilash
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // LocalStorage dan temani o'qish
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as ThemeKey;
    if (savedTheme && themes[savedTheme]) {
      setActiveTheme(savedTheme);
    }
  }, []);

  // Temani saqlash
  const changeTheme = (theme: ThemeKey) => {
    setActiveTheme(theme);
    localStorage.setItem('app_theme', theme);
  };

  // Telegram WebApp integratsiyasi
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0B1120'); 
    }
  }, []);

  // Vaqti-vaqti bilan ko'z pirpirashi
  useEffect(() => {
    if (emotion !== 'normal') return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setEmotion('sleepy');
        setTimeout(() => setEmotion('normal'), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [emotion]);

  // Chat pastga tushishi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, emotion]);

  // --- Robot Yuzi Komponenti ---
  const RobotFace = () => {
    const getEyeStyle = () => {
      switch (emotion) {
        case 'happy': return { height: '6px', borderRadius: '50% 50% 0 0', transform: 'translateY(-4px)' };
        case 'sleepy': return { height: '2px', transform: 'translateY(6px)' };
        case 'surprised': return { height: '16px', width: '16px', borderRadius: '50%' };
        case 'listening': return { height: '12px', width: '12px', borderRadius: '50%', animation: 'pulse 1s infinite' };
        case 'thinking': return { height: '8px', transform: 'translateX(4px) translateY(-2px)' };
        case 'sad': return { height: '8px', borderRadius: '0 0 50% 50%', transform: 'translateY(4px)' };
        default: return { height: '16px', borderRadius: '6px' };
      }
    };

    return (
      <div className={`w-full h-full bg-[#0B1120] rounded-2xl flex items-center justify-center gap-4 relative overflow-hidden transition-shadow duration-500`}>
        <motion.div 
          animate={getEyeStyle()}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`w-4 ${t.color} shadow-[0_0_10px_currentColor] transition-colors duration-500`}
        />
        <motion.div 
          animate={getEyeStyle()}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`w-4 ${t.color} shadow-[0_0_10px_currentColor] transition-colors duration-500`}
        />
      </div>
    );
  };

  // WebSocket ulanishi
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [rpiConnected, setRpiConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const connect = () => {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => setWs(socket);
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'status') {
            setRpiConnected(data.rpi_connected);
          } else if (data.type === 'chat_reply') {
            setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
            setEmotion('speaking');
            setTimeout(() => setEmotion('normal'), 3000);
          } else if (data.type === 'sensor_data') {
            setSysStats(prev => ({ ...prev, ...data.data }));
          }
        } catch (e) {
          console.error(e);
        }
      };
      
      socket.onclose = () => {
        setWs(null);
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => ws?.close();
  }, []);

  // --- Xabarlarni yuborish ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setEmotion('thinking');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'chat', text: chatInput }));
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: "Kechirasiz, server bilan aloqa yo'q." }]);
        setEmotion('sad');
        setTimeout(() => setEmotion('normal'), 2000);
      }, 1000);
    }
    setChatInput('');
  };

  // --- Chiroqni boshqarish ---
  const toggleLight = () => {
    const newState = !lightOn;
    setLightOn(newState);
    setEmotion('happy');
    setTimeout(() => setEmotion('normal'), 1000);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'toggle_light', state: newState }));
    }
  };

  // --- RGB ni boshqarish ---
  const changeRgb = (color: string) => {
    setRgbColor(color);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'set_rgb', color }));
    }
  };

  // --- Eshikni boshqarish ---
  const toggleDoor = () => {
    const newState = !doorLocked;
    setDoorLocked(newState);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'toggle_door', state: newState }));
    }
  };

  // --- Ventilyatorni boshqarish ---
  const toggleFan = () => {
    const newState = !fanOn;
    setFanOn(newState);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'toggle_fan', state: newState }));
    }
  };

  // --- Rasmga olish (Kamera Modalini ochish) ---
  const openCamera = () => {
    setIsCameraOpen(true);
  };

  const capturePhoto = () => {
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 150);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'take_photo' }));
    }
    
    setTimeout(() => {
      setIsCameraOpen(false);
      setEmotion('surprised');
      setTimeout(() => setEmotion('normal'), 2000);
    }, 500);
  };

  const handleAddAlarm = () => {
    if (alarmTime) {
      setAlarms([...alarms, alarmTime]);
      setAlarmTime('');
      setEmotion('happy');
      setTimeout(() => setEmotion('normal'), 2000);
    }
  };

  const timeString = currentTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col pb-24 selection:bg-slate-800 relative">
      
      {/* Global CSS to hide scrollbars */}
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* HEADER */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between sticky top-0 bg-[#0B1120]/90 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${t.color} transition-colors duration-500 shadow-lg`}>
            <Home className="text-[#0B1120]" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black text-white leading-none tracking-tight">SMART<br/>HOME</h1>
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">Xavfsizlik Tizimi</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <div className="flex bg-[#151C2C] p-1.5 rounded-full border border-slate-800/50">
            {(Object.keys(themes) as ThemeKey[]).map(key => (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                className={`w-5 h-5 rounded-full ${themes[key].color} mx-0.5 transition-all duration-300 active:scale-90 ${activeTheme === key ? 'ring-2 ring-[#0B1120] ring-offset-2 ring-offset-[#151C2C] scale-110' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>

          {/* Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-800/50 bg-[#151C2C]">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">{rpiConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-5 py-2 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* TOP CARDS ROW */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left Card: Weather/Date */}
                <div className="bg-[#151C2C] rounded-[32px] p-6 border border-slate-800/50 flex flex-col justify-between relative overflow-hidden">
                  <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${t.bgLight} rounded-full blur-3xl transition-colors duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 bg-[#0B1120]/50 w-fit px-3 py-1.5 rounded-full mb-4 border border-slate-800/50">
                      <Thermometer size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold tracking-widest text-white uppercase">HARORAT</span>
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter mb-1">{sysStats.temp}°</h2>
                    <p className="text-sm font-medium text-slate-400 leading-snug">Namlik: {sysStats.hum}%<br/>Tizim barqaror</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  {/* Time Card */}
                  <div className="bg-[#151C2C] rounded-[32px] p-5 border border-slate-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                     <div className={`absolute -top-10 -right-10 w-20 h-20 ${t.bgLight} rounded-full blur-2xl transition-colors duration-500`}></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1 relative z-10">HOZIR</span>
                    <h2 className="text-4xl font-black text-white tracking-tighter relative z-10">{timeString}</h2>
                  </div>
                  
                  {/* Robot Face Card */}
                  <div className="bg-[#151C2C] rounded-[32px] p-4 border border-slate-800/50 flex items-center justify-center flex-1">
                    <RobotFace />
                  </div>
                </div>
              </div>

              {/* MAIN CARD: QUICK ACTIONS */}
              <div className="bg-[#151C2C] rounded-[32px] p-6 border border-slate-800/50 relative overflow-hidden">
                <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
                  <Power size={18} className="text-slate-400" />
                  <h3 className="text-xs font-bold tracking-widest text-white uppercase">Tezkor Amallar</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {/* Light Button */}
                  <button 
                    onClick={toggleLight}
                    className={`p-5 rounded-[24px] border transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-95 ${lightOn ? `${t.bgLight} ${t.border} ${t.text}` : 'bg-[#0B1120] border-slate-800/50 text-slate-400 hover:bg-slate-800/50'}`}
                  >
                    <Lightbulb size={32} className={lightOn ? 'fill-current opacity-20' : ''} />
                    <span className="text-[11px] font-bold tracking-widest uppercase">Chiroq</span>
                  </button>
                  
                  {/* Door Button */}
                  <button 
                    onClick={toggleDoor}
                    className={`p-5 rounded-[24px] border transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-95 ${!doorLocked ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[#0B1120] border-slate-800/50 text-slate-400 hover:bg-slate-800/50'}`}
                  >
                    {doorLocked ? <Lock size={32} /> : <Unlock size={32} className="fill-current opacity-20" />}
                    <span className="text-[11px] font-bold tracking-widest uppercase">Eshik</span>
                  </button>

                  {/* Fan Button */}
                  <button 
                    onClick={toggleFan}
                    className={`p-5 rounded-[24px] border transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-95 ${fanOn ? `${t.bgLight} ${t.border} ${t.text}` : 'bg-[#0B1120] border-slate-800/50 text-slate-400 hover:bg-slate-800/50'}`}
                  >
                    <Fan size={32} className={fanOn ? 'animate-spin' : ''} />
                    <span className="text-[11px] font-bold tracking-widest uppercase">Iqlim</span>
                  </button>

                  {/* Camera Button */}
                  <button 
                    onClick={openCamera}
                    className="p-5 rounded-[24px] border border-slate-800/50 bg-[#0B1120] text-slate-400 hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-95"
                  >
                    <Camera size={32} />
                    <span className="text-[11px] font-bold tracking-widest uppercase">Kamera</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTROLS TAB */}
          {activeTab === 'controls' && (
            <motion.div 
              key="controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* RGB Controls */}
              <div className="bg-[#151C2C] p-6 rounded-[32px] border border-slate-800/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Palette className={`${t.text} transition-colors duration-500`} size={20} />
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase">RGB LED</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-[#0B1120] px-3 py-1 rounded-full">{rgbColor}</span>
                </div>
                <div className="flex justify-between gap-2">
                  {[
                    { id: 'red', color: 'bg-red-500', shadow: 'shadow-red-500/50' },
                    { id: 'green', color: 'bg-green-500', shadow: 'shadow-green-500/50' },
                    { id: 'blue', color: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
                    { id: 'white', color: 'bg-white', shadow: 'shadow-white/50' },
                    { id: 'off', color: 'bg-[#0B1120]', shadow: 'shadow-none' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => changeRgb(c.id)}
                      className={`w-12 h-12 rounded-full ${c.color} ${rgbColor === c.id ? `ring-4 ring-[#0B1120] ring-offset-2 ring-offset-[#151C2C] ${c.shadow}` : 'opacity-50 hover:opacity-100'} transition-all duration-300 active:scale-90`}
                    />
                  ))}
                </div>
              </div>

              {/* System Stats */}
              <div className="bg-[#151C2C] p-6 rounded-[32px] border border-slate-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className={`${t.text} transition-colors duration-500`} size={20} />
                  <h3 className="text-sm font-bold tracking-widest text-white uppercase">Tizim Holati</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      <span>CPU Yuklanishi</span>
                      <span className={`${t.text} transition-colors duration-500`}>{sysStats.cpu}%</span>
                    </div>
                    <div className="h-3 bg-[#0B1120] rounded-full overflow-hidden border border-slate-800/50">
                      <div className={`h-full ${t.color} rounded-full transition-all duration-500`} style={{ width: `${sysStats.cpu}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      <span>RAM Xotira</span>
                      <span className={`${t.text} transition-colors duration-500`}>{sysStats.ram}%</span>
                    </div>
                    <div className="h-3 bg-[#0B1120] rounded-full overflow-hidden border border-slate-800/50">
                      <div className={`h-full ${t.color} rounded-full transition-all duration-500`} style={{ width: `${sysStats.ram}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alarm Controls */}
              <div className="bg-[#151C2C] p-6 rounded-[32px] border border-slate-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className={`${t.text} transition-colors duration-500`} size={20} />
                  <h3 className="text-sm font-bold tracking-widest text-white uppercase">Budilnik</h3>
                </div>
                
                <div className="flex gap-3 mb-6">
                  <input 
                    type="time" 
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className={`flex-1 bg-[#0B1120] border border-slate-800/50 rounded-2xl px-4 py-3 text-white outline-none focus:${t.border} transition-colors`}
                  />
                  <button 
                    onClick={handleAddAlarm}
                    className={`${t.color} text-[#0B1120] font-black tracking-widest uppercase px-6 rounded-2xl transition-all duration-300 text-xs active:scale-95`}
                  >
                    Qo'shish
                  </button>
                </div>

                <div className="space-y-3">
                  {alarms.length === 0 ? (
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-500 text-center py-4">Eslatmalar yo'q</p>
                  ) : (
                    alarms.map((time, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#0B1120] p-4 rounded-2xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <Clock size={16} className={`${t.text} transition-colors duration-500`} />
                          <span className="font-black text-white text-lg tracking-tighter">{time}</span>
                        </div>
                        <div className={`w-12 h-7 ${t.bgLight} rounded-full relative cursor-pointer transition-colors duration-500 border ${t.border}`}>
                          <div className={`absolute right-1 top-1 w-5 h-5 ${t.color} rounded-full transition-colors duration-500 shadow-sm`}></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-[calc(100vh-180px)]"
            >
              <div className="flex items-center gap-4 mb-4 bg-[#151C2C] p-4 rounded-[32px] border border-slate-800/50">
                <div className={`w-12 h-12 bg-[#0B1120] rounded-full border-2 ${t.border} flex items-center justify-center overflow-hidden transition-colors duration-500`}>
                  <div className={`w-6 h-2 ${t.color} rounded-full animate-pulse transition-colors duration-500`}></div>
                </div>
                <div>
                  <h2 className="font-black text-white tracking-tight">TIZIM KONSOLI</h2>
                  <p className={`text-[10px] font-bold tracking-widest uppercase ${t.text} transition-colors duration-500`}>Smart Home • Online</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 no-scrollbar px-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
                      msg.role === 'user' 
                        ? `${t.color} text-[#0B1120] rounded-br-sm font-bold transition-colors duration-500` 
                        : 'bg-[#151C2C] border border-slate-800/50 text-slate-200 rounded-bl-sm font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {emotion === 'thinking' && (
                  <div className="flex justify-start">
                    <div className="bg-[#151C2C] border border-slate-800/50 p-4 rounded-3xl rounded-bl-sm flex gap-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Buyruq bering..."
                  className={`w-full bg-[#151C2C] border border-slate-800/50 rounded-full py-4 pl-6 pr-14 text-white outline-none focus:${t.border} transition-colors font-medium text-sm`}
                />
                <button 
                  onClick={handleSendMessage}
                  className={`absolute right-2 top-2 bottom-2 w-11 ${t.color} rounded-full flex items-center justify-center text-[#0B1120] transition-transform duration-300 active:scale-90`}
                >
                  <Send size={18} className="ml-1" strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B1120] px-4 py-3 pb-safe flex justify-around items-center z-40 border-t border-slate-800/50 rounded-t-[32px]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-300 active:scale-95 ${activeTab === 'home' ? 'bg-[#151C2C]' : 'opacity-60 hover:opacity-100'}`}
        >
          <Home size={22} className={activeTab === 'home' ? t.text : 'text-slate-400'} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${activeTab === 'home' ? 'text-white' : 'text-slate-500'}`}>Asosiy</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('controls')}
          className={`flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-300 active:scale-95 ${activeTab === 'controls' ? 'bg-[#151C2C]' : 'opacity-60 hover:opacity-100'}`}
        >
          <Settings size={22} className={activeTab === 'controls' ? t.text : 'text-slate-400'} strokeWidth={activeTab === 'controls' ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${activeTab === 'controls' ? 'text-white' : 'text-slate-500'}`}>Sozlama</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-300 active:scale-95 ${activeTab === 'chat' ? 'bg-[#151C2C]' : 'opacity-60 hover:opacity-100'}`}
        >
          <MessageSquare size={22} className={activeTab === 'chat' ? t.text : 'text-slate-400'} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${activeTab === 'chat' ? 'text-white' : 'text-slate-500'}`}>Konsol</span>
        </button>
      </nav>

      {/* CAMERA MODAL */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#0B1120] flex flex-col"
          >
            {/* Flash Effect */}
            <AnimatePresence>
              {cameraFlash && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-50 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Camera Header */}
            <div className="flex justify-between items-center p-6 pt-10">
              <h2 className="text-white font-black tracking-widest uppercase text-lg">Kamera</h2>
              <button 
                onClick={() => setIsCameraOpen(false)} 
                className="p-3 bg-[#151C2C] rounded-full text-slate-400 hover:text-white active:scale-90 transition-all border border-slate-800/50"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Camera Viewfinder */}
            <div className="flex-1 px-6 pb-10 flex flex-col gap-8">
              <div className="flex-1 bg-black rounded-[32px] border-2 border-slate-800/50 relative overflow-hidden flex items-center justify-center shadow-2xl">
                <div className={`absolute inset-0 ${t.bgLight} opacity-50`}></div>
                
                {/* Simulated Grid/Focus */}
                <div className="absolute inset-0 border border-slate-800/30 m-8 rounded-xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-slate-700/50 rounded-full"></div>
                
                <Camera size={48} className="text-slate-700 animate-pulse" />
                
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full border border-red-500/30 backdrop-blur-md">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">Live</span>
                </div>
              </div>

              {/* Capture Button */}
              <div className="flex justify-center items-center h-24">
                <button 
                  onClick={capturePhoto} 
                  className={`w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center ${t.bgLight} active:scale-90 transition-all duration-300 shadow-xl`}
                >
                  <div className={`w-14 h-14 rounded-full ${t.color} shadow-[0_0_20px_currentColor]`}></div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
