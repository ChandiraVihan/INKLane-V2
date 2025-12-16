import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Lanyard from './Lanyard';
import Header from './Header';
import Card from './Card';
import './App.css';
import Home from './Home';
import WelcomeText from './WelcomeText';
import ElectricBorder from './ElectricBorder';
import { cards } from './data';
import Learning from './Learning';
import Todolist from './Todolist';
import AskAi from './AskAi';
import Login from './login';
import Register from './Register';
import DefaultPage from './DefaultPage';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [viewMode, setViewMode] = useState('welcome');
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (title) => {
    setViewMode('lanyard');
    setSelectedCard(title);
  };

  const handleHomeClick = () => {
    setViewMode('welcome');
    setSelectedCard(null);
  };

  const AppLayout = () => (
    <div className="app-container">
      <Header />
      <Home onClick={handleHomeClick} />
      <div className="main-content">
        {viewMode === 'welcome' ? (
          <WelcomeText text="Welcome to InkLane! Click a card to get started." />
        ) : (
          <Lanyard key={selectedCard} selectedCard={selectedCard} />
        )}
      </div>
      <div className="card-container">
        {cards.map((card, i) => (
          <ElectricBorder key={i} color={card.color} speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
            <Card title={card.title} text={card.text} onClick={() => handleCardClick(card.title)} />
          </ElectricBorder>
        ))}
      </div>
    </div>
  );

  const AuthLayout = () => (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );

  const router = createBrowserRouter([
    {
      path: '/',
      element: <DefaultPage />,
    },
    {
      path: '/app',
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
    },
    {
      path: '/learning',
      element: (
        <ProtectedRoute>
          <Learning />
        </ProtectedRoute>
      ),
    },
    {
      path: '/todolist',
      element: (
        <ProtectedRoute>
          <Todolist />
        </ProtectedRoute>
      ),
    },
    {
      path: '/ask-ai',
      element: (
        <ProtectedRoute>
          <AskAi />
        </ProtectedRoute>
      ),
    },
    {
      element: <AuthLayout />,
      children: [
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/register',
          element: <Register />,
        },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;