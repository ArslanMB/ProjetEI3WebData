import { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    pseudo: "",
    birthYear: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8000/users/register", formData);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur serveur.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inscription</h2>
      {message && <p><strong>{message}</strong></p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
        <input name="email" type="email" placeholder="Adresse mail" value={formData.email} onChange={handleChange} required />
        <input name="pseudo" type="text" placeholder="Pseudo" value={formData.pseudo} onChange={handleChange} required />
        <input name="birthYear" type="number" placeholder="Année de naissance" value={formData.birthYear} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirmation mot de passe" value={formData.confirmPassword} onChange={handleChange} required />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}

export default Register;
