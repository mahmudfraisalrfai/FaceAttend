import { Navigate, Route, Routes } from "react-router-dom";
import WebCam from "./components/webcam.jsx";
import Login from "./components/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import LecturerDashboard from "./Home/LecturerDashboard.jsx";
import SessionFree from "./Home/SessionFree.jsx";
import AdminDashboard from "./Home/AdminDashboard.jsx";
import SessionDetails from "./components/SessionDetails.jsx";
import { useAuth } from "./components/context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import StudentEntry from "./Home/StudentEntry.jsx";
export default function App() {
  const { isLogin, user } = useAuth();
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} rtl />
      {isLogin && <Navbar user={user} />}
      <Routes>
        {!isLogin && <Route path="/login" element={<Login />} />}
        <Route element={<ProtectedRoute />}>
          <Route path="/login" element={<Navigate to={"/"} />} />
          {user && user.role === "hall_supervisor" ? (
            <>
              <Route path="/" element={<LecturerDashboard />} />
              <Route path="/webcam" element={<WebCam />} />
            </>
          ) : (
            <>
              <Route path="/" element={<AdminDashboard />}></Route>
              <Route path="/addstudent" element={<StudentEntry />}></Route>
            </>
          )}
          <Route path="/SessionFree" element={<SessionFree />} />
          <Route path="/SessionDetails/:id" element={<SessionDetails />} />
          <Route path="*" element={<Navigate to={"/"} />} />
        </Route>
      </Routes>
    </>
  );
}
