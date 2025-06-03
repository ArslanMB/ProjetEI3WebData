import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/', function (req, res) {
  appDataSource
    .getRepository(User)
    .find({})
    .then(function (users) {
      res.json({ users: users });
    });
});

router.post('/register', async (req, res) => {
  const { email, pseudo, birthYear, password, confirmPassword } = req.body;

  if (!email || !pseudo || !birthYear || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
  }

  const userRepository = appDataSource.getRepository(User);

  try {
    const emailExists = await userRepository.findOneBy({ email });
    const pseudoExists = await userRepository.findOneBy({ pseudo });

    if (emailExists || pseudoExists) {
      return res.status(400).json({ message: 'Email ou pseudo déjà utilisé.' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = userRepository.create({
      email,
      pseudo,
      birthYear,
      password: hashedPassword,
    });

    const savedUser = await userRepository.save(newUser);

    return res.status(201).json({ message: 'Utilisateur inscrit avec succès.', id: savedUser.id });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
  }
});




router.post('/new', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const newUser = userRepository.create({
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });

  userRepository
    .save(newUser)
    .then(function (savedUser) {
      res.status(201).json({
        message: 'User successfully created',
        id: savedUser.id,
      });
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `User with email "${newUser.email}" already exists`,
        });
      } else {
        res.status(500).json({ message: 'Error while creating the user' });
      }
    });
});

router.delete('/:userId', function (req, res) {
  appDataSource
    .getRepository(User)
    .delete({ id: req.params.userId })
    .then(function () {
      res.status(204).json({ message: 'User successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the user' });
    });
});

export default router;
