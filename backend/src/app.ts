import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import config from './config';

const app = express();

//security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

//gzip compression
app.use(compression());

//body parser
app.use(
  cors({
    origin: config.cors_origin || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

import path from 'path';

//file retrieve
app.use(express.static(path.join(process.cwd(), 'uploads')));
app.use('/image', express.static(path.join(process.cwd(), 'uploads')));
app.use('/media', express.static(path.join(process.cwd(), 'uploads')));
app.use('/file', express.static(path.join(process.cwd(), 'uploads')));
app.use('/doc', express.static(path.join(process.cwd(), 'uploads')));

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
