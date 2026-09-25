import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { obtenerRol } from "../services/api";
import '../css/ProtectedRoute.css';

function ProtectedRoute({ children, roles }) {
    const isAuthenticated = useIsAuthenticated();
    const rol = obtenerRol();

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (roles && !roles.includes(rol)) return <Navigate to="/login" />;
    return children;
}

export default ProtectedRoute;