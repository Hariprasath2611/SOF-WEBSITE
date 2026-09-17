import React from 'react';
import {
  Globe2,
  Code2,
  Palette,
  Wrench,
  Cpu,
  Users2,
  Terminal,
  Sparkles,
  Unlock,
  GitBranch
} from 'lucide-react';

const ECOSYSTEM_WORLDS = [
  {
    title: 'CODE',
    icon: Code2,
    desc: 'Public Git repos, compilers, frameworks & open architectures.'
  },
  {
    title: 'DESIGN',
    icon: Palette,
    desc: 'Open design assets, Penpot, Blender, SVG standards & visual freedom.'
  },
  {
    title: 'TOOLS',
    icon: Wrench,
    desc: 'Docker containers, Kubernetes, Vim, VS Code extensions & CLI utilities.'
  },
  {
    title: 'AI',
    icon: Cpu,
    desc: 'Open-weight models, PyTorch, Hugging Face transformers & local LLMs.'
  },
  {
    title: 'COMMUNITY',
    icon: Users2,
    desc: 'Global maintainers, mentorship, hackathons, peer code review & inclusivity.'
  },
  {
    title: 'LINUX',
    icon: Terminal,
    desc: 'The open kernel powering clouds, supercomputers, robotics & modern web.'
  }
];

export default function OpenSourceNetwork() {
  return (
    <section id="ecosystem" className="section ecosystem-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag violet">
            <Globe2 size={14} />
            <span>Living Open-Source Ecosystem</span>
          </div>
          <h2 className="section-title">ONE EVENT. MANY OPEN-SOURCE WORLDS.</h2>
          <p className="section-subtitle">
            Open source is far more than code — it is an expansive paradigm uniting software engineering, creative design, community governance, open intelligence, and operating systems.
          </p>
        </div>

        {/* Visual Ecosystem Architecture Tree */}
        <div className="ecosystem-container">
          {/* Top Root Node */}
          <div className="ecosystem-root-node">
            <div className="root-badge">
              <GitBranch size={20} />
              <span>OPEN SOURCE</span>
            </div>
          </div>

          {/* Six Interconnecting Branches */}
          <div className="ecosystem-branches-grid">
            {ECOSYSTEM_WORLDS.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="eco-branch-card">
                  <div className="eco-icon">
                    <IconComp size={20} />
                  </div>
                  <div className="eco-title">{item.title}</div>
                  <div className="eco-desc">{item.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Bottom Root Destination */}
          <div className="ecosystem-freedom-node">
            <div className="freedom-badge">
              <Unlock size={18} />
              <span>TECHNOLOGY FREEDOM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
