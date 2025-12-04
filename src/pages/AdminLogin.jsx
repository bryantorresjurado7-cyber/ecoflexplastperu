import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Función para normalizar email: eliminar caracteres invisibles y espacios
  const normalizeEmail = (value) => {
    // Eliminar caracteres invisibles (zero-width, controles, etc.)
    return value
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
      .trim(); // Recortar espacios al inicio/fin
  }

  // Función de validación estricta de email
  const validateEmail = (value) => {
    // Normalizar
    const normalized = normalizeEmail(value);

    // Bloquear caracteres peligrosos: espacios, comillas, acentos, tildes, < > ( ) { } [ ], \ /, , ; :, `, |, &, !, ?, =, *, etc.
    const dangerousChars = /[\s'"áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöüÄËÏÖÜñÑ<>(){}[\]\\\/,;:`|&!?=*]/;
    if (dangerousChars.test(normalized)) {
      return 'El email contiene caracteres no permitidos';
    }

    // Solo permitir: letras, números, punto, guion, guion bajo, signo +, %, y @
    const allowedChars = /^[a-zA-Z0-9._+\-%@]+$/;
    if (!allowedChars.test(normalized)) {
      return 'El email contiene caracteres no permitidos';
    }

    // Verificar longitud máxima total (254 caracteres)
    if (normalized.length > 254) {
      return 'El email no puede exceder 254 caracteres';
    }

    // Verificar que haya solo una @
    const atCount = (normalized.match(/@/g) || []).length;
    if (atCount === 0) {
      return 'El email debe contener un símbolo @';
    }
    if (atCount > 1) {
      return 'El email solo puede contener un símbolo @';
    }

    // Separar parte local y dominio
    const parts = normalized.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];

    // Validar parte local
    if (!localPart || localPart.length === 0) {
      return 'La parte local del email no puede estar vacía';
    }

    // Parte local: máximo 64 caracteres
    if (localPart.length > 64) {
      return 'La parte local del email no puede exceder 64 caracteres';
    }

    // Sin punto al inicio/fin de la parte local
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return 'La parte local no puede comenzar o terminar con punto';
    }

    // Sin puntos consecutivos en la parte local
    if (localPart.includes('..')) {
      return 'No se permiten puntos consecutivos en la parte local';
    }

    // Validar dominio
    if (!domainPart || domainPart.length === 0) {
      return 'El dominio del email no puede estar vacío';
    }

    // Convertir dominio a minúsculas para validación
    const domainLower = domainPart.toLowerCase();

    // El dominio solo puede contener letras, números, guiones y puntos
    const domainAllowedChars = /^[a-z0-9.-]+$/;
    if (!domainAllowedChars.test(domainLower)) {
      return 'El dominio contiene caracteres no permitidos';
    }

    // Sin guion bajo en el dominio
    if (domainLower.includes('_')) {
      return 'El dominio no puede contener guion bajo';
    }

    // Debe haber al menos un punto en el dominio
    if (!domainLower.includes('.')) {
      return 'El dominio debe contener al menos un punto';
    }

    // Separar etiquetas del dominio
    const domainLabels = domainLower.split('.');

    // Validar cada etiqueta del dominio
    for (let i = 0; i < domainLabels.length; i++) {
      const label = domainLabels[i];

      // Cada etiqueta no puede estar vacía
      if (!label || label.length === 0) {
        return 'El dominio no puede tener etiquetas vacías';
      }

      // Sin guion al inicio/fin de cada etiqueta
      if (label.startsWith('-') || label.endsWith('-')) {
        return 'Las etiquetas del dominio no pueden comenzar o terminar con guion';
      }

      // Cada etiqueta máximo 63 caracteres
      if (label.length > 63) {
        return 'Cada etiqueta del dominio no puede exceder 63 caracteres';
      }

      // Sin puntos consecutivos (ya validado por split, pero por seguridad)
      if (i < domainLabels.length - 1 && domainLabels[i + 1] === '') {
        return 'No se permiten puntos consecutivos en el dominio';
      }
    }

    // TLD (última etiqueta) debe tener al menos 2 letras
    const tld = domainLabels[domainLabels.length - 1];
    if (tld.length < 2) {
      return 'El dominio de nivel superior (TLD) debe tener al menos 2 caracteres';
    }

    // El TLD solo debe contener letras
    if (!/^[a-z]+$/.test(tld)) {
      return 'El dominio de nivel superior (TLD) solo puede contener letras';
    }

    return null; // Email válido
  }

  // Manejar cambio en el campo de email
  const handleEmailChange = (e) => {
    const value = e.target.value;

    // Permitir escribir siempre, pero filtrar caracteres peligrosos
    // Eliminar caracteres peligrosos en tiempo real
    let filteredValue = value
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
      .replace(/[\s'"áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöüÄËÏÖÜñÑ<>(){}[\]\\\/,;:`|&!?=*]/g, ''); // Caracteres peligrosos

    // Limitar longitud máxima
    if (filteredValue.length > 254) {
      filteredValue = filteredValue.substring(0, 254);
    }

    // Actualizar el email
    setEmail(filteredValue);

    // Si el campo está vacío, no validar aún
    if (filteredValue.length === 0) {
      setEmailError('');
      return;
    }

    // Validar en tiempo real para mostrar errores
    const validationError = validateEmail(filteredValue);

    if (validationError) {
      setEmailError(validationError);
    } else {
      // Si es válido, normalizar el dominio a minúsculas
      if (filteredValue.includes('@')) {
        const parts = filteredValue.split('@');
        const domainPart = parts[1];
        if (domainPart) {
          // Convertir dominio a minúsculas
          const normalizedEmail = parts[0] + '@' + domainPart.toLowerCase();
          setEmail(normalizedEmail);
        }
      }
      setEmailError('');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setLoading(true)

    // Normalizar email antes de validar
    const normalizedEmail = normalizeEmail(email);
    let finalEmail = normalizedEmail;

    // Convertir dominio a minúsculas si hay @
    if (normalizedEmail.includes('@')) {
      const parts = normalizedEmail.split('@');
      const domainPart = parts[1];
      if (domainPart) {
        finalEmail = parts[0] + '@' + domainPart.toLowerCase();
      }
    }

    // Validar email antes de enviar
    const emailValidationError = validateEmail(finalEmail);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setLoading(false);
      return;
    }

    // Actualizar el email normalizado en el estado
    setEmail(finalEmail);

    try {
      const result = await login(finalEmail.trim(), password)

      if (result.success) {
        navigate('/admin/dashboard')
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-verde-light via-white to-fondo-claro flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradiente-boton rounded-xl shadow-lg mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-negro-principal mb-2">
            Panel de Administración
          </h2>
          <p className="text-gris-medio">
            EcoFlexPlast
          </p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-negro-principal mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gris-medio" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    // Validar al perder el foco también
                    if (email && email.length > 0) {
                      const validationError = validateEmail(email);
                      if (validationError) {
                        setEmailError(validationError);
                      }
                    }
                  }}
                  className={`input-field pl-10 ${emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="admin@ecoflexplast.com"
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-negro-principal mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gris-medio" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Recordar sesión */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-verde-principal focus:ring-verde-principal border-gris-muy-claro rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gris-oscuro">
                  Recordar sesión
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-verde-principal hover:text-verde-hover">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link de retorno */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gris-medio hover:text-verde-principal transition-colors"
          >
            ← Volver al sitio web
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
