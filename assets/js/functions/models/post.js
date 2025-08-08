const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    coverImageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);

