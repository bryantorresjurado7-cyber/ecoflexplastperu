
const COMPANY_INFO = {
  brand: 'ECOFLEX PLAST',
  contact: 'Lisset Rodriguez Carranza',
  phone: '946881539',
  email: 'ventas@ecoflexplastperu.com',
  address: 'CAL. LOS PACOS MZ. N LT. 45 A.H. CHAVIN DE HUANTAR, LIMA - LIMA - VILLA EL SALVADOR',
};

const printStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #111827; line-height: 1.4; }
  .print-doc { width: 210mm; min-height: 297mm; padding: 12mm; margin: auto; background: white; box-sizing: border-box; position: relative; overflow: hidden; }
  
  .wm-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 80px;
    font-weight: 900;
    color: rgba(3, 105, 161, 0.05);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
  }

  .print-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 10; }
  .logo { height: 60px; }
  .print-meta-box { text-align: right; font-size: 11px; }
  
  .title-center { text-align: center; margin-bottom: 20px; position: relative; z-index: 10; }
  .print-title { font-size: 24px; font-weight: 900; color: #059669; margin: 0; letter-spacing: 0.5px; }
  .quote-number { color: #6b7280; font-size: 13px; margin-top: 4px; }
  
  .print-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; position: relative; z-index: 10; }
  .box { border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; background: white; }
  .box h4 { margin: 0 0 6px 0; font-size: 12px; color: #374151; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .print-meta { font-size: 11px; line-height: 1.6; }
  
  table.print-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; position: relative; z-index: 10; }
  table.print-table th { background: #ecfdf5; color: #047857; text-align: left; padding: 10px; border: 1px solid #d1fae5; font-weight: 700; }
  table.print-table td { padding: 8px 10px; border: 1px solid #e5e7eb; }
  table.print-table tr:nth-child(even) { background: #f9fafb; }
  .num-right { text-align: right; }
  
  .print-totals { display: grid; grid-template-columns: 1fr 260px; gap: 20px; position: relative; z-index: 10; }
  .numbers-box { border: 1px solid #d1fae5; padding: 15px; border-radius: 10px; background: #f8fafc; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; font-size: 12px; }
  .total-row:last-child { border-bottom: none; }
  .total-row.grand-total { font-weight: 900; font-size: 16px; border-top: 2px solid #059669; margin-top: 6px; padding-top: 10px; color: #111827; }
  .resumen-title { font-weight: 800; font-size: 13px; color: #374151; margin-bottom: 10px; }

  .print-section { margin-top: 15px; position: relative; z-index: 10; }
  .print-section h4 { font-size: 12px; color: #374151; margin: 0 0 6px 0; }
  .print-section div { font-size: 11px; color: #4b5563; }

  /* Certificado specific styles */
  .cert-doc .cert-header { border-bottom: 2px solid #11182710; padding-bottom: 10px; }
  .cert-meta-right .row { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 2px; }
  .cert-meta-right span { color: #6b7280; }
  .cert-title { color: #047857; font-size: 20px; text-align: center; margin: 15px 0; letter-spacing: 0.5px; }
  .cert-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
  .cert-cell { padding: 10px; border: 1px solid #f3f4f6; }
  .cert-cell label { display: block; font-size: 10px; color: #6b7280; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
  .cert-cell div { font-size: 11px; font-weight: 500; }
  .cert-footer { margin-top: 30px; }
  .sig-box { width: 300px; }
  .sig-line { height: 1px; background: #111827; margin: 30px 0 8px; }
  
  /* Datasheet specific styles */
  .ds-badge { background: linear-gradient(90deg, #059669, #0369a1); color: white; padding: 6px 15px; border-radius: 999px; font-weight: 900; font-size: 12px; }
  .ds-hero { display: grid; grid-template-columns: 240px 1fr; gap: 20px; margin-bottom: 15px; }
  .ds-img-container { border: 1.5px solid #0369a1; border-radius: 12px; padding: 10px; height: 220px; background: #ecfdf5; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .ds-img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; }
  .ds-spec-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  .ds-spec-table td { border-bottom: 1px solid #e5e7eb; padding: 6px 10px; font-size: 11px; }
  .ds-spec-table td:first-child { font-weight: 700; color: #4b5563; width: 45%; }
  .ds-card-box { border: 1px solid #e5e7eb; border-left: 4px solid #059669; border-radius: 12px; padding: 12px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
  .ds-benefits-list { columns: 2; column-gap: 20px; margin: 0; font-size: 10px; padding-left: 15px; }
  .ds-apps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .ds-app-item { background: #f0f9ff; border: 1px dashed #0369a1; border-radius: 8px; padding: 8px; text-align: center; font-size: 9px; font-weight: 700; }
  .ds-footer-grid { display: grid; grid-template-columns: 1fr 140px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-top: 15px; }
  .ds-qr-section { border-left: 1px solid #0369a120; background: #f8fafc; padding: 10px; text-align: center; }
  .ds-qr-img { width: 70px; height: 70px; object-fit: contain; }

  @media print {
    .print-doc { width: 100%; height: auto; padding: 10mm; }
    @page { size: A4; margin: 10mm; }
    .wm-watermark { display: block !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

function escapeHtml(str) {
  return (str || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
}

// Product group inference
function inferGroup(name = '', code = '') {
  const n = name.toUpperCase();
  const c = code.toUpperCase();
  if (c.startsWith('ACC-') || /TENAZA|TENSADOR|GRAPA/.test(n)) return 'ACCESORIOS';
  if (c.startsWith('BB-') || /BURBUJA/.test(n)) return 'BURBUJA';
  if (c.startsWith('ESQ') || /ESQUINERO/.test(n)) return 'ESQUINERO';
  if (c.startsWith('MNG-') || /MANGAS?/.test(n)) return 'MANGAS';
  if (/^ZP[BNARY]-/.test(c) || /ZUNCHO/.test(n)) return 'ZUNCHO';
  return 'OTROS';
}

function parseMeters(name = '') {
  const m = /(\d{3,4})\s*(MTS|METROS)/i.exec(name);
  return m ? parseInt(m[1], 10) : null;
}

function parseWidthInches(name = '') {
  const m = /(5\/8|1\/2)/i.exec(name);
  return m ? m[1] : null;
}

// Certificate measurement generators
function randomInRange(min, max, decimals = 2) {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}

function generateRandomMeasurements(count, group, meters, width) {
  const results = [];
  const startHour = 8;
  const stepMinutes = 15;

  let anchoRange = [14.30, 15.70];
  let espRange = [0.80, 1.00];
  let pesoAvg = 10.00;

  if (group === 'ZUNCHO') {
    if (width === '5/8' && meters <= 800) {
      anchoRange = [14.30, 15.60];
      espRange = [0.90, 1.10];
      pesoAvg = meters / 80;
    }
  } else if (group === 'ESQUINERO') {
    anchoRange = [41.70, 41.80];
    espRange = [2.80, 3.80];
    pesoAvg = 0.44; // Example
  }

  for (let i = 0; i < count; i++) {
    const minutes = i * stepMinutes;
    const h = Math.floor(startHour + minutes / 60);
    const m = minutes % 60;
    const timeStr = `${h}:${m.toString().padStart(2, '0')} a. m.`;

    results.push({
      hora: timeStr,
      ancho: randomInRange(anchoRange[0], anchoRange[1]),
      espesor: randomInRange(espRange[0], espRange[1]),
      peso: randomInRange(pesoAvg * 0.98, pesoAvg * 1.02)
    });
  }
  return results;
}

export function printQuotation(cotizacion) {
  const cliente = Array.isArray(cotizacion.cliente) ? cotizacion.cliente[0] : cotizacion.cliente;
  const fecha = new Date(cotizacion.fecha_emision || cotizacion.created_at).toLocaleDateString('es-PE');

  const html = `
    <div class="print-doc">
      <div class="wm-watermark">ECOFLEX PLAST</div>
      <div class="print-header">
        <img src="/images/logo/logoEmpresa.png" class="logo" />
        <div class="print-meta-box">
          <div><strong>Fecha:</strong> ${fecha}</div>
          <div><strong>Válido hasta:</strong> ${cotizacion.valid_until || '15 días'}</div>
        </div>
      </div>
      
      <div class="title-center">
        <h1 class="print-title">COTIZACIÓN</h1>
        <div class="quote-number">N° Cotización: ${cotizacion.numero_cotizacion || 'N/A'}</div>
      </div>
      
      <div class="print-two-col">
        <div class="box">
          <h4>Datos del cliente</h4>
          <div class="print-meta">
            <div><strong>Cliente:</strong> ${escapeHtml(cliente?.nombre || 'N/A')}</div>
            <div><strong>Documento:</strong> ${escapeHtml(cliente?.documento || cliente?.ruc || 'N/A')}</div>
            <div><strong>Dirección:</strong> ${escapeHtml(cliente?.direccion || 'N/A')}</div>
          </div>
        </div>
        <div class="box">
          <h4>Datos de contacto</h4>
          <div class="print-meta">
            <div><strong>Correo:</strong> ${COMPANY_INFO.email}</div>
            <div><strong>Contacto:</strong> ${COMPANY_INFO.contact}</div>
            <div><strong>Teléfono:</strong> ${COMPANY_INFO.phone}</div>
            <div><strong>Dirección:</strong> ${COMPANY_INFO.address}</div>
          </div>
        </div>
      </div>
      
      <div class="print-section" style="margin-bottom:10px">
        <h4>Detalle de la oferta</h4>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width:30px">#</th>
            <th>Producto</th>
            <th>Descripción</th>
            <th style="width:60px">Cant.</th>
            <th style="width:90px">P. Unit.</th>
            <th style="width:100px">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${(cotizacion.detalles || []).map((d, i) => {
    const p = Array.isArray(d.producto) ? d.producto[0] : d.producto;
    return `
              <tr>
                <td class="num-right">${i + 1}</td>
                <td><strong>${escapeHtml(p?.codigo || '')}</strong></td>
                <td>${escapeHtml(p?.nombre || '')}</td>
                <td class="num-right">${d.cantidad}</td>
                <td class="num-right">${formatCurrency(d.precio_unitario)}</td>
                <td class="num-right">${formatCurrency(d.subtotal)}</td>
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>
      
      <div class="print-totals">
        <div>
          <div class="print-section">
            <h4>Certificación</h4>
            <div>Todos los productos se entregan con <strong>CERTIFICADO DE CALIDAD</strong>.</div>
          </div>
          <div class="print-section">
            <h4>Cuentas bancarias</h4>
            <div><strong>Banco:</strong> ${COMPANY_INFO.brand}</div>
            <div><strong>Cuenta:</strong> 1917289798020 / <strong>CCI:</strong> 00219100728979802056</div>
          </div>
          <div class="print-section">
            <h4>Notas</h4>
            <div>${escapeHtml(cotizacion.observaciones || '')}</div>
          </div>
        </div>
        <div class="numbers-box">
          <div class="resumen-title">Resumen</div>
          <div class="total-row"><span>Subtotal</span><strong>${formatCurrency(cotizacion.subtotal || 0)}</strong></div>
          <div class="total-row"><span>Impuestos (18%)</span><strong>${formatCurrency(cotizacion.igv || 0)}</strong></div>
          <div class="total-row grand-total"><span>Total</span><strong>${formatCurrency(cotizacion.total || 0)}</strong></div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html);
}

export function printCertificate(productoData) {
  const name = productoData.nombre || '';
  const code = productoData.codigo || '';
  const group = inferGroup(name, code);
  const meters = parseMeters(name) || 1000;
  const width = parseWidthInches(name) || '5/8';
  const now = new Date();
  const fechaStr = now.toLocaleDateString('es-PE');

  let material = 'Polipropileno 90% - Polietileno 10% (100% reciclado)';
  if (group === 'MANGAS' || group === 'BURBUJA') material = 'Polietileno 100% virgen';
  if (group === 'ESQUINERO') material = 'Polipropileno (PP) 100% reciclado';

  const certNumber = `CERT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-001`;
  const measurements = generateRandomMeasurements(10, group, meters, width);

  const avgA = (measurements.reduce((sum, m) => sum + m.ancho, 0) / measurements.length).toFixed(2);
  const avgE = (measurements.reduce((sum, m) => sum + m.espesor, 0) / measurements.length).toFixed(2);
  const avgP = (measurements.reduce((sum, m) => sum + m.peso, 0) / measurements.length).toFixed(2);

  const html = `
    <div class="print-doc cert-doc">
      <div class="wm-watermark">ECOFLEX PLAST</div>
      <div class="cert-header">
        <img src="/images/logo/logoEmpresa.png" class="logo" />
        <div class="cert-meta-right">
          <div class="row"><span>DEPARTAMENTO</span><strong>CALIDAD</strong></div>
          <div class="row"><span>CERTIFICADO</span><strong>${certNumber}</strong></div>
          <div class="row"><span>FECHA</span><strong>${fechaStr}</strong></div>
        </div>
      </div>
      
      <h1 class="cert-title">CERTIFICADO DE CALIDAD</h1>
      
      <div class="cert-grid">
        <div class="cert-cell"><label>NOMBRE DEL PRODUCTO</label><div>${escapeHtml(name)}</div></div>
        <div class="cert-cell"><label>MATERIAL EMPLEADO</label><div>${material}</div></div>
        <div class="cert-cell"><label>N° LOTES</label><div>1</div></div>
        <div class="cert-cell"><label>COLOR</label><div>${/NEGRO/i.test(name) ? 'NEGRO' : /BLANCO/i.test(name) ? 'BLANCO' : /AZUL/i.test(name) ? 'AZUL' : /ROJO/i.test(name) ? 'ROJO' : 'NATURAL'}</div></div>
        <div class="cert-cell"><label>PROCEDENCIA</label><div>Producto Nacional</div></div>
        <div class="cert-cell"><label>RANGO ANCHO (mm)</label><div>14.30 - 15.70</div></div>
        <div class="cert-cell"><label>RANGO ESPESOR (mm)</label><div>0.80 - 1.10</div></div>
        <div class="cert-cell"><label>FECHA Y UNIDADES</label><div>${fechaStr} · Metros</div></div>
        <div class="cert-cell"><label>CANTIDAD TOTAL</label><div>1</div></div>
      </div>
      
      <div class="print-section" style="margin-top:20px">
        <h4 style="text-transform:uppercase; border-bottom:1px solid #eee; padding-bottom:5px">Mediciones</h4>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width:30px">N°</th>
              <th>HORA</th>
              <th class="num-right">ANCHO (mm)</th>
              <th class="num-right">ESPESOR (mm)</th>
              <th class="num-right">PESO/LONG</th>
            </tr>
          </thead>
          <tbody>
            ${measurements.map((m, i) => `
              <tr>
                <td class="num-right">${i + 1}</td>
                <td>${m.hora}</td>
                <td class="num-right">${m.ancho.toFixed(2)}</td>
                <td class="num-right">${m.espesor.toFixed(2)}</td>
                <td class="num-right">${m.peso.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight:bold; background:#f8fafc">
              <td colspan="2">PROMEDIO</td>
              <td class="num-right">${avgA}</td>
              <td class="num-right">${avgE}</td>
              <td class="num-right">${avgP}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div class="cert-footer">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-name">${COMPANY_INFO.contact}</div>
          <div class="sig-info">Departamento de Calidad</div>
          <div class="sig-info">${COMPANY_INFO.email}</div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html);
}

export function printDatasheet(productoData) {
  const name = productoData.nombre || '';
  const code = productoData.codigo || '';
  const group = inferGroup(name, code);
  const meters = parseMeters(name) || 1000;
  const widthStr = parseWidthInches(name) || '5/8';
  const widthMm = widthStr === '5/8' ? '15.87 mm' : '12.70 mm';

  const imgMap = {
    ZUNCHO: '/images/zunchos.png',
    ESQUINERO: '/images/esquinero.png',
    BURBUJA: '/images/burbupack.png',
    MANGAS: '/images/manga.png',
  };
  const imgSrc = imgMap[group] || '/images/logo/logoEmpresa.png';

  const html = `
    <div class="print-doc datasheet-doc">
      <div class="wm-watermark">ECOFLEX PLAST</div>
      <div class="ds-top">
        <img src="/images/logo/logoEmpresa.png" class="logo" />
        <div class="ds-badge">FICHA TÉCNICA</div>
      </div>
      
      <div class="ds-title-band">
        <div class="ds-name">${escapeHtml(name)}</div>
        <div class="ds-code">Código: ${escapeHtml(code)}</div>
      </div>
      
      <div class="ds-hero">
        <div class="ds-img-container"><img src="${imgSrc}" class="ds-img" /></div>
        <div>
          <div class="ds-section-title">Especificaciones técnicas</div>
          <div class="ds-card-box">
            <table class="ds-spec-table">
              <tr><td>Material</td><td>Polipropileno (PP) 100%</td></tr>
              <tr><td>Ancho</td><td>${widthStr} (${widthMm})</td></tr>
              <tr><td>Espesor</td><td>0.90 - 1.10 mm</td></tr>
              <tr><td>Rendimiento</td><td>${meters} m/rollo</td></tr>
              <tr><td>Resistencia</td><td>220 - 370 kgf</td></tr>
              <tr><td>Peso</td><td>10 kg aprox.</td></tr>
            </table>
          </div>
        </div>
      </div>
      
      <div class="ds-section-title">Colores disponibles</div>
      <div class="ds-card-box" style="padding:10px">
        <div style="display:flex; gap:10px; font-size:11px; font-weight:600">
          <span>● Amarillo</span> <span>● Blanco</span> <span>● Negro</span> <span>● Rojo</span> <span>● Azul</span>
        </div>
      </div>

      <div class="ds-section-title">Características y beneficios</div>
      <div class="ds-card-box">
        <ul class="ds-benefits-list">
          <li>100% reciclable y ecológico</li>
          <li>Excelente resistencia a la intemperie</li>
          <li>Compatible con máquinas manuales</li>
          <li>No se oxida ni corroe</li>
          <li>Excelente relación costo-beneficio</li>
          <li>Sellado confiable con grapas</li>
          <li>Alta resistencia a la ruptura</li>
          <li>Resistente a cambios de temperatura</li>
          <li>Superficie texturizada</li>
          <li>Fácil manipulación y aplicación</li>
        </ul>
      </div>

      <div class="ds-section-title">Aplicaciones principales</div>
      <div class="ds-card-box"><div class="ds-apps-grid">
        <div class="ds-app-item">Embalaje de Cajas</div>
        <div class="ds-app-item">Paletizado</div>
        <div class="ds-app-item">Amarre de Bultos</div>
        <div class="ds-app-item">Fijación de Cargas</div>
      </div></div>

      <div class="ds-footer-grid">
        <div class="ds-contact">
          <div style="font-weight:800; color:#0369a1; margin-bottom:5px; font-size:12px">Información de contacto</div>
          <div style="font-size:10px">
            <div><strong>Correo:</strong> ${COMPANY_INFO.email}</div>
            <div><strong>Contacto:</strong> ${COMPANY_INFO.contact}</div>
            <div><strong>Teléfono:</strong> ${COMPANY_INFO.phone}</div>
            <div><strong>Dirección:</strong> ${COMPANY_INFO.address}</div>
          </div>
        </div>
        <div class="ds-qr-section">
          <div style="font-weight:800; font-size:11px; margin-bottom:5px">Código QR</div>
          <div style="width:60px; height:60px; border:1px solid #111; margin:auto; background:white"></div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html);
}

function openPrintWindow(html) {
  const win = window.open('', '_blank', 'width=900,height=800');
  win.document.write(`
    <html>
      <head>
        <title>ECOFLEX PLAST - Imprimir</title>
        <style>${printStyles}</style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              // window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}
