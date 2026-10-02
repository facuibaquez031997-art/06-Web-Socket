// ============================================================
// index.js — Los 3 tipos de emit + rooms básicos
// npm install → npm run dev
// Conectá DOS clientes de Postman para ver la diferencia.
// ============================================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let contador = 0; // clientes conectados

function socketAuth(socket, next) {
  console.log(socket.handshake);
  const token = socket.handshake.headers.token;

  console.log(token);

  if (!token) return next(new Error("Token requerido"));

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = {
      user: "Martin Garmendi",
      casa: "quinta",
    };
    next();
  } catch (err) {
    next(new Error("Token inválido o expirado"));
  }
}

io.use(socketAuth);

io.on("connection", (socket) => {
  contador++;
  console.log(`✅ Conectado ${socket.id} (total: ${contador})`);

  // ── LOS 3 EMITS ────────────────────────────────────────────

  // 1. Solo a ESTE cliente
  socket.on(" ", (texto) => {
    socket.emit("mensaje", { tipo: "privado", texto: `Solo vos: ${texto}` });
  });

  // 2. A TODOS (incluido el emisor)
  socket.on("emit:global", (texto) => {
    io.emit("mensaje", { tipo: "global", texto: `Para todos: ${texto}` });
  });

  // 3. A todos MENOS el emisor
  socket.on("emit:broadcast", (texto) => {
    socket.broadcast.emit("mensaje", {
      tipo: "broadcast",
      texto: `Aviso: ${texto}`,
    });
  });

  // ── ROOMS ──────────────────────────────────────────────────

  socket.on("room:unirse", (room) => {
    socket.join(room);
    socket.emit("mensaje", { tipo: "room", texto: `Entraste a "${room}"` });
    socket
      .to(room)
      .emit("mensaje", { tipo: "room", texto: `Alguien entró a "${room}"` });
  });

  socket.on("room:mensaje", ({ room, texto }) => {
    // io.to(room)     → todos en el room (incluido yo)
    // socket.to(room) → todos en el room MENOS yo
    io.to(room).emit("mensaje", { tipo: "room", room, texto });
  });

  socket.on("room:listar", () => {
    // socket.rooms es un Set: incluye el propio socket.id + los rooms unidos
    socket.emit("mensaje", { tipo: "info", rooms: [...socket.rooms] });
  });

  socket.on("disconnect", () => {
    contador--;
    console.log(`❌ Desconectado ${socket.id} (total: ${contador})`);
  });
});

server.listen(3002, () => {
  console.log("\n⚡ http://localhost:3002");
  console.log(
    "Emitir: emit:privado / emit:global / emit:broadcast (con texto)",
  );
  console.log("Rooms:  room:unirse / room:mensaje / room:listar");
  console.log("Escuchar: mensaje");
  console.log("\n💡 Conectá 2 clientes de Postman para ver las diferencias.");
});
