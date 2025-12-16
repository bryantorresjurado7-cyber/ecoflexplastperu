// Script para crear las tablas de contabilidad en Supabase
// Ejecutar con: node scripts/create-contabilidad-tables.js

const SUPABASE_URL = 'https://uecolzuwhgfhicacodqj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY29senV3aGdmaGljYWNvZHFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQ2ODcyMywiZXhwIjoyMDU5MDQ0NzIzfQ.l-wdNgR28WxNLQwZnQR9hKRGnhf_SeJRbPePYcNdNQo';

const sqlStatements = [
  // Tabla principal de Cajas
  `CREATE TABLE IF NOT EXISTS contabilidad_caja (
    id_caja UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio INTEGER NOT NULL CHECK (anio >= 2020),
    monto_inicial DECIMAL(12,2) DEFAULT 0,
    monto_actual DECIMAL(12,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada', 'arqueo')),
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    cerrado_por UUID REFERENCES admin_profiles(id),
    auditoria VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_profiles(id),
    UNIQUE(nombre, mes, anio)
  )`,

  // Tabla de Movimientos
  `CREATE TABLE IF NOT EXISTS contabilidad_movimiento (
    id_movimiento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_caja UUID NOT NULL REFERENCES contabilidad_caja(id_caja) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    categoria VARCHAR(50),
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_documento VARCHAR(30) DEFAULT 'BOLETA' CHECK (tipo_documento IN ('FACTURA', 'BOLETA', 'RECIBO', 'TALONARIO', 'OTRO')),
    numero_documento VARCHAR(50),
    comprobante_url TEXT,
    estado VARCHAR(20) DEFAULT 'registrado' CHECK (estado IN ('registrado', 'aprobado', 'rechazado', 'anulado')),
    observaciones TEXT,
    auditoria VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_profiles(id)
  )`,

  // Tabla de Gastos Fijos
  `CREATE TABLE IF NOT EXISTS contabilidad_gasto_fijo (
    id_gasto_fijo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    dia_vencimiento INTEGER CHECK (dia_vencimiento >= 1 AND dia_vencimiento <= 31),
    proveedor VARCHAR(200),
    cuenta_bancaria VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    auditoria VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_profiles(id)
  )`,

  // Tabla de Gastos Variables
  `CREATE TABLE IF NOT EXISTS contabilidad_gasto_variable (
    id_gasto_variable UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_caja UUID REFERENCES contabilidad_caja(id_caja),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_documento VARCHAR(30) DEFAULT 'BOLETA',
    numero_documento VARCHAR(50),
    proveedor VARCHAR(200),
    comprobante_url TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'anulado')),
    fecha_pago DATE,
    auditoria VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_profiles(id)
  )`,

  // Tabla de Ingresos
  `CREATE TABLE IF NOT EXISTS contabilidad_ingreso (
    id_ingreso UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_caja UUID REFERENCES contabilidad_caja(id_caja),
    concepto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_documento VARCHAR(30) DEFAULT 'BOLETA',
    numero_documento VARCHAR(50),
    cliente VARCHAR(200),
    id_cliente UUID REFERENCES cliente(id_cliente),
    id_pedido UUID REFERENCES pedido(id_pedido),
    metodo_pago VARCHAR(30) DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'yape', 'plin', 'cheque', 'otro')),
    referencia_pago VARCHAR(100),
    comprobante_url TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cobrado', 'anulado')),
    fecha_cobro DATE,
    auditoria VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_profiles(id)
  )`,

  // Indices
  `CREATE INDEX IF NOT EXISTS idx_contabilidad_caja_mes_anio ON contabilidad_caja(mes, anio)`,
  `CREATE INDEX IF NOT EXISTS idx_contabilidad_movimiento_caja ON contabilidad_movimiento(id_caja)`,
  `CREATE INDEX IF NOT EXISTS idx_contabilidad_movimiento_fecha ON contabilidad_movimiento(fecha)`,
  `CREATE INDEX IF NOT EXISTS idx_contabilidad_movimiento_tipo ON contabilidad_movimiento(tipo)`,
  `CREATE INDEX IF NOT EXISTS idx_contabilidad_gasto_variable_fecha ON contabilidad_gasto_variable(fecha)`,
  `CREATE INDEX IF NOT EXISTS idx_contabilidad_ingreso_fecha ON contabilidad_ingreso(fecha)`,

  // RLS
  `ALTER TABLE contabilidad_caja ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE contabilidad_movimiento ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE contabilidad_gasto_fijo ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE contabilidad_gasto_variable ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE contabilidad_ingreso ENABLE ROW LEVEL SECURITY`,

  // Policies para contabilidad_caja
  `DROP POLICY IF EXISTS "Allow authenticated read contabilidad_caja" ON contabilidad_caja`,
  `CREATE POLICY "Allow authenticated read contabilidad_caja" ON contabilidad_caja FOR SELECT TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated insert contabilidad_caja" ON contabilidad_caja`,
  `CREATE POLICY "Allow authenticated insert contabilidad_caja" ON contabilidad_caja FOR INSERT TO authenticated WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated update contabilidad_caja" ON contabilidad_caja`,
  `CREATE POLICY "Allow authenticated update contabilidad_caja" ON contabilidad_caja FOR UPDATE TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated delete contabilidad_caja" ON contabilidad_caja`,
  `CREATE POLICY "Allow authenticated delete contabilidad_caja" ON contabilidad_caja FOR DELETE TO authenticated USING (true)`,

  // Policies para contabilidad_movimiento
  `DROP POLICY IF EXISTS "Allow authenticated read contabilidad_movimiento" ON contabilidad_movimiento`,
  `CREATE POLICY "Allow authenticated read contabilidad_movimiento" ON contabilidad_movimiento FOR SELECT TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated insert contabilidad_movimiento" ON contabilidad_movimiento`,
  `CREATE POLICY "Allow authenticated insert contabilidad_movimiento" ON contabilidad_movimiento FOR INSERT TO authenticated WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated update contabilidad_movimiento" ON contabilidad_movimiento`,
  `CREATE POLICY "Allow authenticated update contabilidad_movimiento" ON contabilidad_movimiento FOR UPDATE TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated delete contabilidad_movimiento" ON contabilidad_movimiento`,
  `CREATE POLICY "Allow authenticated delete contabilidad_movimiento" ON contabilidad_movimiento FOR DELETE TO authenticated USING (true)`,

  // Policies para contabilidad_gasto_fijo
  `DROP POLICY IF EXISTS "Allow authenticated read contabilidad_gasto_fijo" ON contabilidad_gasto_fijo`,
  `CREATE POLICY "Allow authenticated read contabilidad_gasto_fijo" ON contabilidad_gasto_fijo FOR SELECT TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated insert contabilidad_gasto_fijo" ON contabilidad_gasto_fijo`,
  `CREATE POLICY "Allow authenticated insert contabilidad_gasto_fijo" ON contabilidad_gasto_fijo FOR INSERT TO authenticated WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated update contabilidad_gasto_fijo" ON contabilidad_gasto_fijo`,
  `CREATE POLICY "Allow authenticated update contabilidad_gasto_fijo" ON contabilidad_gasto_fijo FOR UPDATE TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated delete contabilidad_gasto_fijo" ON contabilidad_gasto_fijo`,
  `CREATE POLICY "Allow authenticated delete contabilidad_gasto_fijo" ON contabilidad_gasto_fijo FOR DELETE TO authenticated USING (true)`,

  // Policies para contabilidad_gasto_variable
  `DROP POLICY IF EXISTS "Allow authenticated read contabilidad_gasto_variable" ON contabilidad_gasto_variable`,
  `CREATE POLICY "Allow authenticated read contabilidad_gasto_variable" ON contabilidad_gasto_variable FOR SELECT TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated insert contabilidad_gasto_variable" ON contabilidad_gasto_variable`,
  `CREATE POLICY "Allow authenticated insert contabilidad_gasto_variable" ON contabilidad_gasto_variable FOR INSERT TO authenticated WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated update contabilidad_gasto_variable" ON contabilidad_gasto_variable`,
  `CREATE POLICY "Allow authenticated update contabilidad_gasto_variable" ON contabilidad_gasto_variable FOR UPDATE TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated delete contabilidad_gasto_variable" ON contabilidad_gasto_variable`,
  `CREATE POLICY "Allow authenticated delete contabilidad_gasto_variable" ON contabilidad_gasto_variable FOR DELETE TO authenticated USING (true)`,

  // Policies para contabilidad_ingreso
  `DROP POLICY IF EXISTS "Allow authenticated read contabilidad_ingreso" ON contabilidad_ingreso`,
  `CREATE POLICY "Allow authenticated read contabilidad_ingreso" ON contabilidad_ingreso FOR SELECT TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated insert contabilidad_ingreso" ON contabilidad_ingreso`,
  `CREATE POLICY "Allow authenticated insert contabilidad_ingreso" ON contabilidad_ingreso FOR INSERT TO authenticated WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated update contabilidad_ingreso" ON contabilidad_ingreso`,
  `CREATE POLICY "Allow authenticated update contabilidad_ingreso" ON contabilidad_ingreso FOR UPDATE TO authenticated USING (true)`,
  `DROP POLICY IF EXISTS "Allow authenticated delete contabilidad_ingreso" ON contabilidad_ingreso`,
  `CREATE POLICY "Allow authenticated delete contabilidad_ingreso" ON contabilidad_ingreso FOR DELETE TO authenticated USING (true)`,
];

