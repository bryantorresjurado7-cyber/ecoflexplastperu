import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import { QuoteProvider } from './contexts/QuoteContext';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingCart from './components/FloatingCart';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Productos from './pages/Productos';
import Catalogo from './pages/Catalogo';
import ProductoDetalleV2 from './pages/ProductoDetalleV2';
import ProductoDetalle from './pages/ProductoDetalle';
import Colores from './pages/Colores';
import Accesorios from './pages/Accesorios';
import Contacto from './pages/Contacto';
import Cotizacion from './pages/Cotizacion';
import SobreNosotros from './pages/SobreNosotros';
import FAQ from './pages/FAQ';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import LibroReclamaciones from './pages/LibroReclamaciones';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductos from './pages/AdminProductos';
import AdminProductoForm from './pages/AdminProductoForm';
import AdminMovimientoForm from './pages/AdminMovimientoForm';
import AdminVenta from './pages/AdminVenta';
import AdminVentasLista from './pages/AdminVentasLista';
import AdminDashboardVentas from './pages/AdminDashboardVentas';
import AdminDashboardProductos from './pages/AdminDashboardProductos';
import AdminReportes from './pages/AdminReportes';
import AdminMovimientos from './pages/AdminMovimientos';
import AdminCotizaciones from './pages/AdminCotizaciones';
import AdminCotizacionesDashboard from './pages/AdminCotizacionesDashboard';
import AdminCotizacionForm from './pages/AdminCotizacionForm';
import AdminLayout from './components/AdminLayout';
import AdminClientes from './pages/AdminClientes';
import AdminProduccion from './pages/AdminProduccion';
import AdminProduccionForm from './pages/AdminProduccionForm';
import AdminProduccionValidacion from './pages/AdminProduccionValidacion';
import AdminInsumos from './pages/AdminInsumos';
import AdminInsumoForm from './pages/AdminInsumoForm';
import AdminProveedores from './pages/AdminProveedores';
import AdminProveedorForm from './pages/AdminProveedorForm';
import AdminMaquinarias from './pages/AdminMaquinarias';
import AdminMaquinariaForm from './pages/AdminMaquinariaForm';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminUsuarioForm from './pages/AdminUsuarioForm';
import AdminConfiguracion from './pages/AdminConfiguracion';
import AdminCajaChica from './pages/AdminCajaChica';
import AdminCajaChicaMovimientos from './pages/AdminCajaChicaMovimientos';
import AdminCajaChicaAprobaciones from './pages/AdminCajaChicaAprobaciones';
import AdminCajaChicaArqueo from './pages/AdminCajaChicaArqueo';
import AdminCajaChicaConfig from './pages/AdminCajaChicaConfig';
import AdminCajaChicaReportes from './pages/AdminCajaChicaReportes'

import AdminClientesNuevosDashboard from './pages/AdminClientesNuevosDashboard';
import PrintView from './pages/PrintView';

