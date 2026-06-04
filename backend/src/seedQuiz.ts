import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120);

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultAdminEmail = 'admin@example.com';
  const defaultAdminPassword = 'Admin@123456';
  const adminEmail = process.env.ADMIN_EMAIL || (!isProduction ? defaultAdminEmail : '');
  const adminPassword = process.env.ADMIN_PASSWORD || (!isProduction ? defaultAdminPassword : '');

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding production data.');
  }

  if (isProduction && (adminEmail === defaultAdminEmail || adminPassword === defaultAdminPassword)) {
    throw new Error('Default admin credentials are not allowed in production.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      displayName: 'Quản trị viên',
      passwordHash,
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      displayName: 'Quản trị viên',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const topic = await prisma.quizTopic.upsert({
    where: { slug: 'kien-thuc-chuyen-doi-so' },
    update: {
      title: 'Kiến thức Chuyển đổi số',
      description: 'Các câu hỏi cơ bản về chuyển đổi số, dịch vụ công và định danh điện tử.',
      isActive: true
    },
    create: {
      slug: slugify('Kiến thức Chuyển đổi số'),
      title: 'Kiến thức Chuyển đổi số',
      description: 'Các câu hỏi cơ bản về chuyển đổi số, dịch vụ công và định danh điện tử.',
      order: 1
    }
  });

  const existingSet = await prisma.quizSet.findFirst({
    where: { topicId: topic.id, title: 'Kiến thức Chuyển đổi số Cơ bản', archivedAt: null }
  });

  if (!existingSet) {
    await prisma.quizSet.create({
      data: {
        topicId: topic.id,
        title: 'Kiến thức Chuyển đổi số Cơ bản',
        description: 'Bài kiểm tra kiến thức về các khái niệm và dịch vụ công phổ biến trong công cuộc chuyển đổi số quốc gia.',
        timeLimit: 300,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        order: 1,
        questions: {
          create: [
            {
              content: 'Chuyển đổi số là gì?',
              type: 'MULTIPLE_CHOICE',
              points: 10,
              order: 1,
              options: {
                create: [
                  { content: 'Là việc số hóa giấy tờ', order: 1, isCorrect: false },
                  { content: 'Là việc ứng dụng công nghệ thông tin vào mọi hoạt động', order: 2, isCorrect: false },
                  { content: 'Là quá trình thay đổi tổng thể và toàn diện của cá nhân, tổ chức về cách sống, cách làm việc và phương thức sản xuất dựa trên công nghệ số', order: 3, isCorrect: true },
                  { content: 'Là việc mua sắm máy tính và phần mềm mới', order: 4, isCorrect: false }
                ]
              }
            },
            {
              content: 'Ứng dụng VNeID do cơ quan nào quản lý?',
              type: 'MULTIPLE_CHOICE',
              points: 10,
              order: 2,
              options: {
                create: [
                  { content: 'Bộ Thông tin và Truyền thông', order: 1, isCorrect: false },
                  { content: 'Bộ Công an', order: 2, isCorrect: true },
                  { content: 'Bộ Y tế', order: 3, isCorrect: false },
                  { content: 'Ủy ban nhân dân các cấp', order: 4, isCorrect: false }
                ]
              }
            },
            {
              content: 'Đăng ký tài khoản định danh điện tử mức độ 2 phải ra cơ quan Công an. Đúng hay sai?',
              type: 'TRUE_FALSE',
              points: 10,
              order: 3,
              options: {
                create: [
                  { content: 'Đúng', order: 1, isCorrect: true },
                  { content: 'Sai', order: 2, isCorrect: false }
                ]
              }
            }
          ]
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Quiz seed completed.');
  })
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
