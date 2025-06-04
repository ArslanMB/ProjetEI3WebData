import express from 'express';
import crypto from 'crypto';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, birthYear, password, confirmPassword } = req.body;

  if (!username || !email || !birthYear || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
  }

  const userRepo = appDataSource.getRepository(User);

  const existingUser = await userRepo.findOne({
    where: [{ email }, { username }],
  });

  if (existingUser) {
    return res.status(400).json({ message: 'Email ou pseudo déjà utilisé.' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  const newUser = userRepo.create({
    username,
    email,
    birthYear: parseInt(birthYear),
    passwordHash: hash,
  });

  try {
    await userRepo.save(newUser);
    return res.status(201).json({ message: 'Inscription réussie' });
  } catch (err) {
    console.error('Erreur lors de l’enregistrement :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis.' });

  const userRepo = appDataSource.getRepository(User);

  const user = await userRepo.findOneBy({ email });

  if (!user)
    return res.status(401).json({ message: 'Email ou mot de passe invalide.' });

  const hashed = crypto.createHash('sha256').update(password).digest('hex');

  if (user.passwordHash !== hashed)
    return res.status(401).json({ message: 'Email ou mot de passe invalide.' });

  // Ici on retourne l'utilisateur (ou un token si tu veux ajouter JWT plus tard)
  return res.status(200).json({
    message: 'Connexion réussie.',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});

export default router;
