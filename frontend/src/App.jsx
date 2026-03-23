import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import ChatWidget from './ChatWidget';
import Catalog from './Catalog';
import CreateBouquet from './CreateBouquet';
import MyBouquets from './MyBouquets';
import AdminDashboard from './AdminDashboard';
import Community from './Community';

function App() {
  const token = localStorage.getItem('flower_token');

  // Decodifichiamo il JWT per leggere il ruolo dell'utente
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (e) {
      console.error("Errore nella decodifica del token");
    }
  }

  return (
    <Router>
      <Navbar /> 
      
      <Routes>
        {/* Home ora porta al Catalogo (il Giardino) */}
        <Route path="/" element={token ? <Navigate to="/catalogo" /> : <Navigate to="/login" />} />
        
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/catalogo" />} />
        <Route path="/catalogo" element={token ? <Catalog /> : <Navigate to="/login" />} />
        <Route path="/crea-bouquet" element={token ? <CreateBouquet /> : <Navigate to="/login" />} />
        <Route path="/i-miei-mazzi" element={token ? <MyBouquets /> : <Navigate to="/login" />} />
        <Route path="/community" element={token ? <Community /> : <Navigate to="/login" />} />
        
        {/* ROTTA ADMIN */}
        <Route path="/admin" element={
          token && userRole === 'admin' 
            ? <AdminDashboard /> 
            : <Navigate to="/login" />
        } />
      </Routes>

      {/* Chat Flottante - visibile su TUTTE le pagine quando loggati */}
      {token && <ChatWidget />}
    </Router>
  );
}

export default App;