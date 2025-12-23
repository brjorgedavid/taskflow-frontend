import React from 'react'
import { useSelector } from 'react-redux'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import './App.css'

export default function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? <Dashboard /> : <LoginPage />
}
