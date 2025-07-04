import { useState, useEffect } from "react";
import { Card, CardContent, Input, Button } from "../ui/desgin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import { LecturersSkeleton, SessionsSkeleton } from "../ui/Skeleton";
import { createuser, fetchData } from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [lecturersLoading, setLecturersLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 5;

  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [messagLecturer, setMessagLecturer] = useState({
    state: false,
    message: "",
  });

  const { token } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        setSessionsLoading(true);
        const sessionsData = await fetchData("getAllSession", token);
        setSessions(
          sessionsData.data.sessions
            .sort((a, b) => new Date(b.start_time) - new Date(a.start_time)) // ⬅️ الترتيب حسب التاريخ الأحدث
            .map((s) => ({
              id: s.id,
              subject: s.course.name,
              place: s.classroom.name,
              date: s.start_time.split(" "),
              attendees: 0,
              supervisor: s.supervisor.name,
            }))
        );
        setSessionsLoading(false);

        setLecturersLoading(true);
        const supervisorsData = await fetchData("getAllSupervisor", token);
        setLecturers(
          supervisorsData.data.supervisor.map((sup) => ({
            id: sup.id,
            name: sup.name,
            email: sup.email,
          }))
        );
        setLecturersLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  const filteredSessions = sessions.filter(
    (session) =>
      session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.date[0].includes(searchTerm)
  );

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(
    indexOfFirstSession,
    indexOfLastSession
  );
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  const handleAddLecturer = async () => {
    if (!newLecturer.name || !newLecturer.email || !newLecturer.password) {
      return setMessagLecturer({
        state: true,
        message: "⚠️ الرجاء ملئ كافة الحقول",
      });
    }

    const result = await createuser("signup", newLecturer, token);

    if (result.success && result.user) {
      setLecturers((prev) => [
        ...prev,
        {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      ]);

      setMessagLecturer({
        state: true,
        message: "✅ تم إضافة المحاضر بنجاح",
      });

      setNewLecturer({ name: "", email: "", password: "" });
    } else {
      setMessagLecturer({
        state: true,
        message: "❌ فشل في إضافة المحاضر، تحقق من البيانات أو الصلاحيات",
      });
    }
  };

  const handleDeleteLecturer = (id) => {
    setLecturers((prev) => prev.filter((lecturer) => lecturer.id !== id));
  };

  return (
    <div className="pt-20 p-4 max-w-6xl mx-auto">
      {/* البحث */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="🔍 ابحث عن جلسة حسب المادة أو التاريخ أو المشرف أو المكان"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
      </div>

      {/* الجلسات */}
      <Card className="mb-20">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            📅 الجلسات المسجلة
          </h2>
          {!sessionsLoading ? (
            <>
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">المادة</th>
                    <th className="px-4 py-2">المشرف</th>
                    <th className="px-4 py-2">المكان</th>
                    <th className="px-4 py-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSessions.map((session, idx) => (
                    <tr
                      key={session.id}
                      className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        navigate(`/SessionDetails/${session.id}`, {
                          state: session,
                        })
                      }
                    >
                      <td className="px-4 py-2">
                        {indexOfFirstSession + idx + 1}
                      </td>
                      <td className="px-4 py-2">{session.subject}</td>
                      <td className="px-4 py-2">{session.supervisor}</td>
                      <td className="px-4 py-2">{session.place}</td>
                      <td className="px-4 py-2">{session.date[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex gap-2 justify-center">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  ⬅ السابق
                </Button>
                <span className="text-gray-600 pt-2">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  التالي ➡
                </Button>
              </div>
            </>
          ) : (
            <SessionsSkeleton />
          )}
        </CardContent>
      </Card>

      {/* المشرفين */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            👨‍🏫 قائمة المشرفين
          </h2>

          {!lecturersLoading ? (
            <>
              <table className="w-full text-sm text-left text-gray-700 mb-4">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">الاسم</th>
                    <th className="px-4 py-2">البريد</th>
                    {/* <th className="px-4 py-2">إجراء</th> */}
                  </tr>
                </thead>
                <tbody>
                  {lecturers.map((lecturer, index) => (
                    <tr
                      key={lecturer.id}
                      className="bg-gray-50 hover:bg-gray-100"
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{lecturer.name}</td>
                      <td className="px-4 py-2">{lecturer.email}</td>
                      {/* <td className="px-4 py-2">
                        <Button
                          onClick={() => handleDeleteLecturer(lecturer.id)}
                          className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          حذف
                        </Button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="👤 الاسم"
                  value={newLecturer.name}
                  onChange={(e) =>
                    setNewLecturer({ ...newLecturer, name: e.target.value })
                  }
                />
                <Input
                  placeholder="📧 البريد"
                  value={newLecturer.email}
                  onChange={(e) =>
                    setNewLecturer({ ...newLecturer, email: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="🔑 كلمة السر"
                  value={newLecturer.password}
                  onChange={(e) =>
                    setNewLecturer({ ...newLecturer, password: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleAddLecturer}
                disabled={isSubmitting}
                className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
              >
                {isSubmitting ? "⏳ جاري الإضافة..." : "➕ أضف محاضر"}
              </Button>

              {messagLecturer.state && (
                <div
                  className={`mb-4 p-3 text-center rounded-lg ${
                    messagLecturer.message.includes("✅")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {messagLecturer.message}
                </div>
              )}
            </>
          ) : (
            <LecturersSkeleton />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
