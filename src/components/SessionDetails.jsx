import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent } from "../ui/desgin";
import { useAuth } from "./context/AuthContext";
import { AttendanceSkeleton } from "../ui/Skeleton";
import { getSessionById } from "../api";

function SessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedSession = location.state;
  const [session, setSession] = useState(passedSession);
  const [loading, setLoading] = useState(true);

  const { token, user } = useAuth();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await getSessionById("getStudentBySessionId", token, {
          session_id: id,
        });
        const sessionData = response.data;
        setSession({
          subject: passedSession.subject || "غير معروف",
          date:
            new Date(passedSession.date).toLocaleTimeString("ar-EG") ||
            "غير معروف",
          academicYear: passedSession.academicYear || "غير معروف",
          lecturerName: passedSession.supervisor || "غير معروف",
          place: passedSession.place || "غير معروف",
          students: sessionData.students || [],
        });
      } catch (error) {
        console.error("فشل تحميل بيانات الجلسة:", error);
      } finally {
        setLoading(false);
      }
    };

    if (passedSession) {
      fetchSession();
    }
  }, [id, passedSession]);

  return (
    <div className="p-6 pt-20" dir="rtl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-purple-600 hover:text-purple-800 transition"
      >
        ← الرجوع
      </button>

      <Card className="mb-6">
        <div
          className="flex flex-col-reverse md:flex-row-reverse items-start gap-6"
          dir="rtl"
        >
          {/* الصورة - على اليسار في الشاشات الكبيرة */}
          <div className="hidden md:block md:w-1/3">
            <img
              src="/assets/istockphoto-2172514451-612x612.png"
              alt="جلسة دراسية"
              className="rounded-xl shadow-lg w-full h-auto object-cover"
            />
          </div>

          {/* التفاصيل - على اليمين */}
          <div className="flex-1 text-right">
            <h1 className="text-2xl font-bold text-purple-700 mb-4">
              📝 تفاصيل الجلسة
            </h1>
            <ul className="space-y-2 text-gray-700">
              {user?.role === "hall_supervisor" ? (
                <>
                  <li>
                    <strong>📚 المادة:</strong> {passedSession.courseName}
                  </li>
                  <li>
                    <strong>📅 الوقت:</strong>{" "}
                    {new Date(passedSession.startTime).toLocaleTimeString(
                      "ar-EG"
                    )}
                  </li>
                  <li>
                    <strong>👨‍🏫 المحاضر:</strong> {user.name}
                  </li>
                  <li>
                    <strong>🏫 المكان:</strong> {passedSession.classroomName}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>📚 المادة:</strong> {session.subject}
                  </li>
                  <li>
                    <strong>📅 التاريخ:</strong> {session.date}
                  </li>

                  <li>
                    <strong>👨‍🏫 المحاضر:</strong> {session.lecturerName}
                  </li>
                  <li>
                    <strong>🏫 المكان:</strong> {session.place}
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>

      {/* قائمة الحضور */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4 text-purple-700">
            📋 قائمة الحضور
          </h2>
          {loading ? (
            <table className="w-full text-right border" dir="rtl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">اسم الطالب</th>
                  <th className="px-4 py-2">رقم الطالب</th>
                  <th className="px-4 py-2">الحضور</th>
                </tr>
              </thead>
              <tbody>
                <AttendanceSkeleton />
              </tbody>
            </table>
          ) : session.students?.length > 0 ? (
            <table className="w-full text-right border" dir="rtl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">اسم الطالب</th>
                  <th className="px-4 py-2">رقم الطالب</th>
                  <th className="px-4 py-2">الحضور</th>
                </tr>
              </thead>
              <tbody>
                {session.students.map((student, index) => (
                  <tr key={student.record_id} className="border-b">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{student.student_name}</td>
                    <td className="px-4 py-2">{student.university_id}</td>
                    <td className="px-4 py-2">
                      {student.is_present ? "حاضر" : "غائب"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">لا يوجد حضور مسجل لهذه الجلسة.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionDetails;
