const connectDB = require('../utils/db');
const Post = require('../models/post');

const allowCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: allowCorsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();

    const params = event.queryStringParameters || {};
    const { id, slug } = params;

    if (!id && !slug) {
      return {
        statusCode: 400,
        headers: allowCorsHeaders,
        body: JSON.stringify({ error: 'Provide id or slug' }),
      };
    }

    const post = id ? await Post.findById(id) : await Post.findOne({ slug });
    if (!post) {
      return {
        statusCode: 404,
        headers: allowCorsHeaders,
        body: JSON.stringify({ error: 'Post not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: allowCorsHeaders,
      body: JSON.stringify({ post }),
    };
  } catch (error) {
    console.error('Get post error:', error);
    return {
      statusCode: 500,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


