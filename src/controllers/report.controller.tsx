import { Report } from "../models/report.model";
import { Result } from "../models/result.model";
import { IUser } from '../models/user.model';
import { generateReportPDF } from "../utils/generateReportPDF";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";

// Admin / Instructor - Get all report requests
export const getAllReportRequests = catchAsync(
  async (req: AuthRequest, res: any) => {
    const filter: any = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const reports = await Report.find(filter)
      .populate("user", "name email role")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: "success",
      results: reports.length,
      data: reports,
    });
  },
);

// Request report download
export const requestReportDownload = catchAsync(async (req: AuthRequest, res: any) => {
  let report = await Report.findOne({ user: req.user.id });

  // Populate quiz and lesson
  const userResults = await Result.find({ user: req.user.id }).populate({
    path: "quiz",
    select: "title lesson",
    populate: { path: "lesson", select: "title" },
  });

  const validResults = userResults.filter((resItem: any) => resItem.quiz);

  if (!report) {
    report = await Report.create({
      user: req.user.id,
      quizzes: validResults.map((resItem: any) => ({
        quiz: resItem.quiz._id,
        score: resItem.score,
        percentage: resItem.percentage,
        passed: resItem.passed,
        takenAt: resItem.createdAt || new Date(),
        lesson: resItem.quiz.lesson
          ? { _id: resItem.quiz.lesson._id, title: resItem.quiz.lesson.title }
          : { _id: null, title: "No Lesson" },
      })),
      overallAverage:
        validResults.length > 0
          ? validResults.reduce((sum: number, r: any) => sum + r.percentage, 0) / validResults.length
          : 0,
      status: "pending",
    });

    return res.status(200).json({
      status: "success",
      message: "Download request sent. Waiting for approval.",
      data: { report },
    });
  }

  if (report.status === "pending") {
    return res.status(400).json({
      status: "fail",
      message: "You already have a pending download request. Please wait for a response.",
    });
  }

  report.status = "pending";
  await report.save();

  res.status(200).json({
    status: "success",
    message: "Download request sent. Waiting for approval.",
    data: { report },
  });
});

//download report
export const downloadReport = catchAsync(async (req: AuthRequest, res: any) => {
  const report = await Report.findOne({ user: req.user.id })
    .populate("user", "name email")
    .populate({
      path: "quizzes.quiz",
      select: "title lesson",
      populate: { path: "lesson", select: "title" },
    });

  if (!report) {
    return res.status(404).json({ status: "fail", message: "Report not found" });
  }

  if (report.status !== "approved") {
    return res.status(403).json({ status: "fail", message: "Report not approved yet" });
  }

  const populatedUser = report.user as IUser;

  const pdfBuffer = await generateReportPDF(report);

  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=report_${populatedUser.name}.pdf`,
    "Content-Length": pdfBuffer.length,
  });

  res.end(pdfBuffer);
});
