# TaskBot Telegram

Asistente personal de tareas y recordatorios mediante un bot de Telegram.

## Stack principal

- Telegram Bot API
- Telegraf.js
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- node-cron
- dayjs
- Postman
- Render
- Git + GitHub

## Objetivo de la versión 1.0

Construir una primera versión funcional que permita:

1. Crear tareas desde Telegram.
2. Usar un menú principal con botones interactivos.
3. Listar tareas pendientes.
4. Ver tareas del día.
5. Ver tareas vencidas.
6. Ver detalle de una tarea.
7. Editar tareas existentes.
8. Marcar tareas como completadas.
9. Eliminar tareas con confirmación.
10. Posponer tareas.
11. Enviar recordatorios automáticos con botones de acción.
12. Registrar fecha de completado.
13. Evitar recordatorios duplicados.
14. Probar endpoints desde Postman.
15. Desplegar el backend en Render.

## Entorno de desarrollo

En desarrollo local se usará polling.

## Entorno de producción

En producción se usará webhook mediante Render.

## Variables de entorno

Crear un archivo `.env` basado en `.env.example`.

```env
PORT=3000
NODE_ENV=development
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=your_mongodb_atlas_uri_here
APP_URL=http://localhost:3000
TIMEZONE=America/Lima