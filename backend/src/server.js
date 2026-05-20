import mongoose from 'mongoose';
import dotenv from 'dotenv';

import app from './app.js';

process.on('uncaughtException', (err) => {
  console.log('Uncaught Expection Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log('DB connected!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandler Rejection Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
