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
    const page = Math.max(parseInt(params.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(params.pageSize, 10) || 10, 1), 100);
    const published = params.published === 'true' ? true : params.published === 'false' ? false : undefined;
    const tag = params.tag;
    const search = params.search ? params.search.trim() : '';

    const query = {};
    if (typeof published === 'boolean') query.published = published;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return {
      statusCode: 200,
      headers: allowCorsHeaders,
      body: JSON.stringify({
        total,
        page,
        pageSize,
        posts,
      }),
    };
  } catch (error) {
    console.error('List posts error:', error);
    return {
      statusCode: 500,
      headers: allowCorsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


