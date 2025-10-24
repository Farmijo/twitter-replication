# 📝 Twitter API - Documentación de Endpoints de Tweets

## 🚀 Configuración Inicial

### 1. Importar archivos en Postman:
- `Twitter-API-Tweets.postman_collection.json` - La colección completa
- `Twitter-API-Environment.postman_environment.json` - Variables de entorno

### 2. Configurar el entorno:
- Selecciona el entorno "Twitter API - Local Development"
- La URL base está configurada como `http://localhost:3000`

## 🔐 Autenticación

### Paso 1: Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "password123"
}
```

### Paso 2: Iniciar Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6747a1b2c3d4e5f6a7b8c9d0",
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER",
    "following": [],
    "followers": [],
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z"
  }
}
```

> 🔄 **Automatización**: El script de login guardará automáticamente el `ACCESS_TOKEN`, `REFRESH_TOKEN`, `USER_ID` y `USERNAME` en las variables de entorno.

## 🐦 Endpoints de Tweets

### 1. Obtener Todos los Tweets (Timeline)
```http
GET /api/tweets?limit=10&skip=0
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Parámetros de consulta:**
- `limit` (opcional): Número máximo de tweets (por defecto: 10)
- `skip` (opcional): Tweets a saltar para paginación (por defecto: 0)

**Respuesta esperada:**
```json
{
  "message": "Tweets retrieved successfully",
  "data": [
    {
      "id": "tweet123",
      "content": "¡Mi primer tweet!",
      "userId": {
        "_id": "user123",
        "username": "testuser"
      },
      "likesCount": 0,
      "retweetsCount": 0,
      "repliesCount": 0,
      "hashtags": [],
      "mentions": [],
      "isRetweet": false,
      "createdAt": "2025-10-24T10:00:00.000Z",
      "updatedAt": "2025-10-24T10:00:00.000Z"
    }
  ],
  "count": 1,
  "pagination": {
    "limit": 10,
    "skip": 0
  }
}
```

### 2. Crear Tweet
```http
POST /api/tweets
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "content": "¡Mi primer tweet desde Postman! 🚀 #testing #postman"
}
```

**Validaciones:**
- Contenido requerido (no vacío)
- Máximo 280 caracteres
- Mínimo 1 caracter

**Respuesta esperada:**
```json
{
  "message": "Tweet created successfully",
  "data": {
    "id": "tweet123",
    "content": "¡Mi primer tweet desde Postman! 🚀 #testing #postman",
    "userId": "user123",
    "likesCount": 0,
    "retweetsCount": 0,
    "repliesCount": 0,
    "hashtags": ["testing", "postman"],
    "mentions": [],
    "isRetweet": false,
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z"
  }
}
```

> 🔄 **Automatización**: El script guardará automáticamente el `LAST_TWEET_ID` para usar en otros requests.

### 3. Obtener Tweet por ID
```http
GET /api/tweets/{{LAST_TWEET_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 4. Obtener Tweets de Usuario
```http
GET /api/tweets/user/{{USER_ID}}?limit=20&skip=0
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 5. Eliminar Tweet
```http
DELETE /api/tweets/{{LAST_TWEET_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

## 🧪 Casos de Prueba Incluidos

### ✅ Casos Exitosos:
1. **Tweet Normal**: Con contenido válido y hashtags
2. **Tweet con Hashtags**: Contenido con múltiples hashtags
3. **Tweet Largo**: Cerca del límite de 280 caracteres

### ❌ Casos de Error:
1. **Tweet Vacío**: Debería retornar error 400
2. **Tweet Muy Largo**: Más de 280 caracteres
3. **Sin Autenticación**: Sin token, debería retornar 401

## 🔧 Scripts Automáticos

### Scripts Pre-request:
- Logging del endpoint que se va a llamar

### Scripts Post-response:
- Logging del status code
- Extracción automática de tokens de autenticación
- Guardado de IDs de tweets para reutilizar
- Logging de errores si los hay

## 📊 Variables de Entorno

| Variable | Descripción | Se llena automáticamente |
|----------|-------------|-------------------------|
| `BASE_URL` | URL base de la API | Manual: `http://localhost:3000` |
| `ACCESS_TOKEN` | Token de autenticación | ✅ Al hacer login |
| `REFRESH_TOKEN` | Token de renovación | ✅ Al hacer login |
| `USER_ID` | ID del usuario actual | ✅ Al hacer login |
| `USERNAME` | Nombre de usuario | ✅ Al hacer login |
| `LAST_TWEET_ID` | ID del último tweet creado | ✅ Al crear tweet |

## 🚀 Flujo Recomendado de Pruebas

1. **Registrar usuario** (si es necesario)
2. **Hacer login** → Automáticamente llena tokens
3. **Crear tweet** → Automáticamente guarda el ID
4. **Ver timeline** → Verificar que aparece el tweet
5. **Ver tweets de usuario** → Filtrar por usuario actual
6. **Obtener tweet por ID** → Usar el ID guardado
7. **Eliminar tweet** (opcional)

## 🛠️ Troubleshooting

### Error 401 (Unauthorized):
- Verificar que el token esté en las variables de entorno
- Hacer login nuevamente si el token expiró

### Error 400 (Bad Request):
- Verificar que el contenido del tweet no esté vacío
- Verificar que no exceda 280 caracteres

### Error 404 (Not Found):
- Verificar que el ID del tweet existe
- Verificar que la URL esté bien formada

### Error 500 (Internal Server Error):
- Verificar que el backend esté corriendo en puerto 3000
- Revisar logs del servidor backend