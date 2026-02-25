const express = require("express");
const UserController = require("../controllers/UserController");
const CategoryController = require("../controllers/CategoryController");
const PostController = require("../controllers/PostController");
const ContactController = require("../controllers/ContactController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

const router = express.Router();

// User routes
router.get("/users/all", authMiddleware, UserController.getAll);
router.get("/users/:id", authMiddleware, UserController.getById);

router.post("/users/register", authMiddleware, UserController.create);
router.post("/users/login", UserController.login);

router.put("/users/:id", authMiddleware, UserController.update);

router.delete("/users/:id", authMiddleware, UserController.delete);

// Category routes
router.get("/category/all", CategoryController.getAll);
router.get("/category/:id", CategoryController.getById);

router.post("/category/create", authMiddleware, CategoryController.create);

router.put("/category/:id", authMiddleware, CategoryController.update);

router.delete("/category/:id", authMiddleware, CategoryController.delete);

// Posts routes
router.get("/posts/all", PostController.getAll);
router.get("/posts/:id", PostController.getPostById);
router.get("/posts/category/:id", PostController.getPostsByCategory);
router.get("/posts/user/:id", PostController.getPostsByUser);

router.post(
  "/posts/create",
  authMiddleware,
  upload.single("image"),
  PostController.create
);
router.post("/posts/addview/:id", PostController.addView);

router.put(
  "/posts/:id",
  authMiddleware,
  upload.single("image"),
  PostController.update
);

router.delete("/posts/:id", authMiddleware, PostController.delete);

router.post("/contact", ContactController.send);

module.exports = router;
