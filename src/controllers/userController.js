// src/controllers/userController.js
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { MAIL, MAIL_PASSWORD, JWT_SECRET } from '../config.js';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email déjà utilisé par d\'autre utlisateur ' })
        }

        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Nom d\'utilisateur déjà utilisé' })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function login(req, res) {
    try {
        const user = await User.findOne({
            $or: [
                { username: req.body.usernameOrEmail },
                { email: req.body.usernameOrEmail }
            ]
        });
        if (!user) {
            return res.status(400).json({ error: 'Utilisateur non trouvé' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Mot de passe incorrect!' });
        }
        // Generate a JWT token
        const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Send the token to the client
        res.status(200).json({ message: 'User logged in successfully', token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


export async function forgotPassword(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ error: 'Utilisateur no trouvé' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordCode = verificationCode;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure

        await user.save();

        // Générer un code de vérification aléatoire à 6 chiffres

        const transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: MAIL,
                pass: MAIL_PASSWORD
            }
        });

        const mailOptions = {
            to: user.email,
            from: MAIL,
            subject: 'Réinitialisation du mot de passe',
            text: `Vous recevez cet e-mail parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe pour votre compte.\n\n
            Votre code de vérification est : ${verificationCode}\n\n
            Entrez ce code dans l'application pour réinitialiser votre mot de passe.\n\n
            Si vous n'avez pas demandé cela, veuillez ignorer cet e-mail et votre mot de passe restera inchangé.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'E-mail de réinitialisation de mot de passe envoyé' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, verificationCode, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Utilisateur non trouvé' });
        }

        if (user.resetPasswordCode !== verificationCode || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: 'Code de vérification invalide ou expiré' });
        }

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}