async function executeSQL(sql, description) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      // Si exec_sql no existe, intentamos otra forma
      const errorText = await response.text();
      console.log(`  ⚠️ exec_sql no disponible, necesita ejecutar SQL manualmente`);
      return false;
    }

    console.log(`  ✅ ${description || sql.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Creando tablas de contabilidad en Supabase...\n');
  
  // Verificar conexión primero
  try {
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    
    if (testResponse.ok) {
      console.log('✅ Conexión a Supabase exitosa\n');
    }
  } catch (error) {
    console.error('❌ No se puede conectar a Supabase:', error.message);
    return;
  }

  console.log('ℹ️  El servicio REST de Supabase no permite ejecutar SQL directamente.');
  console.log('📋 Por favor, copia y ejecuta el siguiente SQL en el SQL Editor de Supabase:\n');
  console.log('   https://supabase.com/dashboard/project/uecolzuwhgfhicacodqj/sql\n');
  console.log('=' .repeat(80));
  console.log('\n-- COPIAR TODO EL CONTENIDO A CONTINUACIÓN --\n');
  console.log(sqlStatements.join(';\n\n') + ';');
  console.log('\n-- FIN DEL SQL --\n');
  console.log('=' .repeat(80));
  console.log('\n✅ Script completado. Ejecuta el SQL en el dashboard de Supabase.');
}

main().catch(console.error);
