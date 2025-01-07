# Realtime Chat App

A production-ready real-time chat application featuring private & group chat, online/offline presence, typing indicators, read receipts, and MongoDB persistence.

## 🚀 Features

- **Authentication**: JWT Authentication via Clerk Hosted UI (PKCE)
- **Real-time Messaging**: Socket.io powered instant messaging
- **Conversations**: Private 1:1 and Group conversations with admin controls
- **Presence System**: Online/offline status with lastSeen timestamps
- **Typing Indicators**: Real-time typing status for all participants
- **Read Receipts**: Visual confirmation of message delivery and read status
- **Message Pagination**: Cursor-based pagination for efficient loading
- **Optimistic UI**: Instant message sending with server confirmation
- **Multi-tab Support**: Seamless experience across multiple browser tabs

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite for fast development
- **TailwindCSS** for utility-first styling
- **Zustand** for lightweight client state management
- **React Query** for server state caching and synchronization
- **Zod** for runtime type validation
- **Axios** for HTTP client with automatic token handling
- **Socket.io Client** for real-time communication
- **Clerk** for authentication and user management

### Backend
- **NestJS** with Express for scalable server architecture
- **Socket.io** for WebSocket gateway and real-time features
- **MongoDB** with Mongoose for data persistence
- **Zod** for request/response validation
- **JWKS** for JWT token verification (Clerk integration)
- **TypeScript** for type safety across the stack

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally on port 27017)
- **Clerk Account** for authentication

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd realtime-chat-nest-react
```

### 2. Environment Configuration

```bash
# Copy environment files
cp server/env.example server/.env
cp client/env.example client/.env
```

Update the environment files with your configuration:

**Server (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/realtime-chat

# JWT Configuration (Clerk)
JWT_ISSUER=https://your-clerk-domain.clerk.accounts.dev
JWT_AUDIENCE=your-clerk-audience
JWKS_URI=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Client (.env):**
```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
VITE_CLERK_DOMAIN=your-clerk-domain.clerk.accounts.dev

# API Configuration
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## 📁 Project Structure

```
/realtime-chat-nest-react
├── /server                    # NestJS Backend
│   ├── /src
│   │   ├── /common            # Shared utilities
│   │   │   ├── /pipes         # Zod validation pipe
│   │   │   ├── /guards        # JWT auth guard
│   │   │   ├── /utils         # JWKS client, helpers
│   │   │   └── /schemas       # Zod schemas
│   │   ├── /modules
│   │   │   ├── /auth          # Auth endpoints
│   │   │   ├── /users         # User management
│   │   │   ├── /conversations # Chat conversations
│   │   │   ├── /messages      # Message handling
│   │   │   ├── /presence      # Online status
│   │   │   └── /ws            # Socket.io gateway
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
├── /client                    # React Frontend
│   ├── /src
│   │   ├── /lib               # API client, schemas, auth
│   │   ├── /store             # Zustand stores
│   │   ├── /components        # UI components
│   │   ├── /pages             # Route pages
│   │   ├── /features          # Custom hooks
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔧 Development

### Available Scripts

**Server:**
```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Client:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### API Endpoints

**Authentication:**
- `GET /api/users/me` - Get current user profile
- `POST /api/users/me` - Create/update user profile
- `GET /api/users/search` - Search users

**Conversations:**
- `GET /api/conversations` - List user conversations
- `POST /api/conversations/private` - Create private chat
- `POST /api/conversations/group` - Create group chat
- `GET /api/conversations/:id` - Get conversation details
- `PATCH /api/conversations/:id` - Update conversation

**Messages:**
- `GET /api/conversations/:id/messages` - Get messages (paginated)
- `POST /api/conversations/:id/messages` - Send message
- `POST /api/conversations/:id/messages/read` - Mark as read
- `GET /api/conversations/:id/messages/unread-count` - Get unread count

### WebSocket Events

**Client → Server:**
- `chat:join` - Join conversation room
- `chat:leave` - Leave conversation room
- `message:send` - Send message
- `message:typing` - Send typing status
- `message:read` - Mark messages as read

**Server → Client:**
- `presence:update` - User presence change
- `message:new` - New message received
- `message:ack` - Message delivery confirmation
- `message:typing` - Typing indicator
- `conversation:update` - Conversation updated

## 🚀 Deployment

### Environment Variables

Ensure all environment variables are properly configured for production:

- Update CORS origins
- Use production MongoDB connection string
- Configure Clerk production keys
- Set appropriate JWT settings

### Build and Deploy

```bash
# Build both applications
cd server && npm run build
cd ../client && npm run build

# Deploy server (example with PM2)
pm2 start dist/main.js --name "chat-server"

# Deploy client (example with Nginx)
# Serve the client/dist folder with your web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) for the amazing Node.js framework
- [React](https://reactjs.org/) for the UI library
- [Socket.io](https://socket.io/) for real-time communication
- [Clerk](https://clerk.com/) for authentication
- [TailwindCSS](https://tailwindcss.com/) for styling