import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { obtenerRol, sincronizarPerfil } from "./services/api";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashbboardDocente from "./pages/DashboardDocente";
import DashboardEstudiante from "./pages/DashboardEstudiante";
import DashboardApoderado from "./pages/DashboardApoderado";
import ProtectedRoute from "./components/ProtectedRoute";
import './css/App.css';

function RedirigirSegunRol() {
    const rol = obtenerRol();
    console.log("[DEBUG RedirigirSegunRol] rol leído:", rol);
    if (rol === 'ADMIN') return <Navigate to="/admin" />;
    if (rol === 'DOCENTE') return <Navigate to="/docente" />;
    if (rol === 'ESTUDIANTE') return <Navigate to="/estudiante" />;
    if (rol === 'APODERADO') return <Navigate to="/apoderado" />;
    console.log("[DEBUG RedirigirSegunRol] rol no coincide con ninguno, mandando a /login");
    return <Navigate to="/login" />;
}

function AuthGate({ children }) {
    const { inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [listo, setListo] = useState(false);

    useEffect(() => {
        let activo = true;
        const preparar = async () => {
            
            if (inProgress !== InteractionStatus.None) {
                return;
            }

            if (isAuthenticated && !obtenerRol()) {
                try {
                    await sincronizarPerfil();
                } catch (error) {
                    console.error("No se pudo sincronizar el perfil con el BFF", error);
                }
            }
            if (activo) setListo(true);
        };
        preparar();
        return () => { activo = false; };
    }, [isAuthenticated, inProgress]);

        console.log("[DEBUG AuthGate] inProgress:", inProgress, "isAuthenticated:", isAuthenticated, "listo:", listo, "rolGuardado:", obtenerRol());

    if (inProgress !== InteractionStatus.None || (isAuthenticated && !listo)) {
        return <div className="cargando-sesion">Cargando sesión...</div>;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthGate>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<RedirigirSegunRol />} />

                    <Route path="/admin" element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <DashboardAdmin />
                        </ProtectedRoute>
                    } />

                    <Route path="/docente" element={
                        <ProtectedRoute roles={['DOCENTE']}>
                            <DashbboardDocente />
                        </ProtectedRoute>
                    } />

                    <Route path="/estudiante" element={
                        <ProtectedRoute roles={['ESTUDIANTE']}>
                            <DashboardEstudiante />
                        </ProtectedRoute>
                    } />

                    <Route path="/apoderado" element={
                        <ProtectedRoute roles={['APODERADO']}>
                            <DashboardApoderado />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthGate>
        </BrowserRouter>
    );
}

export default App;