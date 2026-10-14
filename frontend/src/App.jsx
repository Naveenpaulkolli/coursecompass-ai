import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking backend...");

  const [formData, setFormData] = useState({
    studentName: "",
    courseName: "",
    difficultTopic: "",
    examDate: "",
    availableStudyHours: "",
    confidenceLevel: "",
  });

  const [studyPlan, setStudyPlan] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");

  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Check backend connection
  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus("Backend connection failed"));

    const storedPlans =
      JSON.parse(localStorage.getItem("courseCompassPlans")) || [];

    setSavedPlans(storedPlans);
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const validateForm = () => {
    const hasEmptyField = Object.values(formData).some(
      (value) => String(value).trim() === ""
    );

    if (hasEmptyField) {
      setError("Please complete all fields before generating a study plan.");
      return false;
    }

    setError("");
    return true;
  };

  // Generate Study Plan
  const generateStudyPlan = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoadingPlan(true);
      setError("");
      setStudyPlan(null);
      setQuestions([]);
      setCompletedTasks([]);

      const response = await fetch(
        "/api/study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to generate study plan.");
      }

      setStudyPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Generate Practice Questions
  const generatePracticeQuestions = async () => {
    if (!formData.courseName || !formData.difficultTopic) {
      setError("Enter a course name and difficult topic first.");
      return;
    }

    try {
      setLoadingQuestions(true);
      setError("");
      setQuestions([]);

      const response = await fetch(
        "/api/practice-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseName: formData.courseName,
            difficultTopic: formData.difficultTopic,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to generate practice questions."
        );
      }

      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Progress Tracking
  const toggleTask = (index) => {
    setCompletedTasks((previous) =>
      previous.includes(index)
        ? previous.filter((taskIndex) => taskIndex !== index)
        : [...previous, index]
    );
  };

  // Save Study Plan
  const saveStudyPlan = () => {
    if (!studyPlan) return;

    const planToSave = {
      ...studyPlan,
      savedAt: new Date().toLocaleString(),
    };

    const updatedPlans = [...savedPlans, planToSave];

    setSavedPlans(updatedPlans);

    localStorage.setItem(
      "courseCompassPlans",
      JSON.stringify(updatedPlans)
    );
  };

  // Feedback
  const submitFeedback = (event) => {
    event.preventDefault();

    if (!feedback.trim()) {
      setFeedbackMessage("Please enter feedback before submitting.");
      return;
    }

    const previousFeedback =
      JSON.parse(localStorage.getItem("courseCompassFeedback")) || [];

    const updatedFeedback = [
      ...previousFeedback,
      {
        feedback,
        submittedAt: new Date().toLocaleString(),
      },
    ];

    localStorage.setItem(
      "courseCompassFeedback",
      JSON.stringify(updatedFeedback)
    );

    setFeedback("");
    setFeedbackMessage("Thank you! Your feedback was submitted.");
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>CourseCompass AI</h1>
        <p>Your personalized AI-powered study planner</p>
      </header>

      <main>
        <section className="card status-card">
          <h2>System Status</h2>
          <p>
            Backend: <strong>{apiStatus}</strong>
          </p>
        </section>

        <section className="card">
          <h2>Student Study Planning Form</h2>

          <form onSubmit={generateStudyPlan} className="study-form">
            <label>
              Student Name
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Alex Student"
              />
            </label>

            <label>
              Course Name
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="Artificial Intelligence"
              />
            </label>

            <label>
              Difficult Topic
              <input
                type="text"
                name="difficultTopic"
                value={formData.difficultTopic}
                onChange={handleChange}
                placeholder="Machine Learning"
              />
            </label>

            <label>
              Exam Date
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
              />
            </label>

            <label>
              Available Study Hours
              <input
                type="number"
                min="1"
                name="availableStudyHours"
                value={formData.availableStudyHours}
                onChange={handleChange}
                placeholder="2"
              />
            </label>

            <label>
              Confidence Level
              <select
                name="confidenceLevel"
                value={formData.confidenceLevel}
                onChange={handleChange}
              >
                <option value="">Select confidence level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <button type="submit" disabled={loadingPlan}>
              {loadingPlan
                ? "Generating Study Plan..."
                : "Generate Study Plan"}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </section>

        {studyPlan && (
          <section className="card results-card">
            <h2>Your Study Plan</h2>

            <p>
              <strong>Student:</strong> {studyPlan.studentName}
            </p>

            <p>
              <strong>Course:</strong> {studyPlan.courseName}
            </p>

            <p>
              <strong>Difficult Topic:</strong>{" "}
              {studyPlan.difficultTopic}
            </p>

            <p>
              <strong>Exam Date:</strong> {studyPlan.examDate}
            </p>

            <p>
              <strong>Confidence:</strong>{" "}
              {studyPlan.confidenceLevel}
            </p>

            <h3>Recommended Study Tasks</h3>

            <div className="task-list">
              {Array.isArray(studyPlan.studyTasks) &&
                studyPlan.studyTasks.map((item, index) => (
                  <label className="task-item" key={index}>
                    <input
                      type="checkbox"
                      checked={completedTasks.includes(index)}
                      onChange={() => toggleTask(index)}
                    />

                    <span
                      className={
                        completedTasks.includes(index)
                          ? "completed"
                          : ""
                      }
                    >
                      <strong>{item.task}</strong> — {item.time}
                    </span>
                  </label>
                ))}
            </div>

            <p className="progress">
              Progress: {completedTasks.length} /{" "}
              {studyPlan.studyTasks?.length || 0} tasks completed
            </p>

            <div className="button-row">
              <button
                type="button"
                onClick={generatePracticeQuestions}
                disabled={loadingQuestions}
              >
                {loadingQuestions
                  ? "Generating Questions..."
                  : "Generate Practice Questions"}
              </button>

              <button type="button" onClick={saveStudyPlan}>
                Save Study Plan
              </button>
            </div>
          </section>
        )}

        {questions.length > 0 && (
          <section className="card">
            <h2>Practice Questions</h2>

            <ol>
              {questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ol>
          </section>
        )}

        <section className="card">
          <h2>Saved Study Plans</h2>

          {savedPlans.length === 0 ? (
            <p>No saved plans yet.</p>
          ) : (
            <div className="saved-plans">
              {savedPlans.map((plan, index) => (
                <div className="saved-plan" key={index}>
                  <strong>{plan.courseName}</strong>
                  <p>Topic: {plan.difficultTopic}</p>
                  <p>Student: {plan.studentName}</p>
                  <small>Saved: {plan.savedAt}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Feedback</h2>

          <form onSubmit={submitFeedback}>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Tell us whether the study recommendations were helpful..."
              rows="4"
            />

            <button type="submit">Submit Feedback</button>
          </form>

          {feedbackMessage && <p>{feedbackMessage}</p>}
        </section>

        <section className="card responsible-ai">
          <h2>Responsible AI</h2>

          <p>
            AI-generated study plans, practice questions, and explanations
            are intended as learning support and may contain errors.
            Students should verify important academic information with
            instructors and official course materials.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;