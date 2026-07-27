import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('flower_token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Stile per i link della navbar
  const linkStyle = { color: '#555', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>
          <img src="/logo.png" alt="FlowerStudio" style={{ height: '65px', objectFit: 'contain', display: 'block' }} />
        </Link>
        
        {/* Pulsante Hamburger per Mobile */}
        <button 
          className="navbar-hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        {token ? (
          <>
            <Link to="/catalogo" style={linkStyle} onClick={closeMenu}>Giardino</Link>
            <Link to="/crea-bouquet" style={linkStyle} onClick={closeMenu}>Componi</Link>
            <Link to="/i-miei-mazzi" style={linkStyle} onClick={closeMenu}>I Miei Bouquet</Link>
            <Link to="/community" style={linkStyle} onClick={closeMenu}>Community</Link>
            
            {/* Link Admin visibile SOLO per gli admin */}
            {userRole === 'admin' && (
              <Link to="/admin" style={{ ...linkStyle, color: '#d32f2f' }} onClick={closeMenu}> Admin</Link>
            )}
            
            <button 
              onClick={() => { closeMenu(); handleLogout(); }} 
              className="navbar-logout-btn"
            >
              Esci
            </button>
          </>
        ) : (
          <Link to="/login" style={linkStyle} onClick={closeMenu}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;