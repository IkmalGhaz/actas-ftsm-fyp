import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Pencil, Trash2, X, Search, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const PROGRAMS = [
    'Sains Komputer',
    'Sains Komputer (Data Science)',
    'Sains Komputer (Intelligent Machine)',
    'Sains Komputer (Software Technology)',
    'Sains Komputer (Network Technology)',
    'Teknologi Maklumat',
    'Kejuruteraan Perisian',
    'Kejuruteraan Perisian (Pembangunan Sistem Multimedia)',
    'Kejuruteraan Perisian (Pembangunan Sistem Maklumat)',
];

const DEFAULT_FORM = { no_matrik: '', nama: '', program: 'Sains Komputer', katalaluan: '123' };

function getInitials(nama) {
    return (nama ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function programBadge(program) {
    if (!program) return { bg: 'bg-gray-100', text: 'text-gray-600' };
    const p = program.toLowerCase();
    if (p.includes('sains'))      return { bg: 'bg-teal-100',   text: 'text-teal-700'   };
    if (p.includes('teknologi'))  return { bg: 'bg-blue-100',   text: 'text-blue-700'   };
    if (p.includes('multimedia')) return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    return                                { bg: 'bg-purple-100', text: 'text-purple-700' };
}

function UrusDataPelajar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [senaraiPelajar, setSenaraiPelajar] = useState([]);
    const [loading, setLoading]               = useState(true);
    const [fetchError, setFetchError]         = useState('');
    const [carian, setCarian]                 = useState('');

    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [isEditing, setIsEditing]           = useState(false);
    const [formData, setFormData]             = useState(DEFAULT_FORM);
    const [showPassword, setShowPassword]     = useState(false);
    const [submitting, setSubmitting]         = useState(false);
    const [formError, setFormError]           = useState('');

    const [confirmDelete, setConfirmDelete]   = useState(null);
    const [deleting, setDeleting]             = useState(false);
    const [deleteError, setDeleteError]       = useState('');

    const [toast, setToast]                   = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchPelajar = () => {
        setFetchError('');
        return axios.get('http://localhost:5000/api/pegawai/pelajar')
            .then(res => setSenaraiPelajar(res.data || []))
            .catch(() => setFetchError('Gagal memuat senarai pelajar. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!user || user.role !== 'pegawai') { navigate('/'); return; }
        fetchPelajar();
    }, []);

    if (!user) return null;

    const pelajarDitapis = useMemo(() => {
        if (!carian.trim()) return senaraiPelajar;
        const q = carian.toLowerCase();
        return senaraiPelajar.filter(p =>
            p.no_matrik.toLowerCase().includes(q) ||
            p.nama.toLowerCase().includes(q) ||
            (p.program ?? '').toLowerCase().includes(q)
        );
    }, [senaraiPelajar, carian]);

    const bukaModalTambah = () => {
        setFormData(DEFAULT_FORM);
        setFormError('');
        setShowPassword(false);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const bukaModalEdit = (pelajar) => {
        setFormData({ ...pelajar });
        setFormError('');
        setShowPassword(false);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const tutupModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/pegawai/pelajar/${formData.no_matrik}`, formData);
                showToast('success', `Rekod ${formData.nama} berjaya dikemas kini.`);
            } else {
                await axios.post('http://localhost:5000/api/pegawai/pelajar', formData);
                showToast('success', `Pelajar ${formData.nama} berjaya didaftarkan.`);
            }
            setIsModalOpen(false);
            fetchPelajar();
        } catch (err) {
            setFormError(err.response?.data?.error ?? 'Ralat tidak dijangka. Sila cuba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePadam = async (no_matrik) => {
        setDeleting(true);
        setDeleteError('');
        try {
            await axios.delete(`http://localhost:5000/api/pegawai/pelajar/${no_matrik}`);
            setConfirmDelete(null);
            showToast('success', `Rekod ${no_matrik} berjaya dipadam.`);
            fetchPelajar();
        } catch {
            setDeleteError('Gagal memadam. Cuba lagi.');
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">

            {/* ── HERO BANNER ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            PENGURUSAN REKOD — PEGAWAI FTSM
                        </p>
                        <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                            Urus Data Pelajar
                        </h1>
                        <p className="text-white/30 text-sm mt-1 font-medium">
                            Daftar, kemas kini dan padam rekod akademik pelajar FTSM.
                        </p>
                    </div>

                    <div className="hidden lg:block self-stretch w-px bg-white/10" />

                    <div className="flex items-center gap-5">
                        <div className="text-center">
                            <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                JUMLAH PELAJAR
                            </p>
                            <p className="text-white font-black tracking-tight mt-1"
                                style={{ fontFamily: "'DM Serif Display', serif", fontSize: 64, lineHeight: 1 }}>
                                {loading ? '—' : senaraiPelajar.length}
                            </p>
                            <p className="text-white/25 text-xs mt-1 font-medium">berdaftar</p>
                        </div>

                        <button
                            onClick={bukaModalTambah}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 hover:brightness-110"
                            style={{ background: '#C9A227', color: '#002060' }}
                        >
                            <Plus size={16} />
                            Daftar Pelajar
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TOAST ── */}
            {toast && (
                <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium border ${
                    toast.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {toast.type === 'success'
                        ? <CheckCircle size={15} className="flex-shrink-0" />
                        : <AlertCircle size={15} className="flex-shrink-0" />
                    }
                    {toast.msg}
                </div>
            )}

            {fetchError && (
                <div className="flex items-center gap-2.5 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    {fetchError}
                </div>
            )}

            {/* ── TABLE CARD ── */}
            {!fetchError && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-7 py-5 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama, matrik, atau program..."
                                className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#002060] text-sm text-gray-700 transition-all w-80"
                                value={carian}
                                onChange={(e) => setCarian(e.target.value)}
                            />
                        </div>
                        {!loading && (
                            <p className="text-xs text-gray-400 font-medium">
                                {carian
                                    ? `${pelajarDitapis.length} drp ${senaraiPelajar.length} rekod`
                                    : `${senaraiPelajar.length} rekod`
                                }
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2"
                                style={{ borderColor: '#002060' }} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">
                                        <th className="pl-7 pr-3 py-4 w-12">Bil.</th>
                                        <th className="px-4 py-4">Pelajar</th>
                                        <th className="px-4 py-4">No. Matrik</th>
                                        <th className="px-4 py-4">Program</th>
                                        <th className="px-4 py-4 pr-7 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {pelajarDitapis.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-7 py-16 text-center">
                                                <Users size={30} className="text-gray-200 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-gray-400">
                                                    {carian
                                                        ? `Tiada pelajar sepadan dengan "${carian}".`
                                                        : 'Tiada rekod pelajar dalam sistem.'
                                                    }
                                                </p>
                                                {!carian && (
                                                    <button
                                                        onClick={bukaModalTambah}
                                                        className="mt-4 text-sm font-bold px-4 py-2 rounded-xl text-white transition-colors active:scale-95"
                                                        style={{ background: '#002060' }}
                                                    >
                                                        + Daftar Pelajar Pertama
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        pelajarDitapis.map((pelajar, i) => {
                                            const isConfirming = confirmDelete === pelajar.no_matrik;
                                            const badge = programBadge(pelajar.program);
                                            return (
                                                <tr
                                                    key={pelajar.no_matrik}
                                                    className={`transition-colors ${
                                                        isConfirming ? 'bg-red-50/60' : 'hover:bg-gray-50/50'
                                                    }`}
                                                >
                                                    <td className="pl-7 pr-3 py-3.5 text-xs font-mono text-gray-400">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </td>

                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black select-none text-white"
                                                                style={{ background: isConfirming ? '#dc2626' : '#002060' }}
                                                            >
                                                                {getInitials(pelajar.nama)}
                                                            </div>
                                                            <span className="font-bold text-gray-800 uppercase text-xs tracking-wide">
                                                                {pelajar.nama}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3.5">
                                                        <span className="font-mono font-bold text-xs" style={{ color: '#002060' }}>
                                                            {pelajar.no_matrik}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3.5">
                                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                                            {pelajar.program}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3.5 pr-7">
                                                        {isConfirming ? (
                                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                                {deleteError && (
                                                                    <span className="text-xs text-red-600 font-medium">
                                                                        {deleteError}
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-red-600 font-bold">
                                                                    Padam rekod ini?
                                                                </span>
                                                                <button
                                                                    onClick={() => handlePadam(pelajar.no_matrik)}
                                                                    disabled={deleting}
                                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 active:scale-95"
                                                                >
                                                                    {deleting ? 'Memadamkan...' : 'Ya, Padam'}
                                                                </button>
                                                                <button
                                                                    onClick={() => { setConfirmDelete(null); setDeleteError(''); }}
                                                                    className="px-3 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                                                                >
                                                                    Batal
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => bukaModalEdit(pelajar)}
                                                                    className="p-2 rounded-lg text-gray-400 hover:text-[#002060] hover:bg-[rgba(0,32,96,0.06)] transition-all"
                                                                    title="Kemas Kini"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => { setConfirmDelete(pelajar.no_matrik); setDeleteError(''); }}
                                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                                    title="Padam"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── MODAL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

                        {/* Modal header */}
                        <div className="px-7 py-6" style={{ background: '#002060' }}>
                            <p style={{ color: '#C9A227', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em' }}>
                                {isEditing ? 'KEMAS KINI REKOD PELAJAR' : 'DAFTAR PELAJAR BAHARU'}
                            </p>
                            <div className="flex items-start justify-between mt-1.5">
                                <h2 className="text-white font-extrabold text-lg tracking-tight leading-tight">
                                    {isEditing ? (formData.nama || 'Kemas Kini Pelajar') : 'Borang Pendaftaran'}
                                </h2>
                                <button
                                    onClick={tutupModal}
                                    className="text-white/40 hover:text-white transition-colors mt-0.5 flex-shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-7 space-y-5">

                            {/* No Matrik */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    No. Matrik
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isEditing}
                                    placeholder="Contoh: A200301234"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-800 uppercase focus:outline-none focus:ring-2 focus:border-[#002060] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={formData.no_matrik}
                                    onChange={(e) => setFormData({ ...formData, no_matrik: e.target.value.toUpperCase() })}
                                />
                                {isEditing && (
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        No. Matrik tidak boleh ditukar selepas pendaftaran.
                                    </p>
                                )}
                            </div>

                            {/* Nama */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Nama Penuh
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama penuh pelajar"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:border-[#002060] transition-all uppercase"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                />
                            </div>

                            {/* Program */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Program Pengajian
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:border-[#002060] transition-all cursor-pointer"
                                    value={formData.program}
                                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                >
                                    {PROGRAMS.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Kata Laluan */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Kata Laluan Akses
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:border-[#002060] transition-all"
                                        value={formData.katalaluan}
                                        onChange={(e) => setFormData({ ...formData, katalaluan: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Form error */}
                            {formError && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                                    <AlertCircle size={14} className="flex-shrink-0" />
                                    {formError}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={tutupModal}
                                    className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
                                    style={{ background: '#002060' }}
                                >
                                    {submitting
                                        ? 'Menyimpan...'
                                        : isEditing ? 'Kemas Kini Rekod' : 'Daftar Pelajar'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UrusDataPelajar;
