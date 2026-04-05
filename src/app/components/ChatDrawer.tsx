import { useState } from 'react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: string;
}

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет. Анализирую телеметрию KZ8A-0044. Задайте вопрос — отвечу по данным.',
      timestamp: '14:30:15'
    }
  ]);
  const [input, setInput] = useState('');

  const suggestedQuestions = [
    'Что с ТЭД №3?',
    'Тренд за 15 минут',
    'Объясни алерт',
    'Последние события'
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: '14:32:10'
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: 'В 14:22 температура ТЭД №3 выросла с 88 до 104°C за 6 минут. Ток поднялся до 560А. Индекс снизился с 91 до 80 — основной вклад: вес параметра Темп.ТЭД (30%).',
      timestamp: '14:32:12'
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[2000]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[340px] border-l z-[2001] flex flex-col animate-slide-in" style={{
        backgroundColor: 'var(--dash-bg-page)',
        borderColor: 'var(--dash-border)',
        borderLeftWidth: '0.5px'
      }}>
        {/* Header */}
        <div className="p-3.5 border-b flex items-start justify-between" style={{
          borderColor: 'var(--dash-border)',
          borderBottomWidth: '0.5px'
        }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 border rounded text-[10px] font-medium" style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--dash-gold)',
                borderWidth: '0.5px',
                color: 'var(--dash-gold)'
              }}>
                AI
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--dash-text-primary)' }}>Диагностический ассистент</span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--dash-text-muted)' }}>
              Работает с телеметрией · не фантазирует
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center transition-colors"
            style={{ color: 'var(--dash-text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                <div
                  className="p-3 text-xs border"
                  style={message.role === 'user' ? {
                    backgroundColor: 'var(--dash-bg-cell)',
                    borderColor: 'var(--dash-accent)',
                    borderWidth: '0.5px',
                    color: 'var(--dash-text-primary)',
                    borderRadius: '10px 0 10px 10px'
                  } : {
                    backgroundColor: 'var(--dash-bg-card)',
                    borderColor: 'var(--dash-border)',
                    borderWidth: '0.5px',
                    color: 'var(--dash-text-primary)',
                    borderRadius: '0 10px 10px 10px'
                  }}
                >
                  {message.content}
                </div>
                {message.timestamp && (
                  <div className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`} style={{
                    color: 'var(--dash-text-muted)'
                  }}>
                    {message.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggested Questions (shown when only initial message exists) */}
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                  className="px-2.5 py-1.5 border rounded-lg text-[10px] transition-colors text-left font-medium"
                  style={{
                    backgroundColor: 'var(--dash-bg-cell)',
                    borderColor: 'var(--dash-border)',
                    borderWidth: '0.5px',
                    color: 'var(--dash-text-secondary)'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Row */}
        <div className="p-3 border-t" style={{
          borderColor: 'var(--dash-border)',
          borderTopWidth: '0.5px'
        }}>
          <div className="flex items-center gap-2 border rounded-lg p-2" style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            borderWidth: '0.5px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Спросите о любом параметре..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{
                color: 'var(--dash-text-primary)'
              }}
            />
            <button
              onClick={handleSend}
              className="w-7 h-7 flex items-center justify-center rounded text-white transition-colors flex-shrink-0"
              style={{
                backgroundColor: 'var(--dash-accent)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="text-[10px] text-center mt-2" style={{ color: 'var(--dash-text-muted)' }}>
            Отвечает только по данным телеметрии
          </div>
        </div>
      </div>
    </>
  );
}
