import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import * as XLSX from "xlsx";
import { Card, CardContent, Button } from "../ui/desgin";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllStudents, getSessionById, storeAttendace } from "../api";
import { useAuth } from "./context/AuthContext";
import { toast } from "react-toastify";

function WebCam() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // مرجع لتخزين البث

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [attendance, setAttendance] = useState(new Set());
  const [studentNames, setStudentNames] = useState([]);
  const [studentsSource, setStudentsSource] = useState(""); // "session" | "all"

  useEffect(() => {
    async function fetchStudents() {
      try {
        const sessionResponse = await getSessionById(
          "getStudentBySessionId",
          token,
          {
            session_id: location.state.session_id,
          }
        );

        const sessionStudents = sessionResponse.data.students;

        if (Array.isArray(sessionStudents) && sessionStudents.length > 0) {
          setStudentNames(sessionStudents);
          setStudentsSource("session");
        } else {
          const allResponse = await getAllStudents(token);
          setStudentNames(allResponse.data.students);
          setStudentsSource("all");
        }
      } catch (error) {
        console.error("فشل تحميل بيانات الطلاب:", error);
      }
    }

    fetchStudents();
  }, [token, location.state.session_id]);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    setModelsLoaded(true);
  };

  const loadLabeledDescriptors = () => {
    return studentNames.map((student) => {
      const descriptor = new Float32Array(student.face_encoding);
      return new faceapi.LabeledFaceDescriptors(
        `${studentsSource === "all" ? student.name : student.student_name} - ${
          student.university_id
        }`,
        [descriptor]
      );
    });
  };

  const startVideo = async () => {
    try {
      // كشف نوع الجهاز
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      let constraints = {
        video: true,
        audio: false,
      };

      if (isMobile) {
        // استخدم الكاميرا الخلفية للموبايل
        constraints.video = {
          facingMode: { exact: "environment" },
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
        videoRef.current.play();
      }

      streamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("تعذر الوصول إلى الكاميرا:", error);
      alert("تعذر الوصول إلى الكاميرا. تأكد من منح الأذونات.");
    }
  };

  const exportAttendanceToExcel = () => {
    const date = new Date();
    const fileName = `attendance-${date
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-")}.xlsx`;

    const attendanceArray = Array.from(attendance).map((id, index) => {
      const student = studentNames.find((s) => s.university_id === id);
      return {
        "#": index + 1,
        Name: student?.student_name,
        ID: id,
        Time: new Date().toLocaleTimeString(),
        Date: date.toLocaleDateString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(attendanceArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    if (
      !modelsLoaded ||
      !videoRef.current ||
      !canvasRef.current ||
      studentNames.length === 0
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    let intervalId;

    const handlePlay = async () => {
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      canvas.width = displaySize.width;
      canvas.height = displaySize.height;

      const labeledDescriptors = loadLabeledDescriptors();

      if (labeledDescriptors.length === 0) {
        toast.error("لم يتم تحميل بيانات الوجوه بعد");
        return;
      }

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

      intervalId = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        context.clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach((detection) => {
          const match = faceMatcher.findBestMatch(detection.descriptor);
          const name = match.label === "unknown" ? "Unknown" : match.label;
          const box = detection.detection.box;
          const color = match.label === "unknown" ? "red" : "green";

          if (match.label !== "unknown") {
            const universityId = match.label.split(" - ")[1];
            setAttendance((prev) => new Set(prev).add(universityId));
          }

          context.strokeStyle = color;
          context.lineWidth = 2;
          context.strokeRect(box.x, box.y, box.width, box.height);
          context.fillStyle = color;
          context.font = "16px Arial";
          context.fillText(name, box.x, box.y - 5);
        });
      }, 500);
    };

    video.addEventListener("play", handlePlay);
    return () => {
      video.removeEventListener("play", handlePlay);
      clearInterval(intervalId);
    };
  }, [modelsLoaded, studentNames]);

  useEffect(() => {
    const init = async () => {
      await loadModels();
      await startVideo();
    };
    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStoreAttendance = async () => {
    await storeAttendace(
      "sv/storeAttendance",
      token,
      {
        students: Array.from(attendance),
        session_id: location.state.session_id,
      },
      navigate
    );
  };

  return (
    <div className="pt-20">
      <div className="px-6 mb-4">
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
            navigate(-1);
          }}
        >
          🔙 رجوع
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
        <div className="relative border-4 border-purple-300 rounded-lg overflow-hidden shadow-lg w-full md:w-1/2">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto rounded"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        <Card className="w-full md:w-1/2 shadow-md">
          <CardContent>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              ✅ قائمة الحضور:
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">الاسم</th>
                    <th className="px-4 py-2">الرقم الجامعي</th>
                    <th className="px-4 py-2 text-center">الحالة</th>
                    <th className="px-4 py-2 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {(studentsSource === "session"
                    ? studentNames
                    : studentNames.filter((s) =>
                        attendance.has(s.university_id)
                      )
                  ).map((detail, index) => {
                    const isPresent = attendance.has(detail.university_id);
                    return (
                      <tr
                        key={detail.university_id}
                        className={isPresent ? "bg-green-50" : "bg-red-50"}
                      >
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2 font-medium">
                          {detail.name || detail.student_name || "—"}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {detail.university_id}
                        </td>
                        <td className="px-4 py-2 text-center text-lg">
                          {isPresent ? "✅" : "❌"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {!isPresent && studentsSource === "session" && (
                            <button
                              onClick={() =>
                                setAttendance((prev) =>
                                  new Set(prev).add(detail.university_id)
                                )
                              }
                              className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              وضع حاضر
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <Button
                onClick={exportAttendanceToExcel}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                📥 تحميل Excel
              </Button>
              <Button
                onClick={handleStoreAttendance}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                📝 تخزين في النظام
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WebCam;
