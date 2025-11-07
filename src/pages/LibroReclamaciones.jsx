import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const LibroReclamaciones = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, watch, reset } = useForm({ mode: 'onChange' });
  // Bloquear caracteres y secuencias peligrosas (XSS/SQLi)
  const bannedChars = /[<>"'`$|/\\&;:]/g; // incluye < > " ' ` $ | / \ & ; :
  const bannedSeq = /(--)|(\/\*)|(\*\/)/g; // --, /*, */
  const sanitizeInput = (v) => {
    if (typeof v !== 'string') return v;
    return v.replace(bannedChars, '').replace(bannedSeq, '');
  };
  const preventKeys = (e) => {
    const k = e.key;
    const banned = ['<', '>', '"', "'", '`', '$', '|', '/', '\\', '&', ';', ':'];
    if (banned.includes(k)) {
      e.preventDefault();
      return;
    }
    // Evitar crear "--" consecutivo
    if (k === '-' ) {
      const el = e.currentTarget;
      const pos = el.selectionStart || 0;
      const prev = el.value?.charAt(pos - 1) || '';
      if (prev === '-') e.preventDefault();
    }
  };
  const preventBeforeInput = (e) => {
    const data = typeof e.data === 'string' ? e.data : '';
    if (bannedChars.test(data) || bannedSeq.test(data)) {
      e.preventDefault();
    }
  };
  const sanitizeOnInput = (e) => {
    const { value } = e.currentTarget;
    if (bannedChars.test(value) || bannedSeq.test(value)) {
      e.currentTarget.value = value.replace(bannedChars, '').replace(bannedSeq, '');
    }
  };
  // Sanitizadores específicos por tipo de campo
  const digitsOnly = (e) => {
    const v = e.currentTarget.value || '';
    e.currentTarget.value = v.replace(/\D+/g, '');
  };
  const phoneOnInput = (e) => {
    const v = e.currentTarget.value || '';
    const cleaned = v.replace(/(?!^)\+|[^\d+]/g, '');
    e.currentTarget.value = cleaned;
  };
  const decimalOnInput = (e) => {
    const v = (e.currentTarget.value || '').replace(/,/g, '.').replace(/[^\d.]/g, '');
    const parts = v.split('.');
    const normalized = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0];
    e.currentTarget.value = normalized;
  };
  const preventPaste = (e) => {
    const text = e.clipboardData.getData('text') || '';
    if (bannedChars.test(text) || bannedSeq.test(text)) {
      e.preventDefault();
      const sanitized = text.replace(bannedChars, '').replace(bannedSeq, '');
      const target = e.target;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      target.value = target.value.slice(0, start) + sanitized + target.value.slice(end);
    }
  };
  const secureEvents = { onKeyDown: preventKeys, onPaste: preventPaste, onBeforeInput: preventBeforeInput, onInput: sanitizeOnInput };
  const [enviado, setEnviado] = useState(false);

  const onSubmit = async (data) => {
    // En un backend real se enviaría a una API
    // Simulamos el envío
    await new Promise((r) => setTimeout(r, 600));
    console.log('Reclamo enviado', data);
    setEnviado(true);
    reset();
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-fondo-claro">
      <div className="bg-white border-b border-gris-muy-claro">
        <div className="container-max section-padding py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-negro-principal mb-2">Libro de Reclamaciones</h1>
              <p className="text-gris-oscuro max-w-3xl">
                Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571), ponemos a tu disposición nuestro Libro de Reclamaciones virtual.
              </p>
            </div>
            <img src="/images/libro-reclamaciones-peru.svg" alt="Libro de Reclamaciones" className="hidden md:block w-28 h-28" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información legal */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-3">Información de la empresa</h3>
              <ul className="text-sm text-gris-oscuro space-y-2">
                <li><span className="font-medium">Razón Social:</span> EcoFlexPack S.A.C.</li>
                <li><span className="font-medium">RUC:</span> 20601236547</li>
                <li><span className="font-medium">Dirección 1:</span> Calle 2 Sector 3 Grupo 29 Mz.N Lt.45, Villa El Salvador</li>
                <li><span className="font-medium">Dirección 2:</span> Jr. Isabel Flores de Oliva 270, Lima 15079</li>
                <li><span className="font-medium">Correo:</span> ventas@ecoflexplastperu.com</li>
                <li><span className="font-medium">Teléfono:</span> +51 946 881 539</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-3">Importante</h3>
              <ul className="text-sm text-gris-oscuro list-disc pl-5 space-y-2">
                <li>Reclamo: Disconformidad relacionada a productos o servicios.</li>
                <li>Queja: Malestar o descontento respecto a la atención al público.</li>
                <li>Te responderemos en un plazo máximo de 30 días calendario.</li>
              </ul>
            </div>
          </aside>

          {/* Formulario */}
          <section className="lg:col-span-2">
            {enviado && (
              <div className="mb-6 p-4 rounded-lg border border-green-200 bg-green-50 text-green-700">
                Tu registro fue enviado correctamente. Nos pondremos en contacto contigo dentro del plazo legal.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Tipo de registro</h3>
                <p className="text-sm text-gris-medio mb-4">Selecciona si tu comunicación es un Reclamo o una Queja.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gris-muy-claro/40">
                    <input type="radio" value="Reclamo" {...register('tipo', { required: true })} />
                    <span className="font-medium">Reclamo</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gris-muy-claro/40">
                    <input type="radio" value="Queja" {...register('tipo', { required: true })} />
                    <span className="font-medium">Queja</span>
                  </label>
                </div>
                {errors.tipo && <p className="text-sm text-red-600 mt-2">Selecciona una opción.</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Datos del consumidor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input-field" placeholder="Nombres y apellidos" {...register('nombre', { required: true, setValueAs: sanitizeInput })} {...secureEvents} />
                  <input className="input-field" placeholder="DNI o RUC" inputMode="numeric" pattern="\\d*"
                    {...register('documento', {
                      required: true,
                      setValueAs: (v) => (typeof v === 'string' ? v.replace(/\D+/g, '') : v),
                      validate: (v) => (/^\d{8}$/.test(v) || /^\d{11}$/.test(v)) || 'Ingrese 8 (DNI) o 11 (RUC) dígitos'
                    })}
                    {...secureEvents}
                    onInput={digitsOnly}
                  />
                  <div className="space-y-1">
                    <input
                      className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      type="email"
                      inputMode="email"
                      placeholder="Correo electrónico"
                      {...register('email', {
                        required: 'El email es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      {...secureEvents}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  <input className="input-field" type="tel" placeholder="Teléfono" inputMode="tel"
                    {...register('telefono', {
                      required: true,
                      setValueAs: (v) => (typeof v === 'string' ? v.replace(/(?!^)\+|[^\d+]/g, '') : v),
                      pattern: /^\+?\d{6,15}$/
                    })}
                    {...secureEvents}
                    onInput={phoneOnInput}
                  />
                  <input className="input-field md:col-span-2" placeholder="Dirección" {...register('direccion', { required: true, setValueAs: sanitizeInput })} {...secureEvents} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Detalle de la compra/servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input-field" type="date" placeholder="Fecha (aprox.)" {...register('fecha', { required: true })} />
                  <input className="input-field" placeholder="Monto (si aplica)" inputMode="decimal" pattern="^\\d+(?:[.,]\\d{0,2})?$"
                    {...register('monto', {
                      setValueAs: (v) => {
                        if (typeof v !== 'string') return v;
                        const t = v.replace(/,/g, '.').replace(/[^\d.]/g, '');
                        const parts = t.split('.');
                        const norm = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0];
                        return norm;
                      }
                    })}
                    {...secureEvents}
                    onInput={decimalOnInput}
                  />
                  <input className="input-field md:col-span-2" placeholder="Descripción del bien contratado" {...register('bien', { required: true, setValueAs: sanitizeInput })} {...secureEvents} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Descripción</h3>
                <textarea className="input-field h-28" placeholder="Detalla tu reclamo o queja" {...register('descripcion', { required: true, setValueAs: sanitizeInput })} {...secureEvents} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Pedido del consumidor</h3>
                <textarea className="input-field h-24" placeholder="¿Qué solución solicitas?" {...register('pedido', { required: true, setValueAs: sanitizeInput })} {...secureEvents} />
              </div>

              <div className="flex items-start gap-3">
                <input id="acepto" type="checkbox" {...register('acepto', { required: true })} />
                <label htmlFor="acepto" className="text-sm text-gris-oscuro cursor-pointer select-none">
                  Declaro que la información proporcionada es veraz y autorizo el tratamiento de mis datos personales de acuerdo con la{' '}
                  <Link to="/privacidad" className="text-verde-principal hover:underline">Política de Privacidad</Link>.
                </label>
              </div>
              {errors.acepto && <p className="text-sm text-red-600">Debes aceptar para enviar el formulario.</p>}

              <div className="pt-2">
                <button
                  disabled={isSubmitting || !isValid || !watch('acepto')}
                  aria-disabled={isSubmitting || !isValid || !watch('acepto')}
                  className={`btn-primary ${(!isValid || !watch('acepto') || isSubmitting) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {isSubmitting ? 'Enviando…' : 'Enviar registro'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LibroReclamaciones;


