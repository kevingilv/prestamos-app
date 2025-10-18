import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Prestamos from "./pages/Prestamos";
import Pagos from "./pages/Pagos";
import StepperExample from "./pages/StepperExample"; // Import the example page

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="p-4">Cargando...</div>;
  return currentUser ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<Prestamos />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="prestamos" element={<Prestamos />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="stepper-example" element={<StepperExample />} /> {/* Add the new route */}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
