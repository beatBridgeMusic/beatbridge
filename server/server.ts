import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import songsRoutes from './routes/songsRoutes.js';

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

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

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