function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Rutas públicas con layout normal */}
            <Route path="/" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Home />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/productos" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Productos />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/catalogo" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Catalogo />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/producto-v2/:id" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <ProductoDetalleV2 />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/producto/:id" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <ProductoDetalle />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/colores" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Colores />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/accesorios" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Accesorios />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/contacto" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Contacto />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/cotizacion" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Cotizacion />
                </main>
                <Footer />
                <FloatingCart />
              </div>
            } />

            <Route path="/sobre-nosotros" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <SobreNosotros />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/faq" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <FAQ />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/terminos" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Terminos />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/privacidad" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Privacidad />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/libro-reclamaciones" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <LibroReclamaciones />
                </main>
                <Footer />
              </div>
            } />

            {/* Rutas de administración (sin Header/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard/productos" element={
              <ProtectedRoute>
                <AdminDashboardProductos />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard/clientes-nuevos" element={
              <ProtectedRoute>
                <AdminClientesNuevosDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/reportes" element={
              <ProtectedRoute>
                <AdminReportes />
              </ProtectedRoute>
            } />

            <Route path="/admin/productos" element={
              <ProtectedRoute>
                <AdminProductos />
              </ProtectedRoute>
            } />

            <Route path="/admin/movimientos" element={
              <ProtectedRoute>
                <AdminMovimientos />
              </ProtectedRoute>
            } />

            <Route path="/admin/movimientos/nuevo" element={
              <ProtectedRoute>
                <AdminMovimientoForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/venta" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVenta />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard/ventas" element={
              <ProtectedRoute>
                <AdminDashboardVentas />
              </ProtectedRoute>
            } />

            <Route path="/admin/ventas" element={
              <ProtectedRoute>
                <AdminVentasLista />
              </ProtectedRoute>
            } />

            <Route path="/admin/productos/nuevo" element={
              <ProtectedRoute>
                <AdminProductoForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/productos/editar/:id" element={
              <ProtectedRoute>
                <AdminProductoForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/insumos" element={
              <ProtectedRoute>
                <AdminInsumos />
              </ProtectedRoute>
            } />

            <Route path="/admin/insumos/nuevo" element={
              <ProtectedRoute>
                <AdminInsumoForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/insumos/editar/:id" element={
              <ProtectedRoute>
                <AdminInsumoForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/proveedores" element={
              <ProtectedRoute>
                <AdminProveedores />
              </ProtectedRoute>
            } />

            <Route path="/admin/proveedores/nuevo" element={
              <ProtectedRoute>
                <AdminProveedorForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/proveedores/editar/:id" element={
              <ProtectedRoute>
                <AdminProveedorForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/maquinarias" element={
              <ProtectedRoute>
                <AdminMaquinarias />
              </ProtectedRoute>
            } />

            <Route path="/admin/maquinarias/nuevo" element={
              <ProtectedRoute>
                <AdminMaquinariaForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/maquinarias/editar/:id" element={
              <ProtectedRoute>
                <AdminMaquinariaForm />
              </ProtectedRoute>
            } />
            {/* Usuarios routes */}
            <Route path="/admin/usuarios" element={
              <ProtectedRoute>
                <AdminUsuarios />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios/nuevo" element={
              <ProtectedRoute>
                <AdminUsuarioForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios/editar/:id" element={
              <ProtectedRoute>
                <AdminUsuarioForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/cotizaciones" element={
              <ProtectedRoute>
                <AdminCotizaciones />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard-cotizaciones" element={
              <ProtectedRoute>
                <AdminCotizacionesDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/cotizaciones/nueva" element={
              <ProtectedRoute>
                <AdminCotizacionForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/cotizaciones/editar/:id" element={
              <ProtectedRoute>
                <AdminCotizacionForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/clientes" element={
              <ProtectedRoute>
                <AdminClientes />
              </ProtectedRoute>
            } />

            <Route path="/admin/produccion" element={
              <ProtectedRoute>
                <AdminProduccion />
              </ProtectedRoute>
            } />

            <Route path="/admin/produccion/nuevo" element={
              <ProtectedRoute>
                <AdminProduccionForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/produccion/editar/:id" element={
              <ProtectedRoute>
                <AdminProduccionForm />
              </ProtectedRoute>
            } />

            <Route path="/admin/produccion/validar/:id" element={
              <ProtectedRoute>
                <AdminProduccionValidacion />
              </ProtectedRoute>
            } />

            {/* Transacciones (Antes Caja Chica) Routes */}
            <Route path="/admin/transacciones" element={
              <ProtectedRoute>
                <AdminCajaChica />
              </ProtectedRoute>
            } />
            <Route path="/admin/transacciones/movimientos" element={
              <ProtectedRoute>
                <AdminCajaChicaMovimientos />
              </ProtectedRoute>
            } />
            <Route path="/admin/transacciones/aprobaciones" element={
              <ProtectedRoute>
                <AdminCajaChicaAprobaciones />
              </ProtectedRoute>
            } />
            <Route path="/admin/transacciones/arqueo" element={
              <ProtectedRoute>
                <AdminCajaChicaArqueo />
              </ProtectedRoute>
            } />
            <Route path="/admin/transacciones/config" element={
              <ProtectedRoute>
                <AdminCajaChicaConfig />
              </ProtectedRoute>
            } />
            <Route path="/admin/transacciones/reportes" element={
              <ProtectedRoute>
                <AdminCajaChicaReportes />
              </ProtectedRoute>
            } />


            <Route path="/admin/configuracion" element={
              <ProtectedRoute>
                <AdminConfiguracion />
              </ProtectedRoute>
            } />

            <Route path="/print" element={
              <ProtectedRoute>
                <PrintView />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-20 flex items-center justify-center bg-fondo-claro">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gris-claro mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-negro-principal mb-4">
                      Página no encontrada
                    </h2>
                    <p className="text-gris-medio mb-8">
                      Lo sentimos, la página que buscas no existe.
                    </p>
                    <a href="/" className="btn-primary">
                      Volver al Inicio
                    </a>
                  </div>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </QuoteProvider>
    </AuthProvider>
  );
}

export default App;