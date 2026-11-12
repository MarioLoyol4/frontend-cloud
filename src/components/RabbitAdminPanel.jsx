import { useCallback, useEffect, useState } from 'react';
import {
    getColasSistema,
    crearCola,
    eliminarCola,
    purgarCola,
    crearExchange,
    eliminarExchange,
    crearBinding,
    eliminarBinding,
} from '../services/api';
import '../css/RabbitAdminPanel.css';

function Formulario({ titulo, campos, boton, onEnviar }) {
    const [valores, setValores] = useState({});

    const cambiar = (e) => {
        setValores({
            ...valores,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <form
            className="rabbit-form"
            onSubmit={(e) => {
                e.preventDefault();
                onEnviar(valores);
            }}
        >
            <h3>{titulo}</h3>

            {campos.map((c) =>
                c.opciones ? (
                    <select
                        key={c.name}
                        name={c.name}
                        defaultValue=""
                        onChange={cambiar}
                    >
                        <option value="" disabled>
                            {c.label}
                        </option>
                        {c.opciones.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        key={c.name}
                        name={c.name}
                        placeholder={c.label}
                        type={c.type || 'text'}
                        onChange={cambiar}
                    />
                )
            )}

            <button type="submit">{boton}</button>
        </form>
    );
}

export default function RabbitAdminPanel() {
    const [colas, setColas] = useState([]);
    const [aviso, setAviso] = useState(null);

    const cargar = useCallback(async () => {
        try {
            setColas(await getColasSistema());
        } catch (e) {
            setAviso({
                tipo: 'error',
                texto: e.message,
                detalles: e.detalles,
            });
        }
    }, []);

    useEffect(() => {
        cargar();
        const id = setInterval(cargar, 5000);
        return () => clearInterval(id);
    }, [cargar]);

    const ejecutar = async (accion, textoOk) => {
        try {
            await accion();
            setAviso({ tipo: 'ok', texto: textoOk });
            cargar();
        } catch (e) {
            setAviso({
                tipo: 'error',
                texto: e.message,
                detalles: e.detalles,
            });
        }
    };

    return (
        <section className="rabbit-panel">
            <h2>Mensajería (RabbitMQ)</h2>

            {aviso && (
                <div className={`rabbit-aviso ${aviso.tipo}`} role="status">
                    <strong>{aviso.texto}</strong>
                    <ul>
                        {(aviso.detalles || []).map((d) => (
                            <li key={d}>{d}</li>
                        ))}
                    </ul>
                </div>
            )}

            <table className="rabbit-tabla">
                <thead>
                    <tr>
                        <th>Cola</th>
                        <th>Mensajes</th>
                        <th>Consumidores</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {colas.map((c) => (
                        <tr
                            key={c.name}
                            className={c.name.endsWith('.dlq') && c.messages > 0 ? 'alerta' : ''}
                        >
                            <td>{c.name}</td>
                            <td>{c.exists ? c.messages : '—'}</td>
                            <td>{c.exists ? c.consumers : '—'}</td>
                            <td>
                                <button
                                    disabled={!c.exists}
                                    onClick={() =>
                                        ejecutar(() => purgarCola(c.name), `Cola ${c.name} vaciada`)
                                    }
                                >
                                    Vaciar
                                </button>
                                <button
                                    disabled={!c.exists}
                                    onClick={() =>
                                        ejecutar(() => eliminarCola(c.name), `Cola ${c.name} eliminada`)
                                    }
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="rabbit-formularios">
                <Formulario
                    titulo="Crear cola"
                    boton="Crear"
                    campos={[
                        { name: 'name', label: 'Nombre de la cola' },
                        { name: 'ttlMs', label: 'TTL en ms (opcional)', type: 'number' },
                        { name: 'deadLetterExchange', label: 'Dead-letter exchange (opcional)' },
                    ]}
                    onEnviar={(v) =>
                        ejecutar(
                            () =>
                                crearCola({
                                    name: v.name ?? '',
                                    ttlMs: v.ttlMs ? Number(v.ttlMs) : null,
                                    deadLetterExchange: v.deadLetterExchange || null,
                                }),
                            `Cola ${v.name} creada`
                        )
                    }
                />

                <Formulario
                    titulo="Crear exchange"
                    boton="Crear"
                    campos={[
                        { name: 'name', label: 'Nombre del exchange' },
                        { name: 'type', label: 'Tipo', opciones: ['DIRECT', 'TOPIC', 'FANOUT', 'HEADERS'] },
                    ]}
                    onEnviar={(v) =>
                        ejecutar(
                            () => crearExchange({ name: v.name ?? '', type: v.type || null }),
                            `Exchange ${v.name} creado`
                        )
                    }
                />

                <Formulario
                    titulo="Eliminar exchange"
                    boton="Eliminar"
                    campos={[{ name: 'name', label: 'Nombre del exchange' }]}
                    onEnviar={(v) =>
                        ejecutar(() => eliminarExchange(v.name ?? ''), `Exchange ${v.name} eliminado`)
                    }
                />

                <Formulario
                    titulo="Crear binding"
                    boton="Crear"
                    campos={[
                        { name: 'queue', label: 'Cola' },
                        { name: 'exchange', label: 'Exchange' },
                        { name: 'routingKey', label: 'Routing key' },
                    ]}
                    onEnviar={(v) =>
                        ejecutar(
                            () =>
                                crearBinding({
                                    queue: v.queue ?? '',
                                    exchange: v.exchange ?? '',
                                    routingKey: v.routingKey ?? '',
                                }),
                            'Binding creado'
                        )
                    }
                />

                <Formulario
                    titulo="Eliminar binding"
                    boton="Eliminar"
                    campos={[
                        { name: 'queue', label: 'Cola' },
                        { name: 'exchange', label: 'Exchange' },
                        { name: 'routingKey', label: 'Routing key' },
                    ]}
                    onEnviar={(v) =>
                        ejecutar(
                            () =>
                                eliminarBinding({
                                    queue: v.queue ?? '',
                                    exchange: v.exchange ?? '',
                                    routingKey: v.routingKey ?? '',
                                }),
                            'Binding eliminado'
                        )
                    }
                />
            </div>
        </section>
    );
}