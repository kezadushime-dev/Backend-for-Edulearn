import PDFDocument from "pdfkit";
import { Report } from "../models/report.model";
import { Quiz } from "../models/quiz.model";
import fs from "fs";

export const generateReportPDF = async (report: any) => {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: any[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Header
    doc.fontSize(20).text("Academic Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Learner: ${report.user.name}`);
    doc.text(`Status: ${report.status}`);
    doc.text(`Overall Average: ${report.overallAverage.toFixed(2)}%`);
    doc.moveDown();

    // Table of quizzes
    doc.fontSize(14).text("Quizzes:", { underline: true });
    doc.moveDown(0.5);

    report.quizzes.forEach((q: any, idx: number) => {
      doc.fontSize(12).text(`${idx + 1}. Lesson: ${q.lesson}`);
      doc.text(`   Score: ${q.score}`);
      doc.text(`   Percentage: ${q.percentage.toFixed(2)}%`);
      doc.text(`   Passed: ${q.passed ? "Yes" : "No"}`);
      doc.moveDown(0.5);
    });

    doc.end();
  });
};
