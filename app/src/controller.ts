
import 'dotenv/config'
import type { NextFunction, Request, Response } from 'express';


const controller = {
  
  create: async (_req: Request, res: Response, next: NextFunction) => {



    try {
      const response: unknown = process.env.TEST;
      res.status(200).send(response);
      
    } catch (e: unknown) {
      next(e);
    }
  },

  query: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const response: unknown = 'query';
      res.status(200).send(response);
      
    } catch (e: unknown) {
      next(e);
    }
  }

};

export default controller;
