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
img_analysis = get_base64_image("screenshot-analysis.png")
img_replay = get_base64_image("screenshot-replay.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cline Sentinel — YC Pitch Presentation</title>
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
    padding: 60px 80px;
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
    padding-bottom: 24px;
  }}
  .logo {{
    display: flex;
    align-items: center;
    gap: 16px;
  }}
  .logo-box {{
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 800;
    font-size: 30px;
    color: #000;
    box-shadow: 0 0 25px rgba(0, 240, 255, 0.4);
  }}
  .brand-title {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 32px;
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
    font-size: 13px;
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
    font-size: 14px;
    color: #94a3b8;
    margin-top: 4px;
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
    gap: 60px;
    align-items: center;
    flex: 1;
    margin: 30px 0;
  }}
  .headline {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 58px;
    font-weight: 800;
    line-height: 1.08;
    color: #ffffff;
    text-transform: uppercase;
    margin-bottom: 24px;
  }}
  .headline span.cyan {{ color: #00f0ff; }}
  .headline span.emerald {{ color: #00ff88; }}
  .headline span.rose {{ color: #ff0055; }}
  .headline span.amber {{ color: #ffaa00; }}

  .section-label {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #00f0ff;
    text-transform: uppercase;
    margin-bottom: 12px;
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
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 0, 85, 0.3);
    border-left: 6px solid #ff0055;
    padding: 24px;
    border-radius: 14px;
    margin-bottom: 24px;
  }}
  .solution-box {{
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-left: 6px solid #00ff88;
    padding: 24px;
    border-radius: 14px;
  }}
  .box-title {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }}
  .box-title.red {{ color: #ff0055; }}
  .box-title.green {{ color: #00ff88; }}
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
    font-size: 16px;
    line-height: 1.6;
    color: #cbd5e1;
  }}

  .stats-row {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 24px;
  }}
  .stat-card {{
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
  }}
  .stat-value {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 38px;
    font-weight: 800;
    color: #00f0ff;
  }}
  .stat-label {{
    font-size: 13px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 4px;
    text-transform: uppercase;
  }}

  .screenshot-frame {{
    background: #090e1d;
    border: 2px solid rgba(0, 240, 255, 0.35);
    border-radius: 18px;
    padding: 10px;
    box-shadow: 0 0 50px rgba(0, 240, 255, 0.15), inset 0 0 30px rgba(0, 240, 255, 0.05);
    position: relative;
  }}
  .screenshot-frame img {{
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    border: 1px solid rgba(0, 240, 255, 0.2);
  }}
  .screenshot-badge {{
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(5, 8, 17, 0.9);
    border: 1px solid #00ff88;
    color: #00ff88;
    padding: 6px 14px;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  }}

  .workflow-list {{
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}
  .workflow-step {{
    display: flex;
    align-items: flex-start;
    gap: 18px;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(0, 240, 255, 0.18);
    padding: 20px;
    border-radius: 12px;
  }}
  .step-num {{
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: rgba(0, 240, 255, 0.15);
    border: 1px solid #00f0ff;
    color: #00f0ff;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }}
  .step-content h4 {{
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }}
  .step-content p {{
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.5;
  }}

  .footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(0, 240, 255, 0.2);
    padding-top: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
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
    gap: 16px;
    margin-top: 20px;
  }}
  .feature-item {{
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 16px 20px;
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
        <div class="badge">YC PITCH // DECK 2026</div>
        <div class="slide-num">01 / 03</div>
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
            Autonomous threat actors and rogue LLM agents probe SSH, REST APIs, and MCP endpoints 24/7. Traditional honeypots are static and passive, while human SecOps teams suffer a <strong>4.2-hour average Mean Time to Investigate (MTTI)</strong>.
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
      <div>CONFIDENTIAL // Y COMBINATOR APPLICATION</div>
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
          <div class="tagline">HOW IT WORKS // THE AUTONOMOUS INVESTIGATION ENGINE</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">SYSTEM ARCHITECTURE</div>
        <div class="slide-num">02 / 03</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">INTELLIGENCE PIPELINE</div>
        <h2 class="headline">
          FROM DECOY TRAP TO <span class="cyan">CLINE FORENSIC</span> REMEDIATION.
        </h2>

        <div class="workflow-list">
          <div class="workflow-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Multi-Surface Decoy Network</h4>
              <p>Cowrie SSH (Port 2222) and Synthetic Web/MCP Agent decoys (Port 8088) capture credentials, commands, and structured agent discovery probes.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Deterministic Correlation Engine</h4>
              <p>Events are normalized, deduplicated in PostgreSQL 16, and scored across Attack Risk, Automation Likelihood, and AI-Agent Probability.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Unattended Cline AI Investigation</h4>
              <p>Sanitized telemetry is analyzed by Cline CLI in safe plan-mode (-p) with OpenRouter. Zero tool access guarantees prompt-injection safety.</p>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>Actionable 3-Pillar Security Intelligence</h4>
              <p>Delivers: (1) What the attack is about, (2) Attacker intent & mechanics, and (3) Actionable remediation checklist with ready-to-copy firewall rules.</p>
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
      <div>ZERO HOST EXECUTION // PROMPT-INJECTION RESISTANT SANDBOX</div>
      <div>STACK: FASTAPI • REACT • POSTGRESQL 16 • CLINE CLI • DOCKER</div>
    </div>
  </div>

  <!-- ==================== SLIDE 3 ==================== -->
  <div class="slide">
    <div class="header">
      <div class="logo">
        <div class="logo-box">S</div>
        <div>
          <div class="brand-title">CLINE <span>SENTINEL</span></div>
          <div class="tagline">PRODUCT CAPABILITIES, TRACTION & OPEN SOURCE</div>
        </div>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="badge">OPEN SOURCE TRACTION</div>
        <div class="slide-num">03 / 03</div>
      </div>
    </div>

    <div class="content-grid">
      <div>
        <div class="section-label">ENTERPRISE SOC EXPERIENCE</div>
        <h2 class="headline">
          INTERACTIVE FORENSICS BUILT FOR <span class="emerald">EXPERT SECOPS</span>.
        </h2>

        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-title">Functional Radar Sweep</div>
            <div class="feature-desc">360° SVG radar dynamically plots live attacks with severity color codes and click-to-triage reticle lock-on.</div>
          </div>
          <div class="feature-item">
            <div class="feature-title">CRT Keystroke Replay</div>
            <div class="feature-desc">Phosphor terminal player steps through captured attacker commands with 1x, 2x, 5x speed scrubbing.</div>
          </div>
          <div class="feature-item">
            <div class="feature-title">Attack Simulation Matrix</div>
            <div class="feature-desc">1-click test range triggering SSH brute-force, web admin leaks, MCP agent probes, and command injections.</div>
          </div>
          <div class="feature-item">
            <div class="feature-title">Parallel.ai & Composio</div>
            <div class="feature-desc">MITRE ATT&CK technique catalog and multi-tier Gmail escalation SLAs (Immediate, Hourly, Daily).</div>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 20px; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px;">
          <div style="font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;">
            JOIN THE DEFENSE GRID
          </div>
          <div style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">
            Fully containerized, production-hardened, and verified live on modern infrastructure. Explore the open-source code and run the platform in under 2 minutes.
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

print(f"[+] Written presentation HTML to {HTML_OUT}")

cmd = [
    "brave-browser",
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    f"--print-to-pdf={PDF_OUT}",
    "--print-to-pdf-no-header",
    HTML_OUT
]

print(f"[*] Compiling PDF via headless browser...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    size = os.path.getsize(PDF_OUT)
    print(f"[✓] PDF created successfully: {PDF_OUT} ({round(size / 1024, 1)} KB)")
else:
    print(f"[!] Error: {res.stderr}")
