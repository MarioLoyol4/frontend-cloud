import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";
import '../css/Login.css';

function Login() {
    const { instance, inProgress } = useMsal();

    const handleLogin = () => {
        if (inProgress === InteractionStatus.None) {
            instance.loginRedirect(loginRequest).catch((e) => console.error(e));
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-content">
                    <h1>Colegio O'Higgins</h1>
                    <p className="login-slogan">"Todos los niños pueden aprender"</p>
                    <p className="login-descripcion">
                        Portal academico para estudiantes, apoderados y docentes.
                        Accede a notas, asistencias y comunicados del colegio.
                    </p>
                </div>
            </div>
            <div className="login-right">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="login-logo-icono"><img src="../../Imagen/images.png" alt="Logo" /></div>
                        <span>Colegio O'Higgins</span>
                    </div>
                    <h2>Iniciar Sesión</h2>
                    <p className="login-subtitulo">Ingresa con tu cuenta institucional</p>
                    <button
                        type="button"
                        className="login-boton"
                        onClick={handleLogin}
                        disabled={inProgress !== InteractionStatus.None}
                    >
                        {inProgress !== InteractionStatus.None ? "Cargando..." : "Iniciar sesión con Microsoft"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;