import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Mic, Paperclip, Bot, User, Plus, MessageSquare,
  X, Loader2, ChevronRight, MoreHorizontal, Activity, Video, Camera,
  Brain, Stethoscope, Search, BookOpen, Phone, MicOff, VideoOff, Volume2, FileText, Sparkles,
  Settings, Zap, Heart, Shield, Clock, Star, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'card' | 'image' | 'audio' | 'suggestion';
  cardData?: {
    title: string;
    items: { label: string; value: string; status?: 'normal' | 'warning' | 'critical' }[];
    action?: string;
    color?: string;
    icon?: React.ReactNode;
  };
  suggestions?: string[];
  imageUrl?: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  unread?: boolean;
}

type ChatMode = 'doctor' | 'therapist' | 'rag' | 'symptom' | 'prediction';

const ChatPage = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMode, setActiveMode] = useState<ChatMode>('doctor');
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const MODES = [
    {
      id: 'doctor',
      label: 'AI Doctor',
      icon: Stethoscope,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100',
      activeBg: 'bg-blue-600',
      description: 'General medical consultation'
    },
    {
      id: 'therapist',
      label: 'Therapist',
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-50 hover:bg-purple-100',
      activeBg: 'bg-purple-600',
      description: 'Mental health support'
    },
    {
      id: 'rag',
      label: 'Medical Assistant',
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      activeBg: 'bg-emerald-600',
      description: 'Research & documentation'
    },
    {
      id: 'symptom',
      label: 'Symptom Checker',
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50 hover:bg-orange-100',
      activeBg: 'bg-orange-600',
      description: 'Symptom analysis'
    },
    {
      id: 'prediction',
      label: 'Health Predict',
      icon: Search,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      activeBg: 'bg-indigo-600',
      description: 'Risk assessment'
    },
  ];

  const chatHistory: ChatSession[] = [
    { id: '1', title: 'Migraine Symptoms', date: 'Today', preview: 'Discussed headache patterns and triggers' },
    { id: '2', title: 'Blood Test Analysis', date: 'Yesterday', preview: 'Reviewed CBC results and recommendations' },
    { id: '3', title: 'Anxiety Management', date: 'Oct 24', preview: 'Explored coping strategies and therapy options' },
  ];

  const quickActions = [
    {
      label: 'Schedule Consultation',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      description: 'Book an appointment'
    },
    {
      label: 'Mental Health Check',
      icon: Brain,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      description: 'Assess your mental wellness'
    },
    {
      label: 'Symptom Analysis',
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
      description: 'Analyze your symptoms'
    },
    {
      label: 'Health Risk Assessment',
      icon: Shield,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
      description: 'Predict potential health risks'
    },
    {
      label: 'Upload Medical Records',
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
      description: 'Share your medical documents'
    },
    {
      label: 'Emergency Consultation',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 hover:bg-red-100',
      description: 'Urgent medical advice'
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock Response Logic
    setTimeout(() => {
      generateAIResponse(userMsg.content);
    }, 1500);
  };

  const generateAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let aiResponse: Message;

    if (lowerInput.includes('symptom') || lowerInput.includes('pain') || activeMode === 'symptom') {
      aiResponse = {
        id: Date.now().toString(),
        role: 'assistant',
        type: 'card',
        content: "I've analyzed your symptoms based on clinical protocols.",
        cardData: {
          title: "Symptom Analysis",
          items: [
            { label: "Condition", value: "Tension Headache" },
            { label: "Severity", value: "Moderate" },
            { label: "Triggers", value: "Stress, Screen Time" }
          ],
          action: "See Treatment Plan",
          color: "border-l-emerald-500"
        },
        timestamp: new Date()
      };
    } else if (lowerInput.includes('call') || lowerInput.includes('video')) {
        setIsLiveCallOpen(true);
        aiResponse = {
            id: Date.now().toString(),
            role: 'assistant',
            type: 'text',
            content: "Starting a secure video session for you now...",
            timestamp: new Date()
        };
    } else {
      aiResponse = {
        id: Date.now().toString(),
        role: 'assistant',
        type: 'text',
        content: "I understand. Based on your medical profile, I recommend monitoring this for 24 hours. Would you like me to set a reminder?",
        timestamp: new Date()
      };
    }

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        type: 'image',
        content: "Uploaded medical document",
        imageUrl: URL.createObjectURL(file),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      
      setTimeout(() => {
        const response: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            type: 'card',
            content: "I've extracted the text from your document using OCR.",
            cardData: {
                title: "Lab Report Analysis",
                items: [
                    { label: "Hemoglobin", value: "13.5 g/dL (Normal)" },
                    { label: "WBC", value: "7.2 K/uL (Normal)" },
                    { label: "Platelets", value: "250 K/uL (Normal)" }
                ],
                action: "Save to Profile",
                color: "border-l-blue-500"
            },
            timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 2000);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
      {/* Enhanced Left Sidebar - Chat History */}
      <div className={`
        flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-xl shadow-slate-900/5
        transition-all duration-500 ease-out flex flex-col
        ${isHistoryOpen ? 'w-80' : 'w-0 overflow-hidden'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <MessageSquare size={16} className="text-white" />
              </div>
              <span className="font-semibold text-slate-800 text-lg">Conversations</span>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all md:hidden"
            >
              <X size={18}/>
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => setMessages([])}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-3 py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Sessions</span>
          </div>

          {chatHistory.map(session => (
            <button
              key={session.id}
              className="w-full text-left p-4 rounded-xl hover:bg-slate-50/80 group transition-all duration-200 border border-transparent hover:border-slate-200/50 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all">
                  <MessageSquare size={16} className="text-slate-500 group-hover:text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 truncate">
                      {session.title}
                    </p>
                    {session.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-1 truncate">{session.preview}</p>
                  <p className="text-xs text-slate-400">{session.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Enhanced Mode Selector Header */}
        <div className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center px-6 gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
          {!isHistoryOpen && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            >
              <MessageSquare size={20} />
            </button>
          )}

          <div className="flex gap-2 flex-1">
            {MODES.map(mode => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as ChatMode)}
                  className={`
                    flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/60 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200/50 hover:border-slate-300'
                    }
                  `}
                  title={mode.description}
                >
                  <Icon size={18} className={isActive ? 'text-white' : mode.color} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Call Button */}
          <button
            onClick={() => setIsLiveCallOpen(true)}
            className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95"
            title="Start Live Video Call"
          >
            <Video size={18} />
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto h-full">
            {messages.length === 0 ? (
              /* Enhanced Welcome Screen */
              <div className="h-full flex flex-col items-center justify-center px-6 py-12">
                <div className="text-center max-w-2xl mx-auto space-y-8">
                  {/* AI Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <Bot size={48} className="text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Hello, {user?.fullName?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      I'm your AI health assistant. How can I help you with your medical questions today?
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(action.label)}
                        className="group p-6 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 text-left transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                          <action.icon size={24} />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                          {action.label}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {action.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 pt-8 border-t border-slate-200/50">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Shield size={16} className="text-green-500" />
                      <span>HIPAA Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle size={16} className="text-blue-500" />
                      <span>Board Certified</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Star size={16} className="text-yellow-500" />
                      <span>24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Messages Display */
              <div className="p-6 space-y-6 pb-24">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`
                      w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white
                      ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200'
                      }
                    `}>
                      {msg.role === 'user' ? (
                        <span className="font-bold text-white text-sm">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </span>
                      ) : (
                        <Bot size={20} className="text-blue-600" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`
                        px-6 py-4 rounded-2xl shadow-lg border backdrop-blur-sm
                        ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/20 rounded-tr-md'
                          : 'bg-white/80 border-slate-200/60 text-slate-800 rounded-tl-md'
                        }
                      `}>
                        {/* Message Content */}
                        {msg.type === 'image' && msg.imageUrl && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                            <img src={msg.imageUrl} alt="Uploaded" className="max-w-sm rounded-xl" />
                          </div>
                        )}

                        {msg.type === 'card' && msg.cardData ? (
                          <div className="space-y-4">
                            <p className="leading-relaxed">{msg.content}</p>
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/50 overflow-hidden shadow-sm">
                              <div className={`px-5 py-4 border-l-4 ${msg.cardData.color || 'border-blue-500'} bg-white/50`}>
                                <div className="flex items-center gap-3 mb-3">
                                  {msg.cardData.icon && <div className="text-slate-500">{msg.cardData.icon}</div>}
                                  <h4 className="font-bold text-slate-900 text-lg">{msg.cardData.title}</h4>
                                </div>
                                <div className="space-y-3">
                                  {msg.cardData.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                      <span className="text-slate-600 font-medium">{item.label}</span>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${
                                          item.status === 'critical' ? 'text-red-600' :
                                          item.status === 'warning' ? 'text-orange-600' :
                                          'text-slate-800'
                                        }`}>
                                          {item.value}
                                        </span>
                                        {item.status && (
                                          <div className={`w-2 h-2 rounded-full ${
                                            item.status === 'critical' ? 'bg-red-500' :
                                            item.status === 'warning' ? 'bg-orange-500' :
                                            'bg-green-500'
                                          }`}></div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {msg.cardData.action && (
                                <button className="w-full py-4 text-center font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors border-t border-slate-200/50">
                                  {msg.cardData.action} →
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        )}

                        {/* Suggestions */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
                            {msg.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => setInput(suggestion)}
                                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors border border-white/30"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className={`flex items-center gap-2 px-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-slate-400">
                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {msg.role === 'assistant' && (
                          <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Volume2 size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-lg border-2 border-white">
                      <Bot size={20} className="text-blue-600" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 px-6 py-4 rounded-2xl rounded-tl-md shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm text-slate-600 font-medium">Analyzing your query...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 shadow-lg px-6 py-4 flex-shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end gap-4">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 hover:shadow-md"
                  title="Upload medical document"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 hover:shadow-md"
                  title="Voice input"
                >
                  <Mic size={18} />
                </button>
              </div>

              {/* Input Field */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Ask your ${MODES.find(m => m.id === activeMode)?.label.toLowerCase()} anything...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none min-h-[56px] max-h-32 shadow-sm"
                  rows={1}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield size={12} className="text-green-500" />
                  Secure & Private
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-blue-500" />
                  AI-Powered Analysis
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Press Enter to send • Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Right Sidebar - AI Assistant Info */}
      <div className="hidden xl:flex w-80 bg-white/80 backdrop-blur-xl border-l border-slate-200/60 shadow-xl shadow-slate-900/5 flex-col">
        {/* AI Profile Header */}
        <div className="p-6 border-b border-slate-100/80 text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl shadow-blue-500/20 flex items-center justify-center">
              <Bot size={40} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-lg mb-1">Dr. Aiko</h3>
          <p className="text-sm text-slate-500 mb-2">AI Medical Assistant</p>

          <div className="flex justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
              Internal Medicine
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium border border-purple-200">
              Diagnostics
            </span>
          </div>

          <div className="flex justify-center gap-4 text-xs text-slate-500">
            <div className="text-center">
              <div className="font-bold text-slate-700">98%</div>
              <div>Accuracy</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-700">24/7</div>
              <div>Available</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-700">50K+</div>
              <div>Cases</div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Capabilities</h4>
          <div className="space-y-3">
            {[
              { icon: Activity, label: 'Symptom Analysis', desc: 'Advanced pattern recognition' },
              { icon: Brain, label: 'Mental Health', desc: 'Cognitive behavioral support' },
              { icon: FileText, label: 'Document Analysis', desc: 'Medical record processing' },
              { icon: Search, label: 'Risk Assessment', desc: 'Predictive health analytics' },
              { icon: Heart, label: 'Cardiac Monitoring', desc: 'ECG interpretation' },
              { icon: Shield, label: 'Emergency Response', desc: 'Critical situation handling' }
            ].map((capability, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <capability.icon size={16} className="text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-slate-800 text-sm">{capability.label}</h5>
                  <p className="text-xs text-slate-500 mt-1">{capability.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. LIVE CALL OVERLAY (Modal) */}
      {isLiveCallOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl aspect-video relative overflow-hidden border border-slate-700 flex flex-col">

                  {/* Video Grid */}
                  <div className="flex-1 flex relative">
                      {/* AI Doctor (Main) */}
                      <div className="flex-1 bg-slate-900 flex items-center justify-center relative">
                           <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop" alt="Doctor" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                           <div className="relative z-10 text-center">
                               <div className="w-24 h-24 mx-auto rounded-full border-4 border-white/20 overflow-hidden mb-4 animate-pulse">
                                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4`} alt="AI" className="w-full h-full" />
                               </div>
                               <h3 className="text-xl font-bold text-white">Dr. Aiko</h3>
                               <p className="text-blue-300 text-sm">Connecting secure line...</p>
                           </div>

                           {/* Subtitles */}
                           <div className="absolute bottom-8 left-0 right-0 px-8 text-center">
                               <p className="inline-block bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-md text-sm font-medium">
                                   Hello! I can hear you clearly. How are you feeling today?
                               </p>
                           </div>
                      </div>

                      {/* User (PiP) */}
                      <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-xl border border-slate-600 shadow-xl overflow-hidden">
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                              <User size={32} />
                          </div>
                          <div className="absolute bottom-2 left-2 flex gap-1">
                             <div className="p-1 bg-red-500 rounded-full"><MicOff size={12} className="text-white"/></div>
                          </div>
                      </div>
                  </div>

                  {/* Controls Bar */}
                  <div className="h-20 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-4 px-8">
                      <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"><Mic size={20}/></button>
                      <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"><Camera size={20}/></button>
                      <button
                        onClick={() => setIsLiveCallOpen(false)}
                        className="p-4 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 transition-colors"
                      >
                          <Phone size={20} className="rotate-[135deg]" />
                          End Call
                      </button>
                      <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"><MessageSquare size={20}/></button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ChatPage;