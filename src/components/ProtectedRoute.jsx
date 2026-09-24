import { Navigate } from "react-router-dom";
import { obtenerToken, obtenerRol } from "../services/api";
import '../css/ProtectedRoute.css';

function ProtectedRoute({ children, roles }) {
    const token = obtenerToken();
    const rol = obtenerRol();

    if (!token) {
        return <Navigate to="/login" />;
    }
    if (roles && !roles.includes(rol)) {
        return <Navigate to="/login" />;
    }
    return children;
}

export default ProtectedRoute;