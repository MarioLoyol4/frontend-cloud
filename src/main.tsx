import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import App from './App';

// 1. Configuración de AWS Cognito OIDC
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_JlKpfnYKw", 
  client_id: "7bo7udqp0eup32hj1ennssj9hb",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "email openid phone",
};

// 2. Renderizar envolviendo <App /> dentro de <AuthProvider>
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);