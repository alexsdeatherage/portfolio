const connectDB = require('../utils/db');
const Post = require('../models/post');

const allowCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: allowCorsHeaders, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
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

    await Post.deleteOne({ _id: post._id });

    return {
      statusCode: 200,
      headers: allowCorsHeaders,
      body: JSON.stringify({ message: 'Post deleted' }),
    };
  } catch (error) {
    console.error('Delete post error:', error);
    return {
      statusCode: 500,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


