import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import TambahKursus from './TambahKursus'; // <--- 1. Import fail baru
import Simulator from './Simulator'; // Import komponen baru

  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tambah-kursus" element={<TambahKursus />} /> {/* <--- 2. Daftarkan path */}
        <Route path="/simulator" element={<Simulator />} /> {/* <--- 3. Daftarkan path untuk Simulator */}
      </Routes>
    </Router>
  );
}

export default App;