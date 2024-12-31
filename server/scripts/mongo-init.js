// MongoDB initialization script
db = db.getSiblingDB('chat');

// Create collections with indexes
db.createCollection('users');
db.createCollection('conversations');
db.createCollection('messages');

// Create indexes for better performance
db.users.createIndex({ sub: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.conversations.createIndex({ participants: 1, isGroup: 1 });
db.conversations.createIndex({ lastMessage: 1 });

db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ senderId: 1 });

print('Database initialized successfully');
