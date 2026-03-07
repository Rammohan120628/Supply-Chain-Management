import { BrowserRouter } from "react-router-dom";
import { ThemeModeScript, ThemeProvider } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import Router from "./routes/Router"; 
import { Toaster } from "./components/shadcn-ui/Default-Ui/toaster";
import { EntityProvider } from "./views/Entity/EntityContext";
import { PermissionsProvider } from "./context/PermissionContext/PermissionContext"; // adjust path

function App() {
  return (
    <>
      <EntityProvider>
        <ThemeModeScript />
        <ThemeProvider theme={customTheme}>    
          <BrowserRouter>
            <PermissionsProvider>
              <Router />
            </PermissionsProvider>
          </BrowserRouter>
        </ThemeProvider>
        <Toaster />
      </EntityProvider>
    </>
  );
}

export default App;