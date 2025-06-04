import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ← hook de navigation

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/users/login', form);
      onLogin(res.data.user);         // mise à jour de l'utilisateur connecté
      navigate('/');                  // ← redirection vers la page d'accueil
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur serveur');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
      <button type="submit">Se connecter</button>
      <p>{message}</p>
    </form>
  );
}

