import axios from 'axios';

// ─── AXIOS INSTANCE ─────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
});

// ─── TOKEN HELPER ───────────────────────────────────────

function getToken() {
  if (typeof window === 'undefined') return null;

  try {
    const storage = localStorage.getItem('aprova-ai-auth');
    if (!storage) return null;

    const parsed = JSON.parse(storage);
    return parsed?.state?.token || null;
  } catch (error) {
    console.error('Erro ao ler token:', error);
    return null;
  }
}

// ─── REQUEST INTERCEPTOR ────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── RESPONSE INTERCEPTOR ───────────────────────────────

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      console.warn('🔒 Sessão expirada. Limpando auth...');

      // 🔥 CORRETO
      localStorage.removeItem('aprova-ai-auth');

      window.location.href = '/auth/login';
    }

    return Promise.reject(err);
  }
);

export default api;

// ─── APIs ───────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  me: () => api.get('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getRoutines: () => api.get('/users/routines'),
  saveRoutines: (routines: any[]) =>
    api.post('/users/routines', { routines }),
};

export const subjectApi = {
  getAll: () => api.get('/subjects'),
  create: (data: any) => api.post('/subjects', data),
  update: (id: string, data: any) =>
    api.put(`/subjects/${id}`, data),
  delete: (id: string) =>
    api.delete(`/subjects/${id}`),

  createModule: (subjectId: string, data: any) =>
    api.post(`/subjects/${subjectId}/modules`, data),

  updateModule: (id: string, data: any) =>
    api.put(`/subjects/modules/${id}`, data),

  deleteModule: (id: string) =>
    api.delete(`/subjects/modules/${id}`),

  createTopic: (moduleId: string, data: any) =>
    api.post(`/subjects/modules/${moduleId}/topics`, data),

  updateTopic: (id: string, data: any) =>
    api.put(`/subjects/topics/${id}`, data),

  deleteTopic: (id: string) =>
    api.delete(`/subjects/topics/${id}`),
};

export const planApi = {
  getAll: () => api.get('/study-plans'),
  getActive: () => api.get('/study-plans/active'),
  getToday: () => api.get('/study-plans/today'),
  create: (data: any) => api.post('/study-plans', data),
  generate: (data: any) =>
    api.post('/study-plans/generate', data),
  update: (id: string, data: any) =>
    api.put(`/study-plans/${id}`, data),
};

export const taskApi = {
  create: (data: any) => api.post('/study-tasks', data),
  update: (id: string, data: any) =>
    api.put(`/study-tasks/${id}`, data),
  complete: (id: string, data?: any) =>
    api.patch(`/study-tasks/${id}/complete`, data),
  uncomplete: (id: string) =>
    api.patch(`/study-tasks/${id}/uncomplete`),
  delete: (id: string) =>
    api.delete(`/study-tasks/${id}`),
};

export const flashcardApi = {
  getAll: (params?: any) =>
    api.get('/flashcards', { params }),
  getDue: () => api.get('/flashcards/due'),
  create: (data: any) =>
    api.post('/flashcards', data),
  review: (id: string, rating: number) =>
    api.post(`/flashcards/${id}/review`, { rating }),
  update: (id: string, data: any) =>
    api.put(`/flashcards/${id}`, data),
  delete: (id: string) =>
    api.delete(`/flashcards/${id}`),
};

export const errorNotebookApi = {
  getAll: (params?: any) =>
    api.get('/error-notebook', { params }),
  getDue: () => api.get('/error-notebook/due'),
  getPatterns: () =>
    api.get('/error-notebook/patterns'),

  create: (data: FormData) =>
    api.post('/error-notebook', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: any) =>
    api.put(`/error-notebook/${id}`, data),

  review: (id: string, result: string) =>
    api.post(`/error-notebook/${id}/review`, { result }),

  delete: (id: string) =>
    api.delete(`/error-notebook/${id}`),
};

export const questionApi = {
  getLogs: (params?: any) =>
    api.get('/questions', { params }),
  getStats: () =>
    api.get('/questions/stats'),
  create: (data: any) =>
    api.post('/questions', data),
  bulkCreate: (logs: any[]) =>
    api.post('/questions/bulk', { logs }),
};

export const goalApi = {
  getAll: (params?: any) =>
    api.get('/goals', { params }),
  create: (data: any) =>
    api.post('/goals', data),
  update: (id: string, data: any) =>
    api.put(`/goals/${id}`, data),
  delete: (id: string) =>
    api.delete(`/goals/${id}`),
};

