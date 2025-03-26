import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Action from './pages/Action';
import Resources from './components/Resources';
import About from './pages/About';
import OneOfUs from './pages/OneOfUs';
import Layout from './components/Layout';
import Map from './components/Map';
import IncidentInfo from './pages/IncidentInfo';
import './App.css';
import { IncidentProvider } from './context/IncidentContext';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  return (
    <IncidentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Map supabase={supabase} />} />
            <Route path="/incident" element={<IncidentInfo supabase={supabase} />} />
            <Route path="/action" element={<Action />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/oneofus" element={<OneOfUs supabase={supabase} />} />
          </Routes>
        </Layout>
      </Router>
    </IncidentProvider>
  );
}

export default App;
