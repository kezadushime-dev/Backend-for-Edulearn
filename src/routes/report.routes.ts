import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { downloadReport, requestReportDownload } from "../controllers/report.controller";

const router = express.Router();

/**
 * @swagger
 * /reports/request-download:
 *   patch:
 *     summary: Learner requests report download
 *     tags: [Learner]
 *     security:
 *       - bearerAuth: []
 *     description: Learner requests to download their report. Report status becomes "pending" and requires admin/instructor approval.
 *     responses:
 *       200:
 *         description: Download request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Download request sent. Waiting for approval.
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Report not found
 *       401:
 *         description: Unauthorized – user must be logged in
 *       403:
 *         description: Forbidden – only learners can request download
 */
router.patch("/request-download", protect, restrictTo("learner"), requestReportDownload);

/**
 * @swagger
 * /reports/download:
 *   get:
 *     summary: Download approved learner report as PDF
 *     tags: [Learner]
 *     security:
 *       - bearerAuth: []
 *     description: Returns the learner's report as a PDF file. Report must be approved by admin/instructor.
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Report not approved yet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Report not approved yet
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Report not found
 *       401:
 *         description: Unauthorized – user must be logged in
 */
router.get("/download", protect, restrictTo("learner"), downloadReport);

export default router;
