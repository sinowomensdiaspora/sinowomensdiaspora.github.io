import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Action from './pages/Action';
import Header from './components/Header';
import Map from './components/Map';
import './App.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Map supabase={supabase} />} />
          <Route path="/action" element={<Action />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
