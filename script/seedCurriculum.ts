import mongoose from "mongoose";
import { connectDB } from "../src/config/database";
import { Course } from "../src/models/course.model";
import { Lesson } from "../src/models/lesson.model";
import { User } from "../src/models/user.model";

const MEDIA_BASE = "https://cdn.adventistyouth.rw/curriculum";

type FrameworkCategory = "SPIRITUAL" | "INTELLECTUAL" | "PHYSICAL";
type TargetGroup = "Pathfinder" | "Ambassador" | "Youth-Leader" | "Youth";
type Level =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Friend"
  | "Companion"
  | "Explorer"
  | "Ranger"
  | "Voyager"
  | "Guide"
  | "Ambassador-Year1"
  | "Ambassador-Year2"
  | "Youth-Leader-Rwanda"
  | "All Levels"
  | "Beginner-Intermediate";

type Question = {
  type: "multiple-choice" | "true-false" | "short-answer" | "essay";
  question: string;
  options?: string[];
  answer?: string | boolean;
  points?: number;
};

type LessonTopic = {
  title: string;
  focus: string;
  scripture: string[];
  quizQuestion: string;
  quizOptions?: string[];
  quizAnswer: string | boolean;
  quizType?: "multiple-choice" | "true-false";
};

type CourseBlueprint = {
  frameworkCategory: FrameworkCategory;
  categoryName: string;
  courseName: string;
  description: string;
  learningGoal: string;
  level: Level;
  targetGroup: TargetGroup;
  durationWeeks: number;
  topics: LessonTopic[];
  examQuestions: Question[];
};

const mcq = (question: string, options: string[], answer: string): Question => ({
  type: "multiple-choice",
  question,
  options,
  answer,
  points: 1,
});

const tf = (question: string, answer: boolean): Question => ({
  type: "true-false",
  question,
  options: ["True", "False"],
  answer,
  points: 1,
});

