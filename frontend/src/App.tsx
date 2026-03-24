//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentLogin from './components/StudentLogin';
import StudentRegister from './components/StudentRegister';
import JoinClassDashboard from './components/JoinClassDashboard';
import StudentSession from './components/StudentSession';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/join-class" element={<JoinClassDashboard />} />
        <Route path="/student-session/:code" element={<StudentSession />} />
      </Routes>
    </Router>
  );
}

export default App;
