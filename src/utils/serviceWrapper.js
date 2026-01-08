/**
 * Service Wrapper con Encriptación Automática
 * 
 * Intercepta las llamadas a servicios y encripta/desencripta
 * automáticamente los datos según la configuración
 */

import { encryptData, decryptData, isEncryptionEnabled } from './encryption'

/**
 * Envuelve una función de servicio para agregar encriptación automática
 * @param {Function} serviceFn - Función del servicio a envolver
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Función envuelta con encriptación
 */
export function wrapServiceMethod(serviceFn, options = {}) {
  const {
    encryptResponse = true,
    encryptRequest = false,
    skipEncryption = false
  } = options

  return async function(...args) {
    try {
      // Si la encriptación está deshabilitada o se debe omitir, ejecutar normalmente
      if (!isEncryptionEnabled() || skipEncryption) {
        return await serviceFn(...args)
      }

      // Encriptar argumentos de la petición si está habilitado
      let processedArgs = args
      if (encryptRequest && args.length > 0) {
        processedArgs = await Promise.all(
          args.map(async arg => {
            // Solo encriptar objetos y arrays, no strings simples o números
            if (typeof arg === 'object' && arg !== null) {
              return await encryptData(arg)
            }
            return arg
          })
        )
      }

      // Ejecutar la función del servicio
      const result = await serviceFn(...processedArgs)

      // Encriptar la respuesta si está habilitado
      if (encryptResponse) {
        // Si el resultado es null o undefined, devolverlo tal cual
        if (result === null || result === undefined) {
          return result
        }

        // Encriptar el resultado completo
        return {
          encrypted: true,
          data: await encryptData(result)
        }
      }

      return result
    } catch (error) {
      console.error('Error en wrapper de servicio:', error)
      throw error
    }
  }
}

/**
 * Envuelve un objeto de servicio completo
 * @param {Object} service - Objeto con métodos de servicio
 * @param {Object} options - Opciones de configuración por defecto
 * @returns {Object} Servicio envuelto con encriptación
 */
export function wrapService(service, options = {}) {
  const wrappedService = {}

  for (const [key, value] of Object.entries(service)) {
    if (typeof value === 'function') {
      // Envolver cada método del servicio
      wrappedService[key] = wrapServiceMethod(value.bind(service), options)
    } else {
      // Copiar propiedades que no sean funciones
      wrappedService[key] = value
    }
  }

  return wrappedService
}

/**
 * Desencripta una respuesta del servidor
 * @param {any} response - Respuesta a desencriptar
 * @returns {Promise<any>} Datos desencriptados
 */
export async function unwrapResponse(response) {
  if (!isEncryptionEnabled()) {
    return response
  }

  try {
    // Si la respuesta tiene la estructura de datos encriptados
    if (response && typeof response === 'object' && response.encrypted && response.data) {
      return await decryptData(response.data)
    }

    // Si la respuesta es un string (posiblemente encriptado)
    if (typeof response === 'string') {
      return await decryptData(response)
    }

    // De lo contrario, devolver tal cual
    return response
  } catch (error) {
    console.error('Error al desencriptar respuesta:', error)
    return response
  }
}

/**
 * Hook personalizado para usar servicios con encriptación
 * @param {Object} service - Servicio a usar
 * @param {string} methodName - Nombre del método a llamar
 * @param {Array} args - Argumentos para el método
 * @returns {Promise<any>} Resultado desencriptado
 */
export async function useSecureService(service, methodName, ...args) {
  try {
    const result = await service[methodName](...args)
    return await unwrapResponse(result)
  } catch (error) {
    console.error(`Error en servicio seguro ${methodName}:`, error)
    throw error
  }
}

/**
 * Crea un proxy de servicio con encriptación automática
 * Mantiene compatibilidad con código existente
 */
export function createSecureServiceProxy(service, options = {}) {
  const {
    autoUnwrap = true,
    ...wrapOptions
  } = options

  return new Proxy(service, {
    get(target, prop) {
      const originalValue = target[prop]
      
      if (typeof originalValue !== 'function') {
        return originalValue
      }

      return async function(...args) {
        const wrappedMethod = wrapServiceMethod(originalValue.bind(target), wrapOptions)
        const result = await wrappedMethod(...args)
        
        // Auto-desencriptar si está habilitado
        if (autoUnwrap && isEncryptionEnabled()) {
          return await unwrapResponse(result)
        }
        
        return result
      }
    }
  })
}

export default {
  wrapServiceMethod,
  wrapService,
  unwrapResponse,
  useSecureService,
  createSecureServiceProxy
}
