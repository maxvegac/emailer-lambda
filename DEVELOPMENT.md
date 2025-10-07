# Development Guide

## Express en Lambda - Lo mejor de ambos mundos

Este proyecto usa **Express en Lambda** con `@vendia/serverless-express`, lo que te da:

### ✅ Ventajas
- **Desarrollo local**: Servidor Express completo con hot-reload
- **Producción**: Misma aplicación en Lambda (sin cambios)
- **Consistencia**: Mismo código en desarrollo y producción
- **Familiaridad**: Usa Express como siempre
- **Debugging**: Fácil debugging local

### 📁 Estructura de archivos
```
src/
├── server.ts      # Aplicación Express
├── lambda.ts      # Wrapper para Lambda
├── index.ts       # Lambda pura (backup)
└── local-test.ts  # Tests unitarios
```

## Desarrollo Local

### 1. Configurar entorno
```bash
# Copiar variables de entorno
cp env.example .env

# Editar .env con tus credenciales SMTP
nano .env
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Desarrollo con hot-reload
```bash
npm run dev
```

Esto inicia:
- ✅ Servidor Express en `http://localhost:3000`
- ✅ Hot-reload automático
- ✅ TypeScript compilation
- ✅ Logs detallados

### 4. Endpoints disponibles
```
GET  /health          # Health check
GET  /test            # Datos de ejemplo
POST /send-email      # Enviar email
```

### 5. Probar la aplicación
```bash
# Health check
curl http://localhost:3000/health

# Ver datos de ejemplo
curl http://localhost:3000/test

# Enviar email de prueba
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "windows-license",
    "to": "test@example.com",
    "from": "noreply@yourcompany.com",
    "subject": "Test License",
    "data": {
      "orderNumber": "1234567890",
      "customerName": "Test User",
      "licenseKey": "TEST-KEY-12345"
    }
  }'
```

## Deployment

### 1. Build para producción
```bash
npm run build
```

### 2. Deploy con OpenTofu
```bash
cd terraform
tofu apply
```

### 3. La aplicación se despliega como:
- **Lambda Function**: `lambda.handler` (Express wrapped)
- **Function URL**: Endpoint público
- **Mismo código**: Sin cambios entre desarrollo y producción

## Comparación de enfoques

| Aspecto | Lambda Pura | Express en Lambda |
|---------|-------------|-------------------|
| **Desarrollo** | ❌ Complejo | ✅ Fácil |
| **Hot-reload** | ❌ No | ✅ Sí |
| **Debugging** | ❌ Difícil | ✅ Fácil |
| **Performance** | ✅ Óptimo | ✅ Bueno |
| **Familiaridad** | ❌ Baja | ✅ Alta |
| **Consistencia** | ❌ Baja | ✅ Alta |

## ¿Por qué Express en Lambda?

1. **Desarrollo más rápido**: Servidor local completo
2. **Menos bugs**: Mismo código en dev y prod
3. **Mejor DX**: Hot-reload, debugging fácil
4. **Performance aceptable**: `@vendia/serverless-express` es eficiente
5. **Flexibilidad**: Fácil agregar middleware, rutas, etc.

## Alternativas consideradas

### ❌ Lambda pura
- Desarrollo local complejo
- Inconsistencia dev/prod
- Debugging difícil

### ❌ Express + API Gateway
- Más complejo
- Más costoso
- Latencia adicional

### ✅ Express en Lambda (Elegido)
- Mejor balance desarrollo/producción
- Fácil de mantener
- Performance aceptable

## Troubleshooting

### Error: SMTP credentials not configured
```bash
# Verificar .env
cat .env

# Debe tener:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Error: Template not found
```bash
# Verificar que el template existe
ls src/templates/

# Debe tener:
windows-license.hbs
```

### Error: Build failed
```bash
# Limpiar y reinstalar
rm -rf node_modules dist
npm install
npm run build
```

## Próximos pasos

1. **Agregar más templates**: Crear nuevos `.hbs` files
2. **Validación**: Agregar Joi/Zod para validación
3. **Logging**: Implementar Winston/Pino
4. **Testing**: Agregar Jest/Supertest
5. **Monitoring**: CloudWatch dashboards
