import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { obtenerRol } from "./services/api";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashbboardDocente from "./pages/DashboardDocente";
import DashboardEstudiante from "./pages/DashboardEstudiante";
import DashboardApoderado from "./pages/DashboardApoderado";
import ProtectedRoute from "./components/ProtectedRoute";
import './css/App.css';

function RedirigirSegunRol() {
    const rol = obtenerRol();
    if (rol === 'ADMIN') return <Navigate to="/admin" />;
    if (rol === 'DOCENTE') return <Navigate to="/docente" />;
    if (rol === 'ESTUDIANTE') return <Navigate to="/estudiante" />;
    if (rol === 'APODERADO') return <Navigate to="/apoderado" />;
    return <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}

export default App;