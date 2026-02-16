import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { downloadCertificate, requestCertificateDownload, getAllCertificatesRequests } from "../controllers/report.controller";

const router = express.Router();

/**
 * @swagger
 * /reports/requests:
 *   get:
 *     summary: Get all certificate download requests (Admin & Instructor)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: List of report requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: object
 *                       overallAverage:
 *                         type: number
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get( "/requests", protect, restrictTo("admin", "instructor"), getAllCertificatesRequests);

/**
 * @swagger
 * /reports/request-certificate:
 *   patch:
 *     summary: Learner requests certificate download
 *     tags: [Learner]
 *     security:
 *       - bearerAuth: []
 *     description: Learner requests to download their certificate. Report status becomes "pending" and requires admin/instructor approval.
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
router.patch("/request-certificate", protect, restrictTo("learner"), requestCertificateDownload);

/**
 * @swagger
 * /reports/download:
 *   get:
 *     summary: Download approved learner certificate as PDF
 *     tags: [Learner]
 *     security:
 *       - bearerAuth: []
 *     description: Returns the learner's certificate as a PDF file. Report must be approved by admin/instructor.
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
router.get("/download", protect, restrictTo("learner"), downloadCertificate);

export default router;
