import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Paperclip, Bot, User, FileText, Activity, 
  Search, ChevronLeft, ChevronRight, Settings, Sparkles,
  Pill, AlertCircle, ClipboardList, FilePlus, Stethoscope,
  Zap, Clock, ChevronDown, Menu, X, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode; // Allow rich content
  type: 'text' | 'summary' | 'alert' | 'file_analysis';
  timestamp: Date;
}

type AgentMode = 'medical' | 'document' | 'automation';

const ChatPage = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMode, setActiveMode] = useState<AgentMode>('medical');
  const [isToolsOpen, setIsToolsOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Mock Data ---
  const uploadedFiles = [
    { name: 'Blood_Work_Oct23.pdf', date: 'Oct 24' },
    { name: 'Cardiology_Report.pdf', date: 'Oct 10' },
    { name: 'Patient_History.pdf', date: 'Sep 15' }
  ];

  // --- Effects ---
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Handlers ---

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      generateAIResponse(text);
    }, 1500);
  };

  const generateAIResponse = (userText: string) => {
    const lowerText = userText.toLowerCase();
    let responseContent: React.ReactNode = '';
    let responseType: Message['type'] = 'text';

    if (lowerText.includes('summarize') || lowerText.includes('summary')) {
      responseType = 'summary';
      responseContent = (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#2D6CDF] font-bold border-b border-blue-100 pb-2 mb-2">
            <Activity size={18} /> 
            <span>Patient Clinical Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="bg-slate-50 p-3 rounded-lg">
               <span className="text-slate-500 text-xs font-bold uppercase">Condition</span>
               <p className="font-medium text-slate-900">Hypertension (Stable)</p>
             </div>
             <div className="bg-slate-50 p-3 rounded-lg">
               <span className="text-slate-500 text-xs font-bold uppercase">Adherence</span>
               <p className="font-medium text-emerald-600">92% (High)</p>
             </div>
          </div>
          <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
            <li>Recent lab results show cholesterol levels within normal range.</li>
            <li>Patient reported mild dizziness on Oct 20th.</li>
            <li>Prescription for Lisinopril was refilled yesterday.</li>
          </ul>
        </div>
      );
    } else if (lowerText.includes('medication') || lowerText.includes('interaction')) {
       responseContent = (
         <div className="space-y-2">
           <p>Checking interactions for current active medications...</p>
           <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-yellow-800 text-sm">Potential Interaction Detected</p>
                <p className="text-yellow-700 text-xs mt-1">
                  <strong>Lisinopril</strong> and <strong>Potassium Supplements</strong>. 
                  Risk of hyperkalemia. Monitor electrolyte levels.
                </p>
              </div>
           </div>
           <p className="text-sm text-slate-600">All other medications are compatible.</p>
         </div>
       );
    } else if (lowerText.includes('upload') || lowerText.includes('.pdf')) {
       responseType = 'file_analysis';
       responseContent = (
         <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
               <FileText className="text-blue-600" size={24} />
               <div>
                 <p className="text-sm font-bold text-blue-900">Lab_Results_Nov.pdf</p>
                 <p className="text-xs text-blue-600">Analysis Complete • 3 Insights Found</p>
               </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm border-b border-slate-100 pb-1">
                <span className="text-slate-600">Hemoglobin A1c</span>
                <span className="font-bold text-slate-900">5.7%</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-100 pb-1">
                <span className="text-slate-600">LDL Cholesterol</span>
                <span className="font-bold text-red-600">130 mg/dL (High)</span>
              </div>
            </div>
         </div>
       );
    } else {
      responseContent = "I understand. I've updated the patient's context with that information. Is there anything specific regarding their treatment plan you'd like to review?";
    }

    const aiMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: responseContent,
      type: responseType,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleToolClick = (prompt: string) => {
    handleSend(prompt);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsToolsOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      handleSend(`Analyze the uploaded document: ${fileName}`);
    }
  };

  // --- Render Helpers ---
  const ModeBadge = () => {
    const modes = {
      medical: { label: 'Medical Assistant', color: 'bg-blue-100 text-blue-700', icon: Stethoscope },
      document: { label: 'Document Analyst', color: 'bg-orange-100 text-orange-700', icon: FileText },
      automation: { label: 'Task Automation', color: 'bg-emerald-100 text-emerald-700', icon: Zap },
    };
    const current = modes[activeMode];
    const Icon = current.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${current.color} border border-white/20`}>
        <Icon size={14} />
        {current.label}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-[#F3F6FA] overflow-hidden font-sans">
      
      {/* --- 1. TOOLS PANEL (Left Sidebar) --- */}
      <aside 
        className={`
          ${isToolsOpen ? 'w-full md:w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0'} 
          bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-20 h-full
        `}
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            Clinical Tools
          </h2>
          <button onClick={() => setIsToolsOpen(false)} className="md:hidden p-1 bg-slate-100 rounded hover:bg-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Section A: Clinical Tasks */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Clinical Tasks</h3>
            <div className="space-y-2">
              <button onClick={() => handleToolClick('Summarize patient medical notes')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#2D6CDF] transition-colors text-left group">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 group-hover:text-[#2D6CDF]"><ClipboardList size={18} /></div>
                <span className="text-sm font-medium text-slate-700">Summarize Notes</span>
              </button>
              <button onClick={() => handleToolClick('Review medication adherence this week')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#2D6CDF] transition-colors text-left group">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 group-hover:text-[#2D6CDF]"><Activity size={18} /></div>
                <span className="text-sm font-medium text-slate-700">Review Adherence</span>
              </button>
              <button onClick={() => handleToolClick('Check for medication interactions')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#2D6CDF] transition-colors text-left group">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 group-hover:text-[#2D6CDF]"><Pill size={18} /></div>
                <span className="text-sm font-medium text-slate-700">Check Interactions</span>
              </button>
            </div>
          </div>

          {/* Section B: Document Intelligence */}
          <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Recent Documents</h3>
             <div className="space-y-2 mb-3">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 px-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer group">
                     <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-600 truncate">{file.name}</span>
                     </div>
                     <span className="text-[10px] text-slate-400">{file.date}</span>
                  </div>
                ))}
             </div>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-500 hover:border-[#2D6CDF] hover:text-[#2D6CDF] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
             >
                <FilePlus size={14} /> Upload Document
             </button>
          </div>

          {/* Section C: Patient Data Access */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Quick Access</h3>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleToolClick('Show missed doses')} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-700 text-xs font-bold text-center border border-red-100 transition-colors">
                   Missed Doses
                </button>
                <button onClick={() => handleToolClick('Show upcoming reminders')} className="p-3 bg-amber-50 hover:bg-amber-100 rounded-xl text-amber-700 text-xs font-bold text-center border border-amber-100 transition-colors">
                   Reminders
                </button>
             </div>
          </div>
        </div>
        
        {/* Bottom AI Mode Switch */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
           <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">AI Agent Mode</p>
           <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
              {['medical', 'document', 'automation'].map((mode) => {
                 const isActive = activeMode === mode;
                 let Icon = Stethoscope;
                 if(mode === 'document') Icon = FileText;
                 if(mode === 'automation') Icon = Zap;

                 return (
                   <button
                     key={mode}
                     onClick={() => setActiveMode(mode as AgentMode)}
                     className={`flex-1 py-1.5 rounded-md flex items-center justify-center transition-all ${isActive ? 'bg-white shadow-sm text-[#2D6CDF]' : 'text-slate-400 hover:text-slate-600'}`}
                     title={mode}
                   >
                     <Icon size={16} />
                   </button>
                 )
              })}
           </div>
        </div>
      </aside>


      {/* --- 2. MAIN CHAT WINDOW --- */}
      <main className="flex-1 flex flex-col relative bg-[#F3F6FA]">
        
        {/* Chat Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#2D6CDF] transition-colors"
              >
                 {isToolsOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
              <div>
                 <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   Doctor AI Assistant
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 </h1>
                 <p className="text-xs text-slate-500 hidden sm:block">Your clinical analysis companion</p>
              </div>
           </div>
           <ModeBadge />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar" onClick={() => window.innerWidth < 768 && setIsToolsOpen(false)}>
            {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                     <Sparkles className="text-[#2D6CDF]" size={32} />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg">Ready to assist, Doctor.</h3>
                  <p className="text-slate-500 text-sm mt-1">Select a tool or type a command to begin.</p>
               </div>
            ) : (
               messages.map((msg) => (
                 <div 
                   key={msg.id} 
                   className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                 >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'assistant' ? 'bg-white border-slate-200' : 'bg-[#2D6CDF] border-[#2D6CDF]'}`}>
                        {msg.role === 'assistant' ? <Bot size={16} className="text-[#2D6CDF]" /> : <User size={16} className="text-white" />}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                           px-5 py-3.5 rounded-2xl text-[15px] shadow-sm leading-relaxed
                           ${msg.role === 'user' 
                             ? 'bg-[#E6F0FF] text-slate-800 rounded-tr-sm' 
                             : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}
                        `}>
                           {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                 </div>
               ))
            )}
            {isTyping && (
               <div className="flex gap-4 mr-auto max-w-3xl animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-[#2D6CDF]" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#2D6CDF] rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-[#2D6CDF] rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-[#2D6CDF] rounded-full animate-bounce delay-200"></div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Bottom) */}
        <div className="p-4 sm:p-6 bg-[#F3F6FA] relative z-10">
           <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 flex items-end p-2">
              
              {/* Upload Button */}
              <div className="relative">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-3 text-slate-400 hover:bg-slate-50 hover:text-[#2D6CDF] rounded-xl transition-colors"
                   title="Upload Document"
                 >
                    <Paperclip size={20} />
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.png,.docx"
                 />
              </div>

              {/* Text Input */}
              <textarea
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSend();
                    }
                 }}
                 placeholder="Type a clinical question, command, or patient note..."
                 className="flex-1 max-h-32 min-h-[48px] py-3 px-3 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none"
                 rows={1}
              />

              {/* Voice & Send Actions */}
              <div className="flex items-center gap-1">
                 <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-[#2D6CDF] rounded-xl transition-colors">
                    <Mic size={20} />
                 </button>
                 <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="p-3 bg-[#2D6CDF] hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                 >
                    <Send size={20} />
                 </button>
              </div>
           </div>
           <p className="text-center text-[10px] text-slate-400 mt-3">
              AI responses are generated based on patient context and medical guidelines. Verify all critical information.
           </p>
        </div>

      </main>
    </div>
  );
};

export default ChatPage;