# ✅ Soluciones — Clase 11

## Ejercicio 1 — Contador

```js
let conectados = 0;

io.on("connection", (socket) => {
  conectados++;
  io.emit("usuarios:total", conectados);   // a TODOS, incluido el nuevo

  socket.on("disconnect", () => {
    conectados--;
    io.emit("usuarios:total", conectados);
  });
});
```

Alternativa sin contador manual: `io.engine.clientsCount`.

## Ejercicio 2 — Room por rol

```js
io.on("connection", (socket) => {
  socket.join(`rol:${socket.user.rol}`);

  socket.on("anuncio:admins", (texto) => {
    if (socket.user.rol !== "admin") {
      return socket.emit("error", "Solo admins pueden emitir anuncios");
    }
    io.to("rol:user").emit("anuncio", { texto, de: socket.user.email });
  });
});
```

**Punto clave:** la verificación del rol se hace EN el evento, no solo al conectar. El token ya fue verificado en el handshake, así que `socket.user.rol` es confiable.

## Preguntas de defensa

1. *"¿Por qué el contador se rompe si usás `socket.broadcast.emit` en la conexión?"*
   Porque el cliente nuevo no recibiría el total actualizado — solo los demás. El nuevo vería el contador viejo hasta el próximo cambio.

2. *"¿Se puede confiar en `socket.user.rol`?"*
   Sí, porque viene del JWT verificado con el secreto en el handshake. El cliente no puede modificarlo sin invalidar la firma.
