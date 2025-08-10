const { comparePassword, generateToken, authCorsHeaders, ADMIN_USERNAME, ADMIN_PASSWORD_HASH } = require('../utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: authCorsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: authCorsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { username, password } = data;

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: authCorsHeaders,
        body: JSON.stringify({ error: 'Username and password are required' }),
      };
    }

    // Check if username matches admin username
    if (username !== ADMIN_USERNAME) {
      return {
        statusCode: 401,
        headers: authCorsHeaders,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Check if password hash is set in environment
    if (!ADMIN_PASSWORD_HASH) {
      console.error('ADMIN_PASSWORD_HASH not set in environment variables');
      return {
        statusCode: 500,
        headers: authCorsHeaders,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: authCorsHeaders,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Generate JWT token
    const token = generateToken({ 
      username: ADMIN_USERNAME, 
      role: 'admin',
      iat: Date.now()
    });

    return {
      statusCode: 200,
      headers: authCorsHeaders,
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: { username: ADMIN_USERNAME, role: 'admin' }
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: authCorsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
