import { Link } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('flower_token');

  // Decodifichiamo il JWT per leggere il ruolo
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (e) {
      console.error("Errore decodifica token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('flower_token');
    window.location.href = '/login';
  };

  // Stile per i link della navbar
  const linkStyle = { color: '#555', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' };

  return (
    <nav className="navbar">
      <img src="/logo.png" alt="FlowerStudio" style={{ height: '70px', objectFit: 'contain' }} />
      
      <div className="navbar-links">
        {token ? (
          <>
            <Link to="/catalogo" style={linkStyle}>Giardino</Link>
            <Link to="/crea-bouquet" style={linkStyle}>Componi</Link>
            <Link to="/i-miei-mazzi" style={linkStyle}>I Miei Mazzi</Link>
            <Link to="/community" style={linkStyle}>Community</Link>
            
            {/* Link Admin visibile SOLO per gli admin */}
            {userRole === 'admin' && (
              <Link to="/admin" style={{ ...linkStyle, color: '#d32f2f' }}> Admin</Link>
            )}
            
            <button 
              onClick={handleLogout} 
              style={{ padding: '8px 20px', backgroundColor: 'white', color: '#555', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            >
              Esci
            </button>
          </>
        ) : (
          <Link to="/login" style={linkStyle}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;