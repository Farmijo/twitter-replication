FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY ./.npmrc ./
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "start:dev"]