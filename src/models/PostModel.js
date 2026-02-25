const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: { 
        type: String,
        required: true,
    },
    categories: [
        {   
            type: mongoose.Schema.Types.ObjectId,
            ref: "CategoryModel",
            required: true,
        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    image: {
        type: String,
        default: null,
    },
    views: {
        type: Number,
        default: 0,
    },

}, { timestamps: true
});

const PostModel = mongoose.model("PostModel", PostSchema);

module.exports = PostModel;