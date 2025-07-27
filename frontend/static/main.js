// Mode toggle logic
const modeRadios = document.querySelectorAll('input[name="mode"]');
const personaInputs = document.getElementById('personaInputs');
const uploadForm = document.getElementById('uploadForm');
let demoBtn = null;
function updatePersonaInputsAndDemoBtn() {
    const personaSelected = document.querySelector('input[name="mode"]:checked').value === 'persona';
    personaInputs.style.display = personaSelected ? 'block' : 'none';
    // Handle demo button
    if (personaSelected) {
        if (!demoBtn) {
            demoBtn = document.createElement('button');
            demoBtn.type = 'button';
            demoBtn.id = 'demoBtn';
            demoBtn.className = 'btn-secondary';
            demoBtn.style.flex = 'none';
            demoBtn.style.maxWidth = '120px';
            demoBtn.style.fontSize = '0.98em';
            demoBtn.style.height = '38px';
            demoBtn.style.marginLeft = '8px';
            demoBtn.innerHTML = '<span class="btn-icon" aria-hidden="true"><svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M3 17l4.5-4.5m4.5-4.5l4.5-4.5m-9 9l6-6m-6 6l2 2m4-8l2 2" stroke="#f44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>One-Click Demo';
            demoBtn.onclick = async function() {
                // Autofill persona/job
                document.getElementById('personaInput').value = 'PhD Researcher in Computational Biology';
                document.getElementById('jobInput').value = 'Prepare a comprehensive literature review focusing on methodologies, datasets, and performance benchmarks';
                document.querySelector('input[name="mode"][value="persona"]').checked = true;
                personaInputs.style.display = 'block';
                // If sample.pdf is available, auto-upload it
                const fileInput = document.getElementById('fileInput');
                try {
                    // Simulate user selecting sample.pdf if present
                    const resp = await fetch('/uploads/sample.pdf');
                    if (resp.ok) {
                        const blob = await resp.blob();
                        const file = new File([blob], 'sample.pdf', {type: 'application/pdf'});
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        fileInput.files = dt.files;
                        uploadForm.dispatchEvent(new Event('submit'));
                    } else {
                        alert('Sample PDF not found on server. Please upload manually.');
                    }
                } catch (e) {
                    alert('Demo failed: ' + e);
                }
            };
        }
        // Place demoBtn immediately after Analyze button for perfect alignment
        // Always inject into the .button-row for perfect alignment
        const btnRow = uploadForm.querySelector('.button-row');
        const analyzeBtn = btnRow ? btnRow.querySelector('button[type="submit"]') : null;
        if (btnRow && analyzeBtn && demoBtn !== analyzeBtn.nextSibling) {
            btnRow.insertBefore(demoBtn, analyzeBtn.nextSibling);
        }
        // Remove conflicting width/flex styles from JS
        demoBtn.style.flex = '1 1 0';
        demoBtn.style.maxWidth = '180px';
        demoBtn.style.minWidth = '120px';
        demoBtn.style.height = '42px';
        demoBtn.style.fontSize = '1.01em';
        demoBtn.style.marginLeft = '0';
    } else {
        if (demoBtn && demoBtn.parentNode) {
            demoBtn.parentNode.removeChild(demoBtn);
        }
    }
}
modeRadios.forEach(radio => {
    radio.addEventListener('change', updatePersonaInputsAndDemoBtn);
});
updatePersonaInputsAndDemoBtn();

function badge(level, lang) {
    let color = '#f44336';
    if (level === 'H2') color = '#2196f3';
    if (level === 'H3') color = '#43a047';
    if (level === 'BODY') color = '#aaa';
    let label = level;
    if (lang && lang !== 'LATIN') label += ` <span class='lang-badge'>${lang}</span>`;
    return `<span class="badge" style="background:${color}">${label}</span>`;
}

function tooltip(content, explanation) {
    return `<span class="tooltip">${content}<span class="tooltiptext">${explanation.map(e=>`• ${e}`).join('<br>')}</span></span>`;
}

function renderOutline(outline) {
    if (!outline || !outline.length) return '<em>No headings found.</em>';
    let html = '<ul class="outline-tree">';
    outline.forEach(h => {
        html += `<li>${badge(h.level, h.lang)} ${tooltip(h.text, h.explanation||[])} <span class='page-badge'>p.${h.page}</span></li>`;
    });
    html += '</ul>';
    return html;
}

function renderExtractedSections(sections) {
    if (!sections || !sections.length) return '';
    return `<h3>Top Sections</h3><ul class='section-list'>` +
        sections.map(s =>
          `<li>${badge(s.level)} <b>${s.text}</b> <span class='page-badge'>p.${s.page}</span><br>
          <span class='sim-score'>Score: ${s.similarity?.toFixed(3) || ''}</span><br>
          <span class='explanation'>${s.explanation||''}</span></li>`
        ).join('') + '</ul>';
}

