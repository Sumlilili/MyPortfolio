import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { expressjwt } from "express-jwt";
import config from './../../config/config.js';

const signin = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ error: "User not found" });

    if (!user.authenticate(req.body.password)) {
      return res.status(401).json({ error: "Email and password don't match." });
    }

    const token = jwt.sign({ _id: user._id }, config.jwtSecret);
    res.cookie('t', token, { expire: new Date() + 9999 });

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // ✅ include role
      }
    });
  } catch (err) {
    return res.status(401).json({ error: "Could not sign in" });
  }
};

const signout = (req, res) => {
  res.clearCookie("t");
  return res.status(200).json({ message: "signed out" });
};

// Middleware to check if user is signed in
const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  userProperty: 'auth'
});

// Middleware to check if the user is authorized (self-access only)
const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!authorized) {
    return res.status(403).json({ error: "User is not authorized" });
  }
  next();
};

// ✅ NEW: Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to check admin status" });
  }
};

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization,
  isAdmin
};
