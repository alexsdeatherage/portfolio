# Portfolio Blog with Authentication

A secure blog system built with serverless functions, featuring JWT-based authentication for admin operations.

## Features

- **Public endpoints**: Read posts, list posts
- **Protected endpoints**: Create, update, delete posts (admin only)
- **JWT authentication**: Secure token-based login
- **MongoDB integration**: Persistent data storage
- **CORS support**: Cross-origin request handling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Password Hash

Run the password hash generator with your desired admin password:

```bash
npm run generate-hash mySecurePassword123
```

This will output the environment variables you need to set.

### 3. Set Environment Variables

Set these environment variables in your hosting platform (Netlify, Vercel, etc.) or create a `.env` file:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<hash-from-step-2>
JWT_SECRET=<random-secret-from-step-2>
MONGODB_URI=<your-mongodb-connection-string>
```

**⚠️ Security Notes:**
- Never commit `.env` files to version control
- Use strong, unique passwords
- Generate a random JWT_SECRET for production
- Consider changing the default admin username

## API Endpoints

### Public Endpoints (No Auth Required)

#### GET `/api/blog/list-posts`
List all posts with optional filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Posts per page (default: 10, max: 100)
- `published` (optional): Filter by published status (`true`/`false`)
- `tag` (optional): Filter by specific tag
- `search` (optional): Search in title, content, and excerpt

**Example:**
```bash
curl "https://your-domain.com/api/blog/list-posts?page=1&pageSize=5&published=true"
```

#### GET `/api/blog/get-post`
Get a single post by ID or slug.

**Query Parameters:**
- `id` (optional): Post ID
- `slug` (optional): Post slug

**Example:**
```bash
curl "https://your-domain.com/api/blog/get-post?slug=my-blog-post"
```

### Protected Endpoints (Auth Required)

#### POST `/api/auth/login`
Authenticate and get JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

#### POST `/api/blog/create-post`
Create a new blog post.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "My Blog Post",
  "content": "This is the content of my blog post...",
  "excerpt": "A brief summary of the post",
  "tags": ["technology", "programming"],
  "published": false,
  "coverImageUrl": "https://example.com/image.jpg"
}
```

#### PUT/PATCH `/api/blog/update-post`
Update an existing blog post.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "id": "post-id-here",
  "title": "Updated Title",
  "content": "Updated content...",
  "newSlug": "updated-slug"
}
```

#### DELETE `/api/blog/delete-post`
Delete a blog post.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `id` (optional): Post ID
- `slug` (optional): Post slug

## Usage Examples

### 1. Login and Get Token

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

### 2. Create a Post

```bash
curl -X POST https://your-domain.com/api/blog/create-post \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "Hello, world!",
    "published": true
  }'
```

### 3. Update a Post

```bash
curl -X PUT https://your-domain.com/api/blog/update-post \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "post-id-here",
    "title": "Updated Title"
  }'
```

### 4. Delete a Post

```bash
curl -X DELETE "https://your-domain.com/api/blog/delete-post?id=post-id-here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## File Structure

```
assets/js/functions/
├── auth/
│   └── login.js              # Login endpoint
├── blog/
│   ├── create-post.js        # Create post (protected)
│   ├── update-post.js        # Update post (protected)
│   ├── delete-post.js        # Delete post (protected)
│   ├── get-post.js           # Get single post (public)
│   └── list-posts.js         # List posts (public)
├── models/
│   └── post.js               # Post schema
└── utils/
    ├── auth.js               # Authentication utilities
    └── db.js                 # Database connection
```

## Security Features

- **JWT tokens**: Secure, time-limited authentication
- **Password hashing**: Bcrypt with 12 salt rounds
- **Protected routes**: Admin-only access to sensitive operations
- **CORS headers**: Proper cross-origin request handling
- **Input validation**: Request parameter validation
- **Error handling**: Secure error responses

## Deployment

Deploy to your preferred serverless platform:

- **Netlify Functions**: Place functions in `netlify/functions/`
- **Vercel**: Functions will be automatically detected
- **AWS Lambda**: Use appropriate deployment tools

Remember to set all environment variables in your hosting platform's dashboard.
