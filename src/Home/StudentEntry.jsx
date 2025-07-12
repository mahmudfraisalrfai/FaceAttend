import { useEffect, useRef, useState } from "react";
import { Card, CardContent, Button } from "../ui/desgin";
import { toast } from "react-toastify";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useAuth } from "../components/context/AuthContext";
import { createStudent } from "../api/index";
import { useNavigate } from "react-router-dom";

const StudentEntry = () => {
  const navigate = useNavigate();

  const { token } = useAuth();

  const [form, setForm] = useState({
    university_id: "",
    name: "",
    department_id: "",
    year_id: "",
    face_encoding: null,
  });

  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const imgRef = useRef(null);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  };

  const fetchInitialData = async () => {
    try {
      const [departmentsRes, yearsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/admin/getAllDepartments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "bypass-tunnel-reminder": "1",
          },
        }),
        axios.get(`${process.env.REACT_APP_BASE_URL}/admin/getAllYears`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "bypass-tunnel-reminder": "1",
          },
        }),
      ]);
      setDepartments(departmentsRes.data.departments || []);
      setYears(yearsRes.data.years || []);
    } catch (error) {
      toast.error("فشل تحميل البيانات");
      console.error(error);
    }
  };

  useEffect(() => {
    loadModels();
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setImagePreview(reader.result);
      setIsProcessing(true);
      setProcessingMessage("⏳ جاري معالجة صورة الوجه...");

      const img = new Image();
      img.src = reader.result;
      img.onload = async () => {
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setProcessingMessage("❌ لم يتم التعرف على وجه في الصورة.");
          setForm((prev) => ({ ...prev, face_encoding: null }));
          setIsProcessing(false);
          return;
        }

        const descriptorArray = Array.from(detection.descriptor);
        setForm((prev) => ({ ...prev, face_encoding: descriptorArray }));
        setProcessingMessage("✅ تم استخراج ملامح الوجه بنجاح.");
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.university_id)
      newErrors.university_id = "الرجاء إدخال الرقم الجامعي.";
    if (!form.name) newErrors.name = "الرجاء إدخال الاسم الكامل.";
    if (!form.department_id) newErrors.department_id = "الرجاء اختيار القسم.";
    if (!form.year_id) newErrors.year_id = "الرجاء اختيار السنة الدراسية.";
    if (!form.face_encoding)
      newErrors.face_encoding = "الرجاء رفع صورة واضحة للطالب.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const formattedForm = {
        ...form,
        department_id: parseInt(form.department_id),
        year_id: parseInt(form.year_id),
      };

      const res = await createStudent(formattedForm, token);
      toast.success("✅ تم إضافة الطالب بنجاح!");
      console.log("✅ Success:", res);

      setForm({
        university_id: "",
        name: "",
        department_id: "",
        year_id: "",
        face_encoding: null,
      });
      setImagePreview(null);
      setProcessingMessage("");
    } catch (error) {
      toast.error(error?.response?.data.errors.university_id);
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 pt-24 flex justify-center items-center">
      <Card className="w-full max-w-xl shadow-xl border border-purple-300 rounded-2xl">
        <CardContent>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-purple-600 hover:text-purple-800 transition text-sm"
            >
              ← الرجوع
            </button>
          </div>
          <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">
            🧑‍🎓 إضافة طالب جديد
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {/* الرقم الجامعي */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                الرقم الجامعي
              </label>
              <input
                type="text"
                name="university_id"
                value={form.university_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {errors.university_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.university_id}
                </p>
              )}
            </div>

            {/* الاسم الكامل */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* القسم */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                القسم
              </label>
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="">-- اختر القسم --</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.department_id}
                </p>
              )}
            </div>

            {/* السنة الدراسية */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                السنة الدراسية
              </label>
              <select
                name="year_id"
                value={form.year_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="">-- اختر السنة الدراسية --</option>
                {years.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
              {errors.year_id && (
                <p className="text-red-500 text-sm mt-1">{errors.year_id}</p>
              )}
            </div>

            {/* صورة الوجه */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                صورة الوجه
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md bg-white"
              />
              {imagePreview && (
                <div className="mt-2 text-center">
                  <img
                    ref={imgRef}
                    src={imagePreview}
                    alt="preview"
                    className="max-h-40 mx-auto rounded"
                  />
                  {isProcessing ? (
                    <div className="mt-2 flex justify-center">
                      <div className="h-4 w-48 bg-purple-300 rounded animate-pulse" />
                    </div>
                  ) : (
                    processingMessage && (
                      <p className="mt-2 text-sm font-medium text-purple-700">
                        {processingMessage}
                      </p>
                    )
                  )}
                </div>
              )}
              {errors.face_encoding && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.face_encoding}
                </p>
              )}
            </div>
          </div>

          {/* زر الإرسال */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-md ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing ? "⏳ جاري المعالجة..." : "➕ إضافة الطالب"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEntry;
