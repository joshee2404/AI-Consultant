import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const api = axios.create({ baseURL: API_BASE });

export async function submitAssessment(formData) {
  const res = await api.post("/assess", formData);
  return res.data;
}

export async function getResult(assessmentId) {
  const res = await api.get(`/result/${assessmentId}`);
  return res.data;
}

export async function pollResult(assessmentId, onStatus) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const data = await getResult(assessmentId);
        if (onStatus) onStatus(data.status);
        if (data.status === "complete" || (!data.status)) {
          clearInterval(interval);
          resolve(data);
        } else if (data.status === "error") {
          clearInterval(interval);
          reject(new Error(data.detail || "Pipeline failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 3000);
  });
}

export async function listAssessments() {
  const res = await api.get("/assessments");
  return res.data;
}
