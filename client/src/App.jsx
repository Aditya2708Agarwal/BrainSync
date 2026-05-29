import './App.css'
import Landing from './pages/landing.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx'
import RoomPage from './pages/room.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rooms/:id" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
