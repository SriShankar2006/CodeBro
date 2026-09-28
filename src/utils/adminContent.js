import { PROBLEMS, ALL_TOPICS } from "../data/problems";
import { COURSES, QUIZ_QUESTIONS } from "../data/courses";
import { getAdminContent, supabase } from "../services/supabase";

const PROBLEM_KEY = "cb_admin_problems";
const COURSE_KEY = "cb_admin_courses";
const HIDDEN_PROBLEM_KEY = "cb_admin_hidden_problems";
const HIDDEN_COURSE_KEY = "cb_admin_hidden_courses";
const QUIZ_KEY = "cb_admin_quizzes";

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const idKey = id => String(id);

const mergeById = (baseItems, overrides, hiddenIds) => {
  const hidden = new Set((hiddenIds || []).map(idKey));
  const overrideMap = new Map((overrides || []).map(item => [idKey(item.id), item]));
  const merged = baseItems
    .filter(item => !hidden.has(idKey(item.id)))
    .map(item => overrideMap.get(idKey(item.id)) || item);

  const baseIds = new Set(baseItems.map(item => idKey(item.id)));
  const customItems = (overrides || []).filter(item => !baseIds.has(idKey(item.id)) && !hidden.has(idKey(item.id)));
  return [...merged, ...customItems];
};

export const getAdminProblemOverrides = () => readJson(PROBLEM_KEY, []);
export const getAdminCourseOverrides = () => readJson(COURSE_KEY, []);
export const getHiddenProblemIds = () => readJson(HIDDEN_PROBLEM_KEY, []);
export const getHiddenCourseIds = () => readJson(HIDDEN_COURSE_KEY, []);
export const getAdminQuizOverrides = () => readJson(QUIZ_KEY, {});

export const saveAdminProblemOverrides = problems => writeJson(PROBLEM_KEY, problems);
export const saveAdminCourseOverrides = courses => writeJson(COURSE_KEY, courses);
export const saveHiddenProblemIds = ids => writeJson(HIDDEN_PROBLEM_KEY, ids);
export const saveHiddenCourseIds = ids => writeJson(HIDDEN_COURSE_KEY, ids);
export const saveAdminQuizOverrides = quizzes => writeJson(QUIZ_KEY, quizzes);

export const hydrateAdminContent = async () => {
  try {
    const rows = await getAdminContent();
    const keys = { problems: PROBLEM_KEY, courses: COURSE_KEY, hiddenProblems: HIDDEN_PROBLEM_KEY, hiddenCourses: HIDDEN_COURSE_KEY, quizzes: QUIZ_KEY };
    rows.forEach(row => {
      const key = keys[row.content_key];
      if (key && row.content !== undefined) writeJson(key, row.content);
    });
    return true;
  } catch (error) {
    console.warn("Shared admin content unavailable; using local content:", error.message || error);
    return false;
  }
};

export const subscribeAdminContent = onChange => {
  const channel = supabase
    .channel("admin-content-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "admin_content" }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
};

export const getAllProblems = () => mergeById(PROBLEMS, getAdminProblemOverrides(), getHiddenProblemIds());
export const getAllCourses = () => mergeById(COURSES, getAdminCourseOverrides(), getHiddenCourseIds()).map(course => ({
  ...course,
  totalLessons: (course.chapters || []).reduce((total, chapter) => total + (chapter.lessons || []).length, 0),
}));
export const getAllQuizQuestions = () => {
  const overrides = getAdminQuizOverrides();
  const result = Object.fromEntries(Object.entries(QUIZ_QUESTIONS).map(([topic, questions]) => [topic, [...questions]]));
  Object.entries(overrides).forEach(([topic, questions]) => { result[topic] = questions; });
  return result;
};

export const getAllProblemTopics = () => {
  const topics = new Set(ALL_TOPICS);
  getAllProblems().forEach(problem => (problem.topics || []).forEach(topic => topics.add(topic)));
  return [...topics];
};

