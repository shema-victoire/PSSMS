require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('All env variables:', process.env); 