import { useMsal } from "@azure/msal-react";
import { cerrarSesion, obtenerRol } from "../services/api";
import '../css/NavBar.css';

function NavBar() {
    const { accounts } = useMsal();
    const nombreUsuario = accounts[0]?.name || accounts[0]?.username || "Usuario";
    const rol = obtenerRol();

    const handleLogout = async () => {
        await cerrarSesion();
    };

    const etiquetaRol = {
        ADMIN: "Administrador",
        DOCENTE: "Docente",
        APODERADO: "Apoderado",
        ESTUDIANTE: "Estudiante"
    };

    return (
        <nav className="navbar">
            <div className="navbar-izquierda">
                <div className="navbar-logo"><img src="../../Imagen/images.png" alt="" /></div>
                <div className="navbar-info">
                    <span className="navbar-colegio">Colegio O'Higgins</span>
                    <span className="navbar-subtitulo">Portal digital</span>
                </div>
            </div>
            <div className="navbar-derecha">
                <div className="navbar-usuario">
                    <div className="navbar-avatar">
                        <img src="../../Imagen/avatar.jpg" alt="Avatar" />
                    </div>
                    <div className="navbar-usuario-info">
                        <span className="navbar-nombre">{nombreUsuario}</span>
                        <span className="navbar-rol">{etiquetaRol[rol] || rol}</span>
                    </div>
                </div>
                <button className="navbar-logout" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}

export default NavBar;