const shortAnswer = (question: string): Question => ({ type: "short-answer", question });
const essay = (question: string): Question => ({ type: "essay", question });

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const pathfinderBlueprints: CourseBlueprint[] = [
  {
    frameworkCategory: "SPIRITUAL",
    categoryName: "Iby'umwuka (Spiritual)",
    courseName: "Pathfinder Friend - Personal Devotion and Citizenship",
    description: "Friend level spiritual growth, devotion, and Christian citizenship for Pathfinders.",
    learningGoal: "Develop devotion habits, Bible memory discipline, and basic Christian responsibility.",
    level: "Friend",
    targetGroup: "Pathfinder",
    durationWeeks: 10,
    topics: [
      {
        title: "Personal Devotion and Prayer Foundations",
        focus: "Daily prayer and Bible reading habits for young Pathfinders.",
        scripture: ["Psalm 5:3", "Philippians 4:6"],
        quizQuestion: "A strong devotion habit starts with daily prayer and Scripture.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Bible Memorization and Christian Identity",
        focus: "Using Scripture memory to shape identity and decision-making.",
        scripture: ["Psalm 119:11", "1 Peter 2:9"],
        quizQuestion: "Which practice helps a Pathfinder resist temptation?",
        quizType: "multiple-choice",
        quizOptions: ["Ignoring Scripture", "Bible memorization", "Skipping prayer"],
        quizAnswer: "Bible memorization",
      },
      {
        title: "Christian Citizenship and Service",
        focus: "Practical service and community responsibility rooted in faith.",
        scripture: ["Micah 6:8", "Matthew 5:16"],
        quizQuestion: "Christian citizenship is best shown by integrity and service.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      shortAnswer("Explain how daily devotion strengthens a Pathfinder's character."),
      shortAnswer("List two examples of Christian citizenship for youth."),
    ],
  },
  {
    frameworkCategory: "SPIRITUAL",
    categoryName: "Iby'umwuka (Spiritual)",
    courseName: "Pathfinder Companion - Doctrine and Stewardship",
    description: "Companion level understanding of doctrine, stewardship, and practical faithfulness.",
    learningGoal: "Ground Companion Pathfinders in doctrine and everyday stewardship.",
    level: "Companion",
    targetGroup: "Pathfinder",
    durationWeeks: 10,
    topics: [
      {
        title: "Bible Doctrines Basics",
        focus: "Core Adventist beliefs and biblical authority.",
        scripture: ["2 Timothy 3:16", "Ephesians 2:8-10"],
        quizQuestion: "Adventist doctrine is grounded in Scripture.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Stewardship and Tithing",
        focus: "Faithfulness in resources, time, and witness.",
        scripture: ["Malachi 3:10", "Luke 16:10"],
        quizQuestion: "Stewardship means managing God's gifts faithfully.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Pathfinder Honors Introduction",
        focus: "Using honors to build practical ministry skills.",
        scripture: ["Colossians 3:23", "1 Peter 4:10"],
        quizQuestion: "Pathfinder honors are mainly for competition.",
        quizType: "true-false",
        quizAnswer: false,
      },
    ],
    examQuestions: [
      shortAnswer("Define stewardship from a biblical perspective."),
      shortAnswer("How can Pathfinder honors support mission?"),
    ],
  },
  {
    frameworkCategory: "INTELLECTUAL",
    categoryName: "Iby'ubwenge (Intellectual)",
    courseName: "Pathfinder Explorer - Church History and Mission",
    description: "Explorer level Adventist heritage, evangelism, and community service.",
    learningGoal: "Equip Explorers to connect church history to practical mission.",
    level: "Explorer",
    targetGroup: "Pathfinder",
    durationWeeks: 10,
    topics: [
      {
        title: "Adventist Church History Overview",
        focus: "Major movement milestones and theological identity.",
        scripture: ["Habakkuk 2:2-3", "Revelation 14:6"],
        quizQuestion: "Why is Adventist history important for young leaders?",
        quizType: "multiple-choice",
        quizOptions: ["No reason", "It explains mission identity", "Only for scholars"],
        quizAnswer: "It explains mission identity",
      },
      {
        title: "Mission and Evangelism Skills",
        focus: "Witness models for youth and local church context.",
        scripture: ["1 Peter 3:15", "Matthew 28:19"],
        quizQuestion: "Youth evangelism should combine service and gospel witness.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Community Service and Christian Citizenship",
        focus: "Service project planning and impact measurement.",
        scripture: ["Galatians 6:9", "Philippians 2:4"],
        quizQuestion: "Service projects should include planning and follow-up.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      shortAnswer("State two mission lessons from Adventist history."),
      shortAnswer("Describe one youth-focused evangelism strategy."),
    ],
  },
  {
    frameworkCategory: "PHYSICAL",
    categoryName: "Iby'umubiri (Physical)",
    courseName: "Pathfinder Ranger - Safety and Outdoor Readiness",
    description: "Ranger level first aid, outdoor survival, and safe leadership.",
    learningGoal: "Prepare Rangers for practical safety leadership in field activities.",
    level: "Ranger",
    targetGroup: "Pathfinder",
    durationWeeks: 10,
    topics: [
      {
        title: "Leadership Skills in Field Settings",
        focus: "Team coordination, risk awareness, and safe execution.",
        scripture: ["Joshua 1:9", "Proverbs 22:3"],
        quizQuestion: "Safety planning is optional in field activities.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "First Aid and Emergency Response",
        focus: "Core first aid and emergency communication.",
        scripture: ["Luke 10:33-34", "Ecclesiastes 4:9"],
        quizQuestion: "What should happen first in an emergency?",
        quizType: "multiple-choice",
        quizOptions: ["Panic", "Quick safety assessment", "Ignore the event"],
        quizAnswer: "Quick safety assessment",
      },
      {
        title: "Outdoor Survival and Stewardship",
        focus: "Basic survival skills and creation care ethics.",
        scripture: ["Genesis 2:15", "Psalm 121:1"],
        quizQuestion: "Creation care is part of outdoor Christian ministry.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      shortAnswer("List three first-aid priorities in Pathfinder field ministry."),
      shortAnswer("Explain why stewardship matters in outdoor programs."),
    ],
  },
  {
    frameworkCategory: "INTELLECTUAL",
    categoryName: "Iby'ubwenge (Intellectual)",
    courseName: "Pathfinder Voyager - Advanced Bible and Ministry Skills",
    description: "Voyager level advanced Bible study, youth preaching, and conflict resolution.",
    learningGoal: "Develop Voyagers as confident Bible communicators and peacemakers.",
    level: "Voyager",
    targetGroup: "Pathfinder",
    durationWeeks: 10,
    topics: [
      {
        title: "Advanced Bible Study Methods",
        focus: "Contextual interpretation and faithful application.",
        scripture: ["Acts 17:11", "James 1:22"],
        quizQuestion: "Context is optional in Bible interpretation.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Youth Preaching Training",
        focus: "Sermon structure and audience engagement.",
        scripture: ["2 Timothy 4:2", "Ecclesiastes 12:10"],
        quizQuestion: "A good youth sermon should center on one biblical big idea.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Conflict Resolution",
        focus: "Reconciliation and team unity in youth ministry.",
        scripture: ["Matthew 18:15", "Colossians 3:13"],
        quizQuestion: "Ignoring conflict is a biblical leadership strategy.",
        quizType: "true-false",
        quizAnswer: false,
      },
    ],
    examQuestions: [
      essay("Discuss how preaching and conflict resolution improve youth ministry effectiveness."),
    ],
  },
  {
    frameworkCategory: "SPIRITUAL",
    categoryName: "Iby'umwuka (Spiritual)",
    courseName: "Pathfinder Guide - Junior Leadership and Mentorship",
    description: "Guide level mentoring, teaching, and junior leadership practice.",
    learningGoal: "Prepare Guide Pathfinders for mentorship and ministry team leadership.",
    level: "Guide",
    targetGroup: "Pathfinder",
    durationWeeks: 10,
    topics: [
      {
        title: "Junior Leadership Training",
        focus: "Leadership character and responsibility in ministry teams.",
        scripture: ["1 Timothy 4:12", "Mark 10:45"],
        quizQuestion: "Christian leadership is rooted in service.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Teaching Skills",
        focus: "Lesson planning and age-appropriate teaching methods.",
        scripture: ["Nehemiah 8:8", "Luke 2:46"],
        quizQuestion: "A good lesson starts with clear learning outcomes.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Mentorship Principles",
        focus: "Mentoring structures, trust, and healthy boundaries.",
        scripture: ["2 Timothy 2:2", "Proverbs 11:14"],
        quizQuestion: "Mentorship is only giving instructions.",
        quizType: "true-false",
        quizAnswer: false,
      },
    ],
    examQuestions: [
      essay("Differentiate authority and influence in Christian youth leadership."),
      shortAnswer("List three traits of healthy youth mentorship."),
    ],
  },
];

const additionalBlueprints: CourseBlueprint[] = [
  {
    frameworkCategory: "SPIRITUAL",
    categoryName: "Iby'umwuka (Spiritual)",
    courseName: "Foundations of Adventist Faith for Youth",
    description: "Core spiritual foundations based on Seventh-day Adventist teachings.",
    learningGoal: "Ground youth in key Adventist doctrines and practical discipleship.",
    level: "Beginner",
    targetGroup: "Youth",
    durationWeeks: 8,
    topics: [
      {
        title: "The Great Controversy and Identity in Christ",
        focus: "Cosmic conflict worldview and personal identity in Christ.",
        scripture: ["Revelation 12:7-9", "Galatians 2:20"],
        quizQuestion: "The Great Controversy is central to Adventist belief.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Sabbath and Covenant Faithfulness",
        focus: "Sabbath theology and youth worship practice.",
        scripture: ["Genesis 2:1-3", "Exodus 20:8-11"],
        quizQuestion: "Sabbath has no mission relevance.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Prayer and Daily Devotion",
        focus: "Practical routines for Scripture, prayer, and spiritual consistency.",
        scripture: ["Matthew 6:9-13", "Psalm 119:105"],
        quizQuestion: "Which comes first in Bible study?",
        quizType: "multiple-choice",
        quizOptions: ["Application", "Observation", "Debate"],
        quizAnswer: "Observation",
      },
    ],
    examQuestions: [
      shortAnswer("Explain how the Great Controversy shapes Adventist youth identity."),
      essay("Describe how Sabbath and devotion habits strengthen mission among youth."),
    ],
  },
  {
    frameworkCategory: "SPIRITUAL",
    categoryName: "Iby'umwuka (Spiritual)",
    courseName: "History of Adventist Youth Ministry in Rwanda",
    description: "Historical development of Adventist youth ministry in Rwanda.",
    learningGoal: "Equip leaders with historical understanding for contextual ministry.",
    level: "Beginner-Intermediate",
    targetGroup: "Youth",
    durationWeeks: 6,
    topics: [
      {
        title: "Origins of Adventism in Rwanda",
        focus: "Missionary arrival, schools, and early church growth.",
        scripture: ["Matthew 28:19", "Psalm 78:4"],
        quizQuestion: "Early Adventist mission growth in Rwanda was supported by schools and health ministry.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Development of AY, Pathfinders, and Ambassadors",
        focus: "Youth structures for discipleship and leadership growth.",
        scripture: ["1 Timothy 4:12", "Titus 2:6-8"],
        quizQuestion: "Which ministry mainly serves teenagers?",
        quizType: "multiple-choice",
        quizOptions: ["Pathfinders", "Deacons", "Treasury Board"],
        quizAnswer: "Pathfinders",
      },
      {
        title: "Youth Ministry in Contemporary Rwanda",
        focus: "Digital mission, leadership transitions, and pastoral realities.",
        scripture: ["Romans 12:2", "Micah 6:8"],
        quizQuestion: "Digital evangelism can support youth discipleship when used responsibly.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      shortAnswer("Summarize two milestones in Adventist youth ministry growth in Rwanda."),
      essay("Propose a contextual youth ministry strategy for your district based on historical lessons."),
    ],
  },
  {
    frameworkCategory: "INTELLECTUAL",
    categoryName: "Iby'ubwenge (Intellectual)",
    courseName: "Christian Leadership and Critical Thinking",
    description: "Leadership development with strong Christian ethics and critical thinking.",
    learningGoal: "Equip youth with ethical decision-making and servant leadership skills.",
    level: "Intermediate",
    targetGroup: "Youth",
    durationWeeks: 8,
    topics: [
      {
        title: "Principles of Servant Leadership",
        focus: "Leadership rooted in service, humility, and integrity.",
        scripture: ["John 13:14-15", "Mark 10:45"],
        quizQuestion: "Servant leadership is defined by service and humility.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Critical Thinking and Biblical Worldview",
        focus: "Evaluating ideas through Scripture and reason.",
        scripture: ["1 Thessalonians 5:21", "Colossians 2:8"],
        quizQuestion: "Critical thinking opposes biblical faith.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Communication and Conflict Resolution",
        focus: "Constructive communication and reconciliation methods.",
        scripture: ["Proverbs 15:1", "Matthew 18:15"],
        quizQuestion: "Healthy conflict can strengthen ministry teams.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      essay("Discuss how servant leadership can transform youth ministry in Rwanda."),
    ],
  },
  {
    frameworkCategory: "PHYSICAL",
    categoryName: "Iby'umubiri (Physical)",
    courseName: "Adventist Health Principles for Youth",
    description: "Understanding NEWSTART and practical healthy living.",
    learningGoal: "Help youth adopt holistic health principles and self-discipline.",
    level: "All Levels",
    targetGroup: "Youth",
    durationWeeks: 8,
    topics: [
      {
        title: "The 8 Laws of Health",
        focus: "NEWSTART principles and theological relevance.",
        scripture: ["3 John 1:2", "1 Corinthians 6:19-20"],
        quizQuestion: "What does the T in NEWSTART stand for?",
        quizType: "multiple-choice",
        quizOptions: ["Trust in God", "Training", "Treatment"],
        quizAnswer: "Trust in God",
      },
      {
        title: "Nutrition and Mental Wellness",
        focus: "Diet, emotional resilience, and mission readiness.",
        scripture: ["Daniel 1:8-20", "Mark 6:31"],
        quizQuestion: "Food choices can influence spiritual focus.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Active Lifestyle and Temperance",
        focus: "Exercise routines and self-control disciplines.",
        scripture: ["1 Timothy 4:8", "Galatians 5:22-23"],
        quizQuestion: "Temperance is only about food.",
        quizType: "true-false",
        quizAnswer: false,
      },
    ],
    examQuestions: [
      shortAnswer("Explain how the health message supports spiritual growth."),
      shortAnswer("Give two practical youth health habits aligned with NEWSTART."),
    ],
  },
  {
    frameworkCategory: "INTELLECTUAL",
    categoryName: "Iby'ubwenge (Intellectual)",
    courseName: "Rwanda Adventist Youth Leadership Development",
    description: "Rwanda-specific youth leadership training for ethics, structure, and mission.",
    learningGoal: "Train youth leaders in contextual leadership, reconciliation, and evangelism strategy.",
    level: "Youth-Leader-Rwanda",
    targetGroup: "Youth-Leader",
    durationWeeks: 12,
    topics: [
      {
        title: "History of Adventism in Rwanda",
        focus: "Mission history and lessons for youth leaders.",
        scripture: ["Psalm 78:4", "Deuteronomy 32:7"],
        quizQuestion: "Historical memory is essential for leadership wisdom.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Structure of Rwanda Union and Conferences",
        focus: "Governance pathways and ministry coordination.",
        scripture: ["1 Corinthians 12:12", "Ecclesiastes 4:9"],
        quizQuestion: "Understanding structure improves ministry accountability.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Role of AY, Pathfinders, and Ambassadors",
        focus: "Transition pathways and retention strategy.",
        scripture: ["Ephesians 4:11-13", "Proverbs 22:6"],
        quizQuestion: "AY, Pathfinders, and Ambassadors should operate in isolation.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Youth Leadership Ethics in Post-1994 Context",
        focus: "Ethical leadership and reconciliation-centered influence.",
        scripture: ["Zechariah 8:16", "2 Corinthians 5:18-19"],
        quizQuestion: "Leadership ethics can be ignored if results are positive.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Community Healing and Evangelism Strategy",
        focus: "Trauma-sensitive mission planning and long-term discipleship.",
        scripture: ["Isaiah 61:1", "Matthew 9:36"],
        quizQuestion: "A strong healing strategy includes compassion, truth, and follow-up.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      essay("Design a Rwanda-context youth leadership strategy integrating ethics, structure, and healing mission."),
      shortAnswer("List four practical steps for community healing evangelism."),
    ],
  },
  {
    frameworkCategory: "INTELLECTUAL",
    categoryName: "Iby'ubwenge (Intellectual)",
    courseName: "Ambassador Leadership and Mission - Year 1",
    description: "Year 1 Ambassador curriculum for identity, calling, and digital mission.",
    learningGoal: "Build mature ambassador leaders with strategic mission focus.",
    level: "Ambassador-Year1",
    targetGroup: "Ambassador",
    durationWeeks: 16,
    topics: [
      {
        title: "Identity in Christ",
        focus: "Identity-based leadership and discipleship.",
        scripture: ["Ephesians 1:4-5", "Galatians 2:20"],
        quizQuestion: "Identity in Christ is a foundation for leadership.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Career and Calling",
        focus: "Purpose-driven decisions in education and profession.",
        scripture: ["Colossians 3:17", "Proverbs 3:5-6"],
        quizQuestion: "Calling should be separated from career choices.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Advanced Leadership",
        focus: "Strategic planning, delegation, and accountability.",
        scripture: ["Luke 14:28", "Exodus 18:21-22"],
        quizQuestion: "Delegation means abandoning responsibility.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Digital Evangelism",
        focus: "Ethical online mission and discipleship pathways.",
        scripture: ["Psalm 96:3", "Philippians 4:8"],
        quizQuestion: "Digital ministry needs ethical accountability.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      essay("Evaluate how identity, career calling, and digital evangelism can be integrated in ambassador mission."),
    ],
  },
  {
    frameworkCategory: "INTELLECTUAL",
    categoryName: "Iby'ubwenge (Intellectual)",
    courseName: "Ambassador Leadership and Mission - Year 2",
    description: "Year 2 Ambassador curriculum for administration, preaching, and mission projects.",
    learningGoal: "Prepare ambassadors for high-responsibility church and mission leadership.",
    level: "Ambassador-Year2",
    targetGroup: "Ambassador",
    durationWeeks: 16,
    topics: [
      {
        title: "Church Administration Basics",
        focus: "Governance, planning, and accountability systems.",
        scripture: ["1 Corinthians 14:40", "Luke 16:10"],
        quizQuestion: "Administration quality affects ministry outcomes.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Public Speaking and Preaching",
        focus: "Message preparation and delivery skills.",
        scripture: ["2 Timothy 2:15", "Ecclesiastes 12:11"],
        quizQuestion: "Good preaching requires biblical depth and practical application.",
        quizType: "true-false",
        quizAnswer: true,
      },
      {
        title: "Youth Mentorship",
        focus: "Mentorship pipelines and coaching conversations.",
        scripture: ["2 Timothy 2:2", "Proverbs 27:17"],
        quizQuestion: "Mentorship should be unstructured and accidental only.",
        quizType: "true-false",
        quizAnswer: false,
      },
      {
        title: "Mission Project Planning",
        focus: "Design, execution, and evaluation of mission projects.",
        scripture: ["Nehemiah 2:17-18", "Luke 10:17"],
        quizQuestion: "Mission projects need planning and post-evaluation.",
        quizType: "true-false",
        quizAnswer: true,
      },
    ],
    examQuestions: [
      essay("Design an annual youth strategy combining preaching, mentorship, and mission planning."),
      shortAnswer("Name three indicators of effective youth ministry administration."),
    ],
  },
];

const curriculumBlueprints: CourseBlueprint[] = [
  ...pathfinderBlueprints,
  ...additionalBlueprints,
];

const categoryDescriptionByCode: Record<FrameworkCategory, string> = {
  SPIRITUAL:
    "Faith, discipleship, biblical identity, and character formation for Adventist youth.",
  INTELLECTUAL:
    "Knowledge, critical thinking, leadership reasoning, and ministry planning skills.",
  PHYSICAL:
    "Health, wellness, outdoor readiness, and practical lifestyle discipline.",
};

const createDefaultInstructor = async () => {
  const seedEmail =
    process.env.CURRICULUM_SEED_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "curriculum.seed@edulearn.local";
  const seedPassword =
    process.env.CURRICULUM_SEED_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    "SeedPassword123!";

  const existing = await User.findOne({ email: seedEmail });
  if (existing) return existing;

  return User.create({
    name: "Curriculum Seeder",
    email: seedEmail,
    password: seedPassword,
    role: "leader",
    country: "Rwanda",
    field: "Adventist Youth Ministries",
    province: "Kigali",
    church: "Rwanda Union Headquarters",
    club: "National Youth Leadership",
  });
};

const buildPrimaryQuizQuestion = (topic: LessonTopic): Question => {
  if (topic.quizType === "true-false") {
    return tf(topic.quizQuestion, Boolean(topic.quizAnswer));
  }

  return mcq(
    topic.quizQuestion,
    topic.quizOptions || ["Option A", "Option B", "Option C"],
    String(topic.quizAnswer),
  );
};

const buildBiblicalFoundationNotes = (
  blueprint: CourseBlueprint,
  topic: LessonTopic,
  lessonNumber: number,
) => {
  const scriptures = topic.scripture.join(", ");
  return [
    `Lesson ${lessonNumber} Full Notes`,
    "",
    `Course: ${blueprint.courseName}`,
    `Topic Focus: ${topic.focus}`,
    "",
    "1) Theological Overview",
    `This section gives a grounded Adventist explanation of the subject '${topic.title}', connecting doctrine, discipleship, and practical ministry. Students should identify the biblical principle, define the key terms, and explain why this topic matters for youth character formation.`,
    "",
    "2) Biblical Study and Interpretation",
    `Primary Scripture references: ${scriptures}.`,
    "Read each text in context, identify repeated themes, then summarize what God is teaching about identity, leadership responsibility, service, and mission.",
    "",
    "3) Historical and Ministry Context",
    "Learners should connect doctrine to real church life. When relevant, explain how the Adventist movement in Rwanda developed through worship, education, health ministry, and youth structures such as AY, Pathfinders, and Ambassadors.",
    "",
    "4) Leadership Application",
    "Translate the lesson from knowledge to action: what decisions should a youth leader make differently this week because of this truth? Include local church examples and accountability mechanisms.",
    "",
    "5) Reflection Questions",
    "- What truth in this lesson challenges my current attitude or behavior?",
    "- Which Scripture should guide my decisions in leadership and service?",
    "- How can this lesson improve discipleship outcomes in my club or church?",
    "",
    "6) Ministry Output",
    "Write a short ministry brief including key doctrine points, one contextual challenge, one action plan, and one prayer commitment for implementation over the next 7 days.",
  ].join("\n");
};

const buildLeadershipApplicationNotes = (
  blueprint: CourseBlueprint,
  topic: LessonTopic,
  isRwandaLeadership: boolean,
) => {
  const rwandaSection = isRwandaLeadership
    ? "For Rwanda context, apply reconciliation-centered leadership: build trust, promote truth with grace, include community healing practices, and design evangelism strategies that are trauma-aware and pastorally responsible."
    : "Apply the lesson to your district or local church by defining measurable actions, realistic timelines, and team accountability.";

  return [
    `Leadership Practice Notes: ${topic.title}`,
    "",
    "1) Practical Strategy",
    "Move from theory to action by setting one ministry objective, one execution method, and one measurable result. Avoid generic plans; define who will do what and by when.",
    "",
    "2) Team Facilitation",
    "Use collaborative leadership: assign roles, monitor progress, and encourage peer feedback. Build a culture of prayer, discipline, and transparent communication.",
    "",
    "3) Risk and Ethics Review",
    "Evaluate ethical risks before implementation. Ensure alignment with biblical values, church policy, safeguarding standards, and responsible digital behavior.",
    "",
    "4) Rwanda and Community Relevance",
    rwandaSection,
    "",
    "5) Reporting Framework",
    "At the end of the activity, submit a short report with: objective, actions taken, outcomes, lessons learned, and a follow-up discipleship plan.",
    "",
    "6) Personal Spiritual Growth",
    "Conclude with prayer and journaling. Document one character trait God is developing in you through this leadership assignment.",
  ].join("\n");
};

const buildLessonPayload = (
  blueprint: CourseBlueprint,
  topic: LessonTopic,
  index: number,
  instructorId: mongoose.Types.ObjectId,
  courseId: mongoose.Types.ObjectId,
) => {
  const lessonNumber = index + 1;
  const slug = toSlug(`${blueprint.courseName}-${topic.title}`);
  const primaryQuestion = buildPrimaryQuizQuestion(topic);
  const isRwandaLeadership = blueprint.level === "Youth-Leader-Rwanda";
  const moduleOneNotes = buildBiblicalFoundationNotes(
    blueprint,
    topic,
    lessonNumber,
  );
  const moduleTwoNotes = buildLeadershipApplicationNotes(
    blueprint,
    topic,
    isRwandaLeadership,
  );

  return {
    title: `Lesson ${lessonNumber}: ${topic.title}`,
    description: topic.focus,
    content: [
      `${topic.focus} This lesson is designed for Adventist youth development and practical ministry impact.`,
      "Learners are expected to demonstrate biblical understanding, contextual reasoning, and ministry application through reflection, collaboration, and assignment delivery.",
      "The session combines doctrine, leadership ethics, and practical execution for measurable discipleship outcomes.",
    ].join(" "),
    objectives: [
      `Explain key concepts from ${topic.title}.`,
      "Connect biblical principles to real ministry context.",
      "Apply the lesson through personal and community action.",
    ],
    images: [`${MEDIA_BASE}/images/${slug}.jpg`],
    videos: [`${MEDIA_BASE}/videos/${slug}.mp4`],
    audios: [`${MEDIA_BASE}/audio/${slug}.mp3`],
    durationMinutes: 45,
    instructor: instructorId,
    course: courseId,
    order: lessonNumber,
    category: blueprint.categoryName,
    modules: [
      {
        moduleTitle: `Module 1: Biblical Foundation - ${topic.title}`,
        order: 1,
        content: {
          text: `${topic.focus} Biblical framing and doctrinal grounding are emphasized for clear Adventist identity.`,
          notes: moduleOneNotes,
          scriptureReferences: topic.scripture,
          image: `${MEDIA_BASE}/images/${slug}-module-1.jpg`,
          video: `${MEDIA_BASE}/videos/${slug}-module-1.mp4`,
          audio: `${MEDIA_BASE}/audio/${slug}-module-1.mp3`,
          images: [`${MEDIA_BASE}/images/${slug}-timeline.jpg`],
          videos: [`${MEDIA_BASE}/videos/${slug}-overview.mp4`],
          audios: [`${MEDIA_BASE}/audio/${slug}-summary.mp3`],
        },
        questions: [primaryQuestion],
        discussionPrompt:
          "Discuss how this biblical principle can improve youth discipleship in your church.",
        practicalAssignment:
          "Prepare a one-page ministry action note from this module and share it with your small group.",
        spiritualReflection:
          "Write a short prayer showing how this lesson can shape your leadership character.",
      },
      {
        moduleTitle: `Module 2: Leadership Application - ${topic.title}`,
        order: 2,
        content: {
          text:
            "This module turns biblical and theoretical concepts into concrete leadership and mission activities.",
          notes: moduleTwoNotes,
          scriptureReferences: topic.scripture,
          image: `${MEDIA_BASE}/images/${slug}-module-2.jpg`,
          video: `${MEDIA_BASE}/videos/${slug}-module-2.mp4`,
          audio: `${MEDIA_BASE}/audio/${slug}-module-2.mp3`,
        },
        questions: [
          mcq(
            "Which action best demonstrates faithful application of this lesson?",
            [
              "Ignore community needs",
              "Apply biblical principles with accountability",
              "Wait for others to act first",
            ],
            "Apply biblical principles with accountability",
          ),
        ],
        discussionPrompt:
          "Share one leadership action you will complete this week based on this module.",
        practicalAssignment: isRwandaLeadership
          ? "Design a local youth leadership exercise that supports reconciliation, unity, and evangelism."
          : "Run one practical activity from this module and submit a short report.",
        spiritualReflection: isRwandaLeadership
          ? "Reflect on ethical leadership in Rwanda and write a commitment statement for healing-centered ministry."
          : "Reflect on one personal attitude that must change for better ministry outcomes.",
      },
    ],
    quiz: {
      questions: [
        primaryQuestion,
        tf(
          "Applying lesson principles consistently leads to stronger youth ministry outcomes.",
          true,
        ),
      ],
      passingScore: 70,
    },
    interactiveElements: {
      discussionPrompts: [
        "What truth from this lesson is most urgent for your current ministry context?",
      ],
      practicalAssignments: [
        "Complete your assignment and present key learnings during the next youth meeting.",
      ],
      spiritualReflections: [
        "Journal how this lesson helps you become a more faithful Adventist youth leader.",
      ],
    },
  };
};

const seedCurriculum = async () => {
  await connectDB();

  try {
    await Lesson.deleteMany({});
    await Course.deleteMany({});

    const instructor = await createDefaultInstructor();

    let totalCourses = 0;
    let totalLessons = 0;
    const categorySet = new Set<string>();

    for (const blueprint of curriculumBlueprints) {
      categorySet.add(blueprint.categoryName);

      const course = await Course.create({
        title: blueprint.courseName,
        description: blueprint.description,
        learningGoal: blueprint.learningGoal,
        category: blueprint.categoryName,
        frameworkCategory: blueprint.frameworkCategory,
        level: blueprint.level,
        targetGroup: blueprint.targetGroup,
        durationWeeks: blueprint.durationWeeks,
        duration: blueprint.durationWeeks * 7 * 45,
        instructor: instructor._id,
        exam: {
          questions: blueprint.examQuestions.map((question) => ({
            ...question,
            points:
              question.points ||
              (question.type === "essay" ? 5 : question.type === "short-answer" ? 3 : 1),
          })),
          passingScore: 70,
          durationMinutes: 90,
        },
        interactiveElements: {
          discussionPrompts: [
            "How should this course shape Adventist youth leadership and discipleship in your local context?",
          ],
          practicalAssignments: [
            "Apply at least one concept from each lesson and document outcomes.",
          ],
          spiritualReflections: [
            "Track weekly spiritual growth linked to course objectives.",
          ],
        },
      });

      totalCourses += 1;

      const lessonIds: mongoose.Types.ObjectId[] = [];

      for (const [index, topic] of blueprint.topics.entries()) {
        const lessonPayload = buildLessonPayload(
          blueprint,
          topic,
          index,
          instructor._id as mongoose.Types.ObjectId,
          course._id as mongoose.Types.ObjectId,
        );

        const lesson = await Lesson.create(lessonPayload);
        lessonIds.push(lesson._id as mongoose.Types.ObjectId);
        totalLessons += 1;
      }

      course.lessons = lessonIds;
      await course.save();
    }

    const summaryByFramework = curriculumBlueprints.reduce(
      (acc, item) => {
        acc[item.frameworkCategory] = (acc[item.frameworkCategory] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("Curriculum seeding complete.");
    console.log(`Categories represented: ${categorySet.size}`);
    console.log(`Courses inserted: ${totalCourses}`);
    console.log(`Lessons inserted: ${totalLessons}`);
    console.log("Framework distribution:", summaryByFramework);
    console.log("Category descriptions:", categoryDescriptionByCode);
  } catch (error) {
    console.error("Failed to seed curriculum:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedCurriculum();
