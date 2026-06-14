<div align="center">

# ACTAS-FTSM
**Academic Credit Tracking & Analytics System**

*Membentuk masa depan analitik akademik yang lebih bijak, pantas, dan efisien untuk mahasiswa FTSM, UKM.*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

</div>

---

## Overview

ACTAS-FTSM is a full-stack academic management web application built exclusively for **Fakulti Teknologi Dan Sains Maklumat (FTSM), Universiti Kebangsaan Malaysia (UKM)**. It gives students real-time visibility into their graduation credit progress and lets them simulate future CGPA outcomes, while providing Program Heads and Faculty Staff with powerful analytics, monitoring, and reporting tools.

The system supports three distinct user roles — **Student (Pelajar)**, **Program Head (Ketua Program)**, and **Faculty Staff (Pegawai FTSM)** — each with a dedicated dashboard and feature set.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Student (Pelajar)](#student-pelajar)
  - [Program Head (Ketua Program)](#program-head-ketua-program)
  - [Faculty Staff (Pegawai FTSM)](#faculty-staff-pegawai-ftsm)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [User Roles & Access](#user-roles--access)
- [Demo Accounts](#demo-accounts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, TailwindCSS 3, Recharts 3, React Router DOM 7 |
| **Backend** | Node.js, Express 5 |
| **Database** | MySQL (via XAMPP) |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Dev Tools** | Nodemon, ESLint, PostCSS |

---

## Features

### Student (Pelajar)

#### Dashboard — Papan Pemuka
The home page after login. Displays the student's current PNGK (Cumulative GPA), total credits accumulated toward the 120-credit graduation target, a semester-by-semester GPA trend chart, Dean's List status badge, and any unread feedback notifications from the Program Head.

#### Credit Check — Semakan & Audit Kredit Graduasi
A detailed credit audit broken into the four UKM graduation requirement categories:

| Category | Credits Required |
|---|---|
| Wajib Fakulti (Faculty Compulsory) | 70 |
| Wajib Universiti (University Compulsory) | 14 |
| Kursus Citra (Elective) | 24 |
| Elektif (Free Elective) | 12 |

Each category renders a colour-coded progress bar with credits completed and remaining credits clearly labelled.

#### CGPA Simulator — Simulator PNGK
A predictive planning tool that lets students model the impact of future courses on their CGPA **without modifying any database records**. Students enter a course name, credit hours (1–6), and an expected grade; the simulator recalculates a projected CGPA in real time using the full UKM grade-point scale:

| Grade | Points |
|---|---|
| A | 4.00 |
| A- | 3.67 |
| B+ | 3.33 |
| B | 3.00 |
| B- | 2.67 |
| C+ | 2.33 |
| C | 2.00 |
| D | 1.00 |
| E | 0.00 |

Multiple simulated courses can be stacked to model an entire upcoming semester.

#### Performance Chart — Carta Prestasi
A dual-line Recharts chart showing PNG (Semester GPA) vs. PNGK (Cumulative GPA) across all semesters. Highlights the student's best semester and displays total credits accumulated to date.

#### Course Rating — Penilaian Subjek
Students submit 1–5 star ratings and written comments for completed courses. Responses feed into the Program Head's curriculum monitoring workflow.

#### Add Course — Tambah Kursus
A form for registering a course result manually. Fields include course code, name, credits, category, grade, and the semester taken. The record is written to the database and the CGPA is recalculated immediately.

---

### Program Head (Ketua Program)

#### KP Dashboard — Papan Pemuka KP
Displays the total number of students in the program, the faculty-wide average PNGK, and a sortable table of all students with their individual CGPAs. Includes one-click CSV export.

#### Course Monitoring — Pemantauan Kursus
A real-time table of every course showing course code, name, category, credits, student enrolment count, and average GPA. Each course is tagged with an auto-calculated status:

| Status | Condition |
|---|---|
| Sangat Baik (Excellent) | Average GPA ≥ 3.00 |
| Sederhana (Moderate) | Average GPA 2.00 – 2.99 |
| Subjek Kritikal (Critical) | Average GPA < 2.00 |

A search field enables quick lookup of any course by code or name.

#### Bell Curve Analytics — Analisis Taburan Gred
A bar chart showing the full grade distribution across all exam records, broken down by grade band (A, A−, B+, B, B−, C+, C, D, E). Bars are colour-coded by performance tier:

| Colour | Tier | Grades |
|---|---|---|
| Green | Excellent | A, A− |
| Blue | Merit | B+, B, B− |
| Yellow | Pass | C+, C |
| Red | Critical | D, E |

This view lets the Program Head instantly identify at-risk cohorts and courses that require academic intervention.

#### Student Feedback — Maklum Balas
A messaging interface for sending academic feedback or early warnings to individual students. Messages appear as notifications on the student dashboard with timestamps. Students can be located by matric number or name.

---

### Faculty Staff (Pegawai FTSM)

#### Student Data Management — Urus Data Pelajar
Full CRUD operations on the student registry through a modal-driven interface. Staff can add students (matric number, full name, program, initial password), edit existing records, and delete records.

#### Report Generation — Jana Laporan
Generates formal academic reports filterable by achievement category:

- **Semua** — All students
- **Senarai Dekan** — Dean's List (CGPA ≥ 3.67)
- **Prestasi Kritikal** — Critical (CGPA < 2.00)

Reports can be exported as a UTF-8 BOM CSV (compatible with Microsoft Excel) or printed to PDF via the browser print dialog. Exported columns: Student ID, Name, Program, Total Credits, CGPA.

#### System Configuration — Konfigurasi Sistem
System-level settings management interface for administrative configuration.

---

## Project Structure

```
actas-ftsm-fyp/
├── server/
│   ├── server.js                    # Express API server (all endpoints)
│   ├── package.json                 # Backend dependencies
│   └── client/                      # React frontend (Vite)
│       ├── index.html
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── src/
│           ├── App.jsx              # Route definitions & ProtectedRoute
│           ├── main.jsx             # React entry point
│           ├── login.jsx            # Unified login page (all roles)
│           │
│           ├── dashboard.jsx        # Student: dashboard
│           ├── SemakanKredit.jsx    # Student: credit audit
│           ├── Simulator.jsx        # Student: CGPA simulator
│           ├── CartaPrestasi.jsx    # Student: performance chart
│           ├── PenilaianSubjek.jsx  # Student: course rating
│           ├── TambahKursus.jsx     # Student: add course result
│           │
│           ├── DashboardKP.jsx      # KP: program dashboard
│           ├── PantauKursus.jsx     # KP: course monitoring
│           ├── AnalisisGred.jsx     # KP: bell curve analytics
│           ├── MaklumBalasKP.jsx    # KP: feedback to students
│           │
│           ├── UrusDataPelajar.jsx  # Staff: student CRUD
│           ├── JanaLaporan.jsx      # Staff: report generation
│           ├── KonfigurasiSistem.jsx # Staff: system settings
│           │
│           └── components/
│               └── SidebarLayout.jsx # Role-aware navigation sidebar
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [XAMPP](https://www.apachefriends.org/) with Apache and MySQL running
- npm

### Database Setup

Open phpMyAdmin (or any MySQL client) and execute the following SQL:

```sql
CREATE DATABASE IF NOT EXISTS actas_db;
USE actas_db;

CREATE TABLE pelajar (
  no_matrik    VARCHAR(10)  PRIMARY KEY,
  kata_laluan  VARCHAR(255),
  nama         VARCHAR(100),
  program      VARCHAR(100)
);

CREATE TABLE kakitangan (
  id_ukmper  VARCHAR(20)  PRIMARY KEY,
  nama       VARCHAR(100),
  katalaluan VARCHAR(255),
  peranan    VARCHAR(50) DEFAULT 'Pegawai FTSM'
);

CREATE TABLE kursus (
  kod_kursus  VARCHAR(10)  PRIMARY KEY,
  nama_kursus VARCHAR(100),
  jam_kredit  INT,
  kategori    VARCHAR(50)
);

CREATE TABLE keputusan (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  no_matrik        VARCHAR(10),
  kod_kursus       VARCHAR(10),
  gred             VARCHAR(5),
  mata_nilaian     DECIMAL(3,2),
  semester_diambil INT,
  FOREIGN KEY (no_matrik)  REFERENCES pelajar(no_matrik),
  FOREIGN KEY (kod_kursus) REFERENCES kursus(kod_kursus)
);

CREATE TABLE maklum_balas (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  no_matrik VARCHAR(20),
  tarikh    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mesej     TEXT,
  status    VARCHAR(20) DEFAULT 'Belum Dibaca'
);

CREATE TABLE penilaian_kursus (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  no_matrik  VARCHAR(20),
  kod_kursus VARCHAR(20),
  rating     INT,
  komen      TEXT,
  tarikh     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend Setup

```bash
cd server
npm install
npx nodemon server.js
```

The API server starts at `http://localhost:5000`.

### Frontend Setup

Open a second terminal:

```bash
cd server/client
npm install
npm run dev
```

The React app is served at `http://localhost:5173`.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Authenticate any user role |

### Student Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/akademik/:no_matrik` | Fetch student courses and CGPA |
| POST | `/api/tambah-kursus` | Add a course result |
| GET | `/api/pelajar/maklum-balas/:no_matrik` | Get KP feedback messages |
| POST | `/api/pelajar/penilaian` | Submit a course rating |

### Program Head Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/kp/analitik-pelajar` | All students with faculty-wide average CGPA |
| GET | `/api/kp/pantau-kursus` | Course performance metrics |
| GET | `/api/kp/taburan-gred` | Grade distribution data (bell curve) |
| POST | `/api/kp/maklum-balas` | Send feedback to a student |

### Faculty Staff Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pegawai/pelajar` | List all students |
| POST | `/api/pegawai/pelajar` | Create a student record |
| PUT | `/api/pegawai/pelajar/:id` | Update a student record |
| DELETE | `/api/pegawai/pelajar/:id` | Delete a student record |

---

## User Roles & Access

| Role | Login ID Format | Access Scope |
|---|---|---|
| **Pelajar** (Student) | `A` + 6 digits | Dashboard, Credit Check, CGPA Simulator, Performance Chart, Course Rating, Add Course |
| **Ketua Program** (Program Head) | `KP` + digits | KP Dashboard, Course Monitoring, Bell Curve Analytics, Student Feedback |
| **Pegawai FTSM** (Faculty Staff) | `P` + digits | Student Data Management, Report Generation, System Configuration |

Sessions are stored in `localStorage`. A `ProtectedRoute` wrapper prevents cross-role navigation and redirects unauthenticated users to the login page.

---

## Demo Accounts

| Role | Username | Password |
|---|---|---|
| Student | A202965 | 123 |
| Program Head | KP001 | *(see database)* |
| Faculty Staff | P001 | *(see database)* |

---

<div align="center">
  <p>Dibangunkan dengan oleh <b>Mohamad Ikmal Bin Mohd Ghazali</b></p>
  <p><i>Kejuruteraan Perisian, FTSM — Universiti Kebangsaan Malaysia (UKM)</i></p>
  <p><i>Final Year Project (FYP)</i></p>
</div>
