import express from 'express';

/** Controllers */
import AuthController from '@src/controllers/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  AuthController.register(req, res);
});

router.post('/login', async (req, res) => {
  AuthController.login(req, res);
});

export default router;
