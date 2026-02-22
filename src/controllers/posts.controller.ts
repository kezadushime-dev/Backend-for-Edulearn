import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import { Like } from "../models/like.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

const normalizeRole = (role: string) => {
  if (role === "learner") return "user";
  if (role === "instructor") return "leader";
  return role;
};

const canModerate = (user: any) => {
  const role = normalizeRole(user.role);
  return role === "admin" || role === "leader";
};

const canEditPost = (user: any, post: any) => {
  return canModerate(user) || post.author.toString() === user._id.toString();
};

export const getPosts = catchAsync(async (req: AuthRequest, res: any) => {
  const filter: any = {};

  if (!canModerate(req.user) || req.query.includeHidden !== "true") {
    filter.isHidden = false;
  }

  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.authorId) filter.author = req.query.authorId;

  const posts = await Post.find(filter)
    .populate("author", "name image avatarUrl role church region ageGroup")
    .sort({ createdAt: -1 });

  const postsWithCounts = await Promise.all(
    posts.map(async (post: any) => {
      const [likesCount, commentsCount] = await Promise.all([
        Like.countDocuments({ post: post._id }),
        Comment.countDocuments({ post: post._id }),
      ]);
      return {
        ...post.toObject(),
        likesCount,
        commentsCount,
      };
    }),
  );

  res.status(200).json({
    status: "success",
    results: postsWithCounts.length,
    data: { posts: postsWithCounts },
  });
});

export const getPost = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name image avatarUrl role church region ageGroup",
  );

  if (!post) return next(new AppError("Post not found", 404));
  if (post.isHidden && !canModerate(req.user)) {
    return next(new AppError("Post not found", 404));
  }

  const [likesCount, commentsCount] = await Promise.all([
    Like.countDocuments({ post: post._id }),
    Comment.countDocuments({ post: post._id }),
  ]);

  res.status(200).json({
    status: "success",
    data: { post: { ...post.toObject(), likesCount, commentsCount } },
  });
});

export const createPost = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { title, content, tags, imageUrl } = req.body;
  if (!title || !content) {
    return next(new AppError("title and content are required", 400));
  }

  const post = await Post.create({
    author: req.user._id,
    title,
    content,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    imageUrl,
  });

  res.status(201).json({
    status: "success",
    data: { post },
  });
});

export const updatePost = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (!canEditPost(req.user, post)) {
    return next(new AppError("You do not have permission to edit this post", 403));
  }

  const updateBody: any = {};
  ["title", "content", "imageUrl", "isHidden"].forEach((field) => {
    if (req.body[field] !== undefined) updateBody[field] = req.body[field];
  });

  if (req.body.tags !== undefined) {
    updateBody.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
  }

  const updated = await Post.findByIdAndUpdate(req.params.id, updateBody, {
    new: true,
    runValidators: true,
  }).populate("author", "name image avatarUrl");

  res.status(200).json({
    status: "success",
    data: { post: updated },
  });
});

export const deletePost = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (!canEditPost(req.user, post)) {
    return next(new AppError("You do not have permission to delete this post", 403));
  }

  post.isHidden = true;
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Post hidden successfully",
  });
});

export const getPostComments = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (post.isHidden && !canModerate(req.user)) {
    return next(new AppError("Post not found", 404));
  }

  const comments = await Comment.find({ post: post._id })
    .populate("author", "name image avatarUrl role")
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    results: comments.length,
    data: { comments },
  });
});

export const createPostComment = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { content } = req.body;
  if (!content) return next(new AppError("content is required", 400));

  const post = await Post.findById(req.params.id);
  if (!post || post.isHidden) return next(new AppError("Post not found", 404));

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name image avatarUrl role",
  );

  res.status(201).json({
    status: "success",
    data: { comment: populatedComment },
  });
});

export const likePost = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isHidden) return next(new AppError("Post not found", 404));

  await Like.findOneAndUpdate(
    { post: post._id, user: req.user._id },
    { post: post._id, user: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const likesCount = await Like.countDocuments({ post: post._id });

  res.status(200).json({
    status: "success",
    data: { likesCount },
  });
});

export const unlikePost = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  await Like.findOneAndDelete({ post: post._id, user: req.user._id });
  const likesCount = await Like.countDocuments({ post: post._id });

  res.status(200).json({
    status: "success",
    data: { likesCount },
  });
});
