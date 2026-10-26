import React, { useState } from 'react';
import { registrarNota, getNotificaciones } from '../services/api'; // Ajusta tu ruta


export default function SimuladorDashboard() {
    const [loading, setLoading] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);


    const simularNota = async () => {
        setLoading(true);
        try {
            // 1. Usa tu función existente para enviar la nota al BFF
            // El BFF llamará a academic-service y este a RabbitMQ
            await registrarNota({ 
                alumnoId: 1, 
                asignaturaId: 1, 
                calificacion: 7.0 
            });
            
            // 2. Esperamos 2 segundos (para que RabbitMQ procese y guarde en BD)
            setTimeout(async () => {
                // 3. Traemos las notificaciones actualizadas
                const res = await getNotificaciones();
                // Ajusta esto según lo que devuelva tu BFF (puede ser res o res.body)
                setNotificaciones(res || []); 
                setLoading(false);
            }, 2000);


        } catch (error) {
            console.error("Error", error);
            alert("Error al simular la nota");
            setLoading(false);
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Dashboard de Apoderado (Demo Asíncrona)</h1>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
                <h2 className="text-lg font-semibold mb-2">Acciones de Simulación</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Al hacer clic, se envía una nota. El backend procesa rápido y RabbitMQ hace el resto.
                </p>
                <button 
                    onClick={simularNota} 
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Procesando en segundo plano...' : 'Simular Registro de Nota'}
                </button>
            </div>


            <h2 className="text-xl font-bold mb-2">Bandeja de Notificaciones</h2>
            <div className="bg-white rounded shadow">
                {notificaciones.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">No hay notificaciones. Simula un evento.</p>
                ) : (
                    <ul className="divide-y">
                        {notificaciones.map((notif, index) => (
                            <li key={index} className="p-4 hover:bg-gray-50">
                                <p className="font-semibold text-gray-800">{notif.asunto || 'Notificación'}</p>
                                <p className="text-gray-600">{notif.mensaje}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
