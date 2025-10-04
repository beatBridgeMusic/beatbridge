import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import songsRoutes from './routes/songsRoutes.js';
import authRouter from './routes/authRoutes';
import spotifyAuthRouters from './routes/spotifyAuthRoutes.js'

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICEROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use('/songs', songsRoutes);
app.use('/auth', authRouter);
app.use('/spotifyAuth', spotifyAuthRouters);

// catch-all route handler for any requests to an unknown route
app.use((req, res) => {
  res.sendStatus(404);
});

// express global error handler
app.use((err, req, res, next) => {
  console.log('logging err:', err);
  // defaultErr object
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);

  return res.status(errorObj.status).send(errorObj.message);
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

export default app;
