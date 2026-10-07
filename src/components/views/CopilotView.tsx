// import React, { useState } from 'react';
// import { Bot, Send, Sparkles, User, ArrowRight, HelpCircle, FileText } from 'lucide-react';
// import { Invoice, Expense } from '../../types';

// interface CopilotViewProps {
//   invoices: Invoice[];
//   expenses: Expense[];
// }

// interface Message {
//   id: string;
//   sender: 'ai' | 'user';
//   text: string;
//   timestamp: string;
// }

// export const CopilotView: React.FC<CopilotViewProps> = ({ invoices, expenses }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       sender: 'ai',
//       text: 'Hello! I am FinSight Copilot powered by Google Gemini. Ask me anything about your invoices, overdue receivables, spending trends, or cash flow optimization opportunities!',
//       timestamp: 'Just now',
//     },
//   ]);

//   const [inputQuery, setInputQuery] = useState('');
//   const [isThinking, setIsThinking] = useState(false);

//   const samplePrompts = [
//     'Which invoices are currently overdue and need follow-up?',
//     'Summarize my highest business expenses this month.',
//     'What is my predicted net profit margin for next quarter?',
//     'Identify early payment discounts I can capture with vendors.',
//   ];

//   const handleSend = (textToSend?: string) => {
//     const query = textToSend || inputQuery;
//     if (!query.trim()) return;

//     const userMsg: Message = {
//       id: `usr-${Date.now()}`,
//       sender: 'user',
//       text: query,
//       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     if (!textToSend) setInputQuery('');
//     setIsThinking(true);

//     setTimeout(() => {
//       let replyText = '';
//       const lower = query.toLowerCase();

//       if (lower.includes('overdue')) {
//         const overdues = invoices.filter((i) => i.status === 'Overdue');
//         const totalOverdue = overdues.reduce((s, i) => s + i.total, 0);
//         replyText = `You currently have ${overdues.length} overdue invoice(s) totaling $${totalOverdue.toLocaleString()}. The largest overdue account is ${
//           overdues[0]?.customerName || 'Cyberdyne Systems'
//         } ($${overdues[0]?.total || 5000}). I recommend issuing an automated reminder email.`;
//       } else if (lower.includes('expense')) {
//         const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);
//         replyText = `Your top 3 expenses this month are:\n1. ${topExpenses[0]?.title} ($${topExpenses[0]?.amount})\n2. ${topExpenses[1]?.title} ($${topExpenses[1]?.amount})\n3. ${topExpenses[2]?.title} ($${topExpenses[2]?.amount}). Total spent across all logged items is $${expenses
//           .reduce((s, e) => s + e.amount, 0)
//           .toLocaleString()}.`;
//       } else if (lower.includes('discount') || lower.includes('vendor')) {
//         replyText = `FinSight Copilot detected that Amazon Web Services offers a 2% early payment terms discount ($184.20) if paid 5 days before Net-30 expiry. Remitting early will optimize vendor relations and net margins.`;
//       } else {
//         replyText = `Based on live analysis of your financial ledger, your gross revenue is $${invoices
//           .filter((i) => i.status === 'Paid')
//           .reduce((s, i) => s + i.total, 0)
//           .toLocaleString()} against operating expenses of $${expenses
//           .reduce((s, e) => s + e.amount, 0)
//           .toLocaleString()}. Your working capital buffer remains above optimal benchmarks!`;
//       }

//       const aiMsg: Message = {
//         id: `ai-${Date.now()}`,
//         sender: 'ai',
//         text: replyText,
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       };

//       setMessages((prev) => [...prev, aiMsg]);
//       setIsThinking(false);
//     }, 1000);
//   };

//   return (
//     <div className="space-y-6 pb-12 max-w-5xl mx-auto">
//       {/* Header */}
//       <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
//             <Sparkles className="w-3 h-3 text-blue-600" /> Powered by Gemini
//           </div>
//           <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">FinSight AI Financial Copilot</h2>
//           <p className="text-xs text-slate-500">
//             Ask natural language questions about your business cash flow, vendor risks, and invoice balances.
//           </p>
//         </div>
//       </div>

//       {/* Chat Window */}
//       <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
//         {/* Messages Stream */}
//         <div className="flex-1 p-6 overflow-y-auto space-y-4">
//           {messages.map((m) => (
//             <div
//               key={m.id}
//               className={`flex gap-3 max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
//             >
//               <div
//                 className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
//                   m.sender === 'ai' ? 'bg-blue-600' : 'bg-slate-800'
//                 }`}
//               >
//                 {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
//               </div>

