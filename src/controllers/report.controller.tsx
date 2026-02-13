import { Report } from "../models/report.model";
import { User } from "../models/user.model";
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
export const requestReportDownload = catchAsync(
  async (req: AuthRequest, res: any) => {
    const report = await Report.findOne({ user: req.user.id });
    if (!report)
      return res
        .status(404)
        .json({ status: "fail", message: "Report not found" });

    report.status = "pending";
    await report.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Download request sent. Waiting for approval.",
      });
  },
);

//download report
export const downloadReport = catchAsync(async (req: AuthRequest, res: any) => {
  const report = await Report.findOne({ user: req.user.id })
    .populate("user")
    .populate({
      path: "quizzes.quiz",
      populate: {
        path: "lesson",
        select: "title",
      },
    });

  if (!report) {
    return res.status(404).json({
      status: "fail",
      message: "Report not found",
    });
  }

  if (report.status !== "approved") {
    return res.status(403).json({
      status: "fail",
      message: "Report not approved yet",
    });
  }

  const learner = report.user as any;

  // Generate PDF (now lesson title is available)
  const pdfBuffer = await generateReportPDF(report);

  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=report_${learner.name}.pdf`,
    "Content-Length": pdfBuffer.length,
  });

  res.end(pdfBuffer);
});