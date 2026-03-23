import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyBouquets() {
  const [bouquets, setBouquets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchMyBouquets();
  }, []);

  const fetchMyBouquets = async () => {
    try {
      const token = localStorage.getItem('flower_token');
      const response = await axios.get('http://localhost:3000/bouquets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBouquets(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Errore nel recupero bouquet", error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo capolavoro? ")) return;

    try {
      const token = localStorage.getItem('flower_token');
      await axios.delete(`http://localhost:3000/bouquets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Aggiorniamo la lista rimuovendo quello cancellato
      setBouquets(bouquets.filter(b => b.id !== id));
    } catch (error) {
      console.error("Errore eliminazione", error);
      alert("Impossibile eliminare il bouquet.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/crea-bouquet?edit=${id}`);
  };

  const handleTogglePublic = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('flower_token');
      await axios.put(`http://localhost:3000/bouquets/${id}/toggle-public`, 
        { is_public: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBouquets(bouquets.map(b => 
        b.id === id ? { ...b, is_public: !currentStatus } : b
      ));
    } catch (error) {
      console.error("Errore toggle pubblico", error);
    }
  };

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '3rem' }}>Caricamento del tuo giardino... </h3>;

  return (
    <div className="page-container">
      <h2 style={{ color: '#4d6b53', borderBottom: '2px solid #EAF4A5', paddingBottom: '10px', display: 'inline-block' }}>
        I Miei Bouquet 
      </h2>

      {bouquets.length === 0 ? (
        <p style={{ color: '#888', marginTop: '2rem' }}>Non hai ancora creato nessun bouquet. Vai su "Componi" per iniziare!</p>
      ) : (
        <div className="grid-cards">
          
          {bouquets.map((bouquet) => (
            <div key={bouquet.id} style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              
              {/* Anteprima del bouquet */}
              <div style={{ width: '100%', height: '200px', backgroundColor: '#fdfbf7', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                {bouquet.preview_image ? (
                  <>
                    <img 
                      src={bouquet.preview_image} 
                      alt={`Anteprima di ${bouquet.name}`} 
                      onClick={() => setZoomedImage(bouquet.preview_image)}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} 
                    />
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#aaa', padding: '1rem' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 5px 0' }}></p>
                    <p style={{ margin: 0, fontSize: '0.8rem' }}>Nessuna anteprima. Modifica e ri-salva!</p>
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '48px' }}>
                <h3 style={{ margin: '0', color: '#444' }}>{bouquet.name}</h3>
                <div style={{ width: '25px', height: '25px', backgroundColor: bouquet.wrapper, borderRadius: '50%', border: '1px solid #ccc', flexShrink: 0 }}></div>
              </div>
              
              <p style={{ margin: '10px 0 5px 0', color: '#666', fontSize: '0.9rem' }}>🌸 {bouquet.flower_count} Fiori inseriti</p>
              
              {/* Gruppo bottoni in fondo alla card */}
              <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                {/* Toggle Pubblico / Privato */}
                <button 
                  onClick={() => handleTogglePublic(bouquet.id, bouquet.is_public)}
                  style={{ 
                    width: '100%', padding: '8px', marginBottom: '10px',
                    backgroundColor: bouquet.is_public ? '#e3f2fd' : '#f5f5f5', 
                    color: bouquet.is_public ? '#1565c0' : '#888', 
                    border: bouquet.is_public ? '1px solid #90caf9' : '1px solid #ddd', 
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}>
                  {bouquet.is_public ? ' Pubblico' : ' Privato'}
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleEdit(bouquet.id)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#EAF4A5', color: '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ️ Modifica
                  </button>
                  <button 
                    onClick={() => handleDelete(bouquet.id)}
                    style={{ padding: '10px 15px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🗑️
                  </button>
                </div>
              </div>

              </div> {/* chiusura div contenuto */}
            </div>
          ))}

        </div>
      )}

      {/* LIGHTBOX MODALE */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgb(253, 251, 247)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button 
            onClick={() => setZoomedImage(null)}
            style={{ 
              position: 'absolute', top: '20px', right: '20px',
              backgroundColor: 'transparent', color: '#333', border: 'none',
              fontSize: '2rem', cursor: 'pointer', zIndex: 2010
            }}
          >✕</button>
          <img 
            src={zoomedImage} 
            alt="Bouquet ingrandito" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', height: '100%', maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', cursor: 'default', transform: 'scale(1.15)' }}  
          />
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default MyBouquets;