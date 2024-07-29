import express, { NextFunction, Request, Response } from 'express';

import controller  from './controller';

// Create an Express application
const app = express();
const port: number = 3000;
// handle json in request body
app.use(express.json());

// -------- routes
app.get('/', (req: Request, res: Response) => {
  res.send('');
});

app.put('/create', (req: Request, res: Response, next: NextFunction): void => {
  controller.create(req, res, next);
});

app.get('/query', (req: Request, res: Response, next: NextFunction): void => {
  controller.query(req, res, next);
});

// ---------- Start server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});