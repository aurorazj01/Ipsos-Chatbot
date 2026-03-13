import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const IPSOS_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ipsos_logo.svg/2560px-Ipsos_logo.svg.png";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check for admin
    if (username === 'admin' && password === 'ipsos2026') {
      onLogin();
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-ipsos-blue/5 overflow-hidden border border-ipsos-blue/5"
      >
        <div className="bg-ipsos-blue p-8 text-center relative overflow-hidden">
          {/* Decorative background logo */}
          <img 
            src={IPSOS_LOGO} 
            alt="" 
            className="absolute -right-10 -top-10 w-40 h-40 opacity-10 rotate-12 pointer-events-none"
            referrerPolicy="no-referrer"
          />
          
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
            <img 
              src={IPSOS_LOGO} 
              alt="Ipsos Logo" 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight relative z-10">Ipsos 专属助手</h1>
          <p className="text-white/70 text-sm mt-2 relative z-10">益普索内部员工登录</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-ipsos-blue/20 focus:border-ipsos-blue transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-ipsos-blue/20 focus:border-ipsos-blue transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-ipsos-blue text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-ipsos-blue/90 transition-all shadow-lg shadow-ipsos-blue/20 group"
          >
            登录
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              测试账号: <span className="font-mono font-bold text-ipsos-blue">admin</span> / <span className="font-mono font-bold text-ipsos-blue">ipsos2026</span>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
