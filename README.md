# Realtime Chat App

A production-ready real-time chat application featuring private & group chat, online/offline presence, typing indicators, read receipts, and MongoDB persistence.

## Tech Stack

### Frontend
- React (Vite)
- TailwindCSS
- Zustand (client state)
- React Query (server cache)
- Zod (client schemas)
- Axios
- Clerk (authentication)

### Backend
- NestJS (Express)
- Socket.io (Gateway)
- MongoDB (Mongoose)
- Zod (validation)
- JWT verification (Clerk)

## Features

- JWT Authentication via Clerk Hosted UI (PKCE)
- Private 1:1 and Group conversations
- Real-time messaging with Socket.io
- Online/offline presence with lastSeen
- Typing indicators
- Read receipts
- Message pagination (cursor-based)
- Optimistic UI updates
- Multi-tab awareness

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally on port 27017)

## Quick Start

1. Clone the repository
2. Copy environment files:
   ```bash
   cp server/env.example server/.env
   cp client/env.example client/.env
   ```
3. Install dependencies:
   ```bash
   # Server
   cd server && npm install
   
   # Client
   cd client && npm install
   ```
4. Start development servers:
   ```bash
   # Server (port 4000)
   cd server && npm run start:dev
   
   # Client (port 5173)
   cd client && npm run dev
   ```

## Project Structure

```
/realtime-chat
  /server          # NestJS backend
  /client          # React frontend
  docker-compose.yml
  README.md
```
