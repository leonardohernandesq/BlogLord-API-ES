const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const CategoryModel = mongoose.model("CategoryModel", CategorySchema);

module.exports = CategoryModel;