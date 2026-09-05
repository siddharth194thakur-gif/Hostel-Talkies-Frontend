import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { CommunityGuidelinesPage } from './pages/CommunityGuidelinesPage';
import { ContactPage } from './pages/ContactPage';

// Protected Pages
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { LostFoundPage } from './pages/LostFoundPage';
import { ServicesPage } from './pages/ServicesPage';
import { StudyResourcesPage } from './pages/StudyResourcesPage';
import { EventsPage } from './pages/EventsPage';
import { NoticesPage } from './pages/NoticesPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SavedPostsPage } from './pages/SavedPostsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AdminPage } from './pages/AdminPage';
import { GamingHubPage } from './pages/GamingHubPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Layout Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/guidelines" element={<CommunityGuidelinesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Protected Student Layout Routes */}

          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/lost-found" element={<LostFoundPage />} />
            <Route path="/services" element={<Navigate to="/dashboard" replace />} />
            <Route path="/study" element={<StudyResourcesPage />} />
            <Route path="/gaming" element={<GamingHubPage />} />
            <Route path="/custom-rooms" element={<GamingHubPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/saved" element={<SavedPostsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
