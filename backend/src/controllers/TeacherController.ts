import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../types";
import { logger } from "../utils/logger";
import { PDFExtractor } from "../utils/pdfExtractor";
import { UTApi } from "uploadthing/server";

export class TeacherController {
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const { classId } = req.query;

      const activeClasses = await prisma.class.count({ where: { teacherId, archived: false } });
      const classes = await prisma.class.findMany({
        where: { 
          teacherId, 
          archived: false,
          ...(classId ? { id: String(classId) } : {})
        }
      });
      const classIds = classes.map(c => c.id);

      const enrollments = await prisma.classStudent.findMany({
        where: { classId: { in: classIds } },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              quizSessions: {
                where: { status: 'COMPLETED' },
                orderBy: { endedAt: 'desc' }
              }
            }
          },
          class: { select: { id: true, name: true } }
        }
      });

      const uniqueStudentIds = Array.from(new Set(enrollments.map(e => e.studentId)));
      const totalStudents = uniqueStudentIds.length;

      const useMock = process.env.USE_MOCK_DATA === 'true';

      if (useMock) {
        return res.json({
          success: true,
          data: {
            summary: {
              activeClasses: activeClasses || 3,
              totalStudents: totalStudents || 78,
              avgScore: 82,
              completedTasks: 12,
              activeRate: 94
            },
            chart: [
              { label: 'Tugas 1', value: 85 },
              { label: 'Kuis 1', value: 78 },
              { label: 'Tugas 2', value: 92 },
              { label: 'Kuis 2', value: 68 },
              { label: 'UTS', value: 88 }
            ],
            atRisk: [
              {
                id: 'mock_risk_1',
                name: 'Budi Santoso',
                kelas: 'Kelas 10-A',
                avg: '62.4%',
                color: '#EF4444',
                issue: 'Nilai kuis matematika menurun dalam 3 kuis terakhir'
              },
              {
                id: 'mock_risk_2',
                name: 'Siti Aminah',
                kelas: 'Kelas 10-B',
                avg: '64.8%',
                color: '#EF4444',
                issue: 'Keaktifan membaca materi kurang dari 20% minggu ini'
              },
              {
                id: 'mock_risk_3',
                name: 'Aditya Pratama',
                kelas: 'Kelas 10-A',
                avg: '58.0%',
                color: '#EF4444',
                issue: 'Belum mengumpulkan 2 tugas terakhir'
              }
            ]
          }
        });
      }

      // Calculate real stats from the database
      const quizSessions = await prisma.quizSession.findMany({
        where: {
          classId: { in: classIds },
          status: 'COMPLETED',
          score: { not: null }
        },
        select: { score: true }
      });
      const avgScore = quizSessions.length > 0
        ? Math.round(quizSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizSessions.length)
        : 0;

      const completedTasks = await prisma.quizSession.count({
        where: {
          classId: { in: classIds },
          status: 'COMPLETED'
        }
      });

      const activeStudentsCount = await prisma.student.count({
        where: {
          id: { in: uniqueStudentIds },
          OR: [
            { quizSessions: { some: { startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } },
            { materialViews: { some: { viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } }
          ]
        }
      });
      const activeRate = totalStudents > 0
        ? Math.round((activeStudentsCount / totalStudents) * 100)
        : 0;

      let chart: { label: string; value: number }[] = [];
      if (classId && classes.length === 1) {
        // If a specific class is selected, show its quizzes average score
        const quizzes = await prisma.quiz.findMany({
          where: { classId: String(classId) },
          select: { id: true, title: true }
        });
        chart = await Promise.all(quizzes.map(async (q) => {
          const quizSessions = await prisma.quizSession.findMany({
            where: { quizId: q.id, status: 'COMPLETED' },
            select: { score: true }
          });
          const average = quizSessions.length > 0
            ? Math.round(quizSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizSessions.length)
            : 0;
          return {
            label: q.title.length > 10 ? q.title.substring(0, 10) + '..' : q.title,
            value: average
          };
        }));
      } else {
        // Otherwise show average score for each class
        chart = await Promise.all(classes.map(async (c) => {
          const classSessions = await prisma.quizSession.findMany({
            where: { classId: c.id, status: 'COMPLETED' },
            select: { score: true }
          });
          const average = classSessions.length > 0
            ? Math.round(classSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / classSessions.length)
            : 0;
          return {
            label: c.name.length > 10 ? c.name.substring(0, 10) + '..' : c.name,
            value: average
          };
        }));
      }

      const atRisk = enrollments.map(e => {
        const student = e.student;
        const studentSessions = student.quizSessions.filter(qs => qs.classId === e.classId);
        const avg = studentSessions.length > 0
          ? Math.round(studentSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentSessions.length)
          : 0;
        
        const isLow = avg < 75 && studentSessions.length > 0;
        if (!isLow) return null;

        return {
          id: student.id,
          name: student.name,
          kelas: e.class.name,
          avg: `${avg}%`,
          color: avg < 60 ? '#EF4444' : '#F59E0B',
          issue: avg < 60 
            ? 'Nilai rata-rata kuis sangat rendah' 
            : 'Perlu bimbingan tambahan untuk meningkatkan nilai'
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      res.json({
        success: true,
        data: {
          summary: {
            activeClasses,
            totalStudents,
            avgScore,
            completedTasks,
            activeRate
          },
          chart,
          atRisk
        }
      });
    } catch (error) {
      logger.error('Error getting teacher stats', error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }

  static async getMyClasses(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: {
          _count: { select: { students: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: classes });
    } catch (error) {
      logger.error('Error fetching teacher classes', error);
      res.status(500).json({ success: false, error: "Gagal mengambil daftar kelas" });
    }
  }

  static async createClass(req: AuthRequest, res: Response) {
    try {
      const { name, level, schedule, description, token } = req.body;
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const newClass = await prisma.class.create({
        data: {
          name,
          grade: parseInt(level) || 10,
          code: token,
          description: description || "",
          teacherId
        }
      });

      res.status(201).json({ success: true, data: newClass, message: "Kelas berhasil dibuat" });
    } catch (error) {
      logger.error('Error creating class', error);
      res.status(500).json({ success: false, error: "Gagal membuat kelas" });
    }
  }

  static async toggleArchiveClass(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { archived } = req.body;
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const targetClass = await prisma.class.findFirst({
        where: { id: classId, teacherId }
      });

      if (!targetClass) {
        return res.status(404).json({ success: false, error: "Kelas tidak ditemukan" });
      }

      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: { archived: !!archived }
      });

      res.json({
        success: true,
        data: updatedClass,
        message: `Kelas berhasil ${archived ? 'diarsipkan' : 'diaktifkan kembali'}`
      });
    } catch (error) {
      logger.error('Error toggling archive class', error);
      res.status(500).json({ success: false, error: "Gagal memproses arsip kelas" });
    }
  }

  static async addMaterial(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, description, fileUrl, type, fileBase64, fileName } = req.body;
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const fs = require('fs');
      fs.appendFileSync('upload-debug.log', `[${new Date().toISOString()}] Upload attempt:\n- title: ${title}\n- fileName: ${fileName}\n- fileUrl: ${fileUrl}\n- hasBase64: ${!!fileBase64}\n- base64Length: ${fileBase64 ? fileBase64.length : 0}\n- token: ${process.env.UPLOADTHING_TOKEN ? 'Present' : 'Missing'}\n`);

      let extractedText: string | null = null;
      let uploadedUrl: string | null = fileUrl || null;

      if (fileBase64) {
        try {
          const buffer = Buffer.from(fileBase64, 'base64');
          const mimeType = type === 'PDF' ? 'application/pdf'
            : type === 'VIDEO' ? 'video/mp4'
            : 'application/octet-stream';
          const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
          const file = new File([buffer], fileName || `material.${type?.toLowerCase() || 'pdf'}`, { type: mimeType });
          const uploadRes = await utapi.uploadFiles(file);
          
          fs.appendFileSync('upload-debug.log', `Upload response: ${JSON.stringify(uploadRes)}\n`);

          if (uploadRes.data?.ufsUrl) {
            uploadedUrl = uploadRes.data.ufsUrl;
          } else if (uploadRes.data?.url) {
            uploadedUrl = uploadRes.data.url;
          }
        } catch (err: any) {
          logger.error('Upload to Uploadthing failed', err);
          fs.appendFileSync('upload-debug.log', `Upload error: ${err.message || err}\nStack: ${err.stack}\n`);
        }

        if (type === 'PDF') {
          try {
            extractedText = await PDFExtractor.extractTextFromBase64(fileBase64);
          } catch {
            extractedText = null;
          }
        }
      }

      const material = await prisma.material.create({
        data: {
          classId,
          title,
          description: description || "",
          content: description || "",
          url: uploadedUrl,
          type: type || 'PDF',
          aiGenerated: false,
          ...(extractedText ? { extractedText } : {}),
        }
      });

      // Send notifications to enrolled students
      try {
        const classData = await prisma.class.findUnique({ where: { id: classId }, select: { name: true } });
        const className = classData?.name || 'Kelas';
        const enrolled = await prisma.classStudent.findMany({
          where: { classId },
          select: { studentId: true }
        });
        if (enrolled.length > 0) {
          await prisma.studentNotification.createMany({
            data: enrolled.map(s => ({
              studentId: s.studentId,
              title: "Materi Baru",
              message: `Materi baru "${title}" telah diunggah di kelas ${className}. Yuk pelajari sekarang!`,
              type: "NEW_MATERIAL",
            }))
          });
        }
      } catch (err) {
        logger.error('Failed to create student notifications for new material', err);
      }

      res.status(201).json({ success: true, data: material });
    } catch (error) {
      logger.error('Error adding material', error);
      res.status(500).json({ success: false, error: "Gagal menambahkan materi" });
    }
  }

  static async addAssignment(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, description, deadline, points } = req.body;
      
      const assignment = await prisma.assignment.create({
        data: {
          classId,
          title,
          description,
          deadline: new Date(deadline),
          points: parseInt(points) || 100
        }
      });

      // Send notifications to enrolled students
      try {
        const classData = await prisma.class.findUnique({ where: { id: classId }, select: { name: true } });
        const className = classData?.name || 'Kelas';
        const enrolled = await prisma.classStudent.findMany({
          where: { classId },
          select: { studentId: true }
        });
        if (enrolled.length > 0) {
          const formattedDeadline = new Date(deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          await prisma.studentNotification.createMany({
            data: enrolled.map(s => ({
              studentId: s.studentId,
              title: "Tugas Baru",
              message: `Tugas baru "${title}" telah dipublikasikan di kelas ${className}. Batas waktu: ${formattedDeadline}.`,
              type: "SYSTEM",
            }))
          });
        }
      } catch (err) {
        logger.error('Failed to create student notifications for new assignment', err);
      }

      res.status(201).json({ success: true, data: assignment, message: "Tugas berhasil dipublikasikan" });
    } catch (error) {
      logger.error('Error adding assignment', error);
      res.status(500).json({ success: false, error: "Gagal mempublikasikan tugas" });
    }
  }

  static async getClassMaterials(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const materials = await prisma.material.findMany({ where: { classId } });
      res.json({ success: true, data: materials });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil materi" });
    }
  }

  static async getClassStudents(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const classStudents = await prisma.classStudent.findMany({
        where: { classId },
        include: { student: { select: { id: true, name: true, email: true } } }
      });
      res.json({ success: true, data: classStudents.map(cs => cs.student) });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil daftar siswa" });
    }
  }

  static async getClassAssignments(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const assignments = await prisma.assignment.findMany({ where: { classId } });
      res.json({ success: true, data: assignments });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil tugas" });
    }
  }

  static async getClassQuizzes(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const quizzes = await prisma.quiz.findMany({
        where: { classId },
        include: {
          questions: true,
          _count: { select: { questions: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: quizzes });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil kuis" });
    }
  }

  static async addQuiz(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, duration, questions, shuffle, showResult, autoGrade } = req.body;

      const quiz = await prisma.quiz.create({
        data: {
          classId,
          title,
          timeLimit: parseInt(duration) || 15,
          questionsCount: questions.length,
          shuffle: shuffle !== undefined ? shuffle : true,
          showResult: showResult !== undefined ? showResult : true,
          autoGrade: autoGrade !== undefined ? autoGrade : true,
          questions: {
            create: questions.map((q: any) => ({
              text: q.text,
              type: "MULTIPLE_CHOICE",
              options: JSON.stringify(q.options),
              correctAnswer: q.options[q.correctAnswer],
              explanation: "AI Generated"
            }))
          }
        }
      });

      // Send notifications to enrolled students
      try {
        const classData = await prisma.class.findUnique({ where: { id: classId }, select: { name: true } });
        const className = classData?.name || 'Kelas';
        const enrolled = await prisma.classStudent.findMany({
          where: { classId },
          select: { studentId: true }
        });
        if (enrolled.length > 0) {
          await prisma.studentNotification.createMany({
            data: enrolled.map(s => ({
              studentId: s.studentId,
              title: "Kuis Baru",
              message: `Kuis baru "${title}" kini tersedia di kelas ${className}. Durasi: ${duration || 15} menit.`,
              type: "SYSTEM",
            }))
          });
        }
      } catch (err) {
        logger.error('Failed to create student notifications for new quiz', err);
      }

      res.status(201).json({ success: true, data: quiz, message: "Kuis berhasil dibuat" });
    } catch (error) {
      logger.error('Error adding quiz', error);
      res.status(500).json({ success: false, error: "Gagal membuat kuis" });
    }
  }

  static async getAllStudents(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: { 
          students: { 
            include: { 
              student: { 
                select: { 
                  id: true, 
                  name: true, 
                  email: true,
                  quizSessions: {
                    where: { status: 'COMPLETED' },
                    select: { score: true, classId: true }
                  }
                } 
              } 
            } 
          } 
        }
      });

      const classIds = classes.map(c => c.id);
      const allStudentsMap = new Map();

      classes.forEach(c => {
        c.students.forEach(cs => {
          const sessions = cs.student.quizSessions.filter((qs: any) => qs.score !== null && classIds.includes(qs.classId));
          const avg = sessions.length > 0
            ? Math.round(sessions.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / sessions.length)
            : 0;

          allStudentsMap.set(cs.student.id, {
            id: cs.student.id,
            name: cs.student.name,
            email: cs.student.email,
            kelas: c.name,
            avg: `${avg}%`,
            status: avg < 75 && sessions.length > 0 ? 'At Risk' : 'Active'
          });
        });
      });

      res.json({ success: true, data: Array.from(allStudentsMap.values()) });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil daftar semua siswa" });
    }
  }

  static async getStudentPerformance(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;
      const { studentId } = req.params;
      const { kelas } = req.query;

      console.log(`\n--- [getStudentPerformance] ---`);
      console.log(`Teacher ID: ${teacherId}`);
      console.log(`Student ID: ${studentId}`);
      console.log(`Class filter: ${kelas}`);

      if (!teacherId) {
        console.log(`Unauthorized request: teacherId is missing`);
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const studentClasses = await prisma.class.findMany({
        where: {
          teacherId,
          students: { some: { studentId } }
        }
      });

      console.log(`Found classes for teacher + student: ${studentClasses.length}`);

      if (studentClasses.length === 0) {
        console.log(`Access Denied: Student ${studentId} is not enrolled in any class taught by teacher ${teacherId}`);
        return res.status(403).json({ success: false, error: "Access Denied" });
      }

      const classIds = studentClasses.map(c => c.id);

      const completedSessions = await prisma.quizSession.findMany({
        where: {
          studentId,
          classId: { in: classIds },
          status: 'COMPLETED',
          score: { not: null }
        },
        include: {
          quiz: {
            select: { title: true }
          }
        },
        orderBy: { endedAt: 'desc' }
      });

      console.log(`Found completed sessions: ${completedSessions.length}`);

      const completedMaterialViews = await prisma.materialView.findMany({
        where: {
          studentId,
          material: {
            classId: { in: classIds }
          }
        },
        include: {
          material: {
            select: { title: true }
          }
        },
        orderBy: { viewedAt: 'desc' }
      });

      console.log(`Found completed material views: ${completedMaterialViews.length}`);

      const avgScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedSessions.length)
        : 0;

      let rankText = "N/A";
      const targetClass = studentClasses.find(c => c.name === kelas) || studentClasses[0];
      if (targetClass) {
        const classEnrollments = await prisma.classStudent.findMany({
          where: { classId: targetClass.id },
          select: { studentId: true }
        });
        const totalClassStudents = classEnrollments.length;

        const studentAverages = await Promise.all(classEnrollments.map(async (enrollment) => {
          const sessions = await prisma.quizSession.findMany({
            where: {
              studentId: enrollment.studentId,
              classId: targetClass.id,
              status: 'COMPLETED',
              score: { not: null }
            },
            select: { score: true }
          });
          const avg = sessions.length > 0
            ? sessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / sessions.length
            : 0;
          return { studentId: enrollment.studentId, avg };
        }));

        studentAverages.sort((a, b) => b.avg - a.avg);

        const studentIndex = studentAverages.findIndex(sa => sa.studentId === studentId);
        const rank = studentIndex !== -1 ? studentIndex + 1 : totalClassStudents;
        rankText = `${rank} / ${totalClassStudents}`;
      }

      const topicAnalysis = completedSessions.map((qs: any, index) => {
        const score = qs.score || 0;
        let color = '#EF4444';
        if (score >= 75) color = '#16A34A';
        else if (score >= 60) color = '#F59E0B';

        const label = qs.quiz?.title || `Kuis Pengerjaan ${completedSessions.length - index}`;

        return {
          label,
          val: score,
          col: color
        };
      });

      if (topicAnalysis.length === 0) {
        topicAnalysis.push(
          { label: 'Belum Ada Kuis', val: 0, col: '#EF4444' }
        );
      }

      let aiRecommendation = "Siswa ini belum mengerjakan kuis apa pun. Harap berikan kuis awal untuk memetakan kemampuan.";
      if (completedSessions.length > 0) {
        if (avgScore >= 85) {
          aiRecommendation = `Siswa menunjukkan pemahaman yang **sangat kuat** dengan rata-rata nilai ${avgScore}%. Pertahankan kinerjanya dan berikan materi pengayaan.`;
        } else if (avgScore >= 75) {
          aiRecommendation = `Siswa memiliki pemahaman yang **cukup baik** (${avgScore}%). Fokuskan pada konsistensi latihan soal untuk memantapkan konsep.`;
        } else {
          aiRecommendation = `Siswa memerlukan perhatian khusus karena rata-rata nilai (${avgScore}%) berada di bawah standar minimum kelas. Disarankan untuk memberikan remedial dan bimbingan adaptif.`;
        }
      }

      const quizActivities = completedSessions.map((qs: any, index) => {
        const date = qs.endedAt ? new Date(qs.endedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
        const timestamp = qs.endedAt ? new Date(qs.endedAt).getTime() : 0;
        const label = qs.quiz?.title || `Kuis Pengerjaan ${completedSessions.length - index}`;
        return {
          type: 'QUIZ',
          t: label,
          d: date,
          s: `${qs.score || 0}%`,
          timestamp
        };
      });

      const materialActivities = completedMaterialViews.map((mv: any) => {
        const date = mv.viewedAt ? new Date(mv.viewedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
        const timestamp = mv.viewedAt ? new Date(mv.viewedAt).getTime() : 0;
        const label = mv.material?.title || 'Materi Pembelajaran';
        return {
          type: 'MATERIAL',
          t: label,
          d: date,
          s: 'Selesai Dibaca',
          timestamp
        };
      });

      const activityHistory = [...quizActivities, ...materialActivities].sort((a, b) => b.timestamp - a.timestamp);

      console.log(`Responding with calculated stats. Average Score: ${avgScore}, Rank: ${rankText}, Activities: ${activityHistory.length}`);

      res.json({
        success: true,
        data: {
          avg: avgScore,
          rank: rankText,
          topicAnalysis,
          aiRecommendation,
          activityHistory
        }
      });
    } catch (error) {
      console.error('[getStudentPerformance] Error:', error);
      res.status(500).json({ success: false, error: "Gagal mengambil performa siswa" });
    }
  }

  static async updateMaterial(req: AuthRequest, res: Response) {
    try {
      const { materialId } = req.params;
      const { title, description } = req.body;
      const material = await prisma.material.update({
        where: { id: materialId },
        data: { title, description, content: description }
      });
      res.json({ success: true, data: material });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal memperbarui materi" });
    }
  }

  static async deleteMaterial(req: AuthRequest, res: Response) {
    try {
      const { materialId } = req.params;
      await prisma.material.delete({ where: { id: materialId } });
      res.json({ success: true, message: "Materi berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal menghapus materi" });
    }
  }

  static async deleteAssignment(req: AuthRequest, res: Response) {
    try {
      const { assignmentId } = req.params;
      await prisma.assignment.delete({ where: { id: assignmentId } });
      res.json({ success: true, message: "Tugas berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal menghapus tugas" });
    }
  }

  static async deleteQuiz(req: AuthRequest, res: Response) {
    try {
      const { quizId } = req.params;
      // Delete questions first if needed (Prisma might handle it if cascade is set, but let's be safe)
      await prisma.quizQuestion.deleteMany({ where: { quizId } });
      await prisma.quiz.delete({ where: { id: quizId } });
      res.json({ success: true, message: "Kuis berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal menghapus kuis" });
    }
  }
}
