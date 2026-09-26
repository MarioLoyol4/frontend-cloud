import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
        redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
        postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI + "/login",
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                if (level === LogLevel.Error) console.error(message);
            },
            logLevel: LogLevel.Error,
        },
    },
};


export const loginRequest = {
    scopes: [import.meta.env.VITE_AZURE_API_SCOPE],
};