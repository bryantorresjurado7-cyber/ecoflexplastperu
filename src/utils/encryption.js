/**
 * Sistema de Encriptación AES-256-GCM para datos JSON
 * 
 * Proporciona encriptación/desencriptación segura de datos JSON
 * con soporte para activar/desactivar mediante variable de entorno
 */

const ENCRYPTION_ENABLED = import.meta.env.VITE_ENABLE_ENCRYPTION === 'true'

/**
 * GENERACIÓN DE LLAVE DINÁMICA POR SESIÓN
 * Para seguridad estilo 'Java Backend', no guardamos llaves en el código.
 * Generamos una llave aleatoria cada vez que el usuario carga la web.
 */
const generateSessionKey = () => {
  // Generar un string aleatorio de 32 caracteres
  const array = new Uint8Array(24);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Esta llave solo vive en la memoria RAM de esta pestaña del navegador
const SESSION_ENCRYPTION_KEY = generateSessionKey();

/**
 * Exporta la llave de sesión actual (para enviarla al servidor)
 */
export function getSessionKey() {
  return SESSION_ENCRYPTION_KEY;
}

/**
 * Convierte un string a ArrayBuffer
 */
function str2ab(str) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/**
 * Convierte ArrayBuffer a string
 */
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

/**
 * Convierte ArrayBuffer a Base64
 */
function ab2base64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convierte Base64 a ArrayBuffer
 */
function base642ab(base64) {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Genera una clave de encriptación desde un string
 */
async function generateKey(password) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ecoflex-salt-2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encripta datos JSON
 * @param {any} data - Datos a encriptar (se convertirán a JSON)
 * @returns {Promise<string>} String Base64 encriptado
 */
export async function encryptData(data) {
  if (!ENCRYPTION_ENABLED) {
    // Si la encriptación está desactivada, devolver los datos tal cual
    return data
  }

  try {
    // Convertir datos a JSON
    const jsonString = JSON.stringify(data)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(jsonString)

    // Generar clave dinámica de sesión
    const key = await generateKey(SESSION_ENCRYPTION_KEY)

    // Generar IV (vector de inicialización) aleatorio
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encriptar
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    )

    // Combinar IV + datos encriptados
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    // Convertir a Base64
    return ab2base64(combined.buffer)
  } catch (error) {
    console.error('Error al encriptar datos:', error)
    throw new Error('Error en la encriptación de datos')
  }
}

/**
 * Desencripta datos
 * @param {string|any} encryptedData - String Base64 encriptado o datos sin encriptar
 * @returns {Promise<any>} Datos desencriptados y parseados
 */
export async function decryptData(encryptedData) {
  if (!ENCRYPTION_ENABLED) {
    // Si la encriptación está desactivada, devolver los datos tal cual
    return encryptedData
  }

  try {
    // Si los datos no son un string, probablemente ya están desencriptados
    if (typeof encryptedData !== 'string') {
      return encryptedData
    }

    // Convertir de Base64 a ArrayBuffer
    const combined = base642ab(encryptedData)

    // Separar IV y datos encriptados
    const iv = combined.slice(0, 12)
    const encryptedBuffer = combined.slice(12)

    // Generar clave dinámica de sesión
    const key = await generateKey(SESSION_ENCRYPTION_KEY)

    // Desencriptar
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      encryptedBuffer
    )

    // Convertir a string y parsear JSON
    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decryptedBuffer)

    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error al desencriptar datos:', error)
    // Si falla la desencriptación, intentar devolver los datos originales
    // (puede ser que no estén encriptados)
    try {
      return typeof encryptedData === 'string'
        ? JSON.parse(encryptedData)
        : encryptedData
    } catch {
      throw new Error('Error en la desencriptación de datos')
    }
  }
}

/**
 * Verifica si la encriptación está habilitada
 * @returns {boolean}
 */
export function isEncryptionEnabled() {
  return ENCRYPTION_ENABLED
}

/**
 * Obtiene el estado de configuración de encriptación
 * @returns {object}
 */
export function getEncryptionConfig() {
  return {
    enabled: ENCRYPTION_ENABLED,
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2',
    iterations: 100000
  }
}
