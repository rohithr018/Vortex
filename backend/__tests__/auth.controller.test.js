import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth.routes.js';
import User from '../models/user.model.js';

// Create an express app to use routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock User model
jest.mock('../models/user.model.js');

describe('Auth Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Register User', () => {
        it('should register user successfully', async () => {
            User.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue();

            const response = await request(app).post('/api/auth/register').send({
                username: 'john',
                fullname: 'John Doe',
                password: 'secret123',
                githubProfile: 'johndoe',
                email: 'john@example.com',
            });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User registered successfully');
        });

        it('should return 400 if email exists', async () => {
            User.findOne.mockImplementation(({ email }) =>
                email ? { email: 'exists' } : null
            );

            const response = await request(app).post('/api/auth/register').send({
                username: 'john2',
                fullname: 'John2',
                password: 'secret123',
                githubProfile: 'johndoe2',
                email: 'john@example.com',
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/email already exists/i);
        });
    });

    describe('Login User', () => {
        it('should login successfully', async () => {
            const hashedPassword = await bcrypt.hash('secret123', 10);
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                email: 'john@example.com',
                password: hashedPassword,
                _doc: {
                    username: 'john',
                    fullname: 'John Doe',
                    githubProfile: 'johndoe',
                    email: 'john@example.com',
                },
            };

            User.findOne.mockResolvedValue(mockUser);
            jwt.sign = jest.fn().mockReturnValue('fake-jwt-token');

            const response = await request(app).post('/api/auth/login').send({
                email: 'john@example.com',
                password: 'secret123',
            });

            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/login successful/i);
            expect(response.body.token).toBe('fake-jwt-token');
        });

        it('should return 404 if user not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app).post('/api/auth/login').send({
                email: 'nouser@example.com',
                password: 'secret123',
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toMatch(/no user found/i);
        });

        it('should return 401 if password is wrong', async () => {
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                email: 'john@example.com',
                password: await bcrypt.hash('correctpass', 10),
                _doc: { username: 'john' },
            };

            User.findOne.mockResolvedValue(mockUser);

            const response = await request(app).post('/api/auth/login').send({
                email: 'john@example.com',
                password: 'wrongpass',
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toMatch(/wrong password/i);
        });
    });
});
