import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [noMatrik, setNoMatrik] = useState('');
    const [katalaluan, setKatalaluan] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Hantar data ke backend Node.js
            const response = await axios.post('http://localhost:5000/api/login', {
                no_matrik: noMatrik,
                katalaluan: katalaluan
            });
            
            if (response.status === 200) {
                alert(response.data.message);
                // Simpan data user sementara di local storage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Bawa pelajar ke dashboard
                navigate('/dashboard');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Pelayan bermasalah");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
            <h2>Log Masuk ACTAS-FTSM</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="No Matrik (Cth: A202965)"
                        value={noMatrik}
                        onChange={(e) => setNoMatrik(e.target.value)}
                        required
                        style={{ padding: '10px', width: '250px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        placeholder="Kata Laluan"
                        value={katalaluan}
                        onChange={(e) => setKatalaluan(e.target.value)}
                        required
                        style={{ padding: '10px', width: '250px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>
                    Log Masuk
                </button>
            </form>
        </div>
    );
}

export default Login;