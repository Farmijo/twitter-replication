# Multi-stage build para optimizar imagen
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY .npmrc package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente (sin test/ gracias a .dockerignore)
COPY . .

# Compilar aplicación
RUN npm run build

# Imagen de producción
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copiar archivos de configuración de dependencias
COPY .npmrc package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar aplicación compilada desde builder
COPY --from=builder /app/dist ./dist

# Cambiar ownership de archivos al usuario no-root
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Comando por defecto para producción
CMD ["node", "dist/main"]