import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LeaderboardPage from './pages/LeaderboardPage';
import MethodsPage from './pages/MethodsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
        <Route path="/methods" element={<MethodsPage />} />
      </Routes>
    </Layout>
  );
}
