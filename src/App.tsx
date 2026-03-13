import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Wind, Trash2, Plus, MessageSquare, Menu, X, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chat } from './services/gemini';
import { BreathingExercise } from './components/BreathingExercise';
import { Login } from './components/Login';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      title: '新对话',
      messages: [
        {
          role: 'model',
          content: '你好！我是你的 Ipsos 专属顾问。我拥有20年的客户关系实战经验，同时也是一名情绪疗愈师。无论是面对棘手的客户沟通难题，还是在项目压力下感到精疲力竭，我都在这里为你提供精准的策略支持与温暖的情绪价值。今天，你想聊聊某个具体的项目挑战，还是想先释放一下积压的情绪？',
        },
      ],
      timestamp: new Date(),
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showZen, setShowZen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isLoggedIn) {
      scrollToBottom();
    }
  }, [currentSession.messages, isLoggedIn]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Update current session with user message
    const updatedMessages: Message[] = [...currentSession.messages, { role: 'user', content: userMessage }];
    
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: updatedMessages, title: s.messages.length === 1 ? userMessage.slice(0, 20) : s.title } 
        : s
    ));
    
    setIsLoading(true);

    try {
      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const stream = await chat(userMessage, history);
      let fullResponse = '';
      
      // Add empty model message to current session
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...updatedMessages, { role: 'model', content: '' }] } 
          : s
      ));

      for await (const chunk of stream) {
        const text = chunk.text;
        fullResponse += text;
        setSessions(prev => prev.map(s => 
          s.id === currentSessionId 
            ? { 
                ...s, 
                messages: s.messages.map((m, i) => 
                  i === s.messages.length - 1 ? { ...m, content: fullResponse } : m
                ) 
              } 
            : s
        ));
      }

    } catch (error) {
      console.error('Chat error:', error);
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, { role: 'model', content: '抱歉，我现在遇到了一点小问题，请稍后再试。' }] } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: Session = {
      id: newId,
      title: '新对话',
      messages: [
        {
          role: 'model',
          content: '你好！我是你的 Ipsos 专属顾问。今天有什么我可以帮你的吗？无论是策略建议还是情绪疏导，我都在。',
        },
      ],
      timestamp: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      clearHistory();
      return;
    }
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions[0].id);
    }
  };

  const clearHistory = () => {
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? {
            ...s,
            title: '新对话',
            messages: [{
              role: 'model',
              content: '对话已重置。有什么新的问题或想法想聊聊吗？',
            }]
          }
        : s
    ));
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#F4F7FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-ipsos-blue text-white flex flex-col h-full z-40 shadow-xl"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-white" />
                <span className="font-bold text-lg tracking-tight">项目记录</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={createNewSession}
              className="mx-4 mb-6 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all border border-white/10 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              开启新对话
            </button>

            <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all group relative ${
                    currentSessionId === session.id 
                      ? 'bg-white text-ipsos-blue shadow-lg' 
                      : 'hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-ipsos-blue' : 'text-white/40'}`} />
                  <span className="text-sm font-medium truncate pr-6">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className={`absolute right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400 ${
                      currentSessionId === session.id ? 'text-ipsos-blue/40' : 'text-white/40'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white text-sm"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-ipsos-blue/10 flex items-center justify-between px-6 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-ipsos-blue"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-bold tracking-tight text-ipsos-blue">Ipsos 专属助手</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowZen(!showZen)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                showZen 
                  ? 'bg-ipsos-blue text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Wind className="w-4 h-4" />
              {showZen ? '退出冥想' : '开启冥想'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 pt-8 scroll-smooth">
          <div className="max-w-4xl mx-auto px-6">
            {/* Zen Mode Overlay */}
            <AnimatePresence>
              {showZen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <BreathingExercise />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="space-y-10">
              {currentSession.messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    msg.role === 'user' ? 'bg-ipsos-red' : 'bg-ipsos-blue'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="text-white w-5 h-5" />
                    ) : (
                      <Bot className="text-white w-5 h-5" />
                    )}
                  </div>
                  
                  <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`px-6 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all ${
                      msg.role === 'user' 
                        ? 'bg-ipsos-red text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-ipsos-blue/5'
                    }`}>
                      <div className={`markdown-body prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider px-2">
                      {msg.role === 'user' ? 'You' : 'Ipsos Assistant'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-ipsos-blue flex items-center justify-center shadow-lg">
                    <Bot className="text-white w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 px-6 py-4 bg-white rounded-2xl border border-ipsos-blue/5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-ipsos-blue rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-ipsos-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-ipsos-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F4F7FA] via-[#F4F7FA] to-transparent pt-10 pb-6 px-6 z-20">
          <div className="max-w-4xl mx-auto relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入你的困惑或心情..."
              className="w-full bg-white border border-ipsos-blue/10 rounded-2xl px-6 py-5 pr-16 focus:outline-none focus:ring-4 focus:ring-ipsos-blue/5 focus:border-ipsos-blue transition-all shadow-xl shadow-ipsos-blue/5 resize-none h-16 max-h-40"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2.5 bg-ipsos-blue text-white rounded-xl hover:bg-ipsos-blue/90 disabled:opacity-50 disabled:hover:bg-ipsos-blue transition-all shadow-lg shadow-ipsos-blue/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide">
            益普索 (Ipsos) 内部专用 · 按 Enter 发送
          </p>
        </div>

        {/* Quick Suggestions */}
        {currentSession.messages.length === 1 && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 px-6 pointer-events-none">
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl pointer-events-auto">
              {[
                '如何应对焦虑且死磕细节的客户？',
                '项目压力太大，感觉生不如死...',
                '帮我做一个深呼吸练习',
                '客户想要创新但又不敢尝试怎么办？'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-5 py-2.5 bg-white border border-ipsos-blue/10 rounded-full text-xs font-medium text-gray-600 hover:border-ipsos-blue hover:text-ipsos-blue transition-all shadow-sm hover:shadow-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
