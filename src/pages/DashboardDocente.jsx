import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getDashboardCurso, getAsignaturas, getEvaluaciones, registrarAsistencia, registrarAnotacion, publicarComunicado, registrarNota, crearEvaluacion } from '../services/api';
import '../css/DashboardDocente.css';

const obtenerFechaHoy = () => new Date().toISOString().slice(0, 10);

function DashboardDocente() {
    const [cursoId, setCursoId] = useState(1);
    const [datos, setDatos] = useState(null);
    const [asignaturas, setAsignaturas] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensajeAccion, setMensajeAccion] = useState({ tipo: '', texto: '' });
    const [estadoAsistencia, setEstadoAsistencia] = useState({});
    const [fechaLista, setFechaLista] = useState(obtenerFechaHoy());
    const [accionEnCurso, setAccionEnCurso] = useState('');
    const [formAnotacion, setFormAnotacion] = useState({
        estudianteId: '',
        tipo: 'POSITIVA',
        descripcion: '',
        fecha: obtenerFechaHoy()
    });
    const [formComunicado, setFormComunicado] = useState({
        titulo: '',
        contenido: '',
        destinatario: 'CURSO_1'
    });
    const [formEvaluacion, setFormEvaluacion] = useState({
        nombre: '',
        fecha: obtenerFechaHoy(),
        asignaturaId: ''
    });
    const [formNota, setFormNota] = useState({
        estudianteId: '',
        evaluacionId: '',
        valor: ''
    });
    const navigate = useNavigate();

    const estudiantes = Array.isArray(datos?.estudiantes) ? datos.estudiantes : [];

    useEffect(() => {
        cargarCurso(cursoId);
    }, []);

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [listaAsignaturas, listaEvaluaciones] = await Promise.all([
                    getAsignaturas(),
                    getEvaluaciones()
                ]);

                if (Array.isArray(listaAsignaturas)) {
                    setAsignaturas(listaAsignaturas);
                }

                if (Array.isArray(listaEvaluaciones)) {
                    setEvaluaciones(listaEvaluaciones);
                }
            } catch {
                setMensajeAccion({ tipo: 'error', texto: 'No se pudieron cargar asignaturas o evaluaciones' });
            }
        };

        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (!estudiantes.length) {
            return;
        }

        setEstadoAsistencia((prev) => {
            const siguiente = {};

            estudiantes.forEach((estudiante) => {
                siguiente[estudiante.id] = prev[estudiante.id] || 'PRESENTE';
            });

            return siguiente;
        });

        setFormAnotacion((prev) => ({
            ...prev,
            estudianteId: estudiantes.some((estudiante) => String(estudiante.id) === String(prev.estudianteId))
                ? prev.estudianteId
                : String(estudiantes[0].id),
            fecha: prev.fecha || obtenerFechaHoy()
        }));

        setFormComunicado((prev) => ({
            ...prev,
            destinatario: prev.destinatario.startsWith('CURSO_') ? `CURSO_${cursoId}` : prev.destinatario || `CURSO_${cursoId}`
        }));

        setFormEvaluacion((prev) => ({
            ...prev,
            asignaturaId: prev.asignaturaId || ''
        }));

        setFormNota((prev) => ({
            ...prev,
            estudianteId: estudiantes.some((estudiante) => String(estudiante.id) === String(prev.estudianteId))
                ? prev.estudianteId
                : String(estudiantes[0].id)
        }));
    }, [datos, cursoId]);

    const cargarCurso = async (id) => {
        setCargando(true);
        setError('');
        setDatos(null);
        try {
            const data = await getDashboardCurso(id);
            if (data.error) { setError(data.error); return; }
            setDatos(data);
        } catch {
            setError('Error al cargar los datos del curso');
        } finally {
            setCargando(false);
        }
    };

    const handleBuscarCurso = (e) => {
        e.preventDefault();
        cargarCurso(cursoId);
    };

    const manejarCambioAsistencia = (estudianteId, valor) => {
        setEstadoAsistencia((prev) => ({
            ...prev,
            [estudianteId]: valor
        }));
    };

    const registrarAsistenciaEstudiante = async (estudiante) => {
        setMensajeAccion({ tipo: '', texto: '' });
        setAccionEnCurso(`asistencia-${estudiante.id}`);

        try {
            const respuesta = await registrarAsistencia({
                estudianteId: estudiante.id,
                fecha: fechaLista,
                estado: estadoAsistencia[estudiante.id] || 'PRESENTE'
            });

            if (respuesta?.error) {
                setMensajeAccion({ tipo: 'error', texto: respuesta.error });
                return;
            }

            setMensajeAccion({
                tipo: 'ok',
                texto: `Asistencia registrada para ${estudiante.nombre} ${estudiante.apellido}`
            });
        } catch {
            setMensajeAccion({ tipo: 'error', texto: 'No se pudo registrar la asistencia' });
        } finally {
            setAccionEnCurso('');
        }
    };

    const registrarNuevaAnotacion = async (e) => {
        e.preventDefault();
        setMensajeAccion({ tipo: '', texto: '' });
        setAccionEnCurso('anotacion');

        try {
            const respuesta = await registrarAnotacion({
                estudianteId: Number(formAnotacion.estudianteId),
                tipo: formAnotacion.tipo,
                descripcion: formAnotacion.descripcion,
                fecha: formAnotacion.fecha
            });

            if (respuesta?.error) {
                setMensajeAccion({ tipo: 'error', texto: respuesta.error });
                return;
            }

            setFormAnotacion((prev) => ({
                ...prev,
                descripcion: '',
                tipo: 'POSITIVA'
            }));
            setMensajeAccion({
                tipo: 'ok',
                texto: 'Anotación registrada correctamente'
            });
        } catch {
            setMensajeAccion({ tipo: 'error', texto: 'No se pudo registrar la anotación' });
        } finally {
            setAccionEnCurso('');
        }
    };

    const enviarComunicado = async (e) => {
        e.preventDefault();
        setMensajeAccion({ tipo: '', texto: '' });
        setAccionEnCurso('comunicado');

        try {
            const respuesta = await publicarComunicado({
                titulo: formComunicado.titulo,
                contenido: formComunicado.contenido,
                autorId: 'DOCENTE',
                destinatario: formComunicado.destinatario
            });

            if (respuesta?.error) {
                setMensajeAccion({ tipo: 'error', texto: respuesta.error });
                return;
            }

            setFormComunicado((prev) => ({
                ...prev,
                titulo: '',
                contenido: ''
            }));
            await cargarCurso(cursoId);
            setMensajeAccion({ tipo: 'ok', texto: 'Comunicado publicado correctamente' });
        } catch {
            setMensajeAccion({ tipo: 'error', texto: 'No se pudo publicar el comunicado' });
        } finally {
            setAccionEnCurso('');
        }
    };

    const crearNuevaEvaluacion = async (e) => {
        e.preventDefault();
        setMensajeAccion({ tipo: '', texto: '' });
        setAccionEnCurso('evaluacion');

        try {
            const respuesta = await crearEvaluacion({
                nombre: formEvaluacion.nombre,
                fecha: formEvaluacion.fecha,
                asignatura: { id: Number(formEvaluacion.asignaturaId) }
            });

            if (respuesta?.error) {
                setMensajeAccion({ tipo: 'error', texto: respuesta.error });
                return;
            }

            setFormEvaluacion((prev) => ({
                ...prev,
                nombre: '',
                asignaturaId: ''
            }));
            setMensajeAccion({
                tipo: 'ok',
                texto: 'Evaluación creada correctamente'
            });
        } catch {
            setMensajeAccion({ tipo: 'error', texto: 'No se pudo crear la evaluación' });
        } finally {
            setAccionEnCurso('');
        }
    };

    const registrarNuevaNota = async (e) => {
        e.preventDefault();
        setMensajeAccion({ tipo: '', texto: '' });
        setAccionEnCurso('nota');

        try {
            const respuesta = await registrarNota({
                valor: Number(formNota.valor),
                estudiante: { id: Number(formNota.estudianteId) },
                evaluacion: { id: Number(formNota.evaluacionId) }
            });

            if (respuesta?.error) {
                setMensajeAccion({ tipo: 'error', texto: respuesta.error });
                return;
            }

            setFormNota((prev) => ({
                ...prev,
                evaluacionId: '',
                valor: ''
            }));
            setMensajeAccion({
                tipo: 'ok',
                texto: 'Nota registrada correctamente'
            });
        } catch {
            setMensajeAccion({ tipo: 'error', texto: 'No se pudo registrar la nota' });
        } finally {
            setAccionEnCurso('');
        }
    };

    return (
        <div className="docente-page">
            <NavBar nombreUsuario="Docente" />

            <main className="docente-main">
                <div className="docente-header">
                    <div>
                        <h1>Panel del Docente</h1>
                        <p>Consulta los estudiantes y comunicados de tu curso</p>
                    </div>

                    <form onSubmit={handleBuscarCurso} className="docente-buscar">
                        <label htmlFor="cursoId">Curso ID:</label>
                        <input
                            id="cursoId"
                            type="number"
                            min="1"
                            value={cursoId}
                            onChange={(e) => setCursoId(e.target.value)}
                        />
                        <button type="submit">Buscar</button>
                    </form>
                </div>

                {cargando && (
                    <div className="docente-cargando">
                        <div className="spinner"></div>
                        <p>Cargando información del curso...</p>
                    </div>
                )}

                {error && (
                    <div className="docente-error">{error}</div>
                )}

                {mensajeAccion.texto && (
                    <div className={`docente-mensaje docente-mensaje-${mensajeAccion.tipo}`}>
                        {mensajeAccion.texto}
                    </div>
                )}

                {datos && !cargando && (
                    <div className="docente-contenido">

                        {/* Estudiantes del curso */}
                        <div className="docente-card docente-card-grande">
                            <div className="docente-card-header">
                                <h2>Pasar la lista</h2>
                                <span className="docente-badge">
                                    {estudiantes.length} estudiantes
                                </span>
                            </div>
                            <div className="docente-card-body">
                                <div className="docente-lista-controles">
                                    <label htmlFor="fechaLista">Fecha de la lista</label>
                                    <input
                                        id="fechaLista"
                                        type="date"
                                        value={fechaLista}
                                        onChange={(e) => setFechaLista(e.target.value)}
                                    />
                                </div>

                                {datos.estudiantes?.disponible === false ? (
                                    <p className="docente-no-disponible">{datos.estudiantes.mensaje}</p>
                                ) : estudiantes.length > 0 ? (
                                    <table className="docente-tabla">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Apellido</th>
                                                <th>RUT</th>
                                                <th>Asistencia</th>
                                                <th>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudiantes.map((e) => (
                                                <tr key={e.id}>
                                                    <td>{e.nombre}</td>
                                                    <td>{e.apellido}</td>
                                                    <td>{e.rut}</td>
                                                    <td>
                                                        <select
                                                            aria-label={`Asistencia de ${e.nombre} ${e.apellido}`}
                                                            value={estadoAsistencia[e.id] || 'PRESENTE'}
                                                            onChange={(event) => manejarCambioAsistencia(e.id, event.target.value)}
                                                        >
                                                            <option value="PRESENTE">PRESENTE</option>
                                                            <option value="AUSENTE">AUSENTE</option>
                                                            <option value="ATRASO">ATRASO</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="docente-accion-btn"
                                                            onClick={() => registrarAsistenciaEstudiante(e)}
                                                            disabled={accionEnCurso === `asistencia-${e.id}`}
                                                        >
                                                            {accionEnCurso === `asistencia-${e.id}` ? 'Guardando...' : 'Guardar asistencia'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="docente-vacio">Sin estudiantes en este curso</p>
                                )}
                            </div>
                        </div>

                        <div className="docente-card">
                            <div className="docente-card-header">
                                <h2>Crear evaluación</h2>
                            </div>
                            <div className="docente-card-body">
                                <form className="docente-formulario" onSubmit={crearNuevaEvaluacion}>
                                    <label htmlFor="nombreEvaluacion">Nombre</label>
                                    <input
                                        id="nombreEvaluacion"
                                        type="text"
                                        value={formEvaluacion.nombre}
                                        onChange={(e) => setFormEvaluacion((prev) => ({ ...prev, nombre: e.target.value }))}
                                        placeholder="Ej: Prueba de Álgebra"
                                    />

                                    <label htmlFor="fechaEvaluacion">Fecha de evaluación</label>
                                    <input
                                        id="fechaEvaluacion"
                                        type="date"
                                        value={formEvaluacion.fecha}
                                        onChange={(e) => setFormEvaluacion((prev) => ({ ...prev, fecha: e.target.value }))}
                                    />

                                    <label htmlFor="asignaturaEvaluacion">Asignatura</label>
                                    <select
                                        id="asignaturaEvaluacion"
                                        value={formEvaluacion.asignaturaId}
                                        onChange={(e) => setFormEvaluacion((prev) => ({ ...prev, asignaturaId: e.target.value }))}
                                    >
                                        <option value="">Selecciona una asignatura</option>
                                        {asignaturas.map((asignatura) => (
                                            <option key={asignatura.id} value={asignatura.id}>
                                                {asignatura.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        className="docente-form-btn"
                                        disabled={accionEnCurso === 'evaluacion' || !formEvaluacion.nombre || !formEvaluacion.asignaturaId}
                                    >
                                        {accionEnCurso === 'evaluacion' ? 'Creando...' : 'Crear evaluación'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="docente-card">
                            <div className="docente-card-header">
                                <h2>Registrar nota</h2>
                            </div>
                            <div className="docente-card-body">
                                <form className="docente-formulario" onSubmit={registrarNuevaNota}>
                                    <label htmlFor="estudianteNota">Estudiante</label>
                                    <select
                                        id="estudianteNota"
                                        value={formNota.estudianteId}
                                        onChange={(e) => setFormNota((prev) => ({ ...prev, estudianteId: e.target.value }))}
                                    >
                                        {estudiantes.map((estudiante) => (
                                            <option key={estudiante.id} value={estudiante.id}>
                                                {estudiante.nombre} {estudiante.apellido}
                                            </option>
                                        ))}
                                    </select>

                                    <label htmlFor="evaluacionNota">Evaluación</label>
                                    <select
                                        id="evaluacionNota"
                                        value={formNota.evaluacionId}
                                        onChange={(e) => setFormNota((prev) => ({ ...prev, evaluacionId: e.target.value }))}
                                    >
                                        <option value="">Selecciona una evaluación</option>
                                        {evaluaciones.map((evaluacion) => (
                                            <option key={evaluacion.id} value={evaluacion.id}>
                                                {evaluacion.nombre}{evaluacion.fecha ? ` - ${evaluacion.fecha}` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <label htmlFor="valorNota">Valor</label>
                                    <input
                                        id="valorNota"
                                        type="number"
                                        min="1"
                                        max="7"
                                        step="0.1"
                                        value={formNota.valor}
                                        onChange={(e) => setFormNota((prev) => ({ ...prev, valor: e.target.value }))}
                                        placeholder="Ej: 6.5"
                                    />

                                    <button
                                        type="submit"
                                        className="docente-form-btn"
                                        disabled={accionEnCurso === 'nota' || !formNota.estudianteId || !formNota.evaluacionId || !formNota.valor}
                                    >
                                        {accionEnCurso === 'nota' ? 'Registrando...' : 'Guardar nota'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Anotaciones */}
                        <div className="docente-card">
                            <div className="docente-card-header">
                                <h2>Registrar anotación</h2>
                            </div>
                            <div className="docente-card-body">
                                <form className="docente-formulario" onSubmit={registrarNuevaAnotacion}>
                                    <label htmlFor="estudianteAnotacion">Estudiante</label>
                                    <select
                                        id="estudianteAnotacion"
                                        value={formAnotacion.estudianteId}
                                        onChange={(e) => setFormAnotacion((prev) => ({ ...prev, estudianteId: e.target.value }))}
                                    >
                                        {estudiantes.map((estudiante) => (
                                            <option key={estudiante.id} value={estudiante.id}>
                                                {estudiante.nombre} {estudiante.apellido}
                                            </option>
                                        ))}
                                    </select>

                                    <label htmlFor="tipoAnotacion">Tipo</label>
                                    <select
                                        id="tipoAnotacion"
                                        value={formAnotacion.tipo}
                                        onChange={(e) => setFormAnotacion((prev) => ({ ...prev, tipo: e.target.value }))}
                                    >
                                        <option value="POSITIVA">POSITIVA</option>
                                        <option value="NEGATIVA">NEGATIVA</option>
                                    </select>

                                    <label htmlFor="fechaAnotacion">Fecha</label>
                                    <input
                                        id="fechaAnotacion"
                                        type="date"
                                        value={formAnotacion.fecha}
                                        onChange={(e) => setFormAnotacion((prev) => ({ ...prev, fecha: e.target.value }))}
                                    />

                                    <label htmlFor="descripcionAnotacion">Descripción</label>
                                    <textarea
                                        id="descripcionAnotacion"
                                        rows="4"
                                        value={formAnotacion.descripcion}
                                        onChange={(e) => setFormAnotacion((prev) => ({ ...prev, descripcion: e.target.value }))}
                                        placeholder="Describe el motivo de la anotación"
                                    />

                                    <button
                                        type="submit"
                                        className="docente-form-btn"
                                        disabled={accionEnCurso === 'anotacion' || !formAnotacion.descripcion || !formAnotacion.estudianteId}
                                    >
                                        {accionEnCurso === 'anotacion' ? 'Registrando...' : 'Guardar anotación'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Comunicados */}
                        <div className="docente-card">
                            <div className="docente-card-header">
                                <h2>Enviar comunicado</h2>
                            </div>
                            <div className="docente-card-body">
                                <form className="docente-formulario" onSubmit={enviarComunicado}>
                                    <label htmlFor="tituloComunicado">Título</label>
                                    <input
                                        id="tituloComunicado"
                                        type="text"
                                        value={formComunicado.titulo}
                                        onChange={(e) => setFormComunicado((prev) => ({ ...prev, titulo: e.target.value }))}
                                        placeholder="Título del comunicado"
                                    />

                                    <label htmlFor="destinatarioComunicado">Destinatario</label>
                                    <select
                                        id="destinatarioComunicado"
                                        value={formComunicado.destinatario}
                                        onChange={(e) => setFormComunicado((prev) => ({ ...prev, destinatario: e.target.value }))}
                                    >
                                        <option value={`CURSO_${cursoId}`}>Curso actual</option>
                                        <option value="GENERAL">General</option>
                                        <option value="APODERADOS">Apoderados</option>
                                    </select>

                                    <label htmlFor="contenidoComunicado">Contenido</label>
                                    <textarea
                                        id="contenidoComunicado"
                                        rows="5"
                                        value={formComunicado.contenido}
                                        onChange={(e) => setFormComunicado((prev) => ({ ...prev, contenido: e.target.value }))}
                                        placeholder="Escribe el comunicado"
                                    />

                                    <button
                                        type="submit"
                                        className="docente-form-btn"
                                        disabled={accionEnCurso === 'comunicado' || !formComunicado.titulo || !formComunicado.contenido}
                                    >
                                        {accionEnCurso === 'comunicado' ? 'Enviando...' : 'Enviar comunicado'}
                                    </button>
                                </form>

                                <div className="docente-separador"></div>

                                {datos.comunicados?.disponible === false ? (
                                    <p className="docente-no-disponible">{datos.comunicados.mensaje}</p>
                                ) : Array.isArray(datos.comunicados) && datos.comunicados.length > 0 ? (
                                    <div className="docente-comunicados">
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
                                    <p className="docente-vacio">Sin comunicados</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default DashboardDocente;