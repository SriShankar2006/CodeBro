// src/services/judge0.js
import axios from "axios";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const HEADERS = {
  "X-RapidAPI-Key":  process.env.REACT_APP_JUDGE0_KEY || "DEMO",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "Content-Type":    "application/json",
};

export const LANGUAGE_IDS = {
  "Python 3":   71,
  "C++":        54,
  "C":          50,
  "Java":       62,
  "JavaScript": 63,
  "Go":         60,
  "Rust":       73,
};

export const VERDICT_MAP = {
  1: "In Queue", 2: "Processing", 3: "Accepted",
  4: "Wrong Answer", 5: "Time Limit Exceeded",
  6: "Compilation Error", 7: "Runtime Error",
};

export async function runCode({ sourceCode, language, stdin = "" }) {
  // Demo mode when no key
  if (!process.env.REACT_APP_JUDGE0_KEY || process.env.REACT_APP_JUDGE0_KEY === "DEMO") {
    await new Promise(r => setTimeout(r, 1200));
    return { verdict: "Accepted", verdictId: 3, stdout: "[Demo] Output: Accepted", time: "0.05", memory: 16000 };
  }

  const res = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
    { source_code: sourceCode, language_id: LANGUAGE_IDS[language] || 71, stdin, cpu_time_limit: 5 },
    { headers: HEADERS }
  );
  const { token } = res.data;

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 600));
    const poll = await axios.get(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`, { headers: HEADERS });
    const d = poll.data;
    if (d.status?.id > 2) {
      return {
        verdict: d.status.description,
        verdictId: d.status.id,
        stdout: d.stdout || "",
        stderr: d.stderr || d.compile_output || "",
        time: d.time,
        memory: d.memory,
      };
    }
  }
  return { verdict: "Time Limit Exceeded", verdictId: 5 };
}
