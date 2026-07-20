# 🚀 Guía Rápida de Prueba - Angular Frontend

## ⚡ Inicio Rápido (5 minutos)

### 1. Verificar Backend (Aspire)
```powershell
# Abrir Visual Studio
# Establecer eShop.AppHost como proyecto de inicio
# Presionar F5

# Verificar Aspire Dashboard: http://localhost:15888
# Confirmar que estos servicios estén "Running":
✅ postgres
✅ redis
✅ eventbus (RabbitMQ)
✅ catalog-api (puerto 5222)
✅ basket-api (puerto 5221)
✅ ordering-api (puerto 5224)
✅ mobile-bff (puerto 62311)
```

### 2. Instalar y Ejecutar Angular
```powershell
cd C:\Users\ASUS X512F (8441)\source\repos\eShop\src\AngularApp

# Primera vez solamente:
npm install

# Ejecutar (puerto predeterminado):
ng serve

# O en puerto alternativo si 4200 está ocupado:
ng serve --port 4201
```

### 3. Abrir en Navegador
```
http://localhost:4200
# o
http://localhost:4201
```

---

## ✅ Lista de Verificación

### Backend (Aspire Dashboard - port 15888)
- [ ] Todos los servicios están "Running" (verde)
- [ ] mobile-bff escuchando en puerto 62311
- [ ] catalog-api escuchando en puerto 5222
- [ ] No hay errores en los logs

### Angular Frontend (port 4200 o 4201)
- [ ] `ng serve` ejecutándose sin errores TypeScript
- [ ] Navegador abierto en http://localhost:4200 o http://localhost:4201
- [ ] Título "eShop - Catálogo de Productos" visible
- [ ] No hay errores de CORS en la consola del navegador (F12)

### Funcionalidad
- [ ] Los productos se cargan en el catálogo
- [ ] Los filtros de "Marca" y "Tipo" funcionan
- [ ] La paginación cambia de página
- [ ] Botón "Agregar" muestra alert confirmando item agregado
- [ ] Botón "🛒 Ver Carrito" es clickeable

---

## 🧪 Pruebas Funcionales

### Prueba 1: Cargar Catálogo
1. Abrir http://localhost:4200
2. **Esperado:** Grid de productos con imágenes, nombres y precios
3. **Verificar:** Consola del navegador (F12) sin errores

### Prueba 2: Filtrar por Marca
1. Seleccionar una marca del dropdown "Marca"
2. **Esperado:** Los productos se filtran automáticamente
3. **Verificar:** Solo productos de esa marca se muestran

### Prueba 3: Filtrar por Tipo
1. Seleccionar un tipo del dropdown "Tipo"
2. **Esperado:** Los productos se filtran automáticamente
3. **Verificar:** Solo productos de ese tipo se muestran

### Prueba 4: Paginación
1. Hacer clic en "Siguiente →"
2. **Esperado:** Se carga la siguiente página de productos
3. **Verificar:** Contador de página incrementa

### Prueba 5: Agregar al Carrito
1. Hacer clic en botón "Agregar" de cualquier producto
2. **Esperado:** Alert con mensaje "X agregado al carrito!"
3. **Verificar:** Consola del navegador muestra log de éxito

---

## 🐛 Troubleshooting

### Error: "No se pueden cargar productos"

**Síntoma:** Pantalla en blanco o mensaje de error

**Solución:**
```powershell
# 1. Verificar que Aspire esté corriendo
# Abrir http://localhost:15888
# Confirmar todos los servicios en verde

# 2. Verificar mobile-bff
# En Aspire Dashboard, buscar "mobile-bff"
# Debe estar en puerto 62311

# 3. Revisar consola del navegador (F12)
# Buscar errores de CORS o red
```

### Error de CORS

**Síntoma:** Error en consola del navegador:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solución:**
```powershell
# 1. Verificar que UseCors() esté en Program.cs de las APIs
# Ya debe estar agregado en:
# - src/Catalog.API/Program.cs
# - src/Basket.API/Program.cs
# - src/Ordering.API/Program.cs

# 2. Reiniciar AppHost (F5 en Visual Studio)

# 3. Limpiar caché del navegador (Ctrl+Shift+Delete)
```

### Angular no compila

**Síntoma:** Errores de TypeScript en terminal

**Solución:**
```powershell
cd src/AngularApp

# Limpiar y reinstalar:
rm -r node_modules
rm package-lock.json
npm cache clean --force
npm install

# Ejecutar de nuevo:
ng serve
```

### Puerto 4200 ya en uso

**Síntoma:** 
```
Port 4200 is already in use.
```

**Solución:**
```powershell
# Opción 1: Usar otro puerto
ng serve --port 4201

# Opción 2: Matar proceso en puerto 4200
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

---

## 📸 Captura de Pantalla Esperada

Deberías ver:

```
┌────────────────────────────────────────────┐
│ eShop - Catálogo de Productos   🛒 Ver Carrito │
├────────────────────────────────────────────┤
│ Marca: [Todas ▼]   Tipo: [Todos ▼]        │
├────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │ │
│  │Product│  │Product│  │Product│  │Product│ │
│  │$19.99│  │$24.99│  │$14.99│  │$29.99│ │
│  │[Agregar││[Agregar│││[Agregar│││[Agregar││ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ ...  │  │ ...  │  │ ...  │  │ ...  │ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
├────────────────────────────────────────────┤
│  ← Anterior   Página 1 de 10   Siguiente → │
└────────────────────────────────────────────┘
```

---

## 🔍 Logs Útiles

### Consola del Navegador (F12 → Console)
```javascript
// Éxito al cargar productos:
"Loading items:"

// Éxito al agregar al carrito:
"Item added to basket: Product Name"
```

### Terminal Angular
```
✔ Application bundle generation complete.
  Watch mode enabled. Watching for file changes...

  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

### Aspire Dashboard
- **catalog-api:** Estado = Running, Color verde
- **mobile-bff:** Estado = Running, Puerto 62311

---

## 📞 Siguiente Paso

Una vez verificado que todo funciona:

1. **Crear Pull Request** en GitHub
2. **Documentar** cualquier issue encontrado
3. **Implementar** componente de Basket completo (opcional)

---

**Estado Esperado:** ✅ TODO FUNCIONANDO

Si sigues esta guía, deberías tener el frontend Angular funcionando correctamente con el backend eShop.
