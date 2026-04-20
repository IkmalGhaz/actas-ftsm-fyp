import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    // Ambil data user yang kita simpan masa login tadi
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Sila Log Masuk Terlebih Dahulu!</h2>;

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
            <h2>Papan Pemuka Pelajar</h2>
            <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px', display: 'inline-block' }}>
                <p><strong>Nama:</strong> {user.nama}</p>
                <p><strong>No Matrik:</strong> {user.no_matrik}</p>
                <p><strong>Program:</strong> {user.program}</p>
                <p><strong>Kredit Semasa:</strong> {user.jumlah_kredit_terkumpul} Jam</p>
            </div>
            
            <hr style={{ margin: '30px 0' }} />
            
            <h3>Visualisasi Prestasi & Simulator akan diletakkan di sini (Sprint 2) 🚀</h3>
            
            <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Log Keluar
            </button>
        </div>
    );
}

export default Dashboard;