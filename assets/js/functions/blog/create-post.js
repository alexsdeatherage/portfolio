const connectDB = require('../utils/db');
const Post = require('../models/post');
const { requireAuth } = require('../utils/auth');

const allowCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (event.httpMethod !== 'POST') {
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
    const { title, content, excerpt, tags, published, coverImageUrl, slug: providedSlug } = data;

    if (!title || !content) {
      return {
        statusCode: 400,
        headers: allowCorsHeaders,
        body: JSON.stringify({ error: 'title and content are required' }),
      };
    }

    let slugBase = providedSlug ? toSlug(providedSlug) : toSlug(title);
    if (!slugBase) {
      return {
        statusCode: 400,
        headers: allowCorsHeaders,
        body: JSON.stringify({ error: 'Unable to derive slug from title' }),
      };
    }

    // Ensure unique slug by appending -n when needed
    let slug = slugBase;
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${slugBase}-${counter}`;
      counter += 1;
    }

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || '',
      tags: Array.isArray(tags) ? tags : [],
      published: Boolean(published),
      coverImageUrl: coverImageUrl || '',
    });

    return {
      statusCode: 201,
      headers: allowCorsHeaders,
      body: JSON.stringify({
        message: 'Post created',
        post,
      }),
    };
  } catch (error) {
    console.error('Create post error:', error);
    return {
      statusCode: 500,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

