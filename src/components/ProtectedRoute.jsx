import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { obtenerRol } from "../services/api";
import '../css/ProtectedRoute.css';

function ProtectedRoute({ children, roles }) {
    const isAuthenticated = useIsAuthenticated();
    const rol = obtenerRol();

    console.log("[DEBUG ProtectedRoute]", { roles, isAuthenticated, rol });

    if (!isAuthenticated) {
        console.log("[DEBUG ProtectedRoute] rebotando a /login: isAuthenticated es false");
        return <Navigate to="/login" />;
    }
    if (roles && !roles.includes(rol)) {
        console.log("[DEBUG ProtectedRoute] rebotando a /login: rol no incluido", { rol, roles });
        return <Navigate to="/login" />;
    }
    return children;
}

export default ProtectedRoute;