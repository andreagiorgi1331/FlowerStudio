import { useState, useEffect } from 'react';
import axios from 'axios';

function Community() {
  const [bouquets, setBouquets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchPublicBouquets();
  }, []);

  const fetchPublicBouquets = async () => {
    try {
      const token = localStorage.getItem('flower_token');
      const response = await axios.get('http://localhost:3000/bouquets/community/public', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBouquets(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Errore nel recupero bouquet pubblici", error);
      setIsLoading(false);
    }
  };

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '3rem' }}>Caricamento della Community... </h3>;

  return (
    <div className="page-container">
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ color: '#4d6b53', fontSize: '2.5rem', margin: '0 0 10px 0' }}>Community </h2>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Scopri le creazioni condivise da tutti i Floral Designer!</p>
      </div>

      {bouquets.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '3rem' }}>
          <p style={{ fontSize: '3rem', margin: '0 0 10px 0' }}></p>
          <p style={{ fontSize: '1.1rem' }}>Nessun bouquet è stato ancora condiviso.</p>
          <p style={{ fontSize: '0.9rem' }}>Vai su "I Miei Mazzi" e pubblica il tuo primo bouquet!</p>
        </div>
      ) : (
        <div className="grid-cards" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {bouquets.map((bouquet) => (
            <div key={bouquet.id} style={{ 
              backgroundColor: '#fff', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              
              {/* Anteprima */}
              <div style={{ width: '100%', height: '250px', backgroundColor: '#fdfbf7', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
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
                    <p style={{ fontSize: '2rem', margin: '0 0 10px 0' }}></p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Nessuna anteprima</p>
                  </div>
                )}
              </div>

              {/* Dettagli */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: '#4d6b53', fontSize: '1.3rem' }}>{bouquet.name}</h3>
                  <div style={{ width: '20px', height: '20px', backgroundColor: bouquet.wrapper, borderRadius: '50%', border: '1px solid #ddd' }}></div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '8px', 
                  padding: '8px 12px', 
                  marginBottom: '10px',
                  fontSize: '0.85rem',
                  color: '#666'
                }}>
                  👤 <strong>{bouquet.user_nome} {bouquet.user_cognome}</strong>
                </div>

                <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.9rem' }}>🌸 {bouquet.flower_count} fiori</p>
              </div>

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

export default Community;
