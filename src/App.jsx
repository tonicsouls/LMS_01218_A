/**
 * PHOENIX UNIFIED - Main App Entry
 * LMS_01218_A - Unified Architecture
 * Routes: Home → Launch → Player
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './views/HomeScreen';
import LaunchScreen from './views/LaunchScreen';
import UnifiedPlayer from './views/UnifiedPlayer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/launch" element={<LaunchScreen />} />
        <Route path="/player" element={<UnifiedPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

