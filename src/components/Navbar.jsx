import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const { logout } = useAuth();

  const handlLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 font-bold text-2xl bg-gradient-to-br from-blue-100 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            <div>FaceAttend</div>
          </div>

          <div className="hidden md:flex space-x-6">
            <Link
              className="text-gray-600 hover:text-purple-600 transition"
              to={"/"}
            >
              لوحة التحكم{" "}
            </Link>
            <Link
              className="text-gray-600 hover:text-purple-600 transition"
              to={"/SessionFree"}
            >
              إنشاء جلسة{" "}
            </Link>
            {user?.role === "admin" ? (
              <Link
                className="block text-gray-600 hover:text-purple-600 transition"
                to={"/addStudent"}
              >
                إدراج طالب{" "}
              </Link>
            ) : (
              ""
            )}{" "}
            <p
              className="text-gray-600 hover:text-purple-600 transition cursor-pointer "
              onClick={handlLogout}
            >
              تسجيل خروج
            </p>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-purple-600 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pb-4 space-y-2 shadow">
          <Link
            to={"/"}
            className="block text-gray-600 hover:text-purple-600 transition"
          >
            لوحة التحكم{" "}
          </Link>

          <Link
            className="block text-gray-600 hover:text-purple-600 transition"
            to={"/SessionFree"}
          >
            إنشاء جلسة{" "}
          </Link>

          {user?.role === "admin" ? (
            <Link
              className="block text-gray-600 hover:text-purple-600 transition"
              to={"/addStudent"}
            >
              إدراج طالب{" "}
            </Link>
          ) : (
            ""
          )}
          <p
            className="block text-gray-600 hover:text-purple-600 transition cursor-pointer "
            onClick={handlLogout}
          >
            تسجيل خروج
          </p>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
