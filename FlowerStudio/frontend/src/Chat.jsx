import { useState } from 'react';
import axios from 'axios';

function Chat() {
  // Memorizziamo la cronologia dei messaggi e quello che l'utente sta scrivendo
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ciao! Sono Fleur, la tua Floral Designer virtuale. Come posso aiutarti oggi?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Aggiungiamo il messaggio dell'utente alla chat
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. RECUPERIAMO IL TOKEN SALVATO! (La magia avviene qui)
      const token = localStorage.getItem('flower_token');
      console.log("Token inviato al backend:", token);

      // 3. Facciamo la chiamata al backend passando il token come Buttafuori
      const response = await axios.post('http://localhost:3000/chat', 
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Aggiungiamo la risposta di Fleur alla chat
      setMessages([...newMessages, { sender: 'bot', text: response.data.reply }]);
      
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { sender: 'bot', text: ' Ops! Errore di connessione con il cervello di Fleur.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '95%', maxWidth: '600px', margin: '1rem auto', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      
      {/* Intestazione della Chat */}
      <div style={{ backgroundColor: '#EAF4A5', color: '#555', padding: '1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', textAlign: 'center' }}>
        <h3> Chat con Fleur</h3>
      </div>

      {/* Area dei messaggi */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#ffffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <span style={{ 
                display: 'inline-block', 
                padding: '10px 15px', 
                borderRadius: '20px', 
                color: '#000',
                backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#ffffffff',
                border: msg.sender === 'bot' ? '1px solid #ddd' : 'none',
                maxWidth: '80%'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {isLoading && <div style={{ textAlign: 'left' }}><span style={{ display: 'inline-block', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '20px' }}>Fleur sta scrivendo... ️</span></div>}
      </div>

      {/* Barra per scrivere */}
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #ccc', padding: '10px', backgroundColor: '#fff', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi un messaggio a Fleur..." 
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', marginRight: '10px' }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', backgroundColor: '#EAF4A5', color: '#555', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
          Invia
        </button>
      </form>
    </div>
  );
}

export default Chat;