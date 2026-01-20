import { Request, Response } from 'express';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, AuthRequest } from '../services/authServices';

class UserController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }

      // Create new user
      const user = await User.create({ email: email.toLowerCase(), password });

      // Generate tokens
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      // Update user with refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Return user data (without password) and tokens
      return res.status(201).json({
        user: {
          _id: user._id,
          email: user.email,
          refreshToken: user.refreshToken,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password (plain text comparison since no encryption)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      // Update refresh token in user document
      user.refreshToken = refreshToken;
      await user.save();

      // Return user data (without password) and tokens
      return res.json({
        user: {
          _id: user._id,
          email: user.email,
          refreshToken: user.refreshToken,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Clear refresh token from user document
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }

      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      // Find user by refresh token
      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res.status(403).json({ error: 'Refresh token not found' });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user._id.toString());

      // Optionally, rotate refresh token (generate new one)
      const newRefreshToken = generateRefreshToken(user._id.toString());
      user.refreshToken = newRefreshToken;
      await user.save();

      return res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

export default UserController;
