import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { ArrowLeft, Save, Shield, Tag, AlertTriangle } from 'lucide-react'

const AdminCajaChicaConfig = () => {
    const [config, setConfig] = useState({
        montoMaximoGasto: 500,
        montoMinimoAlerta: 200,
        periodoArqueo: 'semanal',
        categorias: [
            'Transporte',
            'Alimentación',
            'Materiales de Oficina',
            'Limpieza',
            'Mantenimiento',
            'Otros'
        ],
        responsables: {
            principal: 'Juan Pérez',
            supervisor: 'Ana López'
        }
    })

    const [nuevaCategoria, setNuevaCategoria] = useState('')

    const handleAddCategoria = () => {
        if (nuevaCategoria.trim()) {
            setConfig(prev => ({
                ...prev,
                categorias: [...prev.categorias, nuevaCategoria.trim()]
            }))
            setNuevaCategoria('')
        }
    }

    const handleRemoveCategoria = (cat) => {
        setConfig(prev => ({
            ...prev,
            categorias: prev.categorias.filter(c => c !== cat)
        }))
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-fondo-claro p-4 md:p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            to="/admin/caja-chica"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gris-medio"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-negro-principal">
                                Configuración
                            </h1>
                            <p className="text-gris-medio mt-1">Parámetros generales de la caja chica</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Límites y Alertas */}
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <h2 className="text-xl font-semibold text-negro-principal mb-6 flex items-center gap-2">
                            <AlertTriangle size={24} className="text-yellow-500" />
                            Límites y Alertas
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Monto Máximo por Gasto (S/)
                                </label>
                                <input
                                    type="number"
                                    value={config.montoMaximoGasto}
                                    onChange={(e) => setConfig({ ...config, montoMaximoGasto: e.target.value })}
                                    className="input-field w-full"
                                />
                                <p className="text-xs text-gris-medio mt-1">Gastos superiores requerirán aprobación especial.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Alerta de Saldo Mínimo (S/)
                                </label>
                                <input
                                    type="number"
                                    value={config.montoMinimoAlerta}
                                    onChange={(e) => setConfig({ ...config, montoMinimoAlerta: e.target.value })}
                                    className="input-field w-full"
                                />
                                <p className="text-xs text-gris-medio mt-1">Se notificará cuando el saldo baje de este monto.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Periodo de Arqueo Sugerido
                                </label>
                                <select
                                    value={config.periodoArqueo}
                                    onChange={(e) => setConfig({ ...config, periodoArqueo: e.target.value })}
                                    className="input-field w-full"
                                >
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Categorías */}
                    <div className="bg-white rounded-xl shadow-card p-6">
                        <h2 className="text-xl font-semibold text-negro-principal mb-6 flex items-center gap-2">
                            <Tag size={24} className="text-blue-500" />
                            Categorías de Gastos
                        </h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={nuevaCategoria}
                                onChange={(e) => setNuevaCategoria(e.target.value)}
                                placeholder="Nueva categoría..."
                                className="input-field flex-1"
                            />
                            <button
                                onClick={handleAddCategoria}
                                className="btn-secondary"
                            >
                                Agregar
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {config.categorias.map(cat => (
                                <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                    {cat}
                                    <button
                                        onClick={() => handleRemoveCategoria(cat)}
                                        className="hover:text-red-500"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Responsables */}
                    <div className="bg-white rounded-xl shadow-card p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-negro-principal mb-6 flex items-center gap-2">
                            <Shield size={24} className="text-purple-500" />
                            Responsables
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Responsable Principal (Cajero)
                                </label>
                                <select className="input-field w-full">
                                    <option>Juan Pérez</option>
                                    <option>Maria Garcia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-negro-principal mb-2">
                                    Supervisor (Aprobador)
                                </label>
                                <select className="input-field w-full">
                                    <option>Ana López</option>
                                    <option>Carlos Ruiz</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button className="btn-primary flex items-center gap-2 px-8">
                        <Save size={20} />
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCajaChicaConfig
