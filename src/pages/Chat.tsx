import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Chat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai'; id?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'chat_history'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      if (history.length === 0) {
        setMessages([{ text: "Hello! I'm your Career Mentor AI. How can I help you today?", sender: 'ai' }]);
      } else {
        setMessages(history);
      }
      setLoadingHistory(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/chat_history`);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user) return;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { text: "AI Mentor is currently unavailable. Please check the API configuration (GEMINI_API_KEY).", sender: 'ai' }]);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const userMsg = input;
    setInput('');
    setIsTyping(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, 'users', user.uid, 'chat_history'), {
        userId: user.uid,
        text: userMsg,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // 2. Generate AI response
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `You are a career mentor for engineering students. The user's name is ${profile?.name}. Answer their question concisely and helpfully: ${userMsg}` }] }
        ]
      });

      const aiText = response.text || "I'm sorry, I couldn't process that. Could you try again?";

      // 3. Save AI response to Firestore
      await addDoc(collection(db, 'users', user.uid, 'chat_history'), {
        userId: user.uid,
        text: aiText,
        sender: 'ai',
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Chat Error:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/chat_history`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-6 pb-32 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Mentor</h1>
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <Sparkles className="text-purple-400" size={24} />
      </header>

      <GlassCard className="flex-1 overflow-hidden flex flex-col p-0 border-white/10">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
        >
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                    msg.sender === 'user' ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300 border border-white/10"
                  )}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.sender === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isTyping && (
            <div className="flex gap-3 mr-auto">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Bot size={16} className="text-slate-300" />
              </div>
              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your career..."
              className="w-full glass-input pr-12 py-4"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 disabled:bg-slate-700"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
