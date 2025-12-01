import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Eraser } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface AIChatPanelProps {
  currentTopic: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ currentTopic }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your DevOps Dojo Sensei. I see you're focusing on **${currentTopic}**. How can I help you deepen your understanding today? I can generate roadmaps, explain concepts, or create quiz questions.`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    if (!chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([{
          id: 'error-init',
          role: 'model',
          text: '⚠️ API Key not configured. Please add VITE_API_KEY to your environment variables to enable AI chat.',
          timestamp: Date.now()
        }]);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming || !chatSessionRef.current) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: input });
      
      const botMessageId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Add placeholder message
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: fullText }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I apologize, but I encountered an error connecting to the Dojo mainframe. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    try {
      chatSessionRef.current = createChatSession(); // Reset context
      setMessages([{
          id: 'welcome-reset',
          role: 'model',
          text: `Context cleared. Ready for a new topic!`,
          timestamp: Date.now()
      }]);
    } catch (error) {
      console.error("Failed to reset chat:", error);
      setMessages([{
        id: 'error-reset',
        role: 'model',
        text: '⚠️ API Key not configured. AI chat features are disabled.',
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-none md:rounded-3xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-700 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              DevOps Dojo AI
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">Gemini 3 Pro</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your personal DevOps Mentor</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Clear Conversation"
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
              msg.role === 'user' ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600' : 'bg-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-slate-500 dark:text-slate-300" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none border border-slate-200 dark:border-slate-700' 
                  : 'bg-indigo-50 dark:bg-indigo-900/30 text-slate-800 dark:text-slate-200 rounded-tl-none border border-indigo-100 dark:border-indigo-500/20'
              }`}>
                {msg.text || <span className="animate-pulse">Thinking...</span>}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form 
          onSubmit={handleSend}
          className="flex gap-2 relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Kubernetes, CI/CD, Terraform..."
            disabled={isStreaming}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors shadow-md shadow-indigo-500/20"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-600">AI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
};