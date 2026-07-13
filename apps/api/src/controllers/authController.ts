import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'database';
import { RegisterInputSchema, LoginInputSchema } from 'shared';
import { sendOTP } from '../services/emailService';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-local-dev-only';

export const register = async (req: Request, res: Response) => {
  try {
    const data = RegisterInputSchema.parse(req.body);
    
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      if (existing.isEmailVerified) {
        return res.status(400).json({ error: 'Email already in use' });
      } else {
        // Resend OTP for unverified user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            verificationToken: await bcrypt.hash(otp, 10),
            verificationTokenExpiresAt,
          }
        });

        await sendOTP(existing.email, otp);
        return res.status(200).json({ message: 'OTP sent to your email. Please verify.' });
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const role = data.email === 'manasaditya7907@gmail.com' ? 'PLATFORM_ADMIN' : 'CITIZEN';

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const verificationToken = await bcrypt.hash(otp, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        role,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpiresAt,
      }
    });

    await sendOTP(user.email, otp);
    res.status(201).json({ message: 'Registration successful. Please verify your email with the OTP sent to you.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (!user.verificationToken || !user.verificationTokenExpiresAt) {
      return res.status(400).json({ error: 'Invalid verification state' });
    }

    if (new Date() > user.verificationTokenExpiresAt) {
      return res.status(400).json({ error: 'OTP has expired. Please register again to get a new OTP.' });
    }

    const isValidOTP = await bcrypt.compare(otp, user.verificationToken);
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      }
    });

    const token = jwt.sign({ id: updatedUser.id }, secret, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' 
    });
    res.status(200).json({ user: { id: updatedUser.id, email: updatedUser.email, firstName: updatedUser.firstName, lastName: updatedUser.lastName, role: updatedUser.role } });
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

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first before logging in' });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' 
    });
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, given_name, family_name, picture } = payload;
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create new user for Google login
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || 'User',
          lastName: family_name || '',
          passwordHash,
          isEmailVerified: true, // Google emails are already verified
          avatarUrl: picture,
        }
      });
    } else {
      // User exists, just ensure they are marked as verified since they logged in with Google
      if (!user.isEmailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true }
        });
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
};
