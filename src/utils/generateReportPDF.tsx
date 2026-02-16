import PDFDocument from 'pdfkit';
import { User } from '../models/user.model';
import { drawCertificateTemplate } from '../templates/report.template';

interface CertificateInput {
  user: { name: string };
  courseName: string;
  dateAwarded: string;
  approvedById?: string;
}

export const generateCertificate = async (reportData: CertificateInput) => {
  // 1️⃣ Fetch default seeded admin
  const seedAdmin = await User.findOne({ isSeedAdmin: true });
  if (!seedAdmin) throw new Error('Seed admin not found');

  // 2️⃣ Determine approver
  let approver = seedAdmin;
  if (reportData.approvedById) {
    const found = await User.findById(reportData.approvedById);
    if (found) approver = found;
  }

  // 3️⃣ Create PDF stream
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  drawCertificateTemplate(doc, {
    user: reportData.user,
    courseName: reportData.courseName,
    dateAwarded: reportData.dateAwarded,
    approvedBy: { name: approver.name }
  });

  return doc; // return stream
};