import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getMiPerfil } from '../services/api';
import { agruparNotasPorAsignatura, calcularPromedioNotas } from '../utils/notas';
import '../css/DashboardEstudiante.css';

function DashboardEstudiante() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await getMiPerfil();
                if (data.error) { setError(data.error); return; }
                setDatos(data);
            } catch {
                setError('Error al cargar tu información');
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const calcularPorcentajeAsistencia = (asistencias) => {
        if (!asistencias || asistencias.length === 0) return null;
        const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
        return Math.round((presentes / asistencias.length) * 100);
    };

    const notasAgrupadas = agruparNotasPorAsignatura(datos?.notas);

    return (
        <div className="estudiante-page">
            <NavBar nombreUsuario="Estudiante" />

            <main className="estudiante-main">
                <div className="estudiante-header">
                    <h1>Mi Panel Académico</h1>
                    <p>Consulta tu rendimiento y asistencia</p>
                </div>

                {cargando && (
                    <div className="estudiante-cargando">
                        <div className="spinner"></div>
                        <p>Cargando tu información...</p>
                    </div>
                )}

                {error && (
                    <div className="estudiante-error">{error}</div>
                )}

                {datos && !cargando && (
                    <>
                        {/* Resumen */}
                        <div className="estudiante-resumen">
                            <div className="resumen-card">
                                <span className="resumen-valor">
                                    {calcularPromedioNotas(datos?.notas) ?? '—'}
                                </span>
                                <span className="resumen-label">Promedio General</span>
                            </div>
                            <div className="resumen-card">
                                <span className="resumen-valor">
                                    {datos.notas?.length ?? 0}
                                </span>
                                <span className="resumen-label">Evaluaciones</span>
                            </div>
                            <div className="resumen-card">
                                <span className="resumen-valor">
                                    {calcularPorcentajeAsistencia(datos.historialAsistencias) !== null
                                        ? `${calcularPorcentajeAsistencia(datos.historialAsistencias)}%`
                                        : '—'}
                                </span>
                                <span className="resumen-label">Asistencia</span>
                            </div>
                            <div className="resumen-card">
                                <span className="resumen-valor">
                                    {datos.comunicados?.length ?? 0}
                                </span>
                                <span className="resumen-label">Comunicados</span>
                            </div>
                        </div>

                        <div className="estudiante-contenido">

                            {/* Notas */}
                            <div className="estudiante-card">
                                <div className="estudiante-card-header">
                                    <h2>Mis Notas</h2>
                                    {calcularPromedioNotas(datos.notas) !== null && (
                                        <span className={`promedio-badge ${calcularPromedioNotas(datos.notas) >= 4 ? 'aprobado' : 'reprobado'}`}>
                                            Promedio general: {calcularPromedioNotas(datos.notas).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="estudiante-card-body">
                                    {datos.notas?.disponible === false ? (
                                        <p className="estudiante-no-disponible">{datos.notas.mensaje}</p>
                                    ) : Array.isArray(datos.notas) && datos.notas.length > 0 ? (
                                        <div className="notas-por-asignatura">
                                            {notasAgrupadas.map((grupo) => (
                                                <div key={grupo.nombre} className="asignatura-notas-card">
                                                    <div className="asignatura-notas-header">
                                                        <h3>{grupo.nombre}</h3>
                                                        <span className={`promedio-badge ${grupo.promedio >= 4 ? 'aprobado' : 'reprobado'}`}>
                                                            Promedio: {grupo.promedio?.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <table className="estudiante-tabla">
                                                        <thead>
                                                            <tr>
                                                                <th>Evaluación</th>
                                                                <th>Nota</th>
                                                                <th>Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {grupo.notas.map((nota, i) => (
                                                                <tr key={`${grupo.nombre}-${i}`}>
                                                                    <td>{nota.evaluacion?.nombre || `Evaluación ${i + 1}`}</td>
                                                                    <td className={nota.valor < 4 ? 'nota-roja' : 'nota-verde'}>
                                                                        {nota.valor?.toFixed(1)}
                                                                    </td>
                                                                    <td>
                                                                        <span className={`estado-nota ${nota.valor >= 4 ? 'aprobado' : 'reprobado'}`}>
                                                                            {nota.valor >= 4 ? 'Aprobado' : 'Reprobado'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="estudiante-vacio">Sin notas registradas</p>
                                    )}
                                </div>
                            </div>

                            {/* Asistencia */}
                            <div className="estudiante-card">
                                <div className="estudiante-card-header">
                                    <h2>Mi Asistencia</h2>
                                    {calcularPorcentajeAsistencia(datos.historialAsistencias) !== null && (
                                        <span className={`promedio-badge ${calcularPorcentajeAsistencia(datos.historialAsistencias) >= 85 ? 'aprobado' : 'reprobado'}`}>
                                            {calcularPorcentajeAsistencia(datos.historialAsistencias)}% asistencia
                                        </span>
                                    )}
                                </div>
                                <div className="estudiante-card-body">
                                    {datos.historialAsistencias?.disponible === false ? (
                                        <p className="estudiante-no-disponible">{datos.historialAsistencias.mensaje}</p>
                                    ) : Array.isArray(datos.historialAsistencias) && datos.historialAsistencias.length > 0 ? (
                                        <table className="estudiante-tabla">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.historialAsistencias.map((a, i) => (
                                                    <tr key={i}>
                                                        <td>{a.fecha}</td>
                                                        <td>
                                                            <span className={`estado estado-${a.estado?.toLowerCase()}`}>
                                                                {a.estado}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="estudiante-vacio">Sin registros de asistencia</p>
                                    )}
                                </div>
                            </div>

                            {/* Comunicados */}
                            <div className="estudiante-card estudiante-card-full">
                                <div className="estudiante-card-header">
                                    <h2>Comunicados</h2>
                                </div>
                                <div className="estudiante-card-body">
                                    {datos.comunicados?.disponible === false ? (
                                        <p className="estudiante-no-disponible">{datos.comunicados.mensaje}</p>
                                    ) : Array.isArray(datos.comunicados) && datos.comunicados.length > 0 ? (
                                        <div className="estudiante-comunicados">
                                            {datos.comunicados.map((c, i) => (
                                                <div key={i} className="comunicado-item">
                                                    <h3>{c.titulo}</h3>
                                                    <p>{c.contenido}</p>
                                                    <span className="comunicado-fecha">
                                                        {c.fechaPublicacion?.split('T')[0]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="estudiante-vacio">Sin comunicados</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default DashboardEstudiante;