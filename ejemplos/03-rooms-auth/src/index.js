// ============================================================
// index.js — Rooms + autenticación JWT
// npm install → npm run dev
// Necesita un token de tu API de auth (clases 3-4) para conectar.
// ============================================================

require("dotenv").config();
const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./middlewares/socketAuth");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });

// Middleware: sin token válido, no hay conexión
io.use(socketAuth);

io.on("connection", (socket) => {
  const { email, rol } = socket.user;
  console.log(`✅ ${email} (${rol}) conectado`);

  // Los admins entran automáticamente a un room especial
  if (rol === "admin") {
    socket.join("admins");
    socket.emit("info", "Sos admin: unido al room 'admins'");
  }

  // Cualquier usuario puede reportar → solo los admins lo ven
  socket.on("reporte", (texto) => {
    io.to("admins").emit("reporte:nuevo", {
      de: email,
      texto,
      hora: new Date().toLocaleTimeString(),
    });
    socket.emit("info", "Reporte enviado a los admins");
  });

  // Room por usuario: para notificaciones dirigidas
  // Cada usuario tiene su propio room con su userId
  socket.join(`user:${socket.user.userId}`);

  // Mandar una notificación a un usuario específico
  socket.on("notificar", ({ paraUserId, mensaje }) => {
    io.to(`user:${paraUserId}`).emit("notificacion", {
      de: email,
      mensaje,
    });
  });

  socket.on("disconnect", () => console.log(`❌ ${email} desconectado`));
});

server.listen(3003, () => {
  console.log("\n⚡ http://localhost:3003");
  console.log("Auth: handshake.auth.token con JWT de tu API de login");
  console.log("Eventos: reporte (texto) / notificar ({paraUserId, mensaje})");
  console.log("Escuchar: info / reporte:nuevo / notificacion");
  console.log("\n💡 Conectá con un token de admin y otro de user para probar.");
});
