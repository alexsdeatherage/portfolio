const connectDB = require('../utils/db');
const Post = require('../models/post');
const { requireAuth } = require('../utils/auth');

const allowCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'PUT, PATCH, OPTIONS',
  'Content-Type': 'application/json',
};

const toSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: allowCorsHeaders, body: '' };
  }

  if (event.httpMethod !== 'PUT' && event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Check authentication
    const authResult = await requireAuth(event);
    if (authResult) return authResult;

    await connectDB();

    const data = JSON.parse(event.body || '{}');
    const {
      id,
      slug: identifierSlug,
      // fields to update
      title,
      content,
      excerpt,
      tags,
      published,
      coverImageUrl,
      newSlug,
    } = data;

    if (!id && !identifierSlug) {
      return {
        statusCode: 400,
        headers: allowCorsHeaders,
        body: JSON.stringify({ error: 'Provide id or slug to identify the post' }),
      };
    }

    const existing = id
      ? await Post.findById(id)
      : await Post.findOne({ slug: identifierSlug });

    if (!existing) {
      return {
        statusCode: 404,
        headers: allowCorsHeaders,
        body: JSON.stringify({ error: 'Post not found' }),
      };
    }

    const updates = {};
    if (typeof title === 'string') updates.title = title;
    if (typeof content === 'string') updates.content = content;
    if (typeof excerpt === 'string') updates.excerpt = excerpt;
    if (Array.isArray(tags)) updates.tags = tags;
    if (typeof published !== 'undefined') updates.published = Boolean(published);
    if (typeof coverImageUrl === 'string') updates.coverImageUrl = coverImageUrl;

    // Handle slug change if requested
    if (typeof newSlug === 'string' && newSlug.trim() !== '') {
      let slugBase = toSlug(newSlug);
      if (!slugBase) {
        return {
          statusCode: 400,
          headers: allowCorsHeaders,
          body: JSON.stringify({ error: 'Unable to derive slug from newSlug' }),
        };
      }

      let slug = slugBase;
      let counter = 1;
      // Ensure uniqueness excluding current post id
      // eslint-disable-next-line no-await-in-loop
      while (await Post.findOne({ slug, _id: { $ne: existing._id } })) {
        slug = `${slugBase}-${counter}`;
        counter += 1;
      }
      updates.slug = slug;
    }

    const updated = await Post.findByIdAndUpdate(existing._id, updates, {
      new: true,
      runValidators: true,
    });

    return {
      statusCode: 200,
      headers: allowCorsHeaders,
      body: JSON.stringify({ message: 'Post updated', post: updated }),
    };
  } catch (error) {
    console.error('Update post error:', error);
    return {
      statusCode: 500,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


