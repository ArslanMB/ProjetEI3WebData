import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import rateflixLogo from '../Home/Rateflix.png';
import './Login.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/users/login', form);
      onLogin(res.data.user);
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur serveur');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <img src={rateflixLogo} alt="RateFlix Logo" className="register-logo" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2>Connexion</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Se connecter</button>
        {message && <p className="error-message">{message}</p>}
      </form>
    </div>
  );
}