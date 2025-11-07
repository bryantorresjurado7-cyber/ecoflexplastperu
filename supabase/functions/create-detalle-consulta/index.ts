import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente de Supabase con service role key para poder insertar
    // El service role key bypass RLS policies y permite crear clientes/proveedores
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // Obtener service role key de las variables de entorno (secrets configurados en Supabase)
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'SUPABASE_SERVICE_ROLE_KEY no está configurado. Por favor, configúralo en los secrets de la edge function.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Usar service role key para poder crear registros (bypass RLS)
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    )

    // Solo permitir POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Método no permitido. Use POST.'
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obtener datos del cuerpo de la petición
    const body = await req.json()
    
    // Validar datos requeridos
    const { 
      tipoRelacion,      // 'cliente' o 'proveedor'
      tipoDocumento,     // 'DNI', 'RUC', 'CE', 'PAS'
      numeroDocumento,   // Número del documento
      nombre,            // Nombre completo
      email,             // Email
      telefono,          // Teléfono
      mensaje,           // Mensaje de la consulta
      tipoConsulta,      // Código del tipo de consulta
      descripcionTipoConsulta, // Descripción completa del tipo
      asunto             // Asunto (opcional)
    } = body

    // Validaciones básicas
    if (!tipoRelacion || !['cliente', 'proveedor'].includes(tipoRelacion)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'tipoRelacion es requerido y debe ser "cliente" o "proveedor"'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!tipoDocumento || !numeroDocumento) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'tipoDocumento y numeroDocumento son requeridos'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!nombre || !email || !mensaje || !tipoConsulta) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'nombre, email, mensaje y tipoConsulta son requeridos'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Limpiar número de documento
    const numeroLimpio = numeroDocumento.trim()

    // Paso 1: Buscar si el cliente/proveedor ya existe
    let idClienteProveedor = null
    const tablaBusqueda = tipoRelacion === 'cliente' ? 'cliente' : 'proveedor'
    const campoId = tipoRelacion === 'cliente' ? 'id_cliente' : 'id_proveedor'

    const { data: existente, error: errorBusqueda } = await supabaseClient
      .from(tablaBusqueda)
      .select(campoId)
      .eq('tipo_documento', tipoDocumento)
      .eq('numero_documento', numeroLimpio)
      .maybeSingle()

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
      console.error('Error buscando cliente/proveedor:', errorBusqueda)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Error buscando ${tipoRelacion}: ${errorBusqueda.message}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Paso 2: Si existe, usar su ID y actualizar datos si han cambiado; si no, crear nuevo registro
    if (existente) {
      idClienteProveedor = existente[campoId]
      console.log(`${tipoRelacion} encontrado con ID:`, idClienteProveedor)
      
      // Actualizar datos del cliente/proveedor si han cambiado (nombre, email, teléfono)
      const datosActualizados = {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono ? telefono.trim() : null
      }
      
      // Solo actualizar si hay cambios (evitar updates innecesarios)
      const { error: errorUpdate } = await supabaseClient
        .from(tablaBusqueda)
        .update(datosActualizados)
        .eq(campoId, idClienteProveedor)
      
      if (errorUpdate) {
        console.warn(`Error actualizando ${tipoRelacion}:`, errorUpdate)
        // Continuar de todas formas, no es crítico si falla la actualización
      } else {
        console.log(`${tipoRelacion} actualizado con nuevos datos`)
      }
    } else {
      // Crear nuevo cliente/proveedor
      const nuevoRegistro = {
        tipo_documento: tipoDocumento,
        numero_documento: numeroLimpio,
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono ? telefono.trim() : null,
        direccion: body.direccion ? body.direccion.trim() : 'Sin dirección', // Campo requerido, usar valor por defecto si no se proporciona
        auditoria: body.auditoria ? body.auditoria.trim() : '', // Campo requerido, usar cadena vacía como valor por defecto
        estado: true
      }

      const { data: nuevo, error: errorCreacion } = await supabaseClient
        .from(tablaBusqueda)
        .insert([nuevoRegistro])
        .select(campoId)
        .single()

      if (errorCreacion) {
        console.error(`Error creando ${tipoRelacion}:`, errorCreacion)
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Error creando ${tipoRelacion}: ${errorCreacion.message}`
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      idClienteProveedor = nuevo[campoId]
      console.log(`Nuevo ${tipoRelacion} creado con ID:`, idClienteProveedor)
    }

    // Paso 3: Preparar datos para detalle_consulta
    const datosConsulta = {
      mensaje: mensaje.trim(),
      tipo_consulta: tipoConsulta,
      descripcion_tipo_consulta: descripcionTipoConsulta || tipoConsulta,
      asunto: asunto ? asunto.trim() : null,
      prioridad: body.prioridad || 'Media',
      estado_consulta: 'Abierta',
      estado: true,
      auditoria: ''
    }

    // Asignar id_cliente o id_proveedor según corresponda
    if (tipoRelacion === 'cliente') {
      datosConsulta.id_cliente = idClienteProveedor
      datosConsulta.id_proveedor = null
    } else {
      datosConsulta.id_proveedor = idClienteProveedor
      datosConsulta.id_cliente = null
    }

    // Paso 4: Insertar en detalle_consulta
    const { data: consultaCreada, error: errorConsulta } = await supabaseClient
      .from('detalle_consulta')
      .insert([datosConsulta])
      .select()
      .single()

    if (errorConsulta) {
      console.error('Error creando detalle_consulta:', errorConsulta)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Error creando consulta: ${errorConsulta.message}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Retornar respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        mensaje: 'Consulta creada exitosamente',
        datos: {
          consulta: consultaCreada,
          [tipoRelacion]: {
            id: idClienteProveedor,
            fue_creado: !existente,
            nombre,
            email
          }
        }
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error en create-detalle-consulta:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

