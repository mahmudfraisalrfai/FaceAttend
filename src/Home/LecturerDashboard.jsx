import { SessionCard } from "../ui/desgin";
import { useEffect, useState } from "react";
import { fetchDataSupervsior } from "../api";
import { useAuth } from "../components/context/AuthContext";
import { DetailsSkeleton } from "../ui/Skeleton";

const LecturerDashboard = () => {
  const { token } = useAuth();

  const [lecturerData, setLecturerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchDataSupervsior("sv/getSessionBySupId", token).then((res) => {
          setLecturerData(res.data);
          setLoading(false);
        });
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    })();
  }, []);
  const upcomingSessions = lecturerData.filter((session) => {
    const sessionDate = new Date(session.start_time);
    return sessionDate;
  });
  const preparedSessions = upcomingSessions
    .map((session) => ({
      id: session.id,
      courseName: session.course.name,
      classroomName: session.classroom.name,
      startTime: session.start_time,
      endTime: session.end_time,
      isActive: session.is_active === 1,
      attendance: session.attendance || [],
    }))
    .sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? 1 : -1;
      }

      return new Date(b.endTime) - new Date(a.endTime);
    });
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 pt-6 pb-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md px-6 pt-12 pb-6 space-y-6">
        <section>
          <div className="grid grid-cols-1 gap-y-6">
            {loading ? (
              <DetailsSkeleton />
            ) : preparedSessions.length > 0 ? (
              preparedSessions.map((session, i) => (
                <SessionCard key={i} session={session} />
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد جلسات قادمة.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LecturerDashboard;
