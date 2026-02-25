const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const User = require("../models/UserModel");

const UserController = {
  getAll: async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  },

  create: async (req, res) => {
    try {
      const { name, email, password, confirmPassword, linkedin, github } = req.body;
      const emailExist = await User.findOne({ email });

      if(!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
      }

      if(password !== confirmPassword)  {
        return res.status(400).json({ error: "As senhas não coincidem!" });
      }

      if(email.length < 5 || !email.includes("@")) {
        return res.status(400).json({ error: "Email inválido!" });
      }

      if(emailExist) {
        return res.status(400).json({ error: "Email já cadastrado!" });
      }

      encryptPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
      }

      const password_hash = await encryptPassword(password);

      // github tem o valor https://github.com/leonardohernandesq
      // pegar valor após o último /
      const githubUser = github.split("/").pop();
      const response = await fetch(`https://api.github.com/users/${githubUser}`);
      const data = await response.json();
      const avatar = data.avatar_url;

      const newUser = new User({ name, email, password: password_hash, linkedin, github, avatar });
      await newUser.save();

      newUser.password = undefined;
      newUser.__v = undefined;

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar usuário" });
      console.log(error)
    }
  },

  getById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      user.password = undefined;
      user.__v = undefined;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios!" });
      }
  
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Senha incorreta" });
  
      // Remove campos sensíveis e converte para objeto
      const userObj = user.toObject();
      delete userObj.password;
      delete userObj.__v;
  
      // Gera token
      const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      // Coloca o token dentro do objeto user
      userObj.token = token;
  
      // Responde com o user completo com token embutido
      res.json({user: userObj});
  
    } catch (error) {
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  },

  update: async (req, res) => {
    try {
      const { name, email, password, linkedin, github } = req.body;
      const userId = req.params.id;

      if (!name || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios!" });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
      }

      await User.updateOne({ _id: userId }, { name, email, password, linkedin, github });
      res.json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  }, 

  delete: async(req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      // delete all posts from this user
      await Post.deleteMany({ user: userId });

      await User.deleteOne({ _id: userId });
      res.json({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  }
};

module.exports = UserController;
