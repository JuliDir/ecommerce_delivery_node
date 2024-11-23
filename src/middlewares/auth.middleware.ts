import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '@config/index';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    const authResponse = await axios.get(`${config.SECURITY_URL}${config.CURRENT_USER}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (authResponse.status === 200) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
