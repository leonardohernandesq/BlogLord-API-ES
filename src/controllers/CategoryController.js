const CategoryModel = require("../models/CategoryModel");
const PostModel = require("../models/PostModel"); 


const CategoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await CategoryModel.find().select("-__v");
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  },

  create: async (req, res) => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          error: "O corpo da requisição deve conter um JSON válido com dados.",
        });
      }

      const { name } = req.body;
      if (!name) {
        return res
          .status(400)
          .json({ error: "Nome da categoria é obrigatório!" });
      }

      const existingCategory = await CategoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(409).json({ error: "Categoria já existe!" });
      }

      const newCategory = new CategoryModel({ name });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar categoria" });
    }
  },

  getById: async (req, res) => {
    try {
      const category = await CategoryModel.findById(req.params.id).select(
        "-__v"
      );
      if (!category)
        return res.status(404).json({ error: "Categoria não encontrada" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar categoria" });
    }
  },

  update: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res
          .status(400)
          .json({ error: "Nome da categoria é obrigatório!" });
      }

      const category = await CategoryModel.findByIdAndUpdate(
        req.params.id,
        { name },
        { new: true }
      );
      if (!category)
        return res.status(404).json({ error: "Categoria não encontrada" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  },

  delete: async (req, res) => {
    try {
      const category = await CategoryModel.findByIdAndDelete(req.params.id);

      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }

      // Deletar todos os posts associados a esta categoria
      //await PostModel.deleteMany({ categories: req.params.id });

      res.json({ message: "Categoria deletada com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar categoria" });
    }
  },
};

module.exports = CategoryController;
