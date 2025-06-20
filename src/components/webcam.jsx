// import { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import * as XLSX from "xlsx";
// import { Card, CardContent, Button } from "../ui/desgin";
// import { useLocation, useNavigate } from "react-router-dom";
// import { storeAttendace } from "../api";
// import { useAuth } from "./context/AuthContext";
// import { studentsData } from "../data";

// function WebCam() {
//   const location = useLocation();
//   const studentNames =
//     location.state?.studentDetail.length > 0
//       ? location.state?.studentDetail
//       : studentsData;
//   console.log(studentNames);
//   const navigate = useNavigate();

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [attendance, setAttendance] = useState(new Set());

//   const loadModels = async () => {
//     const MODEL_URL = "/models";
//     await Promise.all([
//       faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
//       faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//       faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//     ]);
//     setModelsLoaded(true);
//   };

//   const loadLabeledImages = async () => {
//     return Promise.all(
//       studentNames.map(async (label) => {
//         try {
//           const img = await faceapi.fetchImage(
//             `/known_faces/${label.university_id}.jpg`
//           );
//           const detection = await faceapi
//             .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
//             .withFaceLandmarks()
//             .withFaceDescriptor();
//           if (!detection) return null;
//           return new faceapi.LabeledFaceDescriptors(label.student_name, [
//             detection.descriptor,
//           ]);
//         } catch {
//           console.warn(
//             `❌ صورة غير موجودة أو غير صالحة للطالب: ${label.student_name}`
//           );
//           return null;
//         }
//       })
//     ).then((data) => data.filter(Boolean));
//   };

//   const startVideo = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     if (videoRef.current) {
//       videoRef.current.srcObject = stream;
//       await new Promise((resolve) => {
//         videoRef.current.onloadedmetadata = resolve;
//       });
//       videoRef.current.play();
//     }
//     return stream;
//   };

//   const exportAttendanceToExcel = () => {
//     const date = new Date();
//     const fileName = `attendance-${date
//       .toLocaleDateString("en-GB")
//       .replace(/\//g, "-")}.xlsx`;

//     const attendanceArray = Array.from(attendance).map((id, index) => {
//       const student = studentNames.find((s) => s.university_id === id);
//       return {
//         "#": index + 1,
//         Name: student?.student_name,
//         ID: id,
//         Time: new Date().toLocaleTimeString(),
//         Date: date.toLocaleDateString(),
//       };
//     });

//     const worksheet = XLSX.utils.json_to_sheet(attendanceArray);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
//     XLSX.writeFile(workbook, fileName);
//   };

//   useEffect(() => {
//     if (!modelsLoaded || !videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");

//     let intervalId;

//     const handlePlay = async () => {
//       const displaySize = {
//         width: video.videoWidth,
//         height: video.videoHeight,
//       };

//       canvas.width = displaySize.width;
//       canvas.height = displaySize.height;

//       const labeledDescriptors = await loadLabeledImages();
//       const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

//       intervalId = setInterval(async () => {
//         const detections = await faceapi
//           .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
//           .withFaceLandmarks()
//           .withFaceDescriptors();

//         const resizedDetections = faceapi.resizeResults(
//           detections,
//           displaySize
//         );
//         context.clearRect(0, 0, canvas.width, canvas.height);

//         resizedDetections.forEach((detection) => {
//           const match = faceMatcher.findBestMatch(detection.descriptor);
//           const name = match.label === "unknown" ? "Unknown" : match.label;
//           const box = detection.detection.box;
//           const color = match.label === "unknown" ? "red" : "green";

//           if (match.label !== "unknown") {
//             const student = studentNames.find(
//               (s) => s.student_name === match.label
//             );
//             if (student) {
//               setAttendance((prev) => new Set(prev).add(student.university_id));
//             }
//           }

//           context.strokeStyle = color;
//           context.lineWidth = 2;
//           context.strokeRect(box.x, box.y, box.width, box.height);
//           context.fillStyle = color;
//           context.font = "16px Arial";
//           context.fillText(name, box.x, box.y - 5);
//         });
//       }, 500);
//     };

//     video.addEventListener("play", handlePlay);
//     return () => {
//       video.removeEventListener("play", handlePlay);
//       clearInterval(intervalId);
//     };
//   }, [modelsLoaded]);

//   useEffect(() => {
//     let stream;
//     const init = async () => {
//       await loadModels();
//       stream = await startVideo();
//     };
//     init();
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const { token } = useAuth();
//   const handelStoreAttendace = async () => {
//     (async () => {
//       await storeAttendace(
//         "sv/storeAttendance",
//         token,
//         {
//           students: Array.from(attendance),
//           session_id: location.state.session_id,
//         },
//         navigate
//       );
//     })();
//   };
//   return (
//     <div className="pt-20">
//       <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
//         <div className="relative border-4 border-purple-300 rounded-lg overflow-hidden shadow-lg w-full md:w-1/2">
//           <video
//             ref={videoRef}
//             autoPlay
//             muted
//             playsInline
//             className="w-full h-auto rounded"
//           />
//           <canvas
//             ref={canvasRef}
//             className="absolute top-0 left-0 w-full h-full"
//           />
//         </div>

