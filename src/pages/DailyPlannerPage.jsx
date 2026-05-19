import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, CheckCircleIcon, PlusCircleIcon, FolderIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import DailyPlan from "../components/DailyPlan";
import companyData from "../data/companyData.json";
import "./DailyPlannerPage.css";

const DailyPlannerPage = () => {
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [deadline, setDeadline] = useState(60);
  const [dailyHours, setDailyHours] = useState(3);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [customTask, setCustomTask] = useState({
    skill: "",
    hours: 1,
    topics: "",
    questions: 1,
    difficulty: "Medium",
    day: 1,
  });
  const [error, setError] = useState(null);
  const [planName, setPlanName] = useState("");
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [isPlansCollapsed, setIsPlansCollapsed] = useState(false);
  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false);

  // Request directory access for saving plans
  const requestDirectoryAccess = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      console.log("Directory access granted:", handle.name);
      setError({ message: "Directory selected for saving plans!", type: "success" });
      return handle;
    } catch (e) {
      console.error("Error accessing directory:", e);
      setError({ message: "Failed to access directory. Falling back to localStorage.", type: "error" });
      return null;
    }
  };

  // Save plans to file
  const savePlansToFile = async (plansToSave) => {
    if (!directoryHandle) {
      console.warn("No directory handle. Falling back to localStorage.");
      localStorage.setItem("dailyPlannerPlans", JSON.stringify(plansToSave));
      return;
    }
    try {
      const fileHandle = await directoryHandle.getFileHandle("plans.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(plansToSave, null, 2));
      await writable.close();
      console.log("Plans saved to plans.json at", new Date().toISOString());
    } catch (e) {
      console.error("Error saving plans to file:", e);
      setError({ message: "Failed to save plans to file. Using localStorage.", type: "error" });
      localStorage.setItem("dailyPlannerPlans", JSON.stringify(plansToSave));
    }
  };

  // Load plans from file
  const loadPlansFromFile = async () => {
    if (!directoryHandle) {
      console.warn("No directory handle. Trying localStorage.");
      return localStorage.getItem("dailyPlannerPlans");
    }
    try {
      const fileHandle = await directoryHandle.getFileHandle("plans.json", { create: false });
      const file = await fileHandle.getFile();
      const text = await file.text();
      console.log("Loaded plans from plans.json:", text);
      return text;
    } catch (e) {
      console.warn("Error loading plans from file:", e);
      return localStorage.getItem("dailyPlannerPlans");
    }
  };

  // Load plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      console.log("Loading plans at", new Date().toISOString());
      try {
        const savedPlans = await loadPlansFromFile();
        const savedCurrentPlanId = localStorage.getItem("dailyPlannerCurrentPlanId");
        if (savedPlans) {
          const parsedPlans = JSON.parse(savedPlans);
          if (Array.isArray(parsedPlans)) {
            const sanitizedPlans = parsedPlans
              .map((p, index) => {
                if (!p.id || !p.name || !p.plan || !p.progress || !p.inputs) {
                  console.warn(`Invalid plan at index ${index}:`, p);
                  return null;
                }
                return {
                  id: p.id,
                  name: p.name,
                  plan: Array.isArray(p.plan)
                    ? p.plan.map((task) => ({
                        ...task,
                        completed: task.completed || false,
                        isCustom: task.isCustom || false,
                        day: Number(task.day) || 1,
                      }))
                    : [],
                  progress:
                    p.progress && typeof p.progress === "object"
                      ? {
                          skillsMastered: Number(p.progress.skillsMastered) || 0,
                          questionsSolved: Number(p.progress.questionsSolved) || 0,
                          hoursLogged: Number(p.progress.hoursLogged) || 0,
                          completedTasks: Array.isArray(p.progress.completedTasks)
                            ? p.progress.completedTasks
                            : [],
                        }
                      : { skillsMastered: 0, questionsSolved: 0, hoursLogged: 0, completedTasks: [] },
                  inputs:
                    p.inputs && typeof p.inputs === "object"
                      ? {
                          companies: Array.isArray(p.inputs.companies) ? p.inputs.companies : [],
                          deadline: Number(p.inputs.deadline) || 60,
                          dailyHours: Number(p.inputs.dailyHours) || 3,
                        }
                      : { companies: [], deadline: 60, dailyHours: 3 },
                  isVisible: typeof p.isVisible === "boolean" ? p.isVisible : true,
                };
              })
              .filter((p) => p !== null);
            setPlans(sanitizedPlans);
            if (savedCurrentPlanId && sanitizedPlans.some((p) => p.id === savedCurrentPlanId)) {
              setCurrentPlanId(savedCurrentPlanId);
              const currentPlan = sanitizedPlans.find((p) => p.id === savedCurrentPlanId);
              if (currentPlan && currentPlan.inputs) {
                setSelectedCompanies(currentPlan.inputs.companies);
                setDeadline(currentPlan.inputs.deadline);
                setDailyHours(currentPlan.inputs.dailyHours);
              }
            }
          } else {
            throw new Error("Saved plans is not an array");
          }
        }
      } catch (e) {
        console.error("Error loading plans:", e);
        setError({ message: "Failed to load saved plans. Starting fresh.", type: "error" });
      }
    };
    loadPlans();
  }, [directoryHandle]);

  // Save plans and current plan ID
  useEffect(() => {
    console.log("Saving plans at", new Date().toISOString());
    savePlansToFile(plans);
    localStorage.setItem("dailyPlannerCurrentPlanId", currentPlanId || "");
  }, [plans, currentPlanId, directoryHandle]);

  // Current plan with fallback
  const currentPlan = plans.find((p) => p.id === currentPlanId) || {
    plan: [],
    progress: { skillsMastered: 0, questionsSolved: 0, hoursLogged: 0, completedTasks: [] },
    inputs: { companies: [], deadline: 60, dailyHours: 3 },
    isVisible: true,
    name: "Current Plan",
  };

  // Calculate progress
  const totalRequiredHours = currentPlan.inputs.companies.reduce((sum, companyName) => {
    const company = companyData.find((c) => c.name === companyName);
    return sum + (company ? company.skills.reduce((s, skill) => s + (skill.hours || 0), 0) : 0);
  }, 0);
  const progressPercentage = totalRequiredHours > 0 ? Math.min((currentPlan.progress.hoursLogged / totalRequiredHours) * 100, 100) : 0;

  const handleCompanyToggle = (companyName) => {
    console.log("Toggling company:", companyName);
    setSelectedCompanies((prev) =>
      prev.includes(companyName) ? prev.filter((name) => name !== companyName) : [...prev, companyName]
    );
  };

  const generatePlan = () => {
    console.log("Generating plan with:", { selectedCompanies, deadline, dailyHours, planName });
    
    // Use default plan name if none provided
    const effectivePlanName = planName || `Plan ${new Date().toISOString().split("T")[0]}`;
    
    // Validate inputs
    if (selectedCompanies.length === 0) {
      setError({ message: "Select at least one company!", type: "error" });
      return;
    }
    if (deadline < 1 || dailyHours < 1) {
      setError({ message: "Deadline and daily hours must be positive!", type: "error" });
      return;
    }
    if (!companyData || !Array.isArray(companyData)) {
      setError({ message: "Company data is missing or invalid!", type: "error" });
      return;
    }

    try {
      // Step 1: Build skill map with unique topics and questions
      const skillMap = {};
      const usedTopics = new Set();
      const usedQuestions = new Set();
      selectedCompanies.forEach((companyName) => {
        const company = companyData.find((c) => c.name === companyName);
        if (!company || !Array.isArray(company.skills)) {
          console.warn(`Company not found or invalid skills: ${companyName}`);
          return;
        }
        company.skills.forEach((skill) => {
          if (!skill.name || !skill.hours || !Array.isArray(skill.topics) || !Array.isArray(skill.questions)) {
            console.warn(`Invalid skill data for ${companyName}:`, skill);
            return;
          }
          const key = `${companyName}:${skill.name}`;
          const uniqueTopics = skill.topics.filter((topic) => {
            const topicKey = `${companyName}:${typeof topic === "object" ? topic.name : topic}`;
            if (usedTopics.has(topicKey)) return false;
            usedTopics.add(topicKey);
            return true;
          });
          const uniqueQuestions = skill.questions.filter((q) => {
            const questionKey = `${companyName}:${typeof q === "string" ? q : q.title}`;
            if (usedQuestions.has(questionKey)) return false;
            usedQuestions.add(questionKey);
            return true;
          });
          skillMap[key] = {
            company: companyName,
            name: skill.name,
            hours: skill.hours,
            topics: uniqueTopics,
            questions: uniqueQuestions,
            questionCount: uniqueQuestions.length,
          };
        });
      });

      // Step 2: Create weighted skills list and sort by priority
      const skills = Object.entries(skillMap).map(([key, data]) => ({
        key,
        company: data.company,
        name: data.name,
        hours: data.hours,
        topics: data.topics,
        questions: data.questions,
        questionCount: data.questionCount,
        priority: data.hours,
      }));
      if (skills.length === 0) {
        setError({ message: "No valid skills found for selected companies!", type: "error" });
        return;
      }
      skills.sort((a, b) => b.priority - a.priority);

      // Step 3: Allocate tasks greedily within available hours
      const totalHours = deadline * dailyHours;
      const planDays = Array.from({ length: deadline }, () => ({
        tasks: [],
        remainingHours: dailyHours,
      }));
      let remainingTotalHours = totalHours;
      const remainingSkillHours = skills.map((skill) => ({ ...skill, remainingHours: skill.hours }));

      let currentDay = 0;
      while (remainingTotalHours > 0 && remainingSkillHours.some((skill) => skill.remainingHours > 0)) {
        let dailyHoursRemaining = planDays[currentDay].remainingHours;
        if (dailyHoursRemaining <= 0) {
          currentDay = (currentDay + 1) % deadline;
          continue;
        }

        for (const skill of remainingSkillHours) {
          if (dailyHoursRemaining <= 0 || skill.remainingHours <= 0 || remainingTotalHours <= 0) continue;

          const allocatedHours = Math.min(dailyHoursRemaining, skill.remainingHours, remainingTotalHours);
          if (allocatedHours > 0) {
            const questionsToSolve = Math.ceil(allocatedHours / 2);
            const difficulty = skill.questions.some((q) => (typeof q === "string" ? q : q.title).includes("(Hard)"))
              ? questionsToSolve > 1
                ? "Mixed"
                : "Hard"
              : skill.questions.some((q) => (typeof q === "string" ? q : q.title).includes("(Medium)"))
              ? "Medium"
              : "Easy";
            const randomTopics = skill.topics
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.min(2, skill.topics.length))
              .map((topic) => ({ name: typeof topic === "string" ? topic : topic.name }));
            const randomQuestions = skill.questions
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.min(questionsToSolve, skill.questions.length))
              .map((q) => (typeof q === "string" ? { title: q } : { title: q.title, problemLink: q.problemLink || "" }));

            planDays[currentDay].tasks.push({
              skill: skill.name,
              company: skill.company,
              hours: allocatedHours,
              topics: randomTopics,
              questions: questionsToSolve,
              questionTitles: randomQuestions,
              difficulty,
              completed: false,
              isCustom: false,
              day: currentDay + 1,
            });

            skill.remainingHours -= allocatedHours;
            dailyHoursRemaining -= allocatedHours;
            remainingTotalHours -= allocatedHours;
            planDays[currentDay].remainingHours = dailyHoursRemaining;
          }
        }
        currentDay = (currentDay + 1) % deadline;
      }

      // Step 4: Warn if not all skills were covered
      const uncoveredSkills = remainingSkillHours.filter((skill) => skill.remainingHours > 0);
      if (uncoveredSkills.length > 0) {
        console.warn("Not all skills could be covered:", uncoveredSkills);
        setError({
          message: `Not enough hours to cover all skills (e.g., ${uncoveredSkills[0]?.name}). Try increasing deadline or hours.`,
          type: "warning",
        });
      }

      // Step 5: Flatten planDays into a single plan array
      const finalPlan = planDays
        .map((day, index) => day.tasks.map((task) => ({ ...task, day: index + 1 })))
        .flat();

      // Step 6: Create and save the new plan
      const newPlan = {
        id: crypto.randomUUID(),
        name: effectivePlanName,
        plan: finalPlan,
        progress: { skillsMastered: 0, questionsSolved: 0, hoursLogged: 0, completedTasks: [] },
        inputs: { companies: selectedCompanies, deadline, dailyHours },
        isVisible: true,
      };

      setPlans((prev) => [...prev, newPlan]);
      setCurrentPlanId(newPlan.id);
      setPlanName(""); // Reset plan name after generation
      setSelectedCompanies([]); // Reset form
      setDeadline(60);
      setDailyHours(3);
      setError({ message: "Plan generated successfully! Check the Study Plan section.", type: "success" });
      console.log("Plan generated successfully:", newPlan);
    } catch (e) {
      console.error("Error generating plan:", e);
      setError({ message: "Failed to generate plan. Please check inputs and try again.", type: "error" });
    }
  };

  const savePlan = () => {
    console.log("Saving plan:", { planName, currentPlanId });
    if (!planName) {
      setError({ message: "Enter a plan name!", type: "error" });
      return;
    }
    if (!currentPlanId) {
      setError({ message: "No plan to save. Generate a plan first!", type: "error" });
      return;
    }
    setPlans((prev) =>
      prev.map((p) =>
        p.id === currentPlanId
          ? { ...p, name: planName, plan: currentPlan.plan, progress: currentPlan.progress, inputs: currentPlan.inputs }
          : p
      )
    );
    setPlanName("");
    setError({ message: "Plan saved successfully!", type: "success" });
  };

  const resetPlan = () => {
    console.log("Resetting plan:", currentPlanId);
    setSelectedCompanies([]);
    setDeadline(60);
    setDailyHours(3);
    setCurrentPlanId(null);
    setPlans((prev) => prev.filter((p) => p.id !== currentPlanId));
    setError({ message: "Plan reset successfully!", type: "success" });
  };

  const loadPlan = (planId) => {
    console.log("Loading plan:", planId);
    const planToLoad = plans.find((p) => p.id === planId);
    if (planToLoad) {
      setCurrentPlanId(planId);
      setSelectedCompanies(planToLoad.inputs.companies);
      setDeadline(planToLoad.inputs.deadline);
      setDailyHours(planToLoad.inputs.dailyHours);
      setError({ message: `Loaded plan: ${planToLoad.name}`, type: "success" });
    } else {
      setError({ message: "Plan not found!", type: "error" });
    }
  };

  const togglePlanVisibility = (planId) => {
    console.log("Toggling visibility for plan:", planId);
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, isVisible: !p.isVisible } : p))
    );
    if (planId === currentPlanId && !plans.find((p) => p.id === planId).isVisible) {
      setCurrentPlanId(null);
      setSelectedCompanies([]);
      setDeadline(60);
      setDailyHours(3);
      setError({ message: "Current plan hidden. Select another plan or create a new one.", type: "info" });
    }
  };

  const importPlans = (event) => {
    console.log("Importing plans from file");
    const file = event.target.files[0];
    if (!file) {
      setError({ message: "No file selected!", type: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPlans = JSON.parse(e.target.result);
        if (!Array.isArray(importedPlans)) {
          throw new Error("Imported file is not an array of plans");
        }
        const sanitizedPlans = importedPlans
          .map((p, index) => {
            if (!p.id || !p.name || !p.plan || !p.progress || !p.inputs) {
              return null;
            }
            return {
              id: p.id || crypto.randomUUID(),
              name: p.name || `Imported Plan ${index + 1}`,
              plan: Array.isArray(p.plan)
                ? p.plan.map((task) => ({
                    ...task,
                    completed: task.completed || false,
                    isCustom: task.isCustom || false,
                    day: Number(task.day) || 1,
                  }))
                : [],
              progress:
                p.progress && typeof p.progress === "object"
                  ? {
                      skillsMastered: Number(p.progress.skillsMastered) || 0,
                      questionsSolved: Number(p.progress.questionsSolved) || 0,
                      hoursLogged: Number(p.progress.hoursLogged) || 0,
                      completedTasks: Array.isArray(p.progress.completedTasks)
                        ? p.progress.completedTasks
                        : [],
                    }
                  : { skillsMastered: 0, questionsSolved: 0, hoursLogged: 0, completedTasks: [] },
              inputs:
                p.inputs && typeof p.inputs === "object"
                  ? {
                      companies: Array.isArray(p.inputs.companies) ? p.inputs.companies : [],
                      deadline: Number(p.inputs.deadline) || 60,
                      dailyHours: Number(p.inputs.dailyHours) || 3,
                    }
                  : { companies: [], deadline: 60, dailyHours: 3 },
              isVisible: typeof p.isVisible === "boolean" ? p.isVisible : true,
            };
          })
          .filter((p) => p !== null);
        setPlans((prev) => [...prev, ...sanitizedPlans]);
        setError({ message: "Plans imported successfully! Select a plan to load.", type: "success" });
        savePlansToFile([...plans, ...sanitizedPlans]);
      } catch (e) {
        setError({ message: "Failed to import plans. Ensure the file is a valid JSON array.", type: "error" });
      }
    };
    reader.readAsText(file);
  };

  const exportPlan = () => {
    console.log("Exporting plans");
    try {
      const dataStr = JSON.stringify(plans, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all-plans.json";
      link.click();
      URL.revokeObjectURL(url);
      setError({ message: "All plans exported as JSON!", type: "success" });
    } catch (e) {
      setError({ message: "Failed to export plans. Please try again.", type: "error" });
    }
  };

  const selectDirectory = async () => {
    console.log("Selecting directory");
    const handle = await requestDirectoryAccess();
    if (handle) {
      setDirectoryHandle(handle);
    }
  };

  const handleMarkDone = (taskIndex, completed) => {
    console.log(`Handling mark done/undo for task index: ${taskIndex}, setting completed to: ${completed}, Current plan ID: ${currentPlanId}`);
    const task = currentPlan.plan[taskIndex];
    if (!task) {
      console.error("Task not found at index:", taskIndex);
      setError({ message: "Task not found!", type: "error" });
      return;
    }
    const updatedPlan = currentPlan.plan.map((t, i) =>
      i === taskIndex ? { ...t, completed } : t
    );
    setPlans((prev) =>
      prev.map((p) =>
        p.id === currentPlanId
          ? {
              ...p,
              plan: updatedPlan,
              progress: {
                ...p.progress,
                skillsMastered: completed
                  ? p.progress.skillsMastered + (task.isCustom ? 0 : 1)
                  : Math.max(0, p.progress.skillsMastered - (task.isCustom ? 0 : 1)),
                questionsSolved: completed
                  ? p.progress.questionsSolved + task.questions
                  : Math.max(0, p.progress.questionsSolved - task.questions),
                hoursLogged: completed
                  ? p.progress.hoursLogged + task.hours
                  : Math.max(0, p.progress.hoursLogged - task.hours),
                completedTasks: completed
                  ? [...new Set([...p.progress.completedTasks, taskIndex])]
                  : p.progress.completedTasks.filter((i) => i !== taskIndex),
              },
            }
          : p
      )
    );
    setError({ message: completed ? "Task marked as done!" : "Task unmarked!", type: "success" });
  };

  const handleAddCustomTask = () => {
    console.log("Adding custom task:", customTask);
    if (!customTask.skill || !customTask.topics || customTask.day < 1 || customTask.day > deadline) {
      setError({ message: "Fill all fields and ensure day is within deadline!", type: "error" });
      return;
    }
    const newTask = {
      skill: customTask.skill,
      hours: Number(customTask.hours),
      topics: customTask.topics.split(",").map((t) => ({ name: t.trim() })),
      questions: Number(customTask.questions),
      questionTitles: [],
      difficulty: customTask.difficulty,
      completed: false,
      isCustom: true,
      day: Number(customTask.day),
    };
    setPlans((prev) =>
      prev.map((p) =>
        p.id === currentPlanId
          ? {
              ...p,
              plan: (() => {
                const newPlan = [...p.plan];
                const insertIndex = newPlan.findIndex((task) => task.day > customTask.day);
                if (insertIndex === -1) {
                  newPlan.push(newTask);
                } else {
                  newPlan.splice(insertIndex, 0, newTask);
                }
                return newPlan;
              })(),
            }
          : p
      )
    );
    setCustomTask({ skill: "", hours: 1, topics: "", questions: 1, difficulty: "Medium", day: 1 });
    setError({ message: "Custom task added successfully!", type: "success" });
  };

  const rescheduleMissed = () => {
    console.log("Rescheduling missed tasks");
    const missedTasks = currentPlan.plan.filter(
      (task, index) => !task.completed && task.day < new Date().getDate()
    );
    if (missedTasks.length === 0) {
      setError({ message: "No missed tasks to reschedule!", type: "info" });
      return;
    }
    setPlans((prev) =>
      prev.map((p) =>
        p.id === currentPlanId
          ? {
              ...p,
              plan: [
                ...p.plan.filter((task) => task.completed || task.day >= new Date().getDate()),
                ...missedTasks.map((task, index) => ({
                  ...task,
                  day: Math.min(deadline, new Date().getDate() + index + 1),
                })),
              ],
            }
          : p
      )
    );
    setError({ message: "Missed tasks rescheduled to the end!", type: "success" });
  };

  const shufflePlan = () => {
    console.log("Shuffling plan");
    setPlans((prev) =>
      prev.map((p) =>
        p.id === currentPlanId
          ? {
              ...p,
              plan: [...p.plan].sort(() => Math.random() - 0.5).map((task, index) => ({
                ...task,
                day: Math.floor(index / (p.plan.length / deadline)) + 1,
              })),
            }
          : p
      )
    );
    setError({ message: "Plan shuffled successfully!", type: "success" });
  };

  const getEligibleCompanies = () => {
    return companyData
      .filter((company) => {
        const requiredHours = company.skills.reduce((sum, skill) => sum + (skill.hours || 0), 0);
        const completedHours = currentPlan.plan
          .filter((task) => task.completed && task.company === company.name)
          .reduce((sum, task) => sum + task.hours, 0);
        return requiredHours > 0 && completedHours / requiredHours >= 0.8;
      })
      .map((company) => company.name);
  };

  return (
    <motion.div
      className="dpp-planner-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <motion.div
          className={`dpp-toast dpp-toast-${error.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <span className="dpp-toast-icon">
            {error.type === "success" ? (
              <CheckCircleIcon />
            ) : error.type === "error" ? (
              <svg className="dpp-toast-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="dpp-toast-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          {error.message}
        </motion.div>
      )}
      <section className="dpp-hero" aria-label="Daily Planner Header">
        <h1 className="dpp-hero-title">Placement Tutor</h1>
        <p className="dpp-hero-subtitle">Your Path to DSA Mastery</p>
      </section>

      {/* Algorithm Explanation Modal */}
      <AnimatePresence>
        {showAlgorithmModal && (
          <motion.div
            className="dpp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowAlgorithmModal(false)}
          >
            <motion.div
              className="dpp-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="dpp-modal-title">How the Plan is Generated</h2>
              <p className="dpp-modal-content">
                Our planner uses a <strong>greedy algorithm</strong> to create your study plan:
              </p>
              <ul className="dpp-modal-list">
                <li>
                  <strong>Prioritize Skills</strong>: We start with skills that require the most hours to ensure critical topics are covered first.
                </li>
                <li>
                  <strong>Spread Tasks</strong>: Tasks are distributed across your deadline days to balance your daily workload, cycling through days to avoid overloading.
                </li>
                <li>
                  <strong>Assign Resources</strong>: For each skill, we select up to 2 topics and a number of questions (based on hours) to study, with YouTube search links for learning.
                </li>
                <li>
                  <strong>Handle Constraints</strong>: If there aren’t enough hours, some skills may not be fully covered, and we’ll notify you to adjust your deadline or hours.
                </li>
              </ul>
              <p className="dpp-modal-content">
                This approach ensures you focus on high-priority skills first while fitting your schedule!
              </p>
              <motion.button
                className="dpp-action-button dpp-button-secondary"
                onClick={() => setShowAlgorithmModal(false)}
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="dpp-progress" aria-label="Progress Dashboard">
        <h2 className="dpp-section-heading">Progress: {currentPlan.name}</h2>
        <div className="dpp-progress-bar-container">
          <motion.div
            className="dpp-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="dpp-progress-bar-label">{Math.round(progressPercentage)}%</span>
          </motion.div>
          <div className="dpp-progress-bar-labels">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="dpp-progress-stats">
          <motion.div
            className="dpp-stat"
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircleIcon className="dpp-stat-icon" />
            <p>
              Skills Mastered: <strong>{currentPlan.progress.skillsMastered}</strong>
            </p>
          </motion.div>
          <motion.div
            className="dpp-stat"
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircleIcon className="dpp-stat-icon" />
            <p>
              Questions Solved: <strong>{currentPlan.progress.questionsSolved}</strong>
            </p>
          </motion.div>
          <motion.div
            className="dpp-stat"
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CalendarIcon className="dpp-stat-icon" />
            <p>
              Hours Logged: <strong>{currentPlan.progress.hoursLogged}</strong>
            </p>
          </motion.div>
          <motion.div
            className="dpp-stat"
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ duration: 0.2 }}
          >
            <FolderIcon className="dpp-stat-icon" />
            <p>
              Eligible Companies: <strong>{getEligibleCompanies().length > 0 ? getEligibleCompanies().join(", ") : "None yet"}</strong>
            </p>
          </motion.div>
        </div>
      </section>

      <section className="dpp-plan-controls" aria-label="Plan Management">
        <h2 className="dpp-section-heading">Manage Plans</h2>
        <div className="dpp-input-group">
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Plan name (e.g., FAANG Prep)"
            className="dpp-input"
            aria-label="Plan name"
          />
          <motion.button
            className="dpp-action-button"
            onClick={() => {
              console.log("Save Plan button clicked");
              savePlan();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Plan
          </motion.button>
          <motion.button
            className="dpp-action-button dpp-button-secondary"
            onClick={() => {
              console.log("Reset Plan button clicked");
              resetPlan();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Plan
          </motion.button>
          <motion.button
            className="dpp-action-button dpp-button-secondary"
            onClick={() => {
              console.log("Select Directory button clicked");
              selectDirectory();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <FolderIcon className="dpp-button-icon" />
            Select Directory
          </motion.button>
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              console.log("Import Plans file selected");
              importPlans(e);
            }}
            className="dpp-file-input"
            aria-label="Import plans"
          />
          <motion.button
            className="dpp-action-button"
            onClick={() => {
              console.log("Export Plans button clicked");
              exportPlan();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Export Plans
          </motion.button>
          <motion.button
            className="dpp-action-button dpp-button-secondary"
            onClick={() => {
              console.log("How It Works button clicked");
              setShowAlgorithmModal(true);
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <InformationCircleIcon className="dpp-button-icon" />
            How It Works
          </motion.button>
        </div>
        <div className="dpp-saved-plans">
          <motion.div
            className="dpp-subheading-wrapper"
            onClick={() => setIsPlansCollapsed(!isPlansCollapsed)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="dpp-subheading">Saved Plans</h3>
            <motion.svg
              className="dpp-collapse-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: isPlansCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.div>
          <AnimatePresence>
            {!isPlansCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {plans.length === 0 ? (
                  <p className="dpp-info">No saved plans. Generate or import one!</p>
                ) : (
                  <ul className="dpp-plan-list">
                    <AnimatePresence>
                      {plans.map((p) => (
                        <motion.li
                          key={p.id}
                          className="dpp-plan-item"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span>{p.name} ({p.isVisible ? "Visible" : "Hidden"})</span>
                          <motion.button
                            className="dpp-action-button dpp-button-small"
                            onClick={() => {
                              console.log("Load Plan button clicked for:", p.id);
                              loadPlan(p.id);
                            }}
                            disabled={p.id === currentPlanId}
                            whileHover={{ scale: p.id === currentPlanId ? 1 : 1.05, rotate: p.id === currentPlanId ? 0 : 2 }}
                            whileTap={{ scale: p.id === currentPlanId ? 1 : 0.95 }}
                          >
                            Load
                          </motion.button>
                          <motion.button
                            className="dpp-action-button dpp-button-small dpp-button-secondary"
                            onClick={() => {
                              console.log("Toggle Visibility button clicked for:", p.id);
                              togglePlanVisibility(p.id);
                            }}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {p.isVisible ? "Hide" : "Show"}
                          </motion.button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="dpp-planner-form" aria-label="Planner Input">
        <h2 className="dpp-section-heading">Create Plan</h2>
        <div className="dpp-company-selection">
          {companyData.map((company) => (
            <motion.label
              key={company.name}
              className={`dpp-company-card ${selectedCompanies.includes(company.name) ? "dpp-selected" : ""}`}
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.name)}
                onChange={() => handleCompanyToggle(company.name)}
                className="dpp-checkbox"
              />
              <span className="dpp-company-name">{company.name}</span>
              <CheckCircleIcon className={`dpp-company-check ${selectedCompanies.includes(company.name) ? "visible" : ""}`} />
            </motion.label>
          ))}
        </div>
        <div className="dpp-input-group">
          <label className="dpp-label">
            Deadline (days):
            <input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
              min="1"
              placeholder="e.g., 60"
              className="dpp-input"
              aria-label="Deadline in days"
            />
          </label>
          <label className="dpp-label">
            Daily Hours:
            <input
              type="number"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              min="1"
              placeholder="e.g., 3"
              className="dpp-input"
              aria-label="Daily study hours"
            />
          </label>
        </div>
        <div className="dpp-button-group">
          <motion.div
            className="dpp-tooltip-wrapper"
            whileHover={{ scale: 1.05 }}
          >
            <motion.button
              className="dpp-action-button"
              onClick={() => {
                console.log("Generate Plan button clicked");
                generatePlan();
              }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              aria-describedby="generate-plan-tooltip"
            >
              Generate Plan
            </motion.button>
            <span className="dpp-tooltip" id="generate-plan-tooltip">
              Creates a study plan by prioritizing skills with more required hours and spreading tasks across days.
            </span>
          </motion.div>
          <motion.button
            className="dpp-action-button dpp-button-secondary"
            onClick={() => {
              console.log("Reschedule Missed button clicked");
              rescheduleMissed();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Reschedule Missed
          </motion.button>
          <motion.button
            className="dpp-action-button dpp-button-secondary"
            onClick={() => {
              console.log("Shuffle Plan button clicked");
              shufflePlan();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Shuffle Plan
          </motion.button>
        </div>
      </section>

      <section className="dpp-custom-task-form" aria-label="Custom Task Input">
        <h2 className="dpp-section-heading">Add Custom Task</h2>
        <div className="dpp-input-group">
          <label className="dpp-label">
            Skill:
            <input
              type="text"
              value={customTask.skill}
              onChange={(e) => setCustomTask({ ...customTask, skill: e.target.value })}
              placeholder="e.g., Graph Theory"
              className="dpp-input"
              aria-label="Custom skill"
            />
          </label>
          <label className="dpp-label">
            Hours:
            <input
              type="number"
              value={customTask.hours}
              onChange={(e) => setCustomTask({ ...customTask, hours: e.target.value })}
              min="1"
              placeholder="e.g., 1"
              className="dpp-input"
              aria-label="Custom task hours"
            />
          </label>
          <label className="dpp-label">
            Topics (comma-separated):
            <input
              type="text"
              value={customTask.topics}
              onChange={(e) => setCustomTask({ ...customTask, topics: e.target.value })}
              placeholder="e.g., DFS, BFS"
              className="dpp-input"
              aria-label="Custom task topics"
            />
          </label>
          <label className="dpp-label">
            Questions:
            <input
              type="number"
              value={customTask.questions}
              onChange={(e) => setCustomTask({ ...customTask, questions: e.target.value })}
              min="1"
              placeholder="e.g., 1"
              className="dpp-input"
              aria-label="Custom task questions"
            />
          </label>
          <label className="dpp-label">
            Difficulty:
            <select
              value={customTask.difficulty}
              onChange={(e) => setCustomTask({ ...customTask, difficulty: e.target.value })}
              className="dpp-input"
              aria-label="Custom task difficulty"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
          <label className="dpp-label">
            Day:
            <input
              type="number"
              value={customTask.day}
              onChange={(e) => setCustomTask({ ...customTask, day: Number(e.target.value) })}
              min="1"
              placeholder="e.g., 1"
              className="dpp-input"
              aria-label="Custom task day"
            />
          </label>
          <motion.button
            className="dpp-action-button"
            onClick={() => {
              console.log("Add Custom Task button clicked");
              handleAddCustomTask();
            }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircleIcon className="dpp-button-icon" />
            Add Task
          </motion.button>
        </div>
      </section>

      <section className="dpp-study-plan" aria-label="Study Plan">
        {currentPlan.isVisible ? (
          <DailyPlan plan={currentPlan.plan} onMarkDone={handleMarkDone} />
        ) : (
          <p className="dpp-info">Current plan is hidden. Show it or select another plan.</p>
        )}
      </section>
    </motion.div>
  );
};

export default DailyPlannerPage;