import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'database';
import { RegisterInputSchema, LoginInputSchema } from 'shared';

const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-local-dev-only';

export const register = async (req: Request, res: Response) => {
  try {
    const data = RegisterInputSchema.parse(req.body);
    
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    
    // Assign admin role to specific email
    const role = data.email === 'manasaditya7907@gmail.com' ? 'PLATFORM_ADMIN' : 'CITIZEN';

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        role,
      }
    });

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '7d' });
    
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(201).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = LoginInputSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '7d' });
    
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const me = async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.status(200).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
};

export const logout = async (req: Request, res: Response) => {
  res.cookie('token', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
