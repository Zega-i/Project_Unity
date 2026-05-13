const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     🗑️  EduBridge Database Reset Tool      ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('⚠️  Menghapus semua data...\n');

  try {
    // Delete in order to respect foreign key constraints
    const steps = [
      { name: 'QuizErrorAnalysis',    fn: () => prisma.quizErrorAnalysis.deleteMany() },
      { name: 'QuizAnswer',           fn: () => prisma.quizAnswer.deleteMany() },
      { name: 'QuizSession',          fn: () => prisma.quizSession.deleteMany() },
      { name: 'LearningPathItem',     fn: () => prisma.learningPathItem.deleteMany() },
      { name: 'LearningPath',         fn: () => prisma.learningPath.deleteMany() },
      { name: 'StudentRiskScore',     fn: () => prisma.studentRiskScore.deleteMany() },
      { name: 'MaterialView',         fn: () => prisma.materialView.deleteMany() },
      { name: 'AiGeneratedMaterial',  fn: () => prisma.aiGeneratedMaterial.deleteMany() },
      { name: 'Material',             fn: () => prisma.material.deleteMany() },
      { name: 'Question',             fn: () => prisma.question.deleteMany() },
      { name: 'ClassStudent',         fn: () => prisma.classStudent.deleteMany() },
      { name: 'Class',                fn: () => prisma.class.deleteMany() },
      { name: 'LoginHistory',         fn: () => prisma.loginHistory.deleteMany() },
      { name: 'StudentNotification',  fn: () => prisma.studentNotification.deleteMany() },
      { name: 'TeacherNotification',  fn: () => prisma.teacherNotification.deleteMany() },
      { name: 'AdminNotification',    fn: () => prisma.adminNotification.deleteMany() },
      { name: 'Student',              fn: () => prisma.student.deleteMany() },
      { name: 'Teacher',              fn: () => prisma.teacher.deleteMany() },
      { name: 'Admin',                fn: () => prisma.admin.deleteMany() },
    ];

    for (const step of steps) {
      const result = await step.fn();
      console.log(`  ✅ ${step.name.padEnd(22)} → ${result.count} data dihapus`);
    }

    console.log('\n════════════════════════════════════════════');
    console.log('✅ Database berhasil dikosongkan!');
    console.log('   Aplikasi sekarang dalam kondisi NETRAL.');
    console.log('════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ ERROR saat reset database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
