import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "../ui/desgin";
import { createSession, getAllNeededForCreateSession } from "../api";
import { useAuth } from "../components/context/AuthContext";
import { toast } from "react-toastify";

const SessionFree = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [classRooms, setClassRooms] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    place: "",
    supervisor: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const [fileData, setFileData] = useState(null);

  const { token, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllNeededForCreateSession(token, user);
        setCourses(data.courses);
        setClassRooms(data.classRooms);
        setSupervisors(data.supervisors);
      } catch (error) {
        alert("فشل في تحميل البيانات.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData(file);
    }
  };

  const handleCreateSession = () => {
    if (loading) return;

    const newErrors = {};
    if (!form.subject) newErrors.subject = "الرجاء اختيار المادة.";
    if (!form.place) newErrors.place = "الرجاء اختيار المكان.";
    if (!form.startDate) newErrors.startDate = "الرجاء إدخال تاريخ البدء.";
    if (!form.endDate) newErrors.endDate = "الرجاء إدخال تاريخ الانتهاء.";
    if (user.role === "admin" && !form.supervisor)
      newErrors.supervisor = "الرجاء اختيار المشرف.";
    if (user.role === "admin" && (!fileData || fileData.length === 0)) {
      newErrors.file = "الرجاء رفع ملف Excel بأسماء الطلاب.";
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (start && end && end <= start) {
      newErrors.endDate = "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    const selectedCourse = courses.find((c) => c.name === form.subject);
    const selectedClassRoom = classRooms.find((r) => r.name === form.place);
    const selectedSupervisor = supervisors.find(
      (s) => s.name === form.supervisor
    );

    const sendSessionData = async () => {
      try {
        let res;
        if (user.role === "admin") {
          const sessionData = new FormData();
          sessionData.append("course_id", selectedCourse?.id);
          sessionData.append("classroom_id", selectedClassRoom?.id);
          sessionData.append(
            "start_time",
            form.startDate.replace("T", " ") + ":00"
          );
          sessionData.append(
            "end_time",
            form.endDate.replace("T", " ") + ":00"
          );
          sessionData.append("supervisor_id", selectedSupervisor?.id);
          sessionData.append("attendance_file", fileData);

          res = await createSession(token, sessionData);
          toast.success(res?.data.message);
        } else {
          const sessionData = {
            course_id: selectedCourse?.id,
            classroom_id: selectedClassRoom?.id,
            start_time: form.startDate.replace("T", " ") + ":00",
            end_time: form.endDate.replace("T", " ") + ":00",
          };

          res = await createSession(token, sessionData);
          toast.success("تم انشاْ الجلسة بنجاح ");
        }

        navigate("/");
      } catch (error) {
        if (error?.response?.data) {
          const data = error.response.data;
          let errorMessage = data.message || "حدث خطأ أثناء إنشاء الجلسة";

          if (
            Array.isArray(data.missing_students) &&
            data.missing_students.length > 0
          ) {
            const students = data.missing_students.join(", ");
            errorMessage += ` \nالطلاب الغير الموجودين: ${students}`;
          }

          toast.error(errorMessage);
        } else {
          toast.error("حدث خطأ غير متوقع أثناء إنشاء الجلسة");
        }
        navigate("/");
        console.error(error?.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    sendSessionData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 pt-24 flex justify-center items-center">
      <Card className="w-full max-w-3xl shadow-xl border border-purple-300 rounded-2xl">
        <CardContent>
          <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">
            🎓 إعداد جلسة حضور جديدة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                label: "المادة",
                name: "subject",
                options: courses.map((c) => c.name),
              },
              {
                label: "المكان",
                name: "place",
                options: classRooms.map((r) => r.name),
              },
            ].map(({ label, name, options }) => (
              <div key={name}>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <select
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">اختر {label}</option>
                  {options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors[name] && (
                  <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                )}
              </div>
            ))}

            {user.role === "admin" && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  المشرف
                </label>
                <select
                  name="supervisor"
                  value={form.supervisor}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">اختر مشرفاً</option>
                  {supervisors.map((sup) => (
                    <option key={sup.id} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
                {errors.supervisor && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                تاريخ البدء
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                تاريخ الانتهاء
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            {user.role === "admin" && (
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  📄 رفع ملف Excel الخاص بالطلاب
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md bg-white"
                />
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleCreateSession}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-md"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء جلسة"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionFree;
