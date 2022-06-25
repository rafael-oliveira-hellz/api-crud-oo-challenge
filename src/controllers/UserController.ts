import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Model
import User from '../models/User';

// Helpers
import createUserToken from '../helpers/CreateUserToken';
import getToken from '../helpers/GetToken';
import getUserByToken from '../helpers/GetUserByToken';

dotenv.config();

class UserController {
  // Register a new user
  public async register(req: Request, res: Response): Promise<Response> {
    const { name, email, password, password_confirmation, role } = req.body;

    if (!name) {
      return res.status(401).json({
        status: 401,
        message: 'O nome é obrigatório',
      });
    }

    if (!email) {
      return res.status(401).json({
        status: 401,
        message: 'O e-mail é obrigatório',
      });
    }

    // Validate e-mail with regex

    const regexEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regexEmail.test(email)) {
      return res.status(401).json({
        status: 401,
        message: 'E-mail inválido',
      });
    }

    if (!password) {
      return res.status(401).json({
        status: 401,
        message: 'A senha é obrigatória',
      });
    }

    // Check if password has between 8 and 16 characters, if it has at least one number, if it has at least one uppercase letter and if it has at least one lowercase letter and if it has at least one special character

    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$£¢¬º|\;:°%,.}{^&~)(*-])[A-Za-z\d#?!@$£¢¬º|\;:°%,.}{^&~)(*-]{8,16}$/;

    if (!regexPassword.test(password)) {
      return res.status(401).json({
        status: 401,
        message:
          'A senha deve ter pelo menos 8 caracteres e 16 caracteres no máximo, pelo menos um número, pelo menos uma letra maiúscula, pelo menos uma letra minúscula e pelo menos um dos seguintes caracteres especiais (@$#!%*?&)',
      });
    }

    if (!password_confirmation) {
      return res.status(401).json({
        status: 401,
        message: 'A confirmação de senha é obrigatória',
      });
    }

    if (password !== password_confirmation) {
      return res.status(401).json({
        status: 401,
        message: 'A senha e a confirmação de senha devem ser iguais',
      });
    }

    // Check if user already exists

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        status: 409,
        message: 'Usuário já existe, escolha outro endereço de e-mail',
      });
    }

    // Create a secure password

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: passwordHash,
      role,
    });

    try {
      const newUser = await user.save();

      const token = await createUserToken(newUser, req, res);

      console.log(token)

      return res.status(201).json({
        status: 201,
        message: 'Usuário criado com sucesso',
        token,
        newUser,
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  }

  // Login a user
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email) {
      return res.status(401).json({
        status: 401,
        message: 'O e-mail é obrigatório',
      });
    }

    if (!password) {
      return res.status(401).json({
        status: 401,
        message: 'A senha é obrigatória',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Usuário não existe',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: 'Senha inválida',
      });
    }

    const token = await createUserToken(user, req, res);

    return res.status(200).json({
      status: 200,
      message: 'Usuário logado com sucesso',
      token,
      user,
    });
  }

  // Check the user token

  public async verifyToken(req: Request, res: Response): Promise<Response> {
    let currentUser;

    const SECRET = process.env.JWT_SECRET;

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token!, SECRET!) as jwt.JwtPayload;

      currentUser = await User.findById(decoded.id).select('-password');
    } else {
      currentUser = null;
    }

    return res.status(200).json({
      status: 200,
      message: 'Usuário autenticado com sucesso',
      currentUser,
    });
  }

  // Get user by id

  public async getUserById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'Usuário não encontrado',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Usuário encontrado com sucesso',
      user,
    });
  }

  // Get the profile of the token's owner

  public async getUserProfile(req: Request, res: Response): Promise<Response> {
    let currentUser;

    const SECRET = process.env.JWT_SECRET;

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token!, SECRET!) as jwt.JwtPayload;

      const userId = decoded ? decoded.id : undefined;

      currentUser = await User.findById({ userId }).select('-password');
    } else {
      currentUser = null;
    }

    return res.status(200).json({
      status: 200,
      message: 'Usuário encontrado com sucesso',
      currentUser,
    });
  }

  // Update a user

  public async updateUser(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    // Check if user exists

    const token = getToken(req);

    const user = await getUserByToken(token);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'Usuário não encontrado',
      });
    }

    // Validations

    const { name, email, password, password_confirmation, role } = req.body;

    let avatar = '';

    if (req.file) {
      user.avatar = req.file.filename;
    }

    if (!name) {
      return res.status(401).json({
        status: 401,
        message: 'O nome é obrigatório',
      });
    }

    user.name = name;

    if (!email) {
      return res.status(401).json({
        status: 401,
        message: 'O e-mail é obrigatório',
      });
    }

    // Validate e-mail with regex

    const regexEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regexEmail.test(email)) {
      return res.status(401).json({
        status: 401,
        message: 'E-mail inválido',
      });
    }

    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      return res.status(401).json({
        status: 401,
        message: 'Usuário já existe, escolha outro endereço de e-mail',
      });
    }

    user.email = email;

    // Check if password has between 8 and 16 characters, if it has at least one number, if it has at least one uppercase letter and if it has at least one lowercase letter and if it has at least one special character

    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$£¢¬º|\;:°%,.}{^&~)(*-])[A-Za-z\d#?!@$£¢¬º|\;:°%,.}{^&~)(*-]{8,16}$/;

    if (password) {
      if (!regexPassword.test(password)) {
        return res.status(401).json({
          status: 401,
          message:
            'A senha deve ter pelo menos 8 caracteres e 16 caracteres no máximo, pelo menos um número, pelo menos uma letra maiúscula, pelo menos uma letra minúscula e pelo menos um dos seguintes caracteres especiais (@$#!%*?&)',
        });
      }

      if (password !== password_confirmation) {
        return res.status(401).json({
          status: 401,
          message: 'A senha e a confirmação de senha devem ser iguais',
        });
      } else if (password === password_confirmation && password !== null) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user.password = passwordHash;
      }
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      return res.status(200).json({
        status: 200,
        message: 'Usuário atualizado com sucesso',
        updatedUser,
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err,
      });
    }
  }

  // Delete a user

  public async deleteUser(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    const token = getToken(req);

    const user = await getUserByToken(token);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'Usuário não encontrado',
      });
    }

    try {
      await User.findByIdAndDelete(id);

      return res.status(200).json({
        status: 200,
        message: 'Usuário excluído com sucesso',
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err,
      });
    }
  }
}

export default new UserController();
