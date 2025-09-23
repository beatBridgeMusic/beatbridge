import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
