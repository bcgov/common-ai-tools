// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { NextFunction, Request, Response } from 'express';

import controller  from './controller';

// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3000;

// Define a route for the root path ('/')
app.get('/', (req: Request, res: Response) => {
  res.send('');
});

app.get('/create', (req: Request, res: Response, next: NextFunction): void => {
  controller.create(req, res, next);
});



// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});