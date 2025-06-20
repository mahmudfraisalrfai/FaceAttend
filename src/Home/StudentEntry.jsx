import { useEffect, useRef, useState } from "react";
import { Card, CardContent, Button } from "../ui/desgin";
import { toast } from "react-toastify";
import * as faceapi from "face-api.js";

const StudentEntry = () => {
  const [form, setForm] = useState({
    studentId: "",
    fullName: "",
    faceDescriptor: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState(""); // رسالة المعالجة
  const imgRef = useRef(null);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  };

  useEffect(() => {
    loadModels();
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
          setForm((prev) => ({ ...prev, faceDescriptor: null }));
          setIsProcessing(false);
          return;
        }

        const descriptorArray = Array.from(detection.descriptor);
        setForm((prev) => ({ ...prev, faceDescriptor: descriptorArray }));
        setProcessingMessage("✅ تم استخراج ملامح الوجه بنجاح.");
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.studentId) newErrors.studentId = "الرجاء إدخال الرقم الجامعي.";
    if (!form.fullName) newErrors.fullName = "الرجاء إدخال الاسم الكامل.";
    if (!form.faceDescriptor)
      newErrors.faceDescriptor = "الرجاء رفع صورة واضحة للطالب.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      console.log(form);
      toast.success("✅ تم إضافة الطالب بنجاح!");
      setForm({ studentId: "", fullName: "", faceDescriptor: null });
      setImagePreview(null);
      setProcessingMessage(""); // حذف الرسالة بعد الإضافة
    } catch (error) {
      toast.error("❌ فشل في إضافة الطالب.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 pt-24 flex justify-center items-center">
      <Card className="w-full max-w-xl shadow-xl border border-purple-300 rounded-2xl">
        <CardContent>
          <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">
            🧑‍🎓 إضافة طالب جديد
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                الرقم الجامعي
              </label>
              <input
                type="text"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {errors.studentId && (
                <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

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
                  {processingMessage && (
                    <p className="mt-2 text-sm font-medium text-purple-700">
                      {processingMessage}
                    </p>
                  )}
                </div>
              )}
              {errors.faceDescriptor && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.faceDescriptor}
                </p>
              )}
            </div>
          </div>

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
