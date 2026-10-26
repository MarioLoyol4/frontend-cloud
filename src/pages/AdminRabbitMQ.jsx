import React, { useState } from 'react';
import { crearCola, eliminarCola } from '../services/api'; // Ajusta la ruta según tu estructura


export default function AdminRabbitMQ() {
    const [queueName, setQueueName] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });


    const handleCreateQueue = async (e) => {
        e.preventDefault();
        if (!queueName.trim()) return;


        try {
            await crearCola(queueName);
            setMessage({ text: `Cola '${queueName}' creada exitosamente.`, type: 'success' });
            setQueueName('');
        } catch (error) {
            // Aquí se captura el error si el backend rechaza por validación
            setMessage({ text: error.message || 'Error al crear la cola', type: 'error' });
        }
    };


    const handleDeleteQueue = async (name) => {
        if (window.confirm(`¿Seguro que quieres eliminar la cola ${name}?`)) {
            try {
                await eliminarCola(name);
                setMessage({ text: `Cola '${name}' eliminada.`, type: 'success' });
            } catch (error) {
                setMessage({ text: 'Error al eliminar la cola', type: 'error' });
            }
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Panel de Administración RabbitMQ</h1>
            
            {message.text && (
                <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}


            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl mb-4">Gestión de Colas</h2>
                <form onSubmit={handleCreateQueue} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={queueName} 
                        onChange={(e) => setQueueName(e.target.value)}
                        placeholder="Nombre de la cola"
                        className="border p-2 rounded flex-1"
                        required // Validación en el frontend
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Crear Cola
                    </button>
                </form>
                
                <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500 mb-2">Prueba de borrado (ejemplo):</p>
                    <button 
                        onClick={() => handleDeleteQueue('notificaciones.nota.queue')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                        Eliminar 'notificaciones.nota.queue'
                    </button>
                </div>
            </div>
            {/* Aquí puedes agregar los formularios para crear/eliminar Exchanges y Bindings de la misma manera */}
        </div>
    );
}
