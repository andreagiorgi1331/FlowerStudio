import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [bouquets, setBouquets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllBouquets();
  }, []);

  const fetchAllBouquets = async () => {
    try {
      const token = localStorage.getItem('flower_token');
      const response = await axios.get('http://localhost:3000/bouquets/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBouquets(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Errore nel recupero bouquet (admin)", error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo bouquet? Questa azione è irreversibile! ️")) return;

    try {
      const token = localStorage.getItem('flower_token');
      await axios.delete(`http://localhost:3000/bouquets/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBouquets(bouquets.filter(b => b.id !== id));
      setMessage(' Bouquet eliminato con successo!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Errore eliminazione (admin)", error);
      setMessage(' Errore durante l\'eliminazione.');
    }
  };

  const handleToggleTemplate = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('flower_token');
      await axios.put(`http://localhost:3000/bouquets/${id}/toggle-template`, 
        { is_template: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Aggiorniamo lo stato localmente
      setBouquets(bouquets.map(b => 
        b.id === id ? { ...b, is_template: !currentStatus } : b
      ));
      setMessage(` Bouquet ${!currentStatus ? 'promosso a Template' : 'rimosso dal Catalogo'}!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Errore toggle template", error);
      setMessage(' Errore durante l\'aggiornamento.');
    }
  };

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '3rem' }}>Caricamento dashboard admin... ️</h3>;

  return (
    <div className="page-container">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#4d6b53', borderBottom: '3px solid #EAF4A5', paddingBottom: '10px', margin: 0 }}>
           Dashboard Admin
        </h2>
        <div style={{ 
          backgroundColor: '#EAF4A5', 
          padding: '8px 20px', 
          borderRadius: '20px', 
          fontWeight: 'bold', 
          color: '#555',
          fontSize: '0.95rem'
        }}>
           {bouquets.length} Bouquet Totali
        </div>
      </div>

      {/* Messaggio di feedback */}
      {message && (
        <div style={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem', 
          padding: '12px', 
          borderRadius: '10px',
          backgroundColor: message.includes('') ? '#e8f5e9' : '#ffebee',
          color: message.includes('') ? '#2e7d32' : '#d32f2f'
        }}>
          {message}
        </div>
      )}

      {bouquets.length === 0 ? (
        <p style={{ color: '#888', marginTop: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>
          Nessun bouquet presente nel sistema. 
        </p>
      ) : (
        <div className="grid-cards">
          
          {bouquets.map((bouquet) => (
            <div key={bouquet.id} style={{ 
              backgroundColor: '#fff', 
              borderRadius: '15px', 
              padding: '1.5rem', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
              display: 'flex', 
              flexDirection: 'column',
              border: bouquet.is_template ? '2px solid #EAF4A5' : '2px solid transparent',
              transition: 'box-shadow 0.2s, transform 0.2s',
              position: 'relative'
            }}>
              
              {/* Badge Template */}
              {bouquet.is_template && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#EAF4A5',
                  color: '#555',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                   Template
                </div>
              )}

              {/* Intestazione bouquet */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: '0', color: '#444', fontSize: '1.15rem' }}>{bouquet.name}</h3>
                <div style={{ 
                  width: '25px', 
                  height: '25px', 
                  backgroundColor: bouquet.wrapper || '#ccc', 
                  borderRadius: '50%', 
                  border: '1px solid #ccc',
                  flexShrink: 0
                }}></div>
              </div>

              {/* Info utente proprietario */}
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px', 
                padding: '8px 12px', 
                marginBottom: '10px',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                👤 <strong>{bouquet.user_nome} {bouquet.user_cognome}</strong>
                <br />
                ️ {bouquet.user_email}
              </div>

              {/* Dettagli */}
              <p style={{ margin: '4px 0', color: '#666', fontSize: '0.9rem' }}>
                🌸 {bouquet.flower_count} Fiori inseriti
              </p>

              {/* Bottoni azioni */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={() => handleToggleTemplate(bouquet.id, bouquet.is_template)}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    backgroundColor: bouquet.is_template ? '#fff3e0' : '#EAF4A5', 
                    color: '#555', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    transition: 'background-color 0.2s'
                  }}>
                  {bouquet.is_template ? '️ Rimuovi Template' : ' Promuovi Template'}
                </button>
                <button 
                  onClick={() => handleDelete(bouquet.id)}
                  style={{ 
                    padding: '10px 15px', 
                    backgroundColor: '#ffebee', 
                    color: '#d32f2f', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    transition: 'background-color 0.2s'
                  }}>
                  ️ Elimina
                </button>
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
