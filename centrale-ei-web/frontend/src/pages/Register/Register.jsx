import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import rateflixLogo from '../Home/Rateflix.png';
import './Register.css';

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    birthYear: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/users/register', form);
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 1200); // Redirige après 1.2s pour laisser voir le message
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="register-container">
      <img src={rateflixLogo} alt="RateFlix Logo" className="register-logo" />
      <form className="register-form" onSubmit={handleSubmit}>
        <input name="username" placeholder="Pseudo" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="birthYear" type="number" placeholder="Année de naissance" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirmez le mot de passe" onChange={handleChange} required />
        <button type="submit">S'inscrire</button>
        <p>{message}</p>
      </form>
    </div>
  );
}