
import { createRoot } from "react-dom/client";
import { EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import './css/App.css';
import App from "./App.jsx";
import { msalInstance } from "./msalInstance";

msalInstance.initialize().then(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) msalInstance.setActiveAccount(accounts[0]);

    msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
            msalInstance.setActiveAccount(event.payload.account);
        }
    });

    return msalInstance.handleRedirectPromise();
}).finally(() => {
    createRoot(document.getElementById("root")).render(
        
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        
    );
});