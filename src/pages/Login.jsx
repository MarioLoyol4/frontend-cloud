import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {login, guardarToken} from "../services/api";
import '../css/Login.css';


function Login() {
    const [rut, setRut] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            const data = await login(rut, password);

            if (data.error) {
                setError(data.error);
                return;
            }

            guardarToken(data.token, data.rol);

            if (data.rol === "ADMIN") navigate("/admin");
            else if (data.rol === "DOCENTE") navigate("/docente");
            else if (data.rol === "ESTUDIANTE") navigate("/estudiante");
            else if (data.rol === "APODERADO") navigate("/apoderado");

        } catch (err) {
            setError("Error de conexión. Intente nuevamente.");
        } finally {
            setCargando(false);
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
                    <p className="login-subtitulo">Ingresa tus credenciales</p>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-campo">
                            <label htmlFor="rut">RUT</label>
                            <input
                                id="rut"
                                type="text"
                                placeholder="12345678-9"
                                value={rut}
                                onChange={(e) => setRut(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-campo">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="login-error">{error}</div>
                        )}
                        <button
                            type="submit"
                            className="login-boton"
                            disabled={cargando}
                        >
                            {cargando ? "Ingresando..." : "Ingresar"}

                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;