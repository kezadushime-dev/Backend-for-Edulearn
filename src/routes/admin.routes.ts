import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { adminCreateUserSchema, updateRoleSchema } from "../validations/adminValidation";
import * as adminController from "../controllers/admin.controllers";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get("/users", protect, restrictTo("admin"), adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/users/:id", protect, restrictTo("admin"), adminController.getUserById);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [learner, instructor, admin]
 *                 example: instructor
 *
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 user:
 *                   id: 65a8c9e4f12a3b0012abc123
 *                   name: John Doe
 *                   email: john@example.com
 *                   role: instructor
 *
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       409:
 *         description: Email already exists
 */
router.post("/users", protect, restrictTo("admin"), validate(adminCreateUserSchema), adminController.createUser);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [learner, instructor, admin]
 *     responses:
 *       200:
 *         description: User role updated
 *       404:
 *         description: User not found
 */
router.patch( "/users/:id/role", protect, restrictTo("admin"), validate(updateRoleSchema), adminController.updateUserRole );

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", protect, restrictTo("admin"), adminController.deleteUser);

/**
 * @swagger
 * /admin/users/role/{role}:
 *   get:
 *     summary: Get users by role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [learner, instructor, admin]
 *     responses:
 *       200:
 *         description: List of users with specified role
 */
router.get("/users/role/:role", protect, restrictTo("admin"),adminController.getUsersByRole);

/**
 * @swagger
 * /admin/statistics:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 */
router.get("/statistics", protect, restrictTo("admin"),adminController.getStatistics);

/**
 * @swagger
 * /admin/reports/{id}/approve:
 *   patch:
 *     summary: Approve a learner's report(admin and instructor)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Admin or instructor approves a learner's report, allowing them to download it. Sets report status to "approved" and records who approved it.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Report ID to approve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report approved successfully
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
 *                   example: Report approved
 *                 data:
 *                   type: object
 *                   properties:
 *                     report:
 *                       type: object
 *                       description: Approved report object
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
 *         description: Forbidden – only admin or instructor can approve
 */
router.patch("/reports/:id/approve", protect, restrictTo("admin", "instructor"), adminController.approveReport);

export default router;