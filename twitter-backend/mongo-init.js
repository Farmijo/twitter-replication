// mongo-init.js
db = db.getSiblingDB('twitterdb');

db.createUser({
  user: 'apiuser',
  pwd: 'apipassword',
  roles: [
    {
      role: 'readWrite',
      db: 'twitterdb'
    }
  ]
});

// Crear colecciones iniciales
db.createCollection('users');
db.createCollection('tweets');

print('Database initialized successfully!');