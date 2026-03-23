import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Nuovi stati per Nome e Cognome (utilizzati solo per la registrazione)
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  
  const [message, setMessage] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false); // Partiamo dalla Registrazione come nel tuo disegno
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isLoginMode 
        ? 'http://localhost:3000/auth/login' 
        : 'http://localhost:3000/auth/register';

      // NOTA: Se il tuo backend non si aspetta 'nome' e 'cognome', li ignorerà, 
      // ma è bene inviarli se deciderai di salvarli nel database in futuro!
      const payload = isLoginMode 
        ? { email, password } 
        : { email, password, nome, cognome };

      const response = await axios.post(url, payload);

      if (isLoginMode) {
        localStorage.setItem('flower_token', response.data.token);
        navigate('/'); 
        window.location.reload(); 
      } else {
        setMessage(' Registrazione completata! Ora puoi fare il login.');
        setIsLoginMode(true); 
        setPassword(''); 
      }
      
    } catch (error) {
      setMessage(' Errore: ' + (error.response?.data?.message || 'Operazione fallita'));
    }
  };

  return (
    // 1. CONTENITORE PRINCIPALE
    <div style={{ 
      // Usiamo calc() per sottrarre l'altezza della Navbar, così è perfettamente centrato!
      minHeight: 'calc(100vh - 90px)', 
      width: '100%',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '2rem 1rem', // Aggiunge respiro ai lati su schermi minuscoli
      boxSizing: 'border-box', // Impedisce al padding di allargare lo schermo
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      
      {/* I TUOI FIORI FLUTTUANTI */}
      { <img src="/fiori/girasole.png" alt="Fiore" style={{ position: 'absolute', top: '2%', left: '-5%', width: '300px', transform: 'rotate(90deg)'}} /> }
      
      {/* Fiori bianchi - in alto a destra */}
      <img src="/fiori/dalia bianca.png" alt="Fiore" style={{ position: 'absolute', top: '-2%', right: '-5%', width: '280px', transform: 'rotate(270deg)' }} />

      {/* Viola del pensiero - a sinistra centro-basso */}
      <img src="/fiori/viola.png" alt="Fiore" style={{ position: 'absolute', bottom: '22%', left: '18%', width: '160px', transform: 'rotate(10deg)' }} />

      {/* Ortensia - a destra centro */}
      <img src="/fiori/ortensia.png" alt="Fiore" style={{ position: 'absolute', top: '39%', right: '15%', width: '150px', transform: 'rotate(-10deg)' }} />

      {/* Dalia fucsia - in basso a sinistra */}
      <img src="/fiori/dalia fucsia.png" alt="Fiore" style={{ position: 'absolute', bottom: '-13%', left: '-3%', width: '200px' }} />

      {/* Fiore rosa - in basso a destra */}
      <img src="/fiori/cosmos.png" alt="Fiore" style={{ position: 'absolute', bottom: '-13%', right: '-1%', width: '250px', transform: 'rotate(15deg)' }} />
      
      {/* 2. CARD CENTRALE BIANCA */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        // MAGIA CSS: clamp(minimo, preferito, massimo). 
        // Su PC il padding sarà 2.5rem, su smartphone si restringerà da solo a 1.5rem!
        padding: 'clamp(1.5rem, 5vw, 2.5rem)', 
        borderRadius: '20px', 
        width: '100%',       // Prende tutto lo spazio disponibile...
        maxWidth: '400px',   // ...ma si ferma a 400px su computer
        boxSizing: 'border-box',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
        zIndex: 10 
      }}>
        
        {/* INTERRUTTORE A PILLOLA LOGIN / REGISTRATI */}
        <div style={{ 
          backgroundColor: '#EAF4A5', 
          borderRadius: '30px', 
          display: 'flex', 
          padding: '5px', 
          marginBottom: 'clamp(1.5rem, 4vw, 2rem)' // Si adatta anche il margine inferiore
        }}>
          <button 
            type="button"
            onClick={() => { setIsLoginMode(true); setMessage(''); }}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: isLoginMode ? '#FFFFFF' : 'transparent', // Diventa bianco se attivo
              color: isLoginMode ? '#333' : '#777',
              boxShadow: isLoginMode ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s'
            }}>
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsLoginMode(false); setMessage(''); }}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: !isLoginMode ? '#FFFFFF' : 'transparent', 
              color: !isLoginMode ? '#333' : '#777',
              boxShadow: !isLoginMode ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s'
            }}>
            Registrati
          </button>
        </div>

        {message && <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', color: message.includes('') ? '#4CAF50' : '#D32F2F' }}>{message}</p>}

        {/* IL FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* I campi Nome e Cognome appaiono SOLO in modalità Registrazione */}
          {!isLoginMode && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '5px', marginLeft: '5px' }}>Nome</label>
                <input type="text" placeholder="Mario" value={nome} onChange={(e) => setNome(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '5px', marginLeft: '5px' }}>Cognome</label>
                <input type="text" placeholder="Rossi" value={cognome} onChange={(e) => setCognome(e.target.value)} required style={inputStyle} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '5px', marginLeft: '5px' }}>Email</label>
            <input type="email" placeholder="mario.rossi@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '5px', marginLeft: '5px' }}>Password</label>
            <input type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" style={{ 
            backgroundColor: '#EAF4A5', 
            color: '#555', 
            border: 'none', 
            padding: '14px', 
            borderRadius: '25px', 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            cursor: 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.2s'
          }}>
            {isLoginMode ? 'Accedi ' : 'Registrati '}
          </button>
        </form>
      </div>
    </div>
  );
}

// Stile condiviso per tutti gli input per non ripetere il codice
const inputStyle = {
  width: '100%',
  padding: 'clamp(10px, 3vw, 12px) 15px', // Rimpicciolisce leggermente l'input su mobile
  borderRadius: '12px',
  border: '2px solid #EAF4A5', 
  outline: 'none',
  fontSize: '1rem',
  boxSizing: 'border-box' // FONDAMENTALE: impedisce al bordo di "uscire" dal contenitore
};

export default Login;