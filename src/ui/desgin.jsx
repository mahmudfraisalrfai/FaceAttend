import { useNavigate } from "react-router-dom";

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
  const formatDateTime = (dateTimeStr) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateTimeStr).toLocaleString("ar-EG", options);
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-md transition duration-300 ${
        isValidSession && !session.isActive
          ? "bg-green-50 border-green-500 shadow-lg"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-800">
        <p>
          <strong>المقرر:</strong> {session.courseName}
        </p>
        <p>
          <strong>القاعة:</strong> {session.classroomName}
        </p>
        <p>
          <strong>من:</strong> {formatDateTime(session.startTime)}
        </p>
        <p>
          <strong>إلى:</strong> {formatDateTime(session.endTime)}
        </p>
        <p className="flex items-center gap-2">
          <strong>الحالة:</strong>{" "}
          <span className={`text-xs font-bold px-2 py-1 rounded-full `}>
            {!session.isActive ? "  لم يتم اخذ الحضور " : " ✅ تم اخذ الحضور "}
          </span>
        </p>
        <div className="w-fit">
          <button
            onClick={() =>
              navigate(`/SessionDetails/${session.id}`, {
                state: session,
              })
            }
            className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition duration-200 shadow-sm"
          >
            تفاصيل الجلسة
          </button>
        </div>
      </div>

      {isValidSession && !session.isActive && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              navigate("/webcam", {
                state: {
                  studentDetail: session.attendance,
                  session_id: session.id,
                },
              })
            }
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
          >
            🎥 بدء الحضور
          </button>
        </div>
      )}
    </div>
  );
};
