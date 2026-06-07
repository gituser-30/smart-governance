import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your Smart Governance assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { id: Date.now(), text: input, isBot: false };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        messages: newMessages
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, { id: Date.now(), text: res.data.reply, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I am having trouble connecting to the server.", isBot: true }]);
      }
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, an error occurred. Please try again later.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 30, right: 30, width: 60, height: 60,
          borderRadius: '50%', background: '#F97316', color: '#fff',
          border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(249,115,22,0.4)',
          display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: 30, right: 30, width: 350, height: 500,
              background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px', background: 'linear-gradient(90deg, #F97316, #E07800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                <Bot size={24} />
                <div style={{ fontWeight: 800, fontSize: 16 }}>GovAI Assistant</div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }} onMouseOver={e => e.currentTarget.style.opacity=1} onMouseOut={e => e.currentTarget.style.opacity=0.8}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#080E1A' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isBot ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    maxWidth: '85%', padding: '12px 16px', borderRadius: 16,
                    background: msg.isBot ? '#1E2D47' : '#F97316',
                    color: '#fff', fontSize: 13, lineHeight: 1.5,
                    borderBottomLeftRadius: msg.isBot ? 4 : 16,
                    borderBottomRightRadius: msg.isBot ? 16 : 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div style={{ padding: 16, background: '#0D1626', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10 }}>
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={isLoading ? "Thinking..." : "Ask me anything..."} 
                disabled={isLoading}
                style={{ flex: 1, background: '#060C18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', outline: 'none', fontSize: 13, opacity: isLoading ? 0.7 : 1 }}
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading}
                style={{ background: '#F97316', border: 'none', borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: isLoading ? 0.7 : 1 }} 
                onMouseOver={e => !isLoading && (e.currentTarget.style.background='#E07800')} 
                onMouseOut={e => !isLoading && (e.currentTarget.style.background='#F97316')}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
