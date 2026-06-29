import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle, AlertCircle, Info } from 'lucide-react';

const STORAGE_KEY = 'actas_config';

const DEFAULT_CONFIG = {
    statusPelajar:   true,
    semester:        'Semester 1 2025/2026',
    tarikhMula:      '2025-01-01',
    tarikhAkhir:     '2025-05-31',
    cgpaDekan:       3.67,
    cgpaAmaran:      2.00,
    kreditGraduasi:  120,
    _lastSaved:      null,
};

function loadConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULT_CONFIG };
}

function formatLastSaved(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('ms-MY', {
        weekday: 'long', day: 'numeric', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function KonfigurasiSistem() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user || user.role !== 'pegawai') {
        navigate('/');
        return null;
    }

    const init = loadConfig();

    const [statusPelajar,   setStatusPelajar]   = useState(init.statusPelajar);
    const [semester,        setSemester]         = useState(init.semester);
    const [tarikhMula,      setTarikhMula]       = useState(init.tarikhMula);
    const [tarikhAkhir,     setTarikhAkhir]      = useState(init.tarikhAkhir);
    const [cgpaDekan,       setCgpaDekan]        = useState(String(init.cgpaDekan));
    const [cgpaAmaran,      setCgpaAmaran]       = useState(String(init.cgpaAmaran));
    const [kreditGraduasi,  setKreditGraduasi]   = useState(String(init.kreditGraduasi));
    const [lastSaved,       setLastSaved]        = useState(init._lastSaved || null);

    const [dirty,       setDirty]       = useState(false);
    const [saved,       setSaved]       = useState(false);
    const [validErrors, setValidErrors] = useState({});

    const markDirty = () => { setDirty(true); setSaved(false); };

    const handleSimpan = () => {
        const errors = {};

        if (tarikhMula && tarikhAkhir && tarikhAkhir <= tarikhMula)
            errors.tarikh = 'Tarikh akhir mesti selepas tarikh mula.';

        const dekan  = parseFloat(cgpaDekan);
        const amaran = parseFloat(cgpaAmaran);
        const kredit = parseInt(kreditGraduasi, 10);

        if (isNaN(dekan)  || dekan  < 3.00 || dekan  > 4.00)
            errors.cgpaDekan = 'Nilai mesti antara 3.00 – 4.00.';
        if (isNaN(amaran) || amaran < 0.00 || amaran > 3.00)
            errors.cgpaAmaran = 'Nilai mesti antara 0.00 – 3.00.';
        if (!errors.cgpaDekan && !errors.cgpaAmaran && dekan <= amaran)
            errors.cgpaDekan = 'Ambang Dekan mesti lebih tinggi daripada Ambang Amaran.';
        if (isNaN(kredit) || kredit < 60 || kredit > 200)
            errors.kreditGraduasi = 'Kredit mesti antara 60 – 200.';

        if (Object.keys(errors).length > 0) { setValidErrors(errors); return; }
        setValidErrors({});

        const now = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            statusPelajar,
            semester,
            tarikhMula,
            tarikhAkhir,
            cgpaDekan:      dekan,
            cgpaAmaran:     amaran,
            kreditGraduasi: kredit,
            _lastSaved:     now,
        }));
        setLastSaved(now);
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const LABEL = 'text-[11px] font-bold text-gray-400 uppercase tracking-widest';
    const INPUT = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:border-[#002060] transition-all';

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">

            {/* ── HERO BANNER ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            KONFIGURASI SISTEM — PEGAWAI FTSM
                        </p>
                        <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                            Tetapan Sistem ACTAS
                        </h1>
                        <p className="text-white/30 text-sm mt-1 font-medium">
                            Urus kawalan akses, pengurusan semester dan ambang akademik.
                        </p>
                    </div>

                    <div className="hidden lg:block self-stretch w-px bg-white/10" />

                    <div className="text-right">
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            SEMESTER AKTIF
                        </p>
                        <p className="text-white font-extrabold mt-1.5 leading-tight" style={{ fontSize: 18 }}>
                            {semester || '—'}
                        </p>
                        {tarikhMula && tarikhAkhir && (
                            <p className="text-white/25 text-xs mt-1.5 font-medium font-mono">
                                {tarikhMula} — {tarikhAkhir}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── SETTINGS CARDS ── */}
            <div className="max-w-2xl mx-auto space-y-4">

                {/* ── 1. Access Control ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6">
                    <p className={`${LABEL} mb-5`}>Kawalan Akses</p>
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Portal Pelajar</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">
                                Kawal sama ada pelajar boleh log masuk dan mengakses rekod akademik mereka.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs font-bold transition-colors ${statusPelajar ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {statusPelajar ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={statusPelajar}
                                onClick={() => { setStatusPelajar(v => !v); markDirty(); }}
                                className="relative flex-shrink-0 w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002060]"
                                style={{ background: statusPelajar ? '#002060' : '#d1d5db' }}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                        statusPelajar ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 2. Semester Management ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6 space-y-5">
                    <p className={LABEL}>Pengurusan Semester</p>

                    <div className="space-y-1.5">
                        <label className={LABEL}>Nama Semester Semasa</label>
                        <input
                            type="text"
                            value={semester}
                            placeholder="Contoh: Semester 1 2025/2026"
                            className={INPUT}
                            onChange={e => { setSemester(e.target.value); markDirty(); }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={LABEL}>Tarikh Mula</label>
                            <input
                                type="date"
                                value={tarikhMula}
                                className={INPUT}
                                onChange={e => { setTarikhMula(e.target.value); markDirty(); }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={LABEL}>Tarikh Akhir</label>
                            <input
                                type="date"
                                value={tarikhAkhir}
                                className={INPUT}
                                onChange={e => { setTarikhAkhir(e.target.value); markDirty(); }}
                            />
                        </div>
                    </div>

                    {validErrors.tarikh && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                            <AlertCircle size={12} className="flex-shrink-0" />
                            {validErrors.tarikh}
                        </div>
                    )}
                </div>

                {/* ── 3. Academic Thresholds ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <p className={LABEL}>Ambang Akademik</p>
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Info size={11} />
                            <span className="text-[10px] font-medium">Digunakan sebagai nilai rujukan penapisan laporan</span>
                        </div>
                    </div>

                    {/* Anugerah Dekan */}
                    <div className="space-y-1.5">
                        <label className={LABEL}>Anugerah Dekan — PNGK Minimum (≥)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                step="0.01" min="3.00" max="4.00"
                                value={cgpaDekan}
                                className={`${INPUT} w-32`}
                                onChange={e => { setCgpaDekan(e.target.value); markDirty(); }}
                            />
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 flex-shrink-0">
                                Kepujian Tertinggi
                            </span>
                        </div>
                        {validErrors.cgpaDekan && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                <AlertCircle size={12} className="flex-shrink-0" />
                                {validErrors.cgpaDekan}
                            </div>
                        )}
                    </div>

                    {/* Amaran Akademik */}
                    <div className="space-y-1.5">
                        <label className={LABEL}>Amaran Akademik — Had PNGK ({'<'})</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                step="0.01" min="0.00" max="3.00"
                                value={cgpaAmaran}
                                className={`${INPUT} w-32`}
                                onChange={e => { setCgpaAmaran(e.target.value); markDirty(); }}
                            />
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-red-100 text-red-700 flex-shrink-0">
                                Had Minimum
                            </span>
                        </div>
                        {validErrors.cgpaAmaran && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                <AlertCircle size={12} className="flex-shrink-0" />
                                {validErrors.cgpaAmaran}
                            </div>
                        )}
                    </div>

                    {/* Kredit Graduasi */}
                    <div className="space-y-1.5">
                        <label className={LABEL}>Kredit Minimum Graduasi</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                step="1" min="60" max="200"
                                value={kreditGraduasi}
                                className={`${INPUT} w-32`}
                                onChange={e => { setKreditGraduasi(e.target.value); markDirty(); }}
                            />
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                                jam kredit
                            </span>
                        </div>
                        {validErrors.kreditGraduasi && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                <AlertCircle size={12} className="flex-shrink-0" />
                                {validErrors.kreditGraduasi}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 4. System Info ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6">
                    <p className={`${LABEL} mb-4`}>Maklumat Sistem</p>
                    <div>
                        {[
                            ['Nama Sistem',         'ACTAS-FTSM'],
                            ['Versi',               '1.0.0'],
                            ['Operator',            `${user.nama} (Pegawai FTSM)`],
                            ['Simpanan Terakhir',   formatLastSaved(lastSaved)],
                        ].map(([label, value], i, arr) => (
                            <div
                                key={label}
                                className={`flex justify-between items-center py-3 ${
                                    i < arr.length - 1 ? 'border-b border-gray-50' : ''
                                }`}
                            >
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">
                                    {label}
                                </span>
                                <span className="text-xs font-medium text-gray-700 text-right ml-4 truncate max-w-xs">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Save footer ── */}
                <div className="space-y-3 pt-2 pb-2">
                    {dirty && !saved && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            Terdapat perubahan yang belum disimpan
                        </div>
                    )}

                    <button
                        onClick={handleSimpan}
                        className={`w-full py-3.5 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm ${
                            saved ? 'bg-emerald-500 text-white' : 'text-white hover:brightness-110'
                        }`}
                        style={saved ? {} : { background: '#002060' }}
                    >
                        {saved
                            ? <><CheckCircle size={16} /> Tetapan Disimpan</>
                            : <><Save size={16} /> Simpan Semua Tetapan</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
