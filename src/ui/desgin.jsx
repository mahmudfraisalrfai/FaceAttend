import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionById } from "../api";
import { useAuth } from "../components/context/AuthContext";

export const Card = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="space-y-2">{children}</div>
);

export const Input = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
      props.className || ""
    }`}
  />
);

export const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
  >
    {children}
  </button>
);

export const SessionCard = ({ session }) => {
  const navigate = useNavigate();

  const isValidSession = new Date(session.endTime) > new Date();
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-md transition duration-300 space-y-4 ${
        isValidSession && !session.isActive
          ? "bg-green-50 border-green-500 shadow-lg"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          📚 {session.courseName}
        </h2>
        <button
          onClick={() =>
            navigate(`/SessionDetails/${session.id}`, {
              state: session,
            })
          }
          className="text-xs font-bold px-4 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition shadow-sm"
        >
          تفاصيل الجلسة
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <p>
          🏫 <strong>المكان:</strong> {session.classroomName}
        </p>
        <p>
          🕔 <strong>إلى:</strong> {formatDateTime(session.endTime)}
        </p>
        <p>
          🕒 <strong>من:</strong> {formatDateTime(session.startTime)}
        </p>

        <p className="col-span-1 md:col-span-2 flex items-center gap-2">
          <strong>الحالة:</strong>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              session.isActive
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {session.isActive ? "✅ تم اخذ الحضور" : "⌛ لم يتم اخذ الحضور"}
          </span>
        </p>
      </div>

      {/* Footer */}
      {isValidSession && !session.isActive && (
        <div className="flex justify-end pt-2 border-t border-gray-200 mt-4">
          <button
            onClick={() =>
              navigate("/webcam", {
                state: {
                  session_id: session.id,
                },
              })
            }
            className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition"
          >
            🎥 بدء الحضور
          </button>
        </div>
      )}
    </div>
  );
};
