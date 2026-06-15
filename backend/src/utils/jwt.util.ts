import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload, expiresIn: any = '15m'): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload: TokenPayload, expiresIn: any = '30d'): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};
