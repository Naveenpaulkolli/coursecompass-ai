const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "100kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CourseCompass AI API is working",
  });
});

// Generate Study Plan
app.post("/api/study-plan", (req, res) => {
  const {
    studentName,
    courseName,
    difficultTopic,
    examDate,
    availableStudyHours,
    confidenceLevel,
  } = req.body;

  if (
    !studentName ||
    !courseName ||
    !difficultTopic ||
    !examDate ||
    !availableStudyHours ||
    !confidenceLevel
  ) {
    return res.status(400).json({
      message: "Please complete all required fields.",
    });
  }

  const studyTasks = [
    {
      task: `Review ${difficultTopic} concepts`,
      time: "1 hour",
    },
    {
      task: `Practice problems on ${difficultTopic}`,
      time: "1.5 hours",
    },
    {
      task: `Take a mock test for ${courseName}`,
      time: "2 hours",
    },
    {
      task: `Group study session on ${difficultTopic}`,
      time: "1 hour",
    },
    {
      task: "Revise notes and key points",
      time: "30 minutes",
    },
  ];

  res.json({
    studentName,
    courseName,
    difficultTopic,
    examDate,
    availableStudyHours,
    confidenceLevel,
    studyTasks,
  });
});

// Generate Practice Questions
app.post("/api/practice-questions", (req, res) => {
  const { courseName, difficultTopic } = req.body;

  if (!courseName || !difficultTopic) {
    return res.status(400).json({
      message: "Course name and difficult topic are required.",
    });
  }

  const questions = [
    `What are the key concepts of ${difficultTopic} in ${courseName}?`,
    `Explain the most challenging aspect of ${difficultTopic} in ${courseName}.`,
    `Provide an example problem related to ${difficultTopic} and explain how you would solve it.`,
  ];

  res.json({
    courseName,
    difficultTopic,
    questions,
  });
});

// Serve the built React frontend
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// Send React app for non-API browser routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      message: "API route not found.",
    });
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `CourseCompass AI backend running on http://localhost:${PORT}`
  );
});