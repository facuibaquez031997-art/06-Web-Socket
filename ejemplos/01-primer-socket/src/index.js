// ============================================================
// index.js — Primer socket: conexión + emit + on
// npm install → npm run dev
// Probalo con Postman: New → Socket.io → http://localhost:3001
// ============================================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // ← Express adentro del server HTTP
const io = new Server(server, { cors: { origin: "*" } });

app.get("/health", (req, res) => res.json({ status: "ok" }));

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  // Saludo inicial SOLO a este cliente
  socket.emit("bienvenida", {
    mensaje: "Conectado al servidor ⚡",
    tuId: socket.id,
  });

  // Escuchar el evento "ping" del cliente
  socket.on("ping", (data) => {
    console.log("📨 ping recibido:", data);
    socket.emit("pong", { recibido: data, hora: new Date().toISOString() });
  });

  // Eco: devuelve lo que le mandes
  socket.on("eco", (texto) => {
    socket.emit("eco", `ECO: ${texto}`);
  });

  socket.on("disconnect", (motivo) => {
    console.log("❌ Desconectado:", socket.id, "→", motivo);
  });
});

server.listen(3001, () => {
  console.log("\n⚡ Socket.io en http://localhost:3001");
  console.log("Eventos: ping (con data) / eco (con texto)");
  console.log("Escuchá: bienvenida / pong / eco");
});
