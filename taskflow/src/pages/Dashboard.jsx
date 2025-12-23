import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { logout, setUser } from '../features/auth/authSlice';
import EmployeesPage from './admin/EmployeesPage';
import VacationsPage from './admin/VacationsPage';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import AppLayout from '../components/layout/AppLayout';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'vacations';
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((s) => s.auth);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && !user) {
        setLoadingUser(true);
        try {
          const profileRes = await api.getMyProfile(token);
          const profileData = profileRes?.data || profileRes;
          dispatch(setUser(profileData));
        } catch (err) {
          console.error('Error loading user profile:', err);
          dispatch(logout());
        } finally {
          setLoadingUser(false);
        }
      } else if (user) {
        setLoadingUser(false);
      }
    };
    fetchUserProfile();
  }, [token, user, dispatch]);

  useEffect(() => {
    if (user && !initialRedirectDone) {
      if (user.role === 'ADMIN') {
        setActiveTab('home');
      } else {
        setActiveTab('vacations');
      }
      setInitialRedirectDone(true);
    }
  }, [user, initialRedirectDone]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'employees' && user.role !== 'ADMIN') {
        setActiveTab('vacations');
      }
      if (activeTab === 'home' && user.role !== 'ADMIN') {
        setActiveTab('vacations');
      }
    }
  }, [user, activeTab]);


  const handleLogout = () => {
    localStorage.removeItem('activeTab');
    setInitialRedirectDone(false);
    dispatch(logout());
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-morphism rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Invalid session</h2>
          <p className="text-gray-600 mt-2">Please login again.</p>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      user={user}
    >
      {activeTab === 'home' && user?.role === 'ADMIN' && <HomePage />}
      {activeTab === 'employees' && user?.role === 'ADMIN' && <EmployeesPage />}
      {activeTab === 'vacations' && <VacationsPage />}
      {activeTab === 'profile' && <ProfilePage />}
    </AppLayout>
  );
}
