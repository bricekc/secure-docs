import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Login";
import DashboardLayout from "./dashboard/Layout";
import DashboardHome from "./dashboard/Home";
import DashboardDocuments from "./dashboard/Documents";

import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="documents" element={<DashboardDocuments />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
