// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js'; // Assurez-vous que JWT_SECRET est défini dans config.js

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Suppose que le token est dans le format "Bearer <token>"

    if (token == null) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalid' });

        req.user = user;
        next();
    });
}
