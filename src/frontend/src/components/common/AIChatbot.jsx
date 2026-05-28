import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { chatService } from '../../services';

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là Trợ lý AI của BoardingHouse Pro. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi về các quy trình quản lý nhà trọ, hóa đơn, dịch vụ hoặc tình trạng phòng hiện tại nhé!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Delay focus slightly for animation to finish
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const messageText = inputValue.trim();
    if (!messageText || loading) return;

    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      // Send message to Gemini backend API (sending history as context)
      const data = await chatService.sendChatMessage(messageText, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.isOnline !== undefined) {
        setIsOnline(data.isOnline);
      }
    } catch (err) {
      console.error(err);
      setIsOnline(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, trợ lý AI đang bận hoặc có sự cố kết nối. Bạn vui lòng thử lại sau ít phút.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xoá lịch sử trò chuyện?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Tôi đã làm sạch cuộc trò chuyện. Tôi có thể giúp gì thêm cho bạn?'
        }
      ]);
    }
  };

  const parseMessageContent = (content) => {
    if (!content) return '';
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className="text-primary font-semibold">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] shadow-2xl flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 group"
        title="Trợ lý AI"
      >
        {isOpen ? (
          <X size={24} className="animate-[spin_0.2s_ease-out]" />
        ) : (
          <div className="relative">
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border border-white ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] z-[9999] flex flex-col bg-white border border-line rounded-2xl shadow-2xl overflow-hidden animate-apple-pop">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-primary text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 bg-white/20 rounded-xl">
                <Sparkles size={18} className="text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">BoardingHouse AI</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-[11px] text-white/80 font-medium">
                    {isOnline ? 'Trực tuyến' : 'Ngoại tuyến (Offline)'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClear}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                title="Xoá hội thoại"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-ink border border-line rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? parseMessageContent(msg.content) : msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-primary animate-pulse" />
                </div>
                <div className="p-3 bg-white text-ink border border-line rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="text-primary animate-spin" />
                  <span className="text-xs text-ink-muted">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSend} className="p-3.5 border-t border-line bg-white flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi tôi bất cứ điều gì..."
              disabled={loading}
              className="flex-1 h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="w-10 h-10 shrink-0 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
