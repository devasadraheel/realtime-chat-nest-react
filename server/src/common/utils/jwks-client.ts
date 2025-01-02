import * as jwksClient from 'jwks-client';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  aud: string;
  iss: string;
  token_use: 'id' | 'access';
  exp: number;
  iat: number;
}

export class JwksService {
  private client: jwksClient.JwksClient;

  constructor() {
    this.client = jwksClient({
      jwksUri: process.env.JWKS_URI || '',
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      cacheMaxEntries: 5,
    });
  }

  async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
          return;
        }
        const signingKey = key?.getPublicKey();
        if (!signingKey) {
          reject(new Error('Unable to find a signing key'));
          return;
        }
        resolve(signingKey);
      });
    });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      throw new Error('Invalid token format');
    }

    const signingKey = await this.getSigningKey(decoded.header.kid);
    
    const payload = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }) as JwtPayload;

    // Validate token_use for Clerk tokens
    if (payload.token_use !== 'id' && payload.token_use !== 'access') {
      throw new Error('Invalid token_use');
    }

    return payload;
  }
}
