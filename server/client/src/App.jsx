import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import Dashboard from './dashboard';
import TambahKursus from './TambahKursus';
import Simulator from './Simulator';
import SemakanKredit from './SemakanKredit';
import CartaPrestasi from './CartaPrestasi';
import PenilaianSubjek from './PenilaianSubjek';
import SidebarLayout from './components/SidebarLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<SidebarLayout><Dashboard /></SidebarLayout>} />
        <Route path="/tambah-kursus" element={<SidebarLayout><TambahKursus /></SidebarLayout>} />
        <Route path="/simulator" element={<SidebarLayout><Simulator /></SidebarLayout>} />
        <Route path="/semakan-kredit" element={<SidebarLayout><SemakanKredit /></SidebarLayout>} />
        <Route path="/carta-prestasi" element={<SidebarLayout><CartaPrestasi /></SidebarLayout>} />
        <Route path="/penilaian-subjek" element={<SidebarLayout><PenilaianSubjek /></SidebarLayout>} />
      </Routes>
    </Router>
  );
}

export default App;