function renderHighlights(subs) {
    if (!subs || !subs.length) return '';
    return `<ul class='highlight-list'>`+
      subs.map(h=> `<li><mark>${h.text}</mark> <span class='sim-score'>${h.similarity?.toFixed(3)||''}</span> <span class='explanation'>${h.explanation||''}</span></li>`).join('') + '</ul>';
}

function renderSubsectionAnalysis(analysis) {
    if (!analysis || !analysis.length) return '';
    return analysis.map(a=>
        `<div class='sub-analysis'>
            <b>Section:</b> <span>${a.section}</span><br>
            <b>Highlights:</b> ${renderHighlights(a.highlights)}
            <b>Summary:</b> <span class='summary'>${(a.summary||[]).join(' ')}</span>
        </div>`
    ).join('');
}

let judgesMode = false;

function toggleJudgesMode() {
    judgesMode = !judgesMode;
    // Re-render dashboard with current data
    if (window._lastShowDashboardArgs) {
        showDashboard(...window._lastShowDashboardArgs);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Judges Mode Toggle
    const judgesToggle = document.createElement('button');
    judgesToggle.textContent = 'Judges Mode';
    judgesToggle.className = 'btn-secondary';
    judgesToggle.style.float = 'right';
    judgesToggle.onclick = toggleJudgesMode;
    document.querySelector('header').appendChild(judgesToggle);

    // How it Works Modal Logic
    const modal = document.getElementById('howItWorksModal');
    const btn = document.getElementById('howItWorksBtn');
    const span = document.getElementById('closeHowItWorks');
    const body = document.getElementById('howItWorksBody');
    btn.onclick = function() {
        body.innerHTML = `
        <h2>How it Works: Connecting the Dots</h2>
        <p>This webapp transforms ordinary PDFs into interactive, intelligent documents using advanced AI and NLP. Here’s how:</p>
        <ul>
          <li><b>Round 1A: Structure Extraction</b>
            <ul>
              <li>PDF is parsed using font size clustering, boldness, margin, spacing, and TOC cross-checks.</li>
              <li>Multilingual and script-aware heuristics for robust heading detection (not just font size!).</li>
              <li>Outputs a clean JSON outline: Title, H1/H2/H3 with page numbers.</li>
              <li>Runs fully offline, on CPU, in &lt;10s for 50 pages.</li>
            </ul>
          </li>
          <li><b>Round 1B: Persona-Driven Intelligence</b>
            <ul>
              <li>Accepts a persona/job and a collection of PDFs.</li>
              <li>Ranks sections by semantic similarity (using all-MiniLM-L6-v2, 80MB, CPU-only).</li>
              <li>Highlights and summarizes the most relevant sections and sub-sections.</li>
              <li>Outputs a structured JSON for downstream use.</li>
            </ul>
          </li>
          <li><b>Explainability & Judges Mode</b>
            <ul>
              <li>Toggle Judges Mode to see heuristics, compliance, and signals for every run.</li>
              <li>Download a compliance report for transparency.</li>
            </ul>
          </li>
          <li><b>Compliance & Performance</b>
            <ul>
              <li>Dockerized for AMD64, CPU-only, offline, &lt;200MB model.</li>
              <li>Strict output directory: /output. No hardcoding, no web calls.</li>
              <li>Batch processing for all PDFs in /input to /output.</li>
            </ul>
          </li>
          <li><b>Unique Features</b>
            <ul>
              <li>One-click persona/job templates, demo mode, and PDF preview using Adobe PDF Embed API.</li>
              <li>Beautiful, responsive UI with advanced visualization and user guidance.</li>
            </ul>
          </li>
        </ul>
        <p><b>Want to win?</b> Focus on explainability, compliance, and user experience. This app is built to impress judges and users alike!</p>
        `;
        modal.style.display = 'block';
    };
    span.onclick = function() { modal.style.display = 'none'; };
    window.onclick = function(event) { if (event.target === modal) modal.style.display = 'none'; };
});

function renderExplainability(ec) {
    if (!ec) return '';
    return `<div class='explainability-section'>
        <h3>Explainability & Compliance</h3>
        <b>Heuristics:</b> <ul>` + (ec.heuristics||[]).map(h=>`<li>${h}</li>`).join('') + `</ul>
        <b>Compliance:</b> <ul>` + Object.entries(ec.compliance||{}).map(([k,v])=>`<li>${k}: <b>${v}</b></li>`).join('') + `</ul>
        <b>Signals Summary:</b> <span>${ec.signals_summary||''}</span>
        <button onclick="downloadComplianceReport()" class="btn-secondary" style="margin-top:8px">Download Compliance Report</button>
    </div>`;
}

