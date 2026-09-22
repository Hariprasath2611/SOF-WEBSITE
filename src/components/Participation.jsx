import React from 'react';
import {
  Users,
  Code2,
  Cpu,
  Zap,
  Cog,
  Compass,
  BrainCircuit,
  Bot,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const DEPARTMENTS = [
  {
    name: 'Computer Science & Engineering',
    abbr: 'CSE',
    icon: Code2,
    synergy: 'FOSS kernel development, distributed architectures, web systems & developer tools.'
  },
  {
    name: 'Information Technology',
    abbr: 'IT',
    icon: Users,
    synergy: 'Cloud native computing, open source databases, DevOps pipelines & secure networks.'
  },
  {
    name: 'Artificial Intelligence & Data Science',
    abbr: 'AI & DS',
    icon: BrainCircuit,
    synergy: 'Open-weight AI models, Hugging Face pipelines, PyTorch & community datasets.'
  },
  {
    name: 'AI & Machine Learning',
    abbr: 'AI & ML',
    icon: Bot,
    synergy: 'Open computer vision libraries, edge inference, NLP models & open source ML engines.'
  },
  {
    name: 'Electronics & Communication',
    abbr: 'ECE',
    icon: Cpu,
    synergy: 'Embedded Linux, RISC-V open architecture, SDR (Software Defined Radio) & RTOS.'
  },
  {
    name: 'Electrical & Electronics',
    abbr: 'EEE',
    icon: Zap,
    synergy: 'Open-source SCADA, smart grid simulation, Arduino firmware & power electronics.'
  },
  {
    name: 'Mechanical Engineering',
    abbr: 'MECH',
    icon: Cog,
    synergy: 'FreeCAD, OpenFOAM CFD simulations, ROS (Robot Operating System) & 3D open print.'
  },
  {
    name: 'Civil Engineering',
    abbr: 'CIVIL',
    icon: Compass,
    synergy: 'QGIS geospatial mapping, open BIM standards & sustainable infrastructure code.'
  }
];

export default function Participation() {
  return (
    <section id="participation" className="section participation-section">
      <div className="container">
        {/* Banner with Clear Emphasis */}
        <div className="participation-banner">
          <div className="banner-content">
            <div className="banner-badge">
              <Sparkles size={14} />
              <span>UNIVERSAL ELIGIBILITY</span>
            </div>

            <h2 className="banner-title">
              OPEN TO <span>ALL ENGINEERING STUDENTS</span>
            </h2>

            <p className="banner-desc">
              Software Freedom Day 2026 welcomes students from engineering colleges across disciplines to learn, create, compete, collaborate, and explore the world of open-source technology.
            </p>

            <div className="banner-callout">
              <CheckCircle2 size={18} color="var(--accent-cyan)" />
              <span>
                <strong>Important Note:</strong> The event is hosted by the <strong>Department of Computer Science & Engineering</strong>, but participation is 100% open to students from <strong>ANY ENGINEERING DEPARTMENT</strong> and from <strong>ANY RECOGNIZED ENGINEERING COLLEGE</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Department Synergy Cards */}
        <div className="dept-grid">
          {DEPARTMENTS.map((dept) => {
            const IconComponent = dept.icon;
            return (
              <div key={dept.name} className="dept-card">
                <div className="dept-header">
                  <div className="dept-icon-box">
                    <IconComponent size={22} />
                  </div>
                  <div className="dept-title-group">
                    <h4>{dept.name}</h4>
                    <span>Dept Code: {dept.abbr}</span>
                  </div>
                </div>

                <p className="dept-synergy">{dept.synergy}</p>

                <div className="dept-tags">
                  <span className="dept-tag">Eligible for All 5 Tracks</span>
                  <span className="dept-tag">Cross-Dept Teams OK</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
