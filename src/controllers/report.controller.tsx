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
  // Try to find existing report
  let report = await Report.findOne({ user: req.user.id });

  // Get all results of the user and populate quiz
  const userResults = await Result.find({ user: req.user.id }).populate("quiz");

  // Filter out results where quiz was deleted
  const validResults = userResults.filter((resItem: any) => resItem.quiz);

  // If no report exists, create one rebuilt from results
  if (!report) {
    report = await Report.create({
      user: req.user.id,
      quizzes: validResults.map((resItem: any) => ({
        quiz: resItem.quiz._id,
        score: resItem.score,
        percentage: resItem.percentage,
        passed: resItem.passed,
        takenAt: resItem.createdAt || new Date(),
      })),
      overallAverage:
        validResults.length > 0
          ? validResults.reduce((sum: number, r: any) => sum + r.percentage, 0) / validResults.length
          : 0,
      status: "pending", // default pending
    });

    return res.status(200).json({
      status: "success",
      message: "Download request sent. Waiting for approval.",
      data: { report },
    });
  }

  // If a request is already pending, block duplicate request
  if (report.status === "pending") {
    return res.status(400).json({
      status: "fail",
      message: "You already have a pending download request. Please wait for a response.",
    });
  }

  // Otherwise, allow a new request
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
  const report = (await Report.findOne({ user: req.user.id })
    .populate('user', 'name email')
    .populate({
      path: 'quizzes.quiz',
      populate: { path: 'lesson', select: 'title' },
      select: 'title lesson',
    }))!; // non-null assertion because we'll check

  if (!report) {
    return res.status(404).json({ status: 'fail', message: 'Report not found' });
  }

  if (report.status !== 'approved') {
    return res.status(403).json({ status: 'fail', message: 'Report not approved yet' });
  }

  // Cast populated user to IUser for TypeScript
  const populatedUser = report.user as IUser;

  const pdfBuffer = await generateReportPDF(report);

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=report_${populatedUser.name}.pdf`,
    'Content-Length': pdfBuffer.length,
  });

  res.end(pdfBuffer);
});
