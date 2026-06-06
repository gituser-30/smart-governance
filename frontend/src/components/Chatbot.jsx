import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your Smart Governance assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      let reply = "I am a demo assistant. For specific issues, please file a grievance or contact support.";
      
      const lower = userMsg.text.toLowerCase();
      
      // Check grievance/complaints first
      if (lower.includes("griev") || lower.includes("grev") || lower.includes("complain") || lower.includes("issue") || lower.includes("problem")) {
        reply = "To lodge a complaint or grievance, navigate to the 'My Grievances' panel or 'Help & Support' in your sidebar and click the file grievance button.";
      } 
      // Then check tracking
      else if (lower.includes("track") || lower.includes("status")) {
        reply = "You can track your application status in the 'My Certificates' panel from your sidebar.";
      } 
      // Then check certificate/apply
      else if (lower.includes("certificate") || lower.includes("apply") || lower.includes("document")) {
        reply = "To apply for certificates like Domicile or Income, go to the 'Dashboard' from your sidebar and click on the 'Apply' button on the certificate card.";
      } 
      // Greetings
      else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        reply = "Hi there! How can I assist you with the Smart Governance platform today?";
      }

      setMessages(prev => [...prev, { id: Date.now(), text: reply, isBot: true }]);
    }, 800);
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
                placeholder="Ask me anything..." 
                style={{ flex: 1, background: '#060C18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', outline: 'none', fontSize: 13 }}
              />
              <button onClick={handleSend} style={{ background: '#F97316', border: 'none', borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#E07800'} onMouseOut={e => e.currentTarget.style.background='#F97316'}>
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
