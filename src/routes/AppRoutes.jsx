import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotesPage from "@/pages/NotesPage";
import PracticePage from "@/pages/PracticePage";
import AnimationsPage from "@/pages/AnimationsPage";
import BookmarksPage from "@/pages/BookmarksPage";
import AIHelpPage from "@/pages/AIHelpPage";
import DailyPlannerPage from "@/pages/DailyPlannerPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import MockInterviewPage from "@/pages/MockInterviewPage";
import SolvePage from "@/pages/SolvePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/daily-planner" element={<DailyPlannerPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/animations" element={<AnimationsPage />} />
      <Route path="/bookmarks" element={<BookmarksPage />} />
      <Route path="/ai-help" element={<AIHelpPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/mock-interview" element={<MockInterviewPage />} />
      <Route path="/solve/:problemId" element={<SolvePage />} />
    </Routes>
  );
};

export default AppRoutes;