export const noteApi = {
  getAll: (params?: any) =>
    api.get('/notes', { params }),
  create: (data: any) =>
    api.post('/notes', data),
  update: (id: string, data: any) =>
    api.put(`/notes/${id}`, data),
  delete: (id: string) =>
    api.delete(`/notes/${id}`),
};

export const mindMapApi = {
  getAll: () =>
    api.get('/mind-maps'),
  get: (id: string) =>
    api.get(`/mind-maps/${id}`),
  create: (data: any) =>
    api.post('/mind-maps', data),
  update: (id: string, data: any) =>
    api.put(`/mind-maps/${id}`, data),
  delete: (id: string) =>
    api.delete(`/mind-maps/${id}`),
};

export const pdfApi = {
  getAll: (params?: any) =>
    api.get('/pdfs', { params }),

  upload: (data: FormData) =>
    api.post('/pdfs', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getFileBlob: (id: string) =>
    api.get(`/pdfs/${id}/file`, { responseType: 'blob' }),

  updateProgress: (id: string, currentPage: number) =>
    api.patch(`/pdfs/${id}/progress`, { currentPage }),

  delete: (id: string) =>
    api.delete(`/pdfs/${id}`),
};

export const focusApi = {
  start: (data: any) =>
    api.post('/focus/start', data),
  update: (id: string, data: any) =>
    api.patch(`/focus/${id}`, data),
  getHistory: () =>
    api.get('/focus/history'),
};

export const habitApi = {
  getAll: () =>
    api.get('/habits'),
  create: (data: any) =>
    api.post('/habits', data),
  complete: (id: string) =>
    api.post(`/habits/${id}/complete`),
  delete: (id: string) =>
    api.delete(`/habits/${id}`),
};

export const analyticsApi = {
  getDashboard: () =>
    api.get('/analytics/dashboard'),
  getStudyHistory: (days?: number) =>
    api.get('/analytics/study-history', { params: { days } }),
  getSubjectPerformance: () =>
    api.get('/analytics/subject-performance'),
  getConsistency: (weeks?: number) =>
    api.get('/analytics/consistency', { params: { weeks } }),
};

export const gamificationApi = {
  getProfile: () =>
    api.get('/gamification/profile'),
};

export const notificationApi = {
  getAll: () =>
    api.get('/notifications'),
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  markAllRead: () =>
    api.patch('/notifications/read-all'),
};

export const emotionApi = {
  log: (data: any) =>
    api.post('/emotions', data),
  getHistory: () =>
    api.get('/emotions/history'),
};

export const intelligenceApi = {
  getProfile: () => api.get('/intelligence/profile'),
  analyzeProfile: () => api.post('/intelligence/profile/analyze'),
  getTodayPlan: () => api.get('/intelligence/plan/today'),
  generatePlan: () => api.post('/intelligence/plan/generate'),
  replan: (data: any) => api.post('/intelligence/plan/replan', data),
  getNextAction: () => api.get('/intelligence/next-action'),
  completeAction: (itemId: string) => api.post(`/intelligence/next-action/${itemId}/complete`),
  getInsights: () => api.get('/intelligence/insights'),
  markInsightRead: (id: string) => api.patch(`/intelligence/insights/${id}/read`),
  setMode: (mode: string) => api.post('/intelligence/mode', { mode }),
  reversePlan: () => api.post('/intelligence/reverse-plan'),
  activateBruteForce: (data: any) => api.post('/intelligence/brute-force', data),
  activateWarMode: () => api.post('/intelligence/war-mode'),
};

export const behaviorApi = {
  trackEvent: (data: any) => api.post('/behavior/event', data),
  getEvents: (days?: number) => api.get('/behavior/events', { params: { days } }),
  logEnergy: (data: any) => api.post('/behavior/energy', data),
  getEnergyPattern: () => api.get('/behavior/energy/pattern'),
  getProcrastination: () => api.get('/behavior/procrastination'),
  getMetrics: (days?: number) => api.get('/behavior/metrics', { params: { days } }),
};

export const missionApi = {
  getAll: () => api.get('/missions'),
  generate: () => api.post('/missions/generate'),
  accept: (id: string) => api.post(`/missions/${id}/accept`),
  complete: (id: string) => api.post(`/missions/${id}/complete`),
};

export const mentorApi = {
  getMyMentoring: () => api.get('/mentoring/my'),
  getMentors: () => api.get('/mentoring/mentors'),
  requestMentoring: (mentorId: string) => api.post('/mentoring/request', { mentorId }),
  getMessages: (mentoringId: string) => api.get(`/mentoring/${mentoringId}/messages`),
  sendMessage: (mentoringId: string, data: any) => api.post(`/mentoring/${mentoringId}/messages`, data),
  getSessions: (mentoringId: string) => api.get(`/mentoring/${mentoringId}/sessions`),
  scheduleSession: (mentoringId: string, data: any) => api.post(`/mentoring/${mentoringId}/sessions`, data),
  getInsights: (studentId: string) => api.get(`/mentoring/mentor/student/${studentId}/insights`),
  getMentorDashboard: () => api.get('/mentoring/mentor/dashboard'),
  registerAsMentor: (data: any) => api.post('/mentoring/mentor/register', data),
};

export const editalApi = {
  upload: (data: FormData) =>
    api.post('/edital/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStatus: (id: string) => api.get(`/edital/${id}/status`),
  confirm: (id: string, data: any) => api.post(`/edital/${id}/confirm`, data),
  getAll: () => api.get('/edital'),
};

export const flashcardExtractApi = {
  preview: (data: FormData) =>
    api.post('/flashcards/extract/preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  confirm: (data: any) => api.post('/flashcards/extract/confirm', data),
};

export const postSimuladoApi = {
  analyze: (data: any) => api.post('/post-simulado/analyze', data),
  getHistory: () => api.get('/post-simulado/history'),
};

export const dailyChallengeApi = {
  getToday: () => api.get('/daily-challenge/today'),
  answer: (id: string, data: any) => api.post(`/daily-challenge/${id}/answer`, data),
  getHistory: () => api.get('/daily-challenge/history'),
};

export const questionExtractApi = {
  preview: (data: FormData) =>
    api.post('/question-extract/preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  confirm: (data: any) => api.post('/question-extract/confirm', data),
  list: (params?: any) => api.get('/question-extract/list', { params }),
  answer: (id: string, data: any) => api.post(`/question-extract/${id}/answer`, data),
};

export const essayApi = {
  submit: (data: any) => api.post('/essays', data),
  submitWithFile: (form: FormData) =>
    api.post('/essays', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params?: any) => api.get('/essays', { params }),
  get: (id: string) => api.get(`/essays/${id}`),
  generateInvite: () => api.post('/essays/invite'),
  acceptInvite: (token: string) => api.post('/essays/accept-invite', { token }),
  getInviteInfo: (token: string) => api.get(`/essays/invite/${token}`),
  listMyTeachers: () => api.get('/essays/my-teachers'),
  getEvolution: () => api.get('/essays/evolution'),
};

export const teacherApi = {
  getDashboard: () => api.get('/teacher/dashboard'),
  listEssays: (params?: any) => api.get('/teacher/essays', { params }),
  listStudents: () => api.get('/teacher/students'),
  getStudentStats: (studentId: string) => api.get(`/teacher/students/${studentId}/stats`),
  getStudentInsights: (studentId: string) => api.get(`/teacher/students/${studentId}/insights`),
  correctEssay: (id: string, data: any) => api.post(`/teacher/essays/${id}/correct`, data),
  addComment: (essayId: string, data: any) => api.post(`/teacher/essays/${essayId}/comments`, data),
  uploadAudio: (essayId: string, form: FormData) =>
    api.post(`/teacher/essays/${essayId}/audio`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCorrectedFile: (essayId: string, form: FormData) =>
    api.post(`/teacher/essays/${essayId}/file`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  listTemplates: () => api.get('/teacher/templates'),
  createTemplate: (data: any) => api.post('/teacher/templates', data),
  useTemplate: (id: string) => api.patch(`/teacher/templates/${id}/use`),
  resolveComment: (id: string) => api.patch(`/teacher/comments/${id}/resolve`),
};

export const flashcardFolderApi = {
  getFolders: () => api.get('/flashcard-folders'),
  createFolder: (data: any) => api.post('/flashcard-folders', data),
  updateFolder: (id: string, data: any) => api.put(`/flashcard-folders/${id}`, data),
  deleteFolder: (id: string) => api.delete(`/flashcard-folders/${id}`),
  getStudyQueue: (id: string, mode: string) => api.get(`/flashcard-folders/${id}/study?mode=${mode}`),
  getStats: (id: string) => api.get(`/flashcard-folders/${id}/stats`),
  moveCard: (cardId: string, folderId: string | null) => api.patch(`/flashcard-folders/cards/${cardId}/move`, { folderId }),
};