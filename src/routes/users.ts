import express from 'express';

/** Controllers */
import UserController from '@src/controllers/users';

const router = express.Router();

router.get('/users', async (req, res) => {
  UserController.listAllUsers(req, res);
});

router.get('/user/:id', async (req, res) => {
  UserController.getUserById(req, res);
});

router.patch('/user/edit/:id', async (req, res) => {
  UserController.updateUser(req, res);
});

router.delete('/user/:id', async (req, res) => {
  UserController.deleteUser(req, res);
});

export default router;
