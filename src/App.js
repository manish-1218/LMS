import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Task from './components/Task';
import StartTask from './components/StartTask';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<StartTask />} />
          <Route path="/Task" element={<Task />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;



