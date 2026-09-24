import { useAuth } from "react-oidc-context"; // Mantiene los estilos originales de tu proyecto

export default function App() {
  const auth = useAuth();

  const handleLogin = () => {
    auth.signinRedirect();
  };

  const handleLogout = () => {
    const clientId = "7bo7udqp0eup32hj1ennssj9hb";
    const logoutUri = "http://localhost:5173"; // TODO: Reemplazar con tu URI real
    const cognitoDomain = "https://us-east-1_JlKpfnYKw.auth.us-east-1.amazoncognito.com"; 
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  // Manejo de estados de carga y error del OIDC Context
  if (auth.isLoading) {
    return (
      <div className="layout">
        <main className="container">
          <div className="card text-center">
            <h2>Cargando...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="layout">
        <main className="container">
          <div className="card text-center">
            <h2>Error de Autenticación</h2>
            <p>{auth.error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  const currentUser = auth.user?.profile;

  return (
    <div className="layout">
      <header className="navbar">
        <div className="logo">
          <span>Portal MiApp</span>
        </div>
        <div>
          {auth.isAuthenticated ? (
            <button className="btn btn-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          ) : (
            <button className="btn btn-login" onClick={handleLogin}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {auth.isAuthenticated ? (
          <div className="card">
            <div className="avatar">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
            </div>
            <h2>¡Bienvenido, {currentUser?.email || "Usuario"}!</h2>
            <p className="subtitle">Autenticado con AWS Cognito</p>

            <div className="user-details">
              <div className="detail-item">
                <strong>Correo / Usuario:</strong>
                <span>{currentUser?.email}</span>
              </div>
              <div className="detail-item">
                <strong>ID Token:</strong>
                <code style={{ wordBreak: 'break-all' }}>{auth.user?.id_token?.substring(0, 30)}...</code>
              </div>
              <div className="detail-item">
                <strong>Access Token:</strong>
                <code style={{ wordBreak: 'break-all' }}>{auth.user?.access_token?.substring(0, 30)}...</code>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <h2>Acceso Requerido</h2>
            <p className="subtitle">
              Para ingresar al sistema debes validar tus credenciales.
            </p>
            <button className="btn btn-login btn-lg" onClick={handleLogin}>
              Iniciar Sesión con Cognito
            </button>
          </div>
        )}
      </main>
    </div>
  );
}