import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express';
const multer  = require('multer')

import controller  from './controller';

// Create an Express application
const app = express();
const port: number = 3000;
// handle json in request body
app.use(express.json());
const upload = multer({ dest: '../uploads/' })

// -------- routes
app.get('/', (req: Request, res: Response) => {
  res.send('');
});

app.put('/create/github', (req: Request, res: Response, next: NextFunction): void => {
  controller.create(req, res, next);
});

app.get('/query/github', (req: Request, res: Response, next: NextFunction): void => {
  controller.query(req, res, next);
});

app.post('/index/pdf', upload.single('pdf'), (req: Request, res: Response, next: NextFunction): void => {
  controller.upload(req, res, next);
});

app.get('/query/pdf', (req: Request, res: Response, next: NextFunction): void => {
  controller.question(req, res, next);
});

// ---------- Start server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});