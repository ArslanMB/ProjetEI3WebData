import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home/Home';
import About from './pages/About/About';
import Layout from './components/Layout/Layout';
import Counter from './pages/Counter/Counter';
import Users from './pages/Users/Users';
import Register from "./pages/Register/Register"; 
import Login from './pages/Login/Login.jsx';
import MovieDetails from './pages/MovieDetails/MovieDetails.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx'; 



function App() {
  const [user, setUser] = useState(null); // état de connexion

  return (
    <Layout user={user} onLogout={() => setUser(null)}>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/counter" element={<Counter />} />
        <Route path="/users" element={<Users />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/movies/:id" element={<MovieDetails user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </Layout>
  );
}

export default App;
