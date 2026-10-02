# 🥋 Ejercicios — Clase 11

---

## 🥋 Ejercicio 1 — Contador de conectados en vivo (15 min)

En el ejemplo `02-eventos-broadcast`, agregá:
- Al conectar/desconectar un cliente, emitir a TODOS el evento `usuarios:total` con el número actual.
- El cliente React (o Postman) muestra el contador en vivo.

**Criterios ✅**
- [ ] Abrir una pestaña nueva sube el contador en TODAS las pestañas.
- [ ] Cerrar una pestaña lo baja.

---

## 🥋 Ejercicio 2 — Room por rol (20 min)

En el ejemplo `03-rooms-auth`:
- Al conectar, unir cada socket a un room según su rol: `rol:user` o `rol:admin`.
- Crear el evento `anuncio:admins` que solo un admin puede emitir (verificar `socket.user.rol`) y que llega solo al room `rol:user`.
- Si un user intenta emitirlo → responderle `error: "Solo admins"`.

**Criterios ✅**
- [ ] Admin emite anuncio → todos los users lo reciben.
- [ ] User intenta emitir → recibe error, nadie más recibe nada.

---

## 🥋 Ejercicio 3 — useSocket en tu proyecto (25 min)

Integrá el hook `useSocket` del live coding a tu proyecto de React:
- El token sale de tu store de Zustand (no de un input).
- Mostrá un indicador de conexión (🟢/🔴) en el header.
- Escuchá un evento `notificacion` y mostralo como toast/alerta.

**Criterios ✅**
- [ ] Al loguearte, el socket conecta solo.
- [ ] Al desloguearte, el socket se desconecta.
- [ ] Sin listeners duplicados (revisar que los mensajes no llegan repetidos).
