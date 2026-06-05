import { NextFunction, Request, Response } from 'express';
import config from '../../config';
import { jwtHelper } from '../../helpers/jwtHelper';
import { debug } from '../../shared/debug';

const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenWithBearer = req.headers.authorization;

    if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
      const token = tokenWithBearer.split(' ')[1];

      try {
        // verify token
        const verifyUser = jwtHelper.verifyToken(
          token,
          config.jwt.jwt_secret as string
        );
        debug('optionalAuth', {
          path: req.originalUrl,
          role: verifyUser.role,
        });
        // set user to req object
        req.user = verifyUser;
      } catch (err) {
        // Token is invalid or expired, ignore and proceed as guest
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export default optionalAuth;
