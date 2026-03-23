import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ciao! Sono Fleur, la tua Floral Designer virtuale. Come posso aiutarti oggi?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll ai nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('flower_token');
      const response = await axios.post('http://localhost:3000/chat', 
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...newMessages, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { sender: 'bot', text: ' Ops! Errore di connessione con il cervello di Fleur.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* BOTTONE FLOTTANTE PER APRIRE/CHIUDERE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: '#4d6b53', color: 'white',
          border: 'none', cursor: 'pointer',
          fontSize: '1.8rem', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.1)'; }}
      >
        {isOpen ? '✕' : '🌸'}
      </button>

      {/* FINESTRA CHAT POP-UP */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '20px', zIndex: 999,
          width: '380px', maxWidth: 'calc(100vw - 40px)',
          height: '500px', maxHeight: 'calc(100vh - 140px)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
          animation: 'chatSlideUp 0.3s ease-out',
        }}>

          {/* Header */}
          <div style={{ 
            backgroundColor: '#4d6b53', color: 'white', 
            padding: '15px 20px', 
          }}>
            <span style={{ fontSize: '1.5rem' }}>🌸</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>Fleur</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>La tua Floral Designer virtuale</p>
            </div>
          </div>

          {/* Messaggi */}
          <div style={{ 
            flex: 1, padding: '15px', overflowY: 'auto', 
            backgroundColor: '#fdfbf7', 
            display: 'flex', flexDirection: 'column', gap: '10px' 
          }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '10px 14px', 
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                  color: '#333',
                  backgroundColor: msg.sender === 'user' ? '#EAF4A5' : '#fff',
                  border: msg.sender === 'bot' ? '1px solid #eee' : 'none',
                  maxWidth: '85%',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
            {isLoading && (
              <div style={{ textAlign: 'left' }}>
                <span style={{ 
                  display: 'inline-block', padding: '10px 14px', 
                  backgroundColor: '#fff', border: '1px solid #eee', 
                  borderRadius: '16px 16px 16px 4px', fontSize: '0.9rem' 
                }}>
                  Fleur sta scrivendo... ️
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ 
            display: 'flex', padding: '12px', gap: '8px',
            borderTop: '1px solid #eee', backgroundColor: '#fff' 
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi a Fleur..." 
              style={{ 
                flex: 1, padding: '10px 14px', borderRadius: '20px', 
                border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem',
                backgroundColor: '#f9f9f9'
              }}
            />
            <button 
              type="submit" 
              disabled={isLoading} 
              style={{ 
                padding: '10px 16px', backgroundColor: '#4d6b53', 
                color: 'white', border: 'none', borderRadius: '20px', 
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                transition: 'background-color 0.2s'
              }}
            >
              Invia
            </button>
          </form>
        </div>
      )}

      {/* Animazione CSS */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default ChatWidget;
