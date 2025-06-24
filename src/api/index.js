import axios from "axios";
import { toast } from "react-toastify";

export const fetchData = async (get, token) => {
  try {
    return await axios.get(`${process.env.REACT_APP_BASE_URL}/admin/${get}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "bypass-tunnel-reminder": "1",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const createuser = async (endpoint, data, token) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/admin/${endpoint}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      user: response.data.user,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      user: null,
    };
  }
};

export const fetchDataSupervsior = async (endpoint, token) => {
  try {
    return await axios.get(`${process.env.REACT_APP_BASE_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getSessionById = async (endpoint, token, body) => {
  try {
    return await axios.post(
      `${process.env.REACT_APP_BASE_URL}/${endpoint}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getStudentsById = async (endpoint, token, body) => {
  try {
    return await axios.post(
      `${process.env.REACT_APP_BASE_URL}/${endpoint}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};
export const storeAttendace = async (endpoint, token, body, navigate) => {
  return await axios
    .post(`${process.env.REACT_APP_BASE_URL}/${endpoint}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      toast.success(res?.data.message);
      navigate("/");
      console.log(res);
    })
    .catch((res) => {
      toast.error(res?.response.data.message);
      navigate("/");
      console.error(res?.response.data.message);
    });
};

export const getAllNeededForCreateSession = async (token, user) => {
  try {
    const [coursesRes, classRoomsRes, supervisorsRes] = await Promise.all([
      axios.get(`${process.env.REACT_APP_BASE_URL}/getAllCourses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${process.env.REACT_APP_BASE_URL}/getAllClassRoom`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      user?.role !== "hall_supervisor"
        ? axios.get(
            `${process.env.REACT_APP_BASE_URL}/admin/getAllSupervisor`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        : Promise.resolve({ data: { supervisor: [] } }),
    ]);

    return {
      courses: coursesRes.data.courses || [],
      classRooms: classRoomsRes.data.class_room || [],
      supervisors: supervisorsRes.data.supervisor || [],
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      courses: [],
      classRooms: [],
      supervisors: [],
    };
  }
};

export const createSession = async (token, body) => {
  try {
    return await axios.post(
      `${process.env.REACT_APP_BASE_URL}/createSession`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

export const createStudent = async (formData, token) => {
  try {
    return await axios.post(
      `${process.env.REACT_APP_BASE_URL}/admin/createStudent`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

export const getAllStudents = async (token) => {
  try {
    return await axios.post(
      `${process.env.REACT_APP_BASE_URL}/sv/getAllStudents`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};
