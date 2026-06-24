import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  if (isProduction) {
    throw new Error('JWT_SECRET is required in production.');
  }

  console.warn('JWT_SECRET is not set. Using an insecure local development secret.');
}

const signingSecret = JWT_SECRET || 'local-dev-secret';

export function createToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username },
    signingSecret,
    { expiresIn: '8h' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: '請先登入' });
  }

  try {
    req.admin = jwt.verify(token, signingSecret);
    return next();
  } catch {
    return res.status(401).json({ message: '登入已過期，請重新登入' });
  }
}
