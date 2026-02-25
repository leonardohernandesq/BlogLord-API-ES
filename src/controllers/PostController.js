const PostModel = require("../models/PostModel");
const CategoryModel = require("../models/CategoryModel");
const UserModel = require("../models/UserModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");

const PostController = {
  getAll: async (req, res) => {
    try {
      const posts = await PostModel.find()
        .populate("categories", "name")
        .populate("user", "name");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar posts" });
    }
  },

  getPostById: async (req, res) => {
    try {
      const post = await PostModel.findById(req.params.id)
        .populate("categories", "name")
        .populate("user", "name");
      if (!post) return res.status(404).json({ error: "Post não encontrado" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar post" });
    }
  },

  getPostsByCategory: async (req, res) => {
    try {
      const posts = await PostModel.find({
        categories: req.params.id,
      }).populate("categories", "name");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar posts por categoria" });
    }
  },

  getPostsByUser: async (req, res) => {
    try {
      const posts = await PostModel.find({ user: req.params.id }).populate(
        "user",
        "name"
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar posts por usuário" });
    }
  },

  create: async (req, res) => {
    try {
      const { title, content, status } = req.body;
      const userId = req.body.user || req.user?.id;

      const categories =
        typeof req.body.categories === "string"
          ? JSON.parse(req.body.categories)
          : req.body.categories;

      if (!title || !content || !categories || categories.length === 0) {
        return res.status(400).json({
          error:
            "Título, conteúdo e pelo menos uma categoria são obrigatórios!",
        });
      }

      for (const category of categories) {
        const categoryExists = await CategoryModel.findById(category);
        if (!categoryExists) {
          return res.status(400).json({ error: "Categoria não encontrada!" });
        }
      }

      const userExists = await UserModel.findById(userId);
      if (!userExists) {
        return res.status(400).json({ error: "Usuário não encontrado!" });
      }

      // Upload to Cloudinary
      let image = null;
      if (req.file) {
        const streamUpload = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "posts" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };
        const result = await streamUpload();
        image = result.secure_url;
      }

      const newPost = new PostModel({
        title,
        content,
        categories,
        user: userId,
        status,
        image,
      });

      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar post" });
    }
  },

  update: async (req, res) => {
    try {
      const { title, content, status } = req.body;
      const userId = req.body.user || req.user?.id;
      const postId = req.params.id;

      const categories =
        typeof req.body.categories === "string"
          ? JSON.parse(req.body.categories)
          : req.body.categories;

      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post não encontrado!" });
      }

      if (post.user.toString() !== userId) {
        return res
          .status(403)
          .json({ error: "Você não tem permissão para editar este post!" });
      }

      // Validação de categorias, se fornecidas
      if (categories && categories.length > 0) {
        for (const category of categories) {
          const categoryExists = await CategoryModel.findById(category);
          if (!categoryExists) {
            return res.status(400).json({ error: "Categoria não encontrada!" });
          }
        }
        post.categories = categories;
      }

      // Upload de imagem para Cloudinary, se houver arquivo
      if (req.file) {
        const streamUpload = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "posts" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };

        const result = await streamUpload();
        post.image = result.secure_url;
      }

      // Atualização dos campos, se fornecidos
      if (title) post.title = title;
      if (content) post.content = content;
      if (status) post.status = status;

      await post.save();
      res.status(200).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao atualizar post" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const post = await PostModel.findByIdAndDelete(id);

      if (!post) {
        return res.status(404).json({ error: "Post não encontrado" });
      }

      if (post.image) {
        const publicId = post.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`posts/${publicId}`);
      }

      res.json({ message: "Post deletado com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar post" });
    }
  },
  addView: async (req, res) => {
    try {
      const post = await PostModel.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post não encontrado" });
      post.views += 1;
      await post.save();
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Erro ao adicionar visualização" });
    }
  },
};

module.exports = PostController;