//         <Card className="w-full md:w-1/2 shadow-md">
//           <CardContent>
//             <h3 className="text-xl font-semibold mb-4 text-gray-700">
//               ✅ Attendance List:
//             </h3>
//             <div className="overflow-x-auto">
//               {location.state?.studentDetail.length > 0 ? (
//                 <table className="w-full text-sm text-left text-gray-700">
//                   <thead className="text-xs uppercase bg-gray-100">
//                     <tr>
//                       <th className="px-4 py-2">#</th>
//                       <th className="px-4 py-2">Student Name</th>
//                       <th className="px-4 py-2">Student Id</th>
//                       <th className="px-4 py-2 text-center">Status</th>
//                       <th className="px-4 py-2 text-center">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {studentNames.map((detail, index) => {
//                       const isPresent = attendance.has(detail.university_id);
//                       return (
//                         <tr
//                           key={detail.university_id}
//                           className={isPresent ? "bg-green-50" : "bg-red-50"}
//                         >
//                           <td className="px-4 py-2">{index + 1}</td>
//                           <td className="px-4 py-2 font-medium">
//                             {detail.student_name}
//                           </td>
//                           <td className="px-4 py-2 font-medium">
//                             {detail.university_id}
//                           </td>
//                           <td className="px-4 py-2 text-center text-lg">
//                             {isPresent ? "✅" : "❌"}
//                           </td>
//                           <td className="px-4 py-2 text-center">
//                             {!isPresent && (
//                               <button
//                                 onClick={() =>
//                                   setAttendance((prev) =>
//                                     new Set(prev).add(detail.university_id)
//                                   )
//                                 }
//                                 className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//                               >
//                                 Mark Present
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               ) : (
//                 <>
//                   <table className="w-full text-sm text-left text-gray-700">
//                     <thead className="text-xs uppercase bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-2">#</th>
//                         <th className="px-4 py-2">Student Name</th>
//                         <th className="px-4 py-2">Student Id</th>
//                         <th className="px-4 py-2 text-center">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {studentNames
//                         .filter((detail) =>
//                           attendance.has(detail.university_id)
//                         )
//                         .map((detail, index) => (
//                           <tr
//                             key={detail.university_id}
//                             className="bg-green-50"
//                           >
//                             <td className="px-4 py-2">{index + 1}</td>
//                             <td className="px-4 py-2 font-medium">
//                               {detail.student_name}
//                             </td>
//                             <td className="px-4 py-2 font-medium">
//                               {detail.university_id}
//                             </td>
//                             <td className="px-4 py-2 text-center text-lg">
//                               ✅
//                             </td>
//                           </tr>
//                         ))}
//                     </tbody>
//                   </table>
//                 </>
//               )}
//             </div>

//             <Button
//               onClick={exportAttendanceToExcel}
//               className="mt-6 bg-purple-600 text-white hover:bg-purple-700"
//             >
//               📥 تحميل الملف بشكل (Excel)
//             </Button>
//             <Button
//               onClick={handelStoreAttendace}
//               className="mt-6 bg-purple-600 text-white hover:bg-purple-700"
//             >
//               تخزين
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// export default WebCam;
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import * as XLSX from "xlsx";
import { Card, CardContent, Button } from "../ui/desgin";
import { useLocation, useNavigate } from "react-router-dom";
import { storeAttendace } from "../api";
import { useAuth } from "./context/AuthContext";
import { studentsData } from "../data";

function WebCam() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [attendance, setAttendance] = useState(new Set());

  const studentDetail = location.state?.studentDetail;
  const useFromState = Array.isArray(studentDetail) && studentDetail.length > 0;
  const studentNames = useFromState ? studentDetail : studentsData;

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
    return studentNames.map(
      (student) =>
        new faceapi.LabeledFaceDescriptors(student.student_name, [
          new Float32Array(student.descriptor),
        ])
    );
  };

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = resolve;
      });
      videoRef.current.play();
    }
    return stream;
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
    if (!modelsLoaded || !videoRef.current || !canvasRef.current) return;

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
            const student = studentNames.find(
              (s) => s.student_name === match.label
            );
            if (student) {
              setAttendance((prev) => new Set(prev).add(student.university_id));
            }
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
  }, [modelsLoaded]);

  useEffect(() => {
    let stream;
    const init = async () => {
      await loadModels();
      stream = await startVideo();
    };
    init();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const { token } = useAuth();
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
                  {studentNames.map((detail, index) => {
                    const isPresent = attendance.has(detail.university_id);
                    return (
                      <tr
                        key={detail.university_id}
                        className={isPresent ? "bg-green-50" : "bg-red-50"}
                      >
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2 font-medium">
                          {detail.student_name}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {detail.university_id}
                        </td>
                        <td className="px-4 py-2 text-center text-lg">
                          {isPresent ? "✅" : "❌"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {!isPresent && (
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

            <Button
              onClick={exportAttendanceToExcel}
              className="mt-6 bg-purple-600 text-white hover:bg-purple-700"
            >
              📥 تحميل Excel
            </Button>
            <Button
              onClick={handleStoreAttendance}
              className="mt-6 ml-4 bg-green-600 text-white hover:bg-green-700"
            >
              📝 تخزين في النظام
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WebCam;
