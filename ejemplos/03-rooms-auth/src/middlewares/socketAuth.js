// ============================================================
// socketAuth.js — Autenticación JWT para Socket.io
// ============================================================

const jwt = require("jsonwebtoken");

function socketAuth(socket, next) {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Token requerido"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Token inválido o expirado"));
  }
}

module.exports = socketAuth;