//               <div
//                 className={`p-4 rounded-2xl text-xs leading-relaxed ${
//                   m.sender === 'ai'
//                     ? 'bg-slate-50 text-slate-900 border border-slate-200/80'
//                     : 'bg-blue-600 text-white font-medium'
//                 }`}
//               >
//                 <p className="whitespace-pre-line">{m.text}</p>
//                 <span
//                   className={`block text-[10px] mt-2 ${
//                     m.sender === 'ai' ? 'text-slate-400' : 'text-blue-200'
//                   }`}
//                 >
//                   {m.timestamp}
//                 </span>
//               </div>
//             </div>
//           ))}

//           {isThinking && (
//             <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 animate-pulse">
//               <Bot className="w-4 h-4" />
//               <span>FinSight Copilot is analyzing your financial records...</span>
//             </div>
//           )}
//         </div>

//         {/* Sample Prompt Chips */}
//         <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
//           {samplePrompts.map((prompt, idx) => (
//             <button
//               key={idx}
//               onClick={() => handleSend(prompt)}
//               className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-400 text-xs font-semibold whitespace-nowrap transition-colors"
//             >
//               {prompt}
//             </button>
//           ))}
//         </div>

//         {/* Query Input Box */}
//         <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
//           <input
//             type="text"
//             value={inputQuery}
//             onChange={(e) => setInputQuery(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//             placeholder="Ask Copilot a question about your finances..."
//             className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-900"
//           />
//           <button
//             onClick={() => handleSend()}
//             className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
//           >
//             <span>Send</span>
//             <Send className="w-3.5 h-3.5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };












import React, { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { Invoice, Expense } from '../../types';

interface CopilotViewProps {
  invoices: Invoice[];
  expenses: Expense[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const CopilotView: React.FC<CopilotViewProps> = ({ invoices, expenses }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I’m FinSight Assistant. Ask me about overdue invoices, business expenses, vendor payments, or cash flow.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const samplePrompts = [
    'Which invoices are currently overdue?',
    'What are my highest business expenses?',
    'How much have I spent this month?',
    'Which vendor payments should I prioritize?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isThinking) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let replyText = '';
      const lower = query.toLowerCase();

      if (lower.includes('overdue')) {
        const overdues = invoices.filter((i) => i.status === 'Overdue');
        const totalOverdue = overdues.reduce((s, i) => s + i.total, 0);
        replyText = `You currently have ${overdues.length} overdue invoice(s) totaling $${totalOverdue.toLocaleString()}. The largest overdue account is ${
          overdues[0]?.customerName || 'Cyberdyne Systems'
        } ($${overdues[0]?.total || 5000}). I recommend following up with the overdue accounts first.`;
      } else if (lower.includes('expense') || lower.includes('spent')) {
        const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);
        replyText = `Your top 3 expenses are:\n1. ${topExpenses[0]?.title || 'No data'} ($${topExpenses[0]?.amount || 0})\n2. ${
          topExpenses[1]?.title || 'No data'
        } ($${topExpenses[1]?.amount || 0})\n3. ${topExpenses[2]?.title || 'No data'} ($${
          topExpenses[2]?.amount || 0
        }).\n\nTotal logged expenses: $${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}.`;
      } else if (lower.includes('discount') || lower.includes('vendor') || lower.includes('payment')) {
        replyText = 'Review upcoming vendor due dates and available early-payment terms before making payments. Prioritize payments where the discount or cash-flow benefit is clearly documented.';
      } else {
        replyText = `Based on your current ledger, paid invoices total $${invoices
          .filter((i) => i.status === 'Paid')
          .reduce((s, i) => s + i.total, 0)
          .toLocaleString()}, while logged expenses total $${expenses
          .reduce((s, e) => s + e.amount, 0)
          .toLocaleString()}. Use the invoice and expense pages for a more detailed breakdown.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div className="space-y-5 pb-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Financial Assistant
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
              <Sparkles className="w-3 h-3" /> Gemini
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">FinSight AI Assistant</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Ask questions about invoices, expenses, vendors, and cash flow using your financial data.
          </p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Financial Assistant</p>
              <p className="text-xs text-slate-500">Ready to answer questions about your ledger</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
            AI assisted
          </span>
        </div>

        <div className="h-[420px] overflow-y-auto p-5 md:p-6 space-y-5 bg-slate-50/40">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[80%] md:max-w-[70%]">
                <div className={`px-4 py-3 rounded-xl text-sm leading-6 ${
                  m.sender === 'ai'
                    ? 'bg-white text-slate-800 border border-slate-200'
                    : 'bg-slate-900 text-white'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 ${
                  m.sender === 'user' ? 'justify-end' : ''
                }`}>
                  {m.sender === 'user' && <User className="w-3 h-3" />}
                  <span>{m.timestamp}</span>
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-700" />
              </div>
              <span>Reviewing your financial data...</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Suggested questions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isThinking}
                className="text-left px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 text-sm text-slate-700 font-medium transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-200 transition-colors">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your finances..."
              disabled={isThinking}
              className="flex-1 min-w-0 px-3 py-2 bg-transparent focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isThinking}
              className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

