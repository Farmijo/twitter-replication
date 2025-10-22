# Twitter Clone Frontend

Frontend en Next.js para una aplicación de microblogging estilo Twitter.

## Características

- 🔐 **Autenticación completa** (Login/Register con JWT)
- 🏠 **Timeline con tweets en tiempo real**
- ✍️ **Crear tweets** con validación de caracteres
- 👤 **Perfiles de usuario** completos
- 📊 **Estadísticas** (tweets, seguidores, siguiendo)
- 👥 **Sistema de seguimiento** (seguir/dejar de seguir usuarios)
- 📱 **Diseño responsive** con Tailwind CSS
- ⚡ **Optimizado con Next.js 15** y App Router

## Tecnologías

- **Framework**: Next.js 15 con App Router
- **UI**: React 19 + Tailwind CSS
- **Autenticación**: JWT con refresh tokens
- **HTTP Client**: Axios con interceptores
- **Estado**: Context API de React
- **Fechas**: date-fns
- **Cookies**: js-cookie
- **TypeScript**: Tipado completo

## Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno** (copia `.env.example` a `.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Construir para producción**:
   ```bash
   npm run build
   npm start
   ```

## API Backend

Este frontend está diseñado para consumir la API de Twitter que creaste anteriormente. Asegúrate de que el backend esté corriendo en `http://localhost:3000`.

### Endpoints utilizados:

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `POST /auth/refresh` - Renovar token
- `GET /tweets` - Obtener timeline
- `POST /tweets` - Crear tweet
- `GET /tweets/user/:id` - Tweets de usuario
- `GET /users/:id` - Perfil de usuario
- `GET /users/:id/stats` - Estadísticas de usuario
- `POST /users/:id/follow` - Seguir usuario
- `DELETE /users/:id/follow` - Dejar de seguir
- `GET /users/:id/following` - Lista de seguidos
- `GET /users/:id/followers` - Lista de seguidores
- `GET /users/:id/is-following` - Verificar si sigue

## Comandos Disponibles

```bash
npm run dev      # Desarrollo con Turbopack
npm run build    # Construir para producción
npm start        # Servidor de producción
npm run lint     # Linter de código
```