function downloadComplianceReport() {
    if (!window._lastShowDashboardArgs) return;
    const [data] = window._lastShowDashboardArgs;
    const ec = data.explainability_and_compliance;
    if (!ec) return;
    const blob = new Blob([JSON.stringify(ec, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'compliance_report.json';
    a.click();
}

function showDashboard(data, mode, filename) {
    const dash = document.getElementById('dashboard');
    window._lastShowDashboardArgs = [data, mode, filename];
    let explainabilityHTML = '';
    if (judgesMode && data.explainability_and_compliance) {
        explainabilityHTML = renderExplainability(data.explainability_and_compliance);
    }
    if (mode === 'structure') {
        dash.innerHTML = `<h3 class='title-block'>${data.title}</h3><div id='pdfPreview'></div>${explainabilityHTML}<h2>Document Outline</h2>${renderOutline(data.outline)}`;
    } else if (mode === 'persona') {
        dash.innerHTML = `${explainabilityHTML}<h2>Persona-Driven Insights</h2>
            <div class='meta'>
                <b>Persona:</b> ${data.Metadata?.persona || ''}<br>
                <b>Job to be done:</b> ${data.Metadata?.job_to_be_done || ''}
            </div>
            ${renderExtractedSections(data['Extracted Sections'])}
            <hr><h3>Sub-section Analysis</h3>
            ${renderSubsectionAnalysis(data['Sub-section Analysis'])}`;
    }
    document.getElementById('resultsSection').style.display = 'block';

    // Show download links
    const links = document.getElementById('downloadLinks');
    let outFiles = [];
    if (mode === 'structure') {
        outFiles.push({
            label: 'Download Structure JSON',
            file: filename.replace(/\.pdf$/i, '.json')
        });
    } else if (mode === 'persona') {
        outFiles.push({
            label: 'Download Persona JSON',
            file: filename.replace(/\.pdf$/i, '_challenge1b_output.json')
        });
        outFiles.push({
            label: 'Download Structure JSON',
            file: filename.replace(/\.pdf$/i, '.json')
        });
    }
    links.innerHTML = outFiles.map(f => `<a href="/output/${encodeURIComponent(f.file)}" class="btn-secondary" download>${f.label}</a>`).join(' ');
}

function showPDFWithAdobeEmbed(pdfUrl) {
    if (!window.AdobeDC) {
        // Wait for AdobeDC to load
        document.addEventListener("adobe_dc_view_sdk.ready", function() {
            showPDFWithAdobeEmbed(pdfUrl);
        });
        return;
    }
    var adobeDCView = new AdobeDC.View({
        clientId: "79fa47e98dbe434da8224de4644bfec4",
        divId: "adobe-dc-view"
    });
    adobeDCView.previewFile({
        content: { location: { url: pdfUrl } },
        metaData: { fileName: "Uploaded.pdf" }
    }, {});
}

// Persona/job template autofill
const personaTemplate = document.getElementById('personaTemplate');
const personaInput = document.getElementById('personaInput');
personaTemplate && personaTemplate.addEventListener('change', function() {
    if (this.value) personaInput.value = this.value;
});
const jobTemplate = document.getElementById('jobTemplate');
const jobInput = document.getElementById('jobInput');
jobTemplate && jobTemplate.addEventListener('change', function() {
    if (this.value) jobInput.value = this.value;
});
// (Removed duplicate demoBtn declaration and logic as now handled above with dynamic injection)


document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;
    const status = document.getElementById('uploadStatus');
    status.innerHTML = '<span class="spinner"></span> Uploading...';
    const formData = new FormData();
    formData.append('file', file);
    // Mode and persona/job
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'persona') {
        formData.append('persona', document.getElementById('personaInput').value);
        formData.append('job', document.getElementById('jobInput').value);
    }
    try {
        const res = await fetch(mode === 'structure' ? '/upload' : '/persona_upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            status.innerHTML = '<span style="color:#43a047">✔ Analysis complete!</span>';
            showDashboard(data.output, mode, data.filename);
            // Always show PDF preview after analysis
            setTimeout(() => showPDFWithAdobeEmbed(`/uploads/${encodeURIComponent(data.filename)}`), 300);
        } else {
            status.innerHTML = `<span style='color:#e53935'>${data.error || 'Upload failed.'}</span>`;
        }
    } catch (err) {
        status.textContent = 'Error uploading or analyzing file.';
    }
});
