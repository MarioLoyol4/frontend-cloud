import { useCallback, useEffect, useState } from 'react';
import {
    getTopicos,
    crearTopico,
    eliminarTopico,
    modificarConfigTopico,
    getGruposConsumidores,
    getGrupoConsumidor,
} from '../services/api';
import '../css/KafkaAdminPanel.css';
const FORM_INICIAL = {
    name: '',
    partitions: 3,
    replicationFactor: 3,
    retentionMs: '',
    cleanupPolicy: 'delete',
};
function KafkaAdminPanel() {
    const [topicos, setTopicos] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [detalleGrupo, setDetalleGrupo] = useState(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [cambio, setCambio] = useState({
        topico: '', key: 'retention.ms',
        value: ''
    });
    const [aviso, setAviso] = useState(null);
    const cargar = useCallback(async () => {
        try {
            setTopicos(await getTopicos());
            setGrupos(await getGruposConsumidores());
        } catch (e) {
            setAviso({ tipo: 'error', texto: e.message });
        }
    }, []);
    useEffect(() => {
        cargar();
    }, [cargar]);

    const ejecutar = async (accion, mensajeOk) => {
        try {
            await accion();
            setAviso({ tipo: 'ok', texto: mensajeOk });
            await cargar();
        } catch (e) {
            setAviso({ tipo: 'error', texto: e.message });
        }
    };
    const crear = (e) => {
        e.preventDefault();
        const configs = { 'cleanup.policy': form.cleanupPolicy };
        if (form.retentionMs) configs['retention.ms'] =

            String(form.retentionMs);
        ejecutar(
            () => crearTopico({
                name: form.name,
                partitions: Number(form.partitions),
                replicationFactor: Number(form.replicationFactor),
                configs,
            }),
            `Tópico ${form.name} creado`
        );
        setForm(FORM_INICIAL);
    };
    const eliminar = (nombre) => {
        if (window.confirm(`¿Eliminar el tópico ${nombre}?`)) {
            ejecutar(() => eliminarTopico(nombre), `Tópico ${nombre}

eliminado`);
        }
    };
    const cambiarConfig = (e) => {
        e.preventDefault();
        ejecutar(
            () => modificarConfigTopico(cambio.topico, {
                key: cambio.key,

                value: cambio.value
            }),

            `Configuración de ${cambio.topico} actualizada`
        );
    };
    const verGrupo = async (id) => {
        try {
            setDetalleGrupo(await getGrupoConsumidor(id));

        } catch (e) {
            setAviso({ tipo: 'error', texto: e.message });
        }
    };
    return (
        <section className="kafka-panel">
            <h2>Administración de Kafka</h2>
            {aviso && <p className={`kafka-aviso ${aviso.tipo}`}>

                {aviso.texto}</p>}

            <h3>Tópicos</h3>
            <table className="kafka-tabla">
                <thead>
                    <tr>
                        <th>Tópico</th>
                        <th>Particiones</th>
                        <th>Réplicas</th>
                        <th>Retención (ms)</th>
                        <th>Cleanup</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {topicos.map((t) => (
                        <tr key={t.name}>
                            <td>{t.name}</td>
                            <td>{t.partitions}</td>
                            <td>{t.replicationFactor}</td>
                            <td>{t.configs?.['retention.ms']}</td>
                            <td>{t.configs?.['cleanup.policy']}</td>
                            <td>
                                <button type="button" onClick={() =>

                                    eliminar(t.name)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <form className="kafka-form" onSubmit={crear}>
                <h3>Crear tópico</h3>
                <input required placeholder="Nombre" value={form.name}
                    onChange={(e) => setForm({
                        ...form, name: e.target.value

                    })} />

                <input type="number" min="1" title="Particiones" value=

                {form.partitions}

                onChange={(e) => setForm({
                    ...form, partitions:

                        e.target.value
                })} />

                <input type="number" min="1" title="Factor de replicación"

                    value={form.replicationFactor}

                    onChange={(e) => setForm({
                        ...form, replicationFactor:

                            e.target.value
                    })} />

                <input placeholder="Retención en ms (opcional)" value=

                    {form.retentionMs}

                    onChange={(e) => setForm({
                        ...form, retentionMs:

                            e.target.value
                    })} />

                <select value={form.cleanupPolicy}
                    onChange={(e) => setForm({
                        ...form, cleanupPolicy:

                            e.target.value
                    })}>

                    <option value="delete">delete</option>
                    <option value="compact">compact</option>
                    <option value="compact,delete">compact,delete</option>
                </select>
                <button type="submit">Crear</button>
            </form>
            <form className="kafka-form" onSubmit={cambiarConfig}>
                <h3>Cambiar configuración</h3>
                <select required value={cambio.topico}
                    onChange={(e) => setCambio({
                        ...cambio, topico:

                            e.target.value
                    })}>

                    <option value="">Tópico...</option>
                    {topicos.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                </select>
                <select value={cambio.key} onChange={(e) => setCambio({

                    ...cambio, key: e.target.value
                })}>

                    <option value="retention.ms">retention.ms</option>
                    <option value="cleanup.policy">cleanup.policy</option>
                    <option

                        value="min.insync.replicas">min.insync.replicas</option>

                </select>
                <input required placeholder="Valor" value={cambio.value}
                    onChange={(e) => setCambio({
                        ...cambio, value:

                            e.target.value
                    })} />

                <button type="submit">Aplicar</button>
            </form>
            <h3>Consumer groups</h3>
            <ul className="kafka-grupos">

                Guía EP5 (Kafka) sobre tu proyecto: código a agregar y correcciones

                Page 50 of 63

                {grupos.map((g) => (
                    <li key={g}>
                        {g} <button type="button" onClick={() =>

                            verGrupo(g)}>Ver lag</button>
                    </li>
                ))}
            </ul>
            {detalleGrupo && (
                <div className="kafka-detalle">
                    <p>
                        Grupo <strong>{detalleGrupo.groupId}</strong>: estado

                        {detalleGrupo.state}, lag total{' '}

                        {detalleGrupo.lagTotal}
                    </p>
                    <ul>
                        {Object.entries(detalleGrupo.lagPorParticion ||

                            {}).map(([particion, lag]) => (

                                <li key={particion}>{particion}: {lag}</li>
                            ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
export default KafkaAdminPanel;