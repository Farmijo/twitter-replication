# Twitter Clone Frontend - Instrucciones para GitHub Copilot

Este es un frontend de Next.js para una aplicación de microblogging estilo Twitter.

## Arquitectura del Proyecto

- **Framework**: Next.js 15 con App Router
- **UI**: React 19 + Tailwind CSS  
- **Autenticación**: JWT con Context API
- **HTTP Client**: Axios con interceptores
- **Tipos**: TypeScript completo

## Estructura de Carpetas

```
src/
├── app/           # App Router (páginas)
├── components/    # Componentes reutilizables  
├── contexts/      # Context providers
├── services/      # Servicios API
├── lib/          # Cliente HTTP
├── types/        # Tipos TypeScript
└── config/       # Configuración
```

## Convenciones de Código

- Usar TypeScript estricto
- Componentes funcionales con hooks
- Context API para estado global
- Tailwind CSS para estilos
- Validación de props con interfaces

## API Endpoints

El frontend consume una API REST en `http://localhost:3000`:

- Autenticación: `/auth/login`, `/auth/register`, `/auth/refresh`
- Usuarios: `/users/:id`, `/users/:id/stats`, `/users/:id/follow`
- Tweets: `/tweets`, `/tweets/user/:id`

## Flujo de Autenticación

1. JWT almacenado en cookies httpOnly
2. Refresh automático con interceptores
3. Redirección automática en rutas protegidas
4. Context para estado de usuario

## Tareas Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run lint` - Linting
- `npm start` - Servidor de producción