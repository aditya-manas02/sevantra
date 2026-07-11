"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("database");
const shared_1 = require("shared");
const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-local-dev-only';
const register = async (req, res) => {
    try {
        const data = shared_1.RegisterInputSchema.parse(req.body);
        const existing = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 12);
        // Assign admin role to specific email
        const role = data.email === 'manasaditya7907@gmail.com' ? 'PLATFORM_ADMIN' : 'CITIZEN';
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                passwordHash,
                role,
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, secret, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.status(201).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const data = shared_1.LoginInputSchema.parse(req.body);
        const user = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const valid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, secret, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.status(200).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.login = login;
const me = async (req, res) => {
    const user = req.user;
    res.status(200).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
};
exports.me = me;
const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
