import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getDashboardEstudiante, obtenerToken } from '../services/api';
import { agruparNotasPorAsignatura, calcularPromedioNotas } from '../utils/notas';
import '../css/DashboardApoderado.css';

function DashboardApoderado() {
    const [estudiantesACargo, setEstudiantesACargo] = useState([]);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Extraer estudiantes a cargo del JWT
    useEffect(() => {
        const token = obtenerToken();
        if (!token) { navigate('/login'); return; }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const ids = payload.estudiantesACargo || [];
            setEstudiantesACargo(ids);
            if (ids.length > 0) seleccionarEstudiante(ids[0]);
        } catch {
            navigate('/login');
        }
    }, []);

    const seleccionarEstudiante = async (id) => {
        setEstudianteSeleccionado(id);
        setCargando(true);
        setError('');
        setDatos(null);
        try {
            const data = await getDashboardEstudiante(id);
            if (data.error) { setError(data.error); return; }
            setDatos(data);
        } catch {
            setError('Error al cargar los datos del estudiante');
        } finally {
            setCargando(false);
        }
    };

    const notasAgrupadas = agruparNotasPorAsignatura(datos?.notas);

    return (
        <div className="apoderado-page">
            <NavBar nombreUsuario="Apoderado" />

            <main className="apoderado-main">
                <div className="apoderado-header">
                    <h1>Panel del Apoderado</h1>
                    <p>Consulta el rendimiento académico de tus estudiantes a cargo</p>
                </div>

                {/* Selector de estudiante */}
                {estudiantesACargo.length > 1 && (
                    <div className="apoderado-selector">
                        <span>Seleccionar estudiante:</span>
                        <div className="apoderado-tabs">
                            {estudiantesACargo.map(id => (
                                <button
                                    key={id}
                                    className={`apoderado-tab ${estudianteSeleccionado === id ? 'activo' : ''}`}
                                    onClick={() => seleccionarEstudiante(id)}
                                >
                                    Estudiante {id}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {cargando && (
                    <div className="apoderado-cargando">
                        <div className="spinner"></div>
                        <p>Cargando información...</p>
                    </div>
                )}

                {error && (
                    <div className="apoderado-error">{error}</div>
                )}

                {datos && !cargando && (
                    <div className="apoderado-contenido">

                        {/* Notas */}
                        <div className="apoderado-card">
                            <div className="apoderado-card-header">
                                <h2>Notas</h2>
                                {calcularPromedioNotas(datos?.notas) !== null && (
                                    <span className={`promedio-badge ${calcularPromedioNotas(datos.notas) >= 4 ? 'aprobado' : 'reprobado'}`}>
                                        Promedio general: {calcularPromedioNotas(datos.notas).toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <div className="apoderado-card-body">
                                {datos.notas?.disponible === false ? (
                                    <p className="apoderado-no-disponible">
                                        {datos.notas.mensaje}
                                    </p>
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
                                                <table className="apoderado-tabla">
                                                    <thead>
                                                        <tr>
                                                            <th>Evaluación</th>
                                                            <th>Nota</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {grupo.notas.map((nota, i) => (
                                                            <tr key={`${grupo.nombre}-${i}`}>
                                                                <td>{nota.evaluacion?.nombre || `Evaluación ${i + 1}`}</td>
                                                                <td className={nota.valor < 4 ? 'nota-roja' : 'nota-verde'}>
                                                                    {nota.valor?.toFixed(1)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="apoderado-vacio">Sin notas registradas</p>
                                )}
                            </div>
                        </div>

                        {/* Asistencias */}
                        <div className="apoderado-card">
                            <div className="apoderado-card-header">
                                <h2>Historial de Asistencia</h2>
                            </div>
                            <div className="apoderado-card-body">
                                {datos.historialAsistencias?.disponible === false ? (
                                    <p className="apoderado-no-disponible">
                                        {datos.historialAsistencias.mensaje}
                                    </p>
                                ) : Array.isArray(datos.historialAsistencias) && datos.historialAsistencias.length > 0 ? (
                                    <table className="apoderado-tabla">
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
                                    <p className="apoderado-vacio">Sin registros de asistencia</p>
                                )}
                            </div>
                        </div>

                        {/* Anotaciones */}
                        <div className="apoderado-card">
                            <div className="apoderado-card-header">
                                <h2>Anotaciones</h2>
                            </div>
                            <div className="apoderado-card-body">
                                {datos.anotaciones?.disponible === false ? (
                                    <p className="apoderado-no-disponible">
                                        {datos.anotaciones.mensaje}
                                    </p>
                                ) : Array.isArray(datos.anotaciones) && datos.anotaciones.length > 0 ? (
                                    <table className="apoderado-tabla">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Tipo</th>
                                                <th>Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datos.anotaciones.map((a, i) => (
                                                <tr key={i}>
                                                    <td>{a.fecha}</td>
                                                    <td>
                                                        <span className={`tipo tipo-${a.tipo?.toLowerCase()}`}>
                                                            {a.tipo}
                                                        </span>
                                                    </td>
                                                    <td>{a.descripcion}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="apoderado-vacio">Sin anotaciones registradas</p>
                                )}
                            </div>
                        </div>

                        {/* Comunicados */}
                        <div className="apoderado-card apoderado-card-full">
                            <div className="apoderado-card-header">
                                <h2>Comunicados</h2>
                            </div>
                            <div className="apoderado-card-body">
                                {datos.comunicados?.disponible === false ? (
                                    <p className="apoderado-no-disponible">
                                        {datos.comunicados.mensaje}
                                    </p>
                                ) : Array.isArray(datos.comunicados) && datos.comunicados.length > 0 ? (
                                    <div className="apoderado-comunicados">
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
                                    <p className="apoderado-vacio">Sin comunicados</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default DashboardApoderado;