import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { subjectRoutes } from '../modules/subjects/subject.routes';
import { taskRoutes } from '../modules/tasks/task.routes';
import { assignmentRoutes } from '../modules/assignments/assignment.routes';
import { examRoutes } from '../modules/exams/exam.routes';
import { attendanceRoutes } from '../modules/attendance/attendance.routes';
import { timetableRoutes } from '../modules/timetable/timetable.routes';
import { noteRoutes } from '../modules/notes/note.routes';
import { studyRoutes } from '../modules/study/study.routes';
import { quizRoutes } from '../modules/quizzes/quiz.routes';
import { notificationRoutes } from '../modules/notifications/notification.routes';
import { analyticsRoutes } from '../modules/analytics/analytics.routes';
import { parentRoutes } from '../modules/parents/parent.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { userRoutes } from '../modules/users/user.routes';
import { aiRoutes } from '../modules/ai/ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/subjects', subjectRoutes);
router.use('/tasks', taskRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/exams', examRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/notes', noteRoutes);
router.use('/study', studyRoutes);
router.use('/quizzes', quizRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/parents', parentRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

export const v1Routes = router;
