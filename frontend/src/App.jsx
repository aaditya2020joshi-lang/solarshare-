import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import NatureBackground from './components/NatureBackground';
import PresenceTracker from './components/PresenceTracker';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import TestBuilder from './pages/TestBuilder';
import TakeTest from './pages/TakeTest';
import TestResult from './pages/TestResult';
import Reminders from './pages/Reminders';
import Flashcards from './pages/Flashcards';
import FlashcardDeck from './pages/FlashcardDeck';
import Search from './pages/Search';
import Notes from './pages/Notes';
import NotesSubject from './pages/NotesSubject';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen transition-colors">
      <NatureBackground />
      <PresenceTracker />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:id"
          element={
            <ProtectedRoute>
              <SubjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id/edit"
          element={
            <ProtectedRoute>
              <TestBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id/take"
          element={
            <ProtectedRoute>
              <TakeTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempts/:id"
          element={
            <ProtectedRoute>
              <TestResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards/:subjectId"
          element={
            <ProtectedRoute>
              <FlashcardDeck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:subjectId"
          element={
            <ProtectedRoute>
              <NotesSubject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
