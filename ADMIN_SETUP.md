# 🎯 Sistema de Administración - EcoFlexPlast

## ✅ ¡Sistema Completo Implementado!

Se ha implementado un sistema completo de administración para tu sitio web EcoFlexPlast. Ahora puedes gestionar todos tus productos, precios y stock desde un panel administrativo web.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Funcionalidades](#funcionalidades)
4. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
5. [Migración de Datos](#migración-de-datos)
6. [Uso del Panel](#uso-del-panel)

---

## 🔧 Configuración Inicial

### Paso 1: Ejecutar el Esquema SQL en Supabase

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)
4. Abre el archivo `supabase-admin-schema.sql`
5. Copia todo el contenido y pégalo en el editor de Supabase
6. Haz clic en **Run** para ejecutar el script

Este script creará automáticamente:
- ✅ Tabla de usuarios administradores
- ✅ Tabla de sesiones
- ✅ Tabla de productos con precios y stock
- ✅ Tabla de categorías
- ✅ Tabla de historial de precios
- ✅ Tabla de auditoría
- ✅ Usuario admin por defecto

### Paso 2: Migrar los Productos Existentes

Ejecuta el script de migración para cargar productos de ejemplo:

\`\`\`bash
cd ecoflexplast-website
node migrate-products.js
\`\`\`

Esto insertará 17 productos de ejemplo en la base de datos, incluyendo:
- 6 Zunchos de diferentes colores
- 3 Esquineros
- 3 Rollos de Burbupack
- 1 Manga plástica
- 3 Accesorios (Tenaza, Tensador, Grapas)

---

## 🔐 Acceso al Sistema

### Credenciales por Defecto

**URL de Login:** http://localhost:5173/admin/login

**Credenciales:**
- **Email:** admin@ecoflexplast.com
- **Contraseña:** Admin123!

⚠️ **IMPORTANTE:** Cambia estas credenciales después del primer login por seguridad.

---

## 🎯 Funcionalidades

### 1. Dashboard Principal
- Vista general de estadísticas
- Total de productos
- Alertas de stock bajo
- Cotizaciones pendientes
- Accesos rápidos

**URL:** `/admin/dashboard`

### 2. Gestión de Productos

#### 📦 Listado de Productos
- Ver todos los productos en tabla
- Búsqueda por nombre o código
- Filtros por categoría y stock
- Edición rápida de precios
- Edición rápida de stock
- Activar/desactivar productos
- **URL:** `/admin/productos`

#### ➕ Agregar Nuevo Producto
- Formulario completo para crear productos
- Campos automáticos:
  - Código único
  - Nombre
  - Categoría y subcategoría
  - Descripción corta y larga
  - Precios (unitario y mayorista)
  - Stock disponible y mínimo
  - Colores y medidas disponibles
  - Imágenes
  - Opciones de destacado y activo
- **URL:** `/admin/productos/nuevo`

#### ✏️ Editar Producto
- Modificar cualquier dato del producto
- Mantiene historial de cambios de precios
- **URL:** `/admin/productos/editar/:id`

### 3. Edición Rápida de Precios

Directamente desde la tabla de productos, haz clic en cualquier precio para editarlo:
- Precio unitario
- Precio mayorista
- Los cambios se guardan automáticamente

### 4. Gestión de Stock

- Edita el stock disponible directamente desde la tabla
- Sistema de alertas automáticas cuando el stock es bajo
- Indicador visual cuando stock < stock mínimo
- El campo se marca en amarillo cuando hay alerta

### 5. Sistema de Seguridad

- Login obligatorio para acceder al admin
- Sesiones con expiración (8 horas)
- Tokens seguros
- Rutas protegidas
- Auditoría de cambios

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `admin_users`
Usuarios con acceso al panel administrativo.

**Campos principales:**
- `id` (UUID) - Identificador único
- `email` - Email del usuario
- `password_hash` - Contraseña encriptada
- `nombre` - Nombre completo
- `rol` - super_admin, admin, editor
- `activo` - Estado del usuario
- `ultimo_acceso` - Fecha del último login

### Tabla: `productos_db`
Catálogo completo de productos.

**Campos principales:**
- `id` (UUID) - Identificador único
- `codigo` - Código del producto (único)
- `nombre` - Nombre del producto
- `categoria` - zunchos, esquineros, burbupack, mangas, accesorios
- `descripcion` - Descripción corta
- `descripcion_larga` - Descripción detallada
- `precio_unitario` - Precio al por menor
- `precio_mayorista` - Precio al por mayor
- `stock_disponible` - Cantidad en inventario
- `stock_minimo` - Nivel de alerta
- `stock_alerta` - Boolean (se activa automáticamente)
- `colores_disponibles` - Array JSON de colores
- `medidas_disponibles` - Array JSON de medidas
- `imagen_principal` - URL de imagen
- `activo` - Visible en la tienda
- `destacado` - Producto destacado
- `nuevo` - Marca de producto nuevo

### Tabla: `categorias_productos`
Categorías de productos predefinidas.

### Tabla: `historial_precios`
Registro de todos los cambios de precios (auditoría).

### Tabla: `audit_log`
Registro de todas las acciones administrativas.

---

## 📤 Migración de Datos

### Script Automático

El archivo `migrate-products.js` contiene datos de ejemplo listos para migrar.

**Cómo usarlo:**

\`\`\`bash
node migrate-products.js
\`\`\`

### Agregar Tus Propios Productos

Puedes modificar el array `productosParaMigrar` en `migrate-products.js` para agregar tus productos reales:

\`\`\`javascript
{
  codigo: 'TU-CODIGO',
  nombre: 'Nombre del Producto',
  categoria: 'zunchos', // o esquineros, burbupack, mangas, accesorios
  subcategoria: 'Tipo',
  descripcion: 'Descripción corta',
  descripcion_larga: 'Descripción completa...',
  precio_unitario: 0.00,
  precio_mayorista: 0.00,
  stock_disponible: 0,
  stock_minimo: 10,
  unidad_medida: 'unidad', // o rollo, metro, paquete, caja
  colores_disponibles: ['Color1', 'Color2'],
  medidas_disponibles: ['Medida1', 'Medida2'],
  imagen_principal: '/ruta/imagen.png',
  activo: true,
  destacado: false
}
\`\`\`

---

## 🖥️ Uso del Panel

### Flujo de Trabajo Típico

#### 1. Iniciar Sesión
1. Navega a `http://localhost:5173/admin/login`
2. Ingresa tus credenciales
3. Serás redirigido al dashboard

#### 2. Ver Productos
1. Desde el dashboard, haz clic en "Productos" en el menú lateral
2. Verás todos tus productos en una tabla

#### 3. Editar Precios Rápidamente
1. En la tabla de productos, haz clic en cualquier precio
2. Ingresa el nuevo valor
3. Presiona Enter o haz clic fuera del campo
4. El precio se actualiza automáticamente

#### 4. Actualizar Stock
1. En la tabla de productos, edita el campo de stock
2. Si el stock baja del mínimo, se marcará en amarillo
3. El dashboard mostrará una alerta

#### 5. Agregar Nuevo Producto
1. Haz clic en "+ Nuevo Producto"
2. Completa el formulario
3. Los campos obligatorios están marcados con *
4. Haz clic en "Crear Producto"

#### 6. Editar Producto Completo
1. Desde la tabla, haz clic en el ícono de editar (lápiz)
2. Modifica los campos necesarios
3. Haz clic en "Actualizar Producto"

#### 7. Activar/Desactivar Producto
1. En la tabla, haz clic en el badge de estado (Activo/Inactivo)
2. El producto se mostrará u ocultará en la tienda automáticamente

#### 8. Eliminar Producto
1. Haz clic en el ícono de eliminar (papelera)
2. Confirma la acción
3. El producto se eliminará permanentemente

---

## 🔄 Integración con el Frontend

Los productos de la base de datos se pueden consumir directamente desde el frontend:

\`\`\`javascript
import { supabase } from './lib/supabase'

// Obtener todos los productos activos
const { data: productos } = await supabase
  .from('productos_db')
  .select('*')
  .eq('activo', true)
  .order('orden', { ascending: true })

// Filtrar por categoría
const { data: zunchos } = await supabase
  .from('productos_db')
  .select('*')
  .eq('categoria', 'zunchos')
  .eq('activo', true')

// Buscar producto por código
const { data: producto } = await supabase
  .from('productos_db')
  .select('*')
  .eq('codigo', 'ZUNCHO-VERDE-001')
  .single()
\`\`\`

---

## 🎨 Personalización

### Cambiar Colores del Admin

Los colores del panel se basan en tu paleta existente:
- Verde principal: `#059669`
- Fondos: Usando tus clases de Tailwind
- Todo está en `tailwind.config.js`

### Agregar Más Categorías

1. Ve a Supabase SQL Editor
2. Ejecuta:

\`\`\`sql
INSERT INTO categorias_productos (nombre, slug, descripcion, orden) VALUES
('Nueva Categoría', 'nueva-categoria', 'Descripción', 6);
\`\`\`

### Agregar Campos Personalizados

Puedes extender la tabla `productos_db` con más campos según tus necesidades.

---

## 🚀 Próximos Pasos

1. ✅ **Ejecutar el esquema SQL** en Supabase
2. ✅ **Migrar los productos** con el script
3. ✅ **Iniciar sesión** en el admin
4. ✅ **Cambiar la contraseña** por defecto
5. ✅ **Agregar tus productos reales**
6. ✅ **Configurar precios y stock**

---

## 🆘 Soporte y Troubleshooting

### Problema: No puedo iniciar sesión

**Solución:**
1. Verifica que ejecutaste el esquema SQL
2. Verifica las credenciales:
   - Email: admin@ecoflexplast.com
   - Password: Admin123!
3. Revisa la consola del navegador para errores

### Problema: No veo productos

**Solución:**
1. Ejecuta el script de migración: `node migrate-products.js`
2. Verifica en Supabase que la tabla `productos_db` tiene datos
3. Verifica que los productos tengan `activo = true`

### Problema: No puedo actualizar precios

**Solución:**
1. Verifica que tienes permisos en Supabase (RLS policies)
2. Revisa la consola del navegador para errores
3. Verifica que la sesión no haya expirado

---

## 📞 Contacto

Si tienes alguna duda o necesitas ayuda adicional, no dudes en preguntar.

¡Tu sistema de administración está listo para usar! 🎉
