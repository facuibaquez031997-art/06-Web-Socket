# ⚡ Clase 11 — Socket.io: Fundamentos de tiempo real

> **Módulo 3 · Backend con Node.js** · Lunes 11 de agosto 2026
> Duración: 2 horas · Hoy el servidor le habla al cliente sin que se lo pidan.

---

## 🧒 La pregunta que abre la clase

> *"Cuando alguien te manda un mensaje de WhatsApp, ¿tu teléfono le pregunta al servidor cada segundo 'hay mensajes nuevos? ¿y ahora? ¿y ahora?'"*

No. El servidor **le avisa al teléfono** cuando llega un mensaje. Esa es la diferencia fundamental:

- **HTTP:** el cliente pregunta, el servidor responde. El servidor NUNCA inicia la conversación.
- **WebSocket:** se abre un canal permanente. **Cualquiera de los dos puede hablar en cualquier momento.**

> 🧒 **Feynman:** HTTP es mandar cartas — escribís, mandás, esperás respuesta. WebSocket es una llamada telefónica — la línea queda abierta y ambos hablan cuando quieren.

---

## 🎯 Objetivo de la clase

1. Explicar la diferencia entre HTTP y WebSocket.
2. Instalar y configurar **Socket.io** sobre Express.
3. Usar **emit** y **on** para mandar y escuchar eventos.
4. Diferenciar `socket.emit`, `io.emit` y `socket.broadcast.emit`.
5. Agrupar usuarios en **rooms**.
6. **Autenticar el socket con JWT** (el mismo del login).
7. Conectar Socket.io desde **React** con un hook `useSocket`.

---

## 🗂️ Estructura del repo

```
backend-clase-11/
├── README.md                    ← Estás acá
├── LIVE-CODING.md               ← Paso a paso para codear en vivo
├── EJERCICIOS.md
├── SOLUCIONES.md
├── tarea/TAREA.md
└── ejemplos/
    ├── 01-primer-socket/        ← Conexión mínima + emit/on
    ├── 02-eventos-broadcast/    ← Los 3 tipos de emit
    └── 03-rooms-auth/           ← Rooms + autenticación JWT
```

---

## ⏱️ Agenda (2 horas)

| Tiempo | Bloque | Dónde |
|---|---|---|
| 0:00 – 0:15 | **Modelo mental** — HTTP vs WS, cuándo usar cada uno | README |
| 0:15 – 0:35 | **Primer socket** — conexión, emit, on | `01-primer-socket` |
| 0:35 – 0:55 | **Broadcast y rooms** | `02` + `03` |
| 0:55 – 1:00 | Pausa ☕ | |
| 1:00 – 1:50 | **Live coding** — server + auth JWT + cliente React | `LIVE-CODING.md` |
| 1:50 – 2:00 | Cierre | |

---

# 📚 TEORÍA

## 1. HTTP vs WebSocket

| | HTTP | WebSocket |
|---|---|---|
| **Quién inicia** | Solo el cliente | Cualquiera de los dos |
| **Conexión** | Se abre y cierra por request | Queda abierta |
| **Formato** | Request/Response | Mensajes bidireccionales |
| **Ideal para** | CRUD, APIs REST | Chat, notificaciones, juegos, dashboards en vivo |
| **Overhead** | Headers en cada request | Handshake una vez, después mensajes livianos |

**La regla práctica:** si el servidor necesita avisarle algo al cliente sin que el cliente pregunte → WebSocket. Todo lo demás → HTTP.

**En tu proyecto conviven los dos:** el CRUD sigue siendo HTTP (posts, productos, tarjetas). El chat y las notificaciones son WebSocket.

---

## 2. ¿Por qué Socket.io y no WebSocket puro?

El browser tiene `new WebSocket(url)` nativo. Socket.io es una capa arriba que agrega:

- **Reconexión automática** si se corta la conexión.
- **Fallback a polling** si el WebSocket está bloqueado (proxies, firewalls).
- **Rooms** — agrupar sockets sin manejarlo a mano.
- **Namespaces** — separar lógicas (chat, notificaciones).
- **Acknowledgements** — confirmar que el mensaje llegó.

```bash
npm install socket.io          # servidor
npm install socket.io-client   # cliente (React)
```

---

## 3. Setup: Socket.io + Express juntos

Socket.io necesita el **servidor HTTP crudo**, no la app de Express. Por eso cambia el `index.js`:

```js
// ANTES (solo Express):
app.listen(3000);

// AHORA (Express + Socket.io comparten servidor):
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);      // servidor HTTP con la app Express
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" } // el frontend de Vite
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
});

server.listen(3000); // ← server.listen, NO app.listen
```

> ⚠️ **Error clásico:** dejar `app.listen()` y preguntarse por qué Socket.io no conecta. Tiene que ser `server.listen()`.

---

## 4. Eventos: emit y on

Todo en Socket.io son **eventos con nombre**. Un lado emite, el otro escucha:

```js
// SERVIDOR
io.on("connection", (socket) => {
  // Escuchar un evento del cliente
  socket.on("saludo", (data) => {
    console.log("El cliente dice:", data);
    // Responderle solo a él
    socket.emit("respuesta", { mensaje: "Hola desde el server" });
  });
});
```

```js
// CLIENTE (browser / React)
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

socket.emit("saludo", { texto: "Hola server" });
socket.on("respuesta", (data) => console.log(data.mensaje));
```

Los nombres de eventos son libres — `"saludo"`, `"chat:mensaje"`, `"tarjeta:movida"`. Convención recomendada: `recurso:accion`.

---

## 5. Los 3 tipos de emit (el corazón de la clase)

