/**
 * PHOENIX UNIFIED - Main App Entry
 * LMS_01218_A - Unified Architecture
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UnifiedPlayer from './views/UnifiedPlayer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UnifiedPlayer />} />
        <Route path="/player" element={<UnifiedPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
