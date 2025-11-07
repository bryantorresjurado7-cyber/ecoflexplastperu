# Edge Function: crud-clientes

CRUD (Crear, Listar, Detallar, Actualizar, Eliminar) con paginación sobre la tabla `cliente`.

## Campos esperados en tabla `cliente`

- `id_cliente` (uuid, PK)
- `nombre` (text)
- `tipo_documento` (text)
- `direccion` (text)
- `telefono` (text)
- `email` (text)
- `descripcion` (text)
- `auditoria` (text)
- `estado` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Deploy rápido

1. **(Solo 1 vez)** Asegúrate de tener la CLI de Supabase instalada:
   ```sh
   npm install -g supabase
   ```

2. **Ubícate en el root del proyecto y autentica:**
   ```sh
   supabase login
   ````

3. **Despliega la función**
   ```sh
   supabase functions deploy crud-clientes --no-verify-jwt
   ```

4. **Asegúrate de tener las variables de entorno en el dashboard (Service Role y URL)**

## Ejemplos de endpoints:

- **Listar clientes (paginado)**
  ```http
  GET /functions/v1/crud-clientes/clientes?page=1&limit=20
  ```

- **Obtener un cliente por ID**
  ```http
  GET /functions/v1/crud-clientes/clientes/<id_cliente>
  ```

- **Crear nuevo cliente**
  ```http
  POST /functions/v1/crud-clientes/clientes
  Content-Type: application/json

  {
    "nombre": "Juan Pérez",
    "tipo_documento": "DNI",
    "direccion": "Av. Principal 123, Lima",
    "telefono": "987654321",
    "email": "juan.perez@email.com",
    "descripcion": "Cliente VIP",
    "auditoria": "webadmin"
  }
  ```

- **Actualizar cliente**
  ```http
  PUT /functions/v1/crud-clientes/clientes/<id_cliente>
  Content-Type: application/json
  { ...campos a modificar... }
  ```

- **Eliminar cliente**
  ```http
  DELETE /functions/v1/crud-clientes/clientes/<id_cliente>
  ```

## Notas
- Este endpoint utiliza Service Role internamente (variables de entorno), por eso permite pleno control y paginado.
- Si tienes preguntas sobre cómo consumirlo del frontend, ¡consulta el README o pídenos ejemplos!
