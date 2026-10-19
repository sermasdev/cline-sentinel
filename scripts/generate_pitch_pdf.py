import os
import base64
import subprocess

BASE_DIR = "/home/admin/hermes-sentinel"
ASSETS_DIR = f"{BASE_DIR}/docs/assets"
DOCS_DIR = f"{BASE_DIR}/docs"
HTML_OUT = f"{DOCS_DIR}/presentation.html"
PDF_OUT = f"{DOCS_DIR}/cline-sentinel-pitch.pdf"

def get_base64_image(filename):
    path = os.path.join(ASSETS_DIR, filename)
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")

img_overview = get_base64_image("screenshot-overview.png")
img_sensors = get_base64_image("screenshot-sensors.png")
img_analysis = get_base64_image("screenshot-analysis.png")
img_simulator = get_base64_image("screenshot-simulator.png")
img_replay = get_base64_image("screenshot-replay.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cline Sentinel — Pitch Presentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page {{
    size: 1920px 1080px;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  body {{
    background-color: #050811;
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}
  .slide {{
    width: 1920px;
    height: 1080px;
    position: relative;
    padding: 55px 75px;
    overflow: hidden;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #050811;
    background-image: 
      radial-gradient(circle at 15% 20%, rgba(0, 240, 255, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 85% 80%, rgba(0, 255, 136, 0.06) 0%, transparent 40%),
      linear-gradient(to right, rgba(0, 240, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  }}
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    padding-bottom: 20px;
  }}
  .logo {{
    display: flex;
    align-items: center;
    gap: 16px;
  }}
  .logo-box {{
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 800;
    font-size: 28px;
    color: #000;
    box-shadow: 0 0 25px rgba(0, 240, 255, 0.4);
  }}
  .brand-title {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #fff;
    text-transform: uppercase;
  }}
  .brand-title span {{
    color: #00f0ff;
  }}
  .badge {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 6px;
    background: rgba(0, 240, 255, 0.1);
    color: #00f0ff;
    border: 1px solid rgba(0, 240, 255, 0.3);
    text-transform: uppercase;
  }}
  .tagline {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #94a3b8;
    margin-top: 2px;
  }}
  .slide-num {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #64748b;
  }}
  .content-grid {{
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 50px;
    align-items: center;
    flex: 1;
    margin: 25px 0;
  }}
  .headline {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 50px;
    font-weight: 800;
    line-height: 1.1;
    color: #ffffff;
    text-transform: uppercase;
    margin-bottom: 20px;
  }}
  .headline span.cyan {{ color: #00f0ff; }}
  .headline span.emerald {{ color: #00ff88; }}
  .headline span.rose {{ color: #ff0055; }}
  .headline span.amber {{ color: #ffaa00; }}
  .headline span.purple {{ color: #a855f7; }}

  .section-label {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #00f0ff;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .section-label::before {{
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00f0ff;
    box-shadow: 0 0 8px #00f0ff;
  }}

  .problem-box {{
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 0, 85, 0.3);
    border-left: 6px solid #ff0055;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 18px;
  }}
  .solution-box {{
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-left: 6px solid #00ff88;
    padding: 20px;
    border-radius: 12px;
  }}
  .box-title {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }}
  .box-title.red {{ color: #ff0055; }}
  .box-title.green {{ color: #00ff88; }}
  .box-title.cyan {{ color: #00f0ff; }}
  .box-title.purple {{ color: #a855f7; }}

  .box-tag {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
  }}
  .box-tag.red {{
    background: rgba(255, 0, 85, 0.2);
    border: 1px solid rgba(255, 0, 85, 0.5);
    color: #ff0055;
  }}
  .box-tag.green {{
    background: rgba(0, 255, 136, 0.2);
    border: 1px solid rgba(0, 255, 136, 0.5);
    color: #00ff88;
  }}

  .box-text {{
    font-size: 15px;
    line-height: 1.55;
    color: #cbd5e1;
  }}

  .stats-row {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 20px;
  }}
  .stat-card {{
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 16px;
    border-radius: 10px;
    text-align: center;
  }}
  .stat-value {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 32px;
    font-weight: 800;
    color: #00f0ff;
  }}
  .stat-label {{
    font-size: 12px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 4px;
    text-transform: uppercase;
  }}

  .screenshot-frame {{
    background: #090e1d;
    border: 2px solid rgba(0, 240, 255, 0.35);
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 0 50px rgba(0, 240, 255, 0.15), inset 0 0 30px rgba(0, 240, 255, 0.05);
    position: relative;
  }}
  .screenshot-frame img {{
    width: 100%;
    height: auto;
    border-radius: 10px;
    display: block;
    border: 1px solid rgba(0, 240, 255, 0.2);
  }}
  .screenshot-badge {{
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(5, 8, 17, 0.92);
    border: 1px solid #00ff88;
    color: #00ff88;
    padding: 5px 12px;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  }}

  .workflow-list {{
    display: flex;
    flex-direction: column;
    gap: 14px;
  }}
  .workflow-step {{
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(0, 240, 255, 0.18);
    padding: 16px 18px;
    border-radius: 10px;
  }}
  .step-num {{
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: rgba(0, 240, 255, 0.15);
    border: 1px solid #00f0ff;
    color: #00f0ff;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }}
  .step-content h4 {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }}
  .step-content p {{
    font-size: 13.5px;
    color: #94a3b8;
    line-height: 1.45;
  }}

  .footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(0, 240, 255, 0.2);
    padding-top: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #64748b;
  }}
  .footer-link {{
    color: #00f0ff;
    text-decoration: none;
    font-weight: 700;
  }}

  .feature-grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-top: 16px;
  }}
  .feature-item {{
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 14px 18px;
    border-radius: 10px;
  }}
  .feature-title {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #00f0ff;
    margin-bottom: 4px;
  }}
  .feature-desc {{
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.4;
  }}
</style>
</head>
<body>

  <!-- ==================== SLIDE 1 ==================== -->
  <div class="slide">
    <div class="header">
      <div class="logo">
        <div class="logo-box">S</div>
        <div>
          <div class="brand-title">CLINE <span>SENTINEL</span></div>
          <div class="tagline">AUTONOMOUS CYBERSECURITY HONEYPOT & THREAT INTELLIGENCE</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">PITCH PRESENTATION // 2026</div>
        <div class="slide-num">01 / 05</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">THE 2026 CYBERSECURITY CRISIS</div>
        <h1 class="headline">
          AUTONOMOUS AI AGENTS ARE <span class="rose">ATTACKING</span> PRODUCTION AT MACHINE SPEED.
        </h1>

        <div class="problem-box">
          <div class="box-title red">
            <span>THE PROBLEM: ASYMMETRIC RECONNAISSANCE</span>
            <span class="box-tag red">$10.5T THREAT</span>
          </div>
          <div class="box-text">
            Autonomous threat actors, automated botnets, and rogue LLM agents probe SSH, REST APIs, and MCP endpoints 24/7. Traditional honeypots are static and passive, leaving human SecOps teams with a <strong>4.2-hour average Mean Time to Investigate (MTTI)</strong>.
          </div>
        </div>

        <div class="solution-box">
          <div class="box-title green">
            <span>THE SOLUTION: CLINE SENTINEL</span>
            <span class="box-tag green">REAL-TIME AI SOC</span>
          </div>
          <div class="box-text">
            Deceptive decoy sensors lure adversaries into safe virtual emulators. <strong>Cline AI acts as an unattended Tier-3 Security Analyst</strong>, correlating telemetry, classifying intent, and generating one-click remediation in <strong>under 30 seconds</strong>.
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">100%</div>
            <div class="stat-label">Containment Isolation</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">&lt; 30s</div>
            <div class="stat-label">Forensic Analysis SLA</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">3-Tier</div>
            <div class="stat-label">Risk & AI Scoring</div>
          </div>
        </div>
      </div>

      <div>
        <div class="screenshot-frame">
          <img src="{img_overview}" alt="Cline Sentinel SOC Overview Dashboard">
          <div class="screenshot-badge">LIVE PLATFORM: 360° RADAR & METRICS</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>CONFIDENTIAL // PITCH PRESENTATION</div>
      <div>GITHUB: <span class="footer-link">https://github.com/sermasdev/cline-sentinel</span></div>
    </div>
  </div>

  <!-- ==================== SLIDE 2 ==================== -->
  <div class="slide">
    <div class="header">
      <div class="logo">
        <div class="logo-box">S</div>
        <div>
          <div class="brand-title">CLINE <span>SENTINEL</span></div>
          <div class="tagline">AGENTIC BOT IDENTIFICATION & HONEYPOT SANDBOX ISOLATION</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">AGENTIC BOT DEFENSE</div>
        <div class="slide-num">02 / 05</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">AUTONOMOUS DECEPTION GRID</div>
        <h2 class="headline">
          IDENTIFY AGENTIC ATTACKS & <span class="purple">ISOLATE</span> IN SANDBOXES.
        </h2>

        <div class="workflow-list">
          <div class="workflow-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Agentic Probing & Schema Discovery Detection</h4>
              <p>Specialized decoys detect structured discovery requests targeting <code>/.well-known/agent.json</code>, MCP (Model Context Protocol) schemas, and automated AI client user-agents (LangChain, AutoGPT).</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Transparent Honeypot Sandbox Isolation</h4>
              <p>When an agentic bot or automated attacker is recognized, traffic is seamlessly contained inside safe, synthetic virtual decoy environments without alerting the attacker.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Live Adversary Behavioral Observation</h4>
              <p>The platform traps the adversary's tool executions, prompt-injection attempts, and reconnaissance scripts in memory, logging rich telemetry for forensic analysis.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>Zero Host or Production Access</h4>
              <p>Decoys provide non-functional simulations of databases, terminal shells, and credential vaults. Malicious instructions cannot execute on the host system.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="screenshot-frame">
          <img src="{img_sensors}" alt="Synthetic Web, API, SSH and MCP Decoy Catalog">
          <div class="screenshot-badge">SYNTHETIC DECOY & MCP AGENT SENSORS</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>AI-AGENT DETECTION WITH UNCERTAINTY QUANTIFICATION</div>
      <div>STACK: COWRIE SSH (2222) • WEB DECOY (8088) • MCP AGENT SENSOR</div>
    </div>
  </div>

  <!-- ==================== SLIDE 3 ==================== -->
  <div class="slide">
    <div class="header">
      <div class="logo">
        <div class="logo-box">S</div>
        <div>
          <div class="brand-title">CLINE <span>SENTINEL</span></div>
          <div class="tagline">CLINE AI FORENSIC ANALYSIS & DAILY ZERO-DAY REMEDIATION</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">AUTONOMOUS FORENSICS</div>
        <div class="slide-num">03 / 05</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">TIER-3 AI SECURITY ANALYST</div>
        <h2 class="headline">
          FORENSIC REASONING, <span class="cyan">ZERO-DAY CHECKS</span> & AUTOMATED FIX.
        </h2>

        <div class="workflow-list">
          <div class="workflow-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Unattended Plan-Mode (-p) Sandbox</h4>
              <p>Telemetry is passed to local Cline CLI in read-only plan mode. Prompt-injection defenses tag telemetry as untrusted evidence, preventing LLM compromise.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>3-Pillar Forensic Breakdown</h4>
              <p>For every suspicious event, Cline delivers: (1) <strong>What the attack is about</strong>, (2) <strong>What it tries to do</strong> (attacker intent), and (3) <strong>How to fix it</strong> (remediation checklist).</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Daily Zero-Day Exploit Checks & Maintenance</h4>
              <p>Automated routines scan for newly published CVEs, zero-day signatures (e.g. RegreSSHion), and propose proactive configuration hardening patches.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>One-Click Immediate Remediation</h4>
              <p>Generates ready-to-execute perimeter firewall commands (<code>iptables -A INPUT -s &lt;IP&gt; -j DROP</code>) and configuration fixes with 1-click clipboard copy.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="screenshot-frame">
          <img src="{img_analysis}" alt="Cline Agent Analysis Telemetry Inspector">
          <div class="screenshot-badge">CLINE AGENT FORENSIC REPORT & REMEDIATION</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>MODEL: GOOGLE/GEMINI-3.8-FLASH VIA OPENROUTER // SUB-30S SLA</div>
      <div>CLASSIFICATION: ATTACK RISK • AUTOMATION LIKELIHOOD • MITRE ATT&CK</div>
    </div>
  </div>

  <!-- ==================== SLIDE 4 ==================== -->
  <div class="slide">
    <div class="header">
      <div class="logo">
        <div class="logo-box">S</div>
        <div>
          <div class="brand-title">CLINE <span>SENTINEL</span></div>
          <div class="tagline">MULTI-SURFACE ATTACK SIMULATION & CONTINUOUS PEN-TESTING</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">TEST RANGE & CONTINUOUS TESTING</div>
        <div class="slide-num">04 / 05</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">ATTACK SIMULATION MATRIX</div>
        <h2 class="headline">
          SIMULATE ATTACKS ON <span class="amber">ALL SURFACES</span> & SELF-TEST.
        </h2>

        <div class="workflow-list">
          <div class="workflow-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Network Ports & Protocol Attacks</h4>
              <p>Simulates rapid SSH dictionary brute-force spraying against port 2222, connection floods, and protocol reconnaissance to verify rate-limiting controls.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Server OS & Shell Privilege Escalation</h4>
              <p>Injects exploitation attempts (<code>cat /etc/shadow</code>, <code>wget dropper.sh</code>, <code>chmod +x</code>) to validate immediate threat classification and detection.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Web Application & Config Leak Scanning</h4>
              <p>Probes sensitive administrative paths (<code>/admin</code>, <code>/.env</code>, <code>/config.json</code>) on port 8088 to verify WAF filtering and directory traversal alerts.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>Continuous Automated Penetration Testing</h4>
              <p>Pluggable architecture allowing automated red-team suites and CI/CD security test pipelines to execute continuous self-testing against honeypot decoys.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="screenshot-frame">
          <img src="{img_simulator}" alt="Attack Simulation Matrix Test Range">
          <div class="screenshot-badge">1-CLICK MULTI-SURFACE SIMULATOR MATRIX</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>CONTINUOUS VALIDATION // ZERO FALSE POSITIVES IN PRODUCTION</div>
      <div>SIMULATION TARGETS: OS • PORTS • WEB APP • REST APIS • MCP TOOLS</div>
    </div>
  </div>

  <!-- ==================== SLIDE 5 ==================== -->
  <div class="slide">
    <div class="header">
      <div class="logo">
        <div class="logo-box">S</div>
        <div>
          <div class="brand-title">CLINE <span>SENTINEL</span></div>
          <div class="tagline">REAL-TIME ALERTS, SESSION REPLAY & OPEN SOURCE PLATFORM</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">INCIDENT RESPONSE & TRACTION</div>
        <div class="slide-num">05 / 05</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">OPERATIONS & INCIDENT RESPONSE</div>
        <h2 class="headline">
          REAL-TIME ALERTS, <span class="emerald">KEYSTROKE REPLAY</span> & TRACTION.
        </h2>

        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-title">Real-Time Email Alerts (Composio)</div>
            <div class="feature-desc">Dispatches instant email alerts via Gmail for Critical and High incidents requiring investigation, with hourly and daily digests.</div>
          </div>
          <div class="feature-item">
            <div class="feature-title">CRT Keystroke Session Replay</div>
            <div class="feature-desc">Interactive terminal player reconstructs attacker commands and terminal outputs step-by-step with 1x, 2x, 5x speed scrubbing.</div>
          </div>
          <div class="feature-item">
            <div class="feature-title">Parallel.ai Threat Intelligence</div>
            <div class="feature-desc">Automatic enrichment mapping attacks against MITRE ATT&CK techniques (T1110, T1595, T1059) and CVE intelligence.</div>
          </div>
          <div class="feature-item">
            <div class="feature-title">Functional Radar & Interactive Triage</div>
            <div class="feature-desc">360° radar with clickable incident blips locking on to live targets with full forensic review and analyst note logging.</div>
          </div>
        </div>

        <div style="margin-top: 18px; padding: 18px 22px; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
          <div style="font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px;">
            OPEN SOURCE SECURITY FOR THE AGENTIC ERA
          </div>
          <div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.5;">
            Built with modern architecture: React 18, TypeScript, Vite, Tailwind CSS, FastAPI, PostgreSQL 16, and Cline CLI. Single supervisor command startup.
          </div>
        </div>
      </div>

      <div>
        <div class="screenshot-frame">
          <img src="{img_replay}" alt="Interactive CRT Session Replay Player">
          <div class="screenshot-badge">CRT TERMINAL FORENSIC REPLAY PLAYER</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>DEVELOPED BY SERMASDEV // FULL SOURCE AVAILABLE UNDER MIT</div>
      <div>REPOSITORY: <a class="footer-link" href="https://github.com/sermasdev/cline-sentinel">https://github.com/sermasdev/cline-sentinel</a></div>
    </div>
  </div>

</body>
</html>
"""

with open(HTML_OUT, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"[+] Written 5-slide presentation HTML to {HTML_OUT}")

cmd = [
    "brave-browser",
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    f"--print-to-pdf={PDF_OUT}",
    "--print-to-pdf-no-header",
    HTML_OUT
]

print(f"[*] Compiling 5-page PDF via headless browser...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    size = os.path.getsize(PDF_OUT)
    print(f"[✓] 5-Page PDF created successfully: {PDF_OUT} ({round(size / 1024, 1)} KB)")
else:
    print(f"[!] Error: {res.stderr}")