```js
io.on("connection", (socket) => {

  // 1. socket.emit → SOLO a este cliente
  socket.emit("privado", "Solo vos ves esto");

  // 2. io.emit → a TODOS los clientes conectados (incluido este)
  io.emit("global", "Todos ven esto");

  // 3. socket.broadcast.emit → a TODOS MENOS este cliente
  socket.broadcast.emit("aviso", "Todos menos el emisor ven esto");
});
```

> 🧒 **Feynman con un aula:**
> - `socket.emit` = el profesor le susurra a UN alumno.
> - `io.emit` = el profesor habla por el altavoz (todos escuchan).
> - `socket.broadcast.emit` = un alumno levanta la mano y todos MENOS él se enteran ("Juan entró al aula").

**Caso típico:** cuando un usuario se conecta al chat, `socket.broadcast.emit("usuario:entro")` — todos los demás ven "Juan entró", pero Juan no necesita ese aviso.

---

## 6. Rooms — grupos de sockets

Un room es un canal con nombre al que los sockets se suscriben:

```js
io.on("connection", (socket) => {
  // Unirse a un room
  socket.on("sala:unirse", (nombreSala) => {
    socket.join(nombreSala);
    // Avisar solo a los de esa sala (menos al que entra)
    socket.to(nombreSala).emit("sala:aviso", `Alguien entró a ${nombreSala}`);
  });

  // Emitir SOLO a un room
  socket.on("sala:mensaje", ({ sala, texto }) => {
    io.to(sala).emit("sala:mensaje", texto);      // todos en la sala
    // socket.to(sala).emit(...)                  // todos en la sala MENOS yo
  });

  // Salir
  socket.on("sala:salir", (sala) => socket.leave(sala));
});
```

**En tu proyecto:** cada chat privado es un room (`chat:userA-userB`), cada proyecto es un room (`proyecto:123`), cada tablero es un room. Mover una tarjeta → `io.to("proyecto:123").emit("tarjeta:movida", ...)` — solo los miembros de ese proyecto lo reciben.

---

## 7. Autenticar el socket con JWT

El socket no manda headers `Authorization` como HTTP. Se usa el **handshake**:

```js
// CLIENTE — mandar el token al conectar
const socket = io("http://localhost:3000", {
  auth: { token: localStorage.getItem("accessToken") },
});
```

```js
// SERVIDOR — middleware de Socket.io (corre ANTES de "connection")
const jwt = require("jsonwebtoken");

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Token requerido"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;   // igual que req.user en Express
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  console.log(`✅ ${socket.user.email} conectado`);
});
```

Si el middleware llama `next(new Error(...))`, el cliente recibe el evento `connect_error` y la conexión se rechaza.

```js
// CLIENTE — manejar el rechazo
socket.on("connect_error", (err) => {
  console.error("No se pudo conectar:", err.message); // "Token requerido"
});
```

---

## 8. El hook useSocket en React

```jsx
// src/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket(token) {
  const socketRef = useRef(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Crear la conexión UNA vez
    const socket = io("http://localhost:3000", { auth: { token } });
    socketRef.current = socket;

    socket.on("connect",    () => setConectado(true));
    socket.on("disconnect", () => setConectado(false));

    // Limpiar al desmontar — clave para no duplicar conexiones
    return () => socket.disconnect();
  }, [token]);

  return { socket: socketRef.current, conectado };
}
```

```jsx
// Uso en un componente
function Chat() {
  const token = useAuthStore((s) => s.accessToken); // de Zustand
  const { socket, conectado } = useSocket(token);

  useEffect(() => {
    if (!socket) return;
    socket.on("chat:mensaje", (msg) => { /* agregar al estado */ });
    return () => socket.off("chat:mensaje"); // limpiar el listener
  }, [socket]);
}
```

> ⚠️ **Los 2 errores clásicos en React:**
> 1. Crear el socket adentro del componente sin `useEffect` → una conexión nueva en cada render.
> 2. No hacer `socket.off` al desmontar → listeners duplicados, mensajes repetidos.

---

## 9. Debug: ver qué pasa

```js
// SERVIDOR — loguear todos los eventos que llegan
socket.onAny((evento, ...args) => {
  console.log(`📥 [${socket.user?.email}] ${evento}`, args);
});
```

En el browser: DevTools → Network → WS → clic en la conexión → Messages. Ahí ves cada mensaje en vivo.

Postman también soporta Socket.io: **New → Socket.io Request** (lo usamos en el live coding).

---

## 📎 Documentación oficial

| Herramienta | Link |
|---|---|
| Socket.io server | https://socket.io/docs/v4/server-api/ |
| Socket.io client | https://socket.io/docs/v4/client-api/ |
| Rooms | https://socket.io/docs/v4/rooms/ |
| Emit cheatsheet | https://socket.io/docs/v4/emit-cheatsheet/ |

> 💡 El **emit cheatsheet** es la página más útil de toda la doc. Guardala.

---

## ✅ Checklist de salida

- [ ] Sé explicar HTTP vs WebSocket con la analogía carta vs llamada.
- [ ] Sé configurar Socket.io sobre `http.createServer(app)` con CORS.
- [ ] Distingo `socket.emit`, `io.emit` y `socket.broadcast.emit`.
- [ ] Sé unir sockets a rooms y emitir con `io.to(room)`.
- [ ] Autentiqué el socket con JWT vía `handshake.auth`.
- [ ] Sé escribir el hook `useSocket` sin duplicar conexiones.
- [ ] Probé eventos con Postman (Socket.io Request).

➡️ Abrí **`LIVE-CODING.md`** para el paso a paso.
