import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Mic,
  ChevronDown,
  ArrowUp,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Copy,
  MoreVertical,
  Check,
  AlertCircle,
  Lock,
  Sparkles,
  Bot,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const CopilotView = ({ invoices = [], expenses = [] }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Model state: 'fin-0.2-flash' | 'fin-0.2-flash-lite' | 'fin-0.4'
  const [selectedModel, setSelectedModel] = useState({
    id: 'fin-0.2-flash-lite',
    name: 'fin 0.2 flash-lite',
    shortName: 'Flash-Lite',
    description: 'Quick answers'
  });

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showUnderProgressModal, setShowUnderProgressModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Mode: 'chat' | 'task'
  const [activeMode, setActiveMode] = useState('chat');

  // Messages: starts empty or with prior messages
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const modelsList = [
    {
      id: 'fin-0.2-flash',
      name: 'fin 0.2 flash',
      shortName: 'Flash',
      description: 'Everyday help & smart reasoning',
      status: 'available'
    },
    {
      id: 'fin-0.2-flash-lite',
      name: 'fin 0.2 flash-lite',
      shortName: 'Flash-Lite',
      description: 'Quick answers & high speed',
      status: 'available'
    },
    {
      id: 'fin-0.4',
      name: 'fin 0.4',
      shortName: 'Fin 0.4',
      description: 'Advanced reasoning (In Progress)',
      status: 'in-progress'
    }
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (m) => {
    if (m.status === 'in-progress') {
      setShowUnderProgressModal(true);
      setIsModelDropdownOpen(false);
      return;
    }
    setSelectedModel(m);
    setIsModelDropdownOpen(false);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let replyText = '';
      const lower = query.toLowerCase();

      if (lower.includes('overdue')) {
        const overdues = invoices.filter((i) => i.status === 'Overdue');
        const totalOverdue = overdues.reduce((s, i) => s + (i.total || 0), 0);
        replyText = `You currently have ${overdues.length} overdue invoice(s) totaling $${totalOverdue.toLocaleString()}. The largest overdue account is ${
          overdues[0]?.customerName || 'Cyberdyne Systems'
        } ($${overdues[0]?.total || 5000}). I recommend issuing an automated reminder email.`;
      } else if (lower.includes('expense')) {
        const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);
        replyText = `Your top recorded expenses this month are:\n1. ${topExpenses[0]?.title || 'Cloud Hosting'} ($${topExpenses[0]?.amount || 1200})\n2. ${topExpenses[1]?.title || 'Office Lease'} ($${topExpenses[1]?.amount || 950})\n3. ${topExpenses[2]?.title || 'Software Licenses'} ($${topExpenses[2]?.amount || 480}). Total logged operational expenses are $${expenses
          .reduce((s, e) => s + (e.amount || 0), 0)
          .toLocaleString()}.`;
      } else if (lower.includes('discount') || lower.includes('vendor')) {
        replyText = `FinSight Copilot detected that Amazon Web Services offers a 2% early payment terms discount ($184.20) if paid 5 days before Net-30 expiry. Remitting early will optimize vendor relations and net margins.`;
      } else if (lower === 'hi' || lower === 'hello' || lower === 'hey') {
        replyText = 'Hello! How can I help you today?';
      } else {
        replyText = `Based on live analysis of your financial ledger, your gross revenue is $${invoices
          .filter((i) => i.status === 'Paid')
          .reduce((s, i) => s + (i.total || 0), 0)
          .toLocaleString()} against operating expenses of $${expenses
          .reduce((s, e) => s + (e.amount || 0), 0)
          .toLocaleString()}. Your business working capital buffer remains above optimal benchmarks!`;
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        modelName: selectedModel.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 800);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-50 dark:bg-[#0d0e11] text-slate-900 dark:text-white select-none overflow-hidden transition-colors">
      {/* Background radial blue glow matching Gemini enterprise aesthetic */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, rgba(26,54,93,0.4) 0%, rgba(13,14,17,0.98) 70%)'
            : 'radial-gradient(circle at center, rgba(219,234,254,0.6) 0%, rgba(248,250,252,0.98) 70%)'
        }}
      />

      {/* Top Header Controls (Integrated Theme Toggle, Reset, Options) */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        {/* Subtle Brand or Model Indicator on Top Left */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">
            Copilot
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-blue-300 font-medium">
            {selectedModel.shortName}
          </span>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================
           STATE 1: HERO VIEW (Empty conversation)
        ========================================================= */}
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
            className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full pb-16"
          >
            {/* Center Greeting */}
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 dark:text-white/95 text-center mb-8">
              Where should we start?
            </h1>

            {/* Pill Search / Input Capsule */}
            <div className="w-full relative bg-white dark:bg-[#1e1f24] rounded-full border border-slate-200 dark:border-white/10 px-4 py-3.5 flex items-center gap-3 shadow-lg dark:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <button
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                title="Add connector or skills"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type @ for connectors, skills and more"
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 font-normal"
                autoFocus
              />

              {/* Model Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0 border border-slate-200/60 dark:border-white/5"
                >
                  <span className="font-medium">{selectedModel.shortName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Model Selection Menu */}
                {isModelDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1e1f24] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                      Select Model
                    </div>
                    {modelsList.map((m) => {
                      const isSelected = selectedModel.id === m.id;
                      const isLock = m.status === 'in-progress';

                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelectModel(m)}
                          className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-white/10 text-blue-700 dark:text-white font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            ) : isLock ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            ) : (
                              <div className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{m.name}</span>
                              {m.status === 'in-progress' && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                  In progress
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{m.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Voice / Mic Icon */}
              <button
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send Button if text typed */}
              {inputQuery.trim() && (
                <button
                  onClick={() => handleSend()}
                  className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:opacity-90 transition-all flex-shrink-0"
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Chat / Task Capsule Toggle */}
            <div className="mt-4 flex items-center justify-center gap-1 bg-white/80 dark:bg-[#1e1f24] p-1 rounded-full border border-slate-200/80 dark:border-white/5 shadow-xs">
              <button
                onClick={() => setActiveMode('chat')}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeMode === 'chat'
                    ? 'bg-slate-100 dark:bg-[#2a2b30] text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveMode('task')}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeMode === 'task'
                    ? 'bg-slate-100 dark:bg-[#2a2b30] text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Task
              </button>
            </div>
          </motion.div>
        ) : (
          /* =========================================================
             STATE 2: CONVERSATION VIEW (Full screen)
          ========================================================= */
          <motion.div
            key="conversation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex-1 flex flex-col justify-between overflow-hidden"
          >
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-3xl mx-auto w-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
              {messages.map((m, idx) => (
                <div key={m.id} className="space-y-2">
                  {m.sender === 'user' ? (
                    /* User message capsule */
                    <div className="flex justify-end">
                      <div className="px-4 py-2.5 rounded-full bg-slate-200/90 dark:bg-[#1e1f24] text-slate-900 dark:text-white text-sm font-normal max-w-lg shadow-xs border border-slate-300/40 dark:border-white/5">
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    /* AI Assistant message */
                    <div className="space-y-3 pt-2">
                      <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line">
                        {m.text}
                      </p>

                      {/* Action footer */}
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 pt-1">
                        <button
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSend(messages[idx - 1]?.text || 'Recalculate')}
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Regenerate"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(m.text, idx)}
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 animate-pulse pt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>{selectedModel.name} is reasoning...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Docked Input Bar */}
            <div className="px-4 sm:px-8 pb-5 pt-2 max-w-3xl mx-auto w-full">
              <div className="w-full bg-white dark:bg-[#1e1f24] rounded-full border border-slate-200 dark:border-white/10 px-4 py-2.5 flex items-center gap-3 shadow-lg dark:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                <button
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Attach file or skill"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask FinSight Copilot"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 font-normal"
                />

                {/* Model Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0 border border-slate-200/60 dark:border-white/5"
                  >
                    <span className="font-medium">{selectedModel.shortName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown list */}
                  {isModelDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1e1f24] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                        Select Model
                      </div>
                      {modelsList.map((m) => {
                        const isSelected = selectedModel.id === m.id;
                        const isLock = m.status === 'in-progress';

                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectModel(m)}
                            className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-white/10 text-blue-700 dark:text-white font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              ) : isLock ? (
                                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              ) : (
                                <div className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">{m.name}</span>
                                {m.status === 'in-progress' && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                    In progress
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{m.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mic Button */}
                <button
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button if input Query has content */}
                {inputQuery.trim() && (
                  <button
                    onClick={() => handleSend()}
                    className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:opacity-90 transition-all flex-shrink-0"
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Disclaimer footer */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2 font-normal">
                FinSight AI is an intelligent assistant and can make mistakes. Verify critical financial entries.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
           POPUP MODAL: "fin 0.4 Currently In Progress"
        ========================================================= */}
      <AnimatePresence>
        {showUnderProgressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f24] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">fin 0.4 In Progress</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Advanced model training under development</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">fin 0.4</span> is currently undergoing deep financial training and benchmark evaluation. Please use active models <span className="font-semibold text-blue-600 dark:text-blue-400">fin 0.2 flash</span> or <span className="font-semibold text-blue-600 dark:text-blue-400">fin 0.2 flash-lite</span> instead.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedModel(modelsList[0]);
                    setShowUnderProgressModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  Use fin 0.2 flash
                </button>
                <button
                  onClick={() => {
                    setSelectedModel(modelsList[1]);
                    setShowUnderProgressModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-medium transition-colors"
                >
                  Use fin 0.2 flash-lite
                </button>
                <button
                  onClick={() => setShowUnderProgressModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
