# 🏠 Tarea — Clase 07

**Entrega:** antes de la Clase 07 (miércoles).

## ✅ Lo que tiene que tener

1. Tu backend tiene Socket.io montado (server.listen, CORS al frontend).
2. El socket se autentica con el MISMO JWT del login.
3. Conexión sin token → rechazada con `connect_error`.
4. Cada usuario entra automáticamente a su room `user:{userId}`.
5. Tu frontend tiene el hook `useSocket` conectado al store de auth.
6. Indicador de conexión visible en la UI.

## 🗣️ En la Clase 12

Mostrás: dos pestañas con usuarios distintos, evento emitido de una llega a la otra en vivo, y el rechazo de conexión sin token en Postman.
