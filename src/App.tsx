import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import AskAIPage from './pages/AskAIPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import StudentPage from './pages/StudentPage';
import ProductivityPage from './pages/ProductivityPage';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tool/:id" element={<ToolDetailPage />} />
            <Route path="/ask-ai" element={<AskAIPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/student" element={<StudentPage />} />
            <Route path="/productivity" element={<ProductivityPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
