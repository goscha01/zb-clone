import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter, Routes, Route } from 'react-router-dom';
import SignupForm from './pages/Signup';
import SignInForm from './pages/Signin';
import ZenbookerDashboard from './pages/dashboard';
import ZenbookerRequests from './pages/Request';
import ZenbookerSchedule from './pages/Schedule';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
    <Routes>
      <Route path='index' element={<App />} />
      <Route path='signup' element={<SignupForm />} />
      <Route path='login' element={<SignInForm />} />
      <Route path='dashboard' element={<ZenbookerDashboard />} />
      <Route path='request' element={<ZenbookerRequests />} />
      <Route path='schedule' element={<ZenbookerSchedule />} />
    </Routes>
  </HashRouter>
);
