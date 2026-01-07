// ===================================
// STATE & DATA
// ===================================
let customSectionCount = 0;
let generatedWebsiteData = null;
let profilePhotoData = null;
let customSectionIcons = {};
let livePreviewTimeout = null;

// ===================================
// EXAMPLE PRESETS
// ===================================
const examplePresets = {
    'student': {
        fullName: 'Alex Chen',
        profession: 'Computer Science Student',
        education: 'B.S. Computer Science, Stanford University (2026)',
        bio: 'Passionate about building accessible web/mobile apps. Currently looking for summer internships in frontend development.',
        theme: 'dark',
        accentColor: '#2563eb', // Blue
        fontStyle: 'inter',
        layoutStyle: 'minimal-editorial',
        customSections: [
            { title: 'Resume PDF', link: '#' },
            { title: 'GitHub', link: '#' },
            { title: 'LinkedIn', link: '#' }
        ]
    },
    'professional': {
        fullName: 'Sarah Jenkins',
        profession: 'Senior Product Designer',
        education: '',
        bio: 'I craft digital products that humanize technology. 8+ years of experience leading design teams at rapid-growth startups.',
        theme: 'light',
        accentColor: '#4b5563', // Slate/Gray-ish (using closest accent) -> actually let's use black or purple
        // let's stick to valid inputs: #2563eb, #7c3aed, #db2777, #dc2626, #ea580c, #ca8a04, #16a34a, #0d9488
        accentColor: '#0d9488', // Teal
        fontStyle: 'inter',
        layoutStyle: 'split-focus',
        customSections: [
            { title: 'Portfolio', link: '#' },
            { title: 'Book a Call', link: '#' },
            { title: 'Email Me', link: '#' }
        ]
    },
    'creator': {
        fullName: 'JAX',
        profession: 'Digital Artist & Streamer',
        education: '',
        bio: 'Creating 3D worlds and teaching blender on YouTube. Join the community ↯',
        theme: 'dark',
        accentColor: '#db2777', // Pink
        fontStyle: 'inter',
        layoutStyle: 'bold-statement',
        customSections: [
            { title: 'YouTube Channel', link: '#' },
            { title: 'Twitch Stream', link: '#' },
            { title: 'Shop Prints', link: '#' },
            { title: 'Discord Server', link: '#' }
        ]
    },
    'writer': {
        fullName: 'Elena Fisher',
        profession: 'Freelance Journalist',
        education: '',
        bio: 'Stories about culture, technology, and the future of work. Published in The Atlantic, Wired, and The Verge.',
        theme: 'light',
        accentColor: '#dc2626', // Red
        fontStyle: 'crimson',
        layoutStyle: 'minimal-editorial',
        customSections: [
            { title: 'Selected Work', link: '#' },
            { title: 'Substack Newsletter', link: '#' },
            { title: 'Twitter / X', link: '#' }
        ]
    },
    'minimalist': {
        fullName: 'David R.',
        profession: 'Developer',
        education: '',
        bio: ' shipping code. building systems. exploring ai.',
        theme: 'dark',
        accentColor: '#16a34a', // Green
        fontStyle: 'mono',
        layoutStyle: 'timeline-story',
        customSections: [
            { title: 'projects', link: '#' },
            { title: 'notes', link: '#' },
            { title: 'contact', link: '#' }
        ]
    }
};

// ===================================
// VIEW MANAGEMENT
// ===================================
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    window.scrollTo(0, 0);
}

function showHomepage() {
    showView('homepage-view');
}

function showBuilder() {
    showView('builder-view');
    // Trigger initial preview after slight delay
    setTimeout(() => updateLivePreview(), 300);
}

function showPreview() {
    showView('preview-view');
}

function showExamples() {
    showView('examples-view');
}

function loadPreset(presetId) {
    const preset = examplePresets[presetId];
    if (!preset) return;

    // 1. Populate Text Inputs
    document.getElementById('fullName').value = preset.fullName;
    document.getElementById('profession').value = preset.profession;
    document.getElementById('education').value = preset.education;
    document.getElementById('bio').value = preset.bio;

    // 2. Set Radio Buttons (Theme, Accent, Font, Layout)
    const setRadio = (name, value) => {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    };

    setRadio('theme', preset.theme);
    setRadio('accentColor', preset.accentColor);
    setRadio('fontStyle', preset.fontStyle);
    setRadio('layoutStyle', preset.layoutStyle);

    // 3. Clear and Rebuild Custom Sections
    const container = document.getElementById('custom-sections-container');
    container.innerHTML = ''; // Clear existing
    customSectionIcons = {}; // Clear icons
    customSectionCount = 0; // Reset count

    // Add preset links
    preset.customSections.forEach(section => {
        addCustomSection(); // Adds a new section and increments count
        // The newly added section will have ID = customSectionCount
        const id = customSectionCount;
        const titleInput = document.getElementById(`section-title-${id}`);
        const linkInput = document.getElementById(`section-link-${id}`);

        if (titleInput) titleInput.value = section.title;
        if (linkInput) linkInput.value = section.link;
    });

    // 4. Navigate to Builder
    showBuilder();

    // 5. Trigger Preview Update
    updateLivePreview();
}

// ===================================
// LIVE PREVIEW FUNCTIONALITY
// ===================================
function updateLivePreview() {
    // Clear existing timeout
    if (livePreviewTimeout) {
        clearTimeout(livePreviewTimeout);
    }

    // Debounce preview updates
    livePreviewTimeout = setTimeout(() => {
        const formData = collectFormData();
        const websiteHTML = generateWebsiteHTML(formData);
        const websiteCSS = generateWebsiteCSS(formData);

        // Embed CSS into HTML for accurate preview
        const previewHTML = websiteHTML.replace(
            '<link rel="stylesheet" href="style.css">',
            `<style>${websiteCSS}</style>`
        );

        displayLivePreview(previewHTML);
    }, 300);
}

function displayLivePreview(html) {
    const iframe = document.getElementById('live-preview-iframe');
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
}

function setupLivePreviewListeners() {
    // Listen to all form inputs for live updates
    const form = document.getElementById('builder-form');
    if (!form) return;

    // Text inputs
    form.querySelectorAll('input[type="text"], input[type="url"], textarea').forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });

    // Radio buttons
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateLivePreview);
    });

    // Profile photo upload
    const profilePhotoInput = document.getElementById('profilePhoto');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePhotoData = e.target.result;
                    updateLivePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ===================================
// CUSTOM SECTIONS
// ===================================
function addCustomSection() {
    customSectionCount++;
    const container = document.getElementById('custom-sections-container');

    const sectionHtml = `
        <div class="custom-section" id="custom-section-${customSectionCount}">
            <div class="custom-section-header">
                <h4>Link ${customSectionCount}</h4>
                <button type="button" class="btn-remove" onclick="removeCustomSection(${customSectionCount})">Remove</button>
            </div>
            <div class="form-group">
                <label for="section-title-${customSectionCount}">Section Title</label>
                <input type="text" id="section-title-${customSectionCount}" name="section-title-${customSectionCount}" placeholder="Resume">
            </div>
            <div class="form-group">
                <label for="section-icon-${customSectionCount}">Icon / Logo (optional)</label>
                <input type="file" id="section-icon-${customSectionCount}" name="section-icon-${customSectionCount}" accept="image/*">
            </div>
            <div class="form-group">
                <label for="section-link-${customSectionCount}">Link</label>
                <input type="url" id="section-link-${customSectionCount}" name="section-link-${customSectionCount}" placeholder="https://example.com/resume.pdf">
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', sectionHtml);

    // Add event listeners for live preview
    document.getElementById(`section-title-${customSectionCount}`).addEventListener('input', updateLivePreview);
    document.getElementById(`section-link-${customSectionCount}`).addEventListener('input', updateLivePreview);
    document.getElementById(`section-icon-${customSectionCount}`).addEventListener('change', handleSectionIconUpload);

    updateLivePreview();
}

function removeCustomSection(id) {
    const section = document.getElementById(`custom-section-${id}`);
    if (section) {
        section.remove();
        delete customSectionIcons[id];
        updateLivePreview();
    }
}

function handleSectionIconUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const sectionId = event.target.id.match(/\d+/)[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            customSectionIcons[sectionId] = e.target.result;
            updateLivePreview();
        };
        reader.readAsDataURL(file);
    }
}

// ===================================
// FORM SUBMISSION & GENERATION
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('builder-form');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            generateWebsite();
        });
    }

    // Setup live preview listeners
    setupLivePreviewListeners();

    // Add initial custom section
    addCustomSection();
});

async function generateWebsite() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('active');

    // Simulate intentional generation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Collect form data
    const formData = collectFormData();

    // Generate website HTML and CSS
    const websiteHTML = generateWebsiteHTML(formData);
    const websiteCSS = generateWebsiteCSS(formData);

    // Store for download
    generatedWebsiteData = {
        html: websiteHTML,
        css: websiteCSS,
        formData: formData
    };

    // Show preview
    displayPreview(websiteHTML);

    // Hide loading and show preview
    loadingOverlay.classList.remove('active');
    showPreview();
}

function collectFormData() {
    const data = {
        fullName: document.getElementById('fullName')?.value || 'Your Name',
        profession: document.getElementById('profession')?.value || 'Your Profession',
        education: document.getElementById('education')?.value || '',
        bio: document.getElementById('bio')?.value || '',
        profilePhoto: profilePhotoData,
        theme: document.querySelector('input[name="theme"]:checked')?.value || 'dark',
        accentColor: document.querySelector('input[name="accentColor"]:checked')?.value || '#2563eb',
        fontStyle: document.querySelector('input[name="fontStyle"]:checked')?.value || 'inter',
        layoutStyle: document.querySelector('input[name="layoutStyle"]:checked')?.value || 'minimal-editorial',
        customSections: []
    };

    // Collect custom sections
    document.querySelectorAll('.custom-section').forEach((section) => {
        const id = section.id.match(/\d+/)[0];
        const title = document.getElementById(`section-title-${id}`)?.value;
        const link = document.getElementById(`section-link-${id}`)?.value;

        if (title && link) {
            data.customSections.push({
                title: title,
                link: link,
                icon: customSectionIcons[id] || null
            });
        }
    });

    return data;
}

// ===================================
// WEBSITE HTML GENERATION
// ===================================
function generateWebsiteHTML(data) {
    let fontLink = '';
    if (data.fontStyle === 'crimson') {
        fontLink = `<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet">`;
    } else if (data.fontStyle === 'mono') {
        fontLink = `<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">`;
    } else {
        fontLink = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;
    }

    let customSectionsHTML = '';
    if (data.customSections.length > 0) {
        const sectionsItems = data.customSections.map(section => `
            <a href="${escapeHtml(section.link)}" class="link-card" target="_blank" rel="noopener noreferrer">
                ${section.icon ? `<img src="${section.icon}" alt="${escapeHtml(section.title)}" class="link-icon">` : ''}
                <span class="link-title">${escapeHtml(section.title)}</span>
                <span class="link-arrow">→</span>
            </a>
        `).join('');

        customSectionsHTML = `
            <section class="links-section">
                <div class="links-grid">
                    ${sectionsItems}
                </div>
            </section>
        `;
    }

    const bioHTML = data.bio ? `
        <section class="about-section">
            <h2>About Me</h2>
            <p class="bio-text">${escapeHtml(data.bio).replace(/\n/g, '<br>')}</p>
        </section>
    ` : '';

    const educationHTML = data.education ? `<p class="education">${escapeHtml(data.education)}</p>` : '';

    const photoHTML = data.profilePhoto ? `<img src="${data.profilePhoto}" alt="${escapeHtml(data.fullName)}" class="profile-photo">` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.fullName)} - ${escapeHtml(data.profession)}</title>
    <meta name="description" content="${escapeHtml(data.profession)}${data.education ? ' - ' + escapeHtml(data.education) : ''}">
    ${fontLink}
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="container">
        <section class="hero-section">
            ${photoHTML}
            <h1 class="name">${escapeHtml(data.fullName)}</h1>
            <p class="profession">${escapeHtml(data.profession)}</p>
            ${educationHTML}
        </section>

        ${bioHTML}

        ${customSectionsHTML}
    </main>

    <footer class="site-footer">
        <p>Built with <a href="#" target="_blank">mypage</a></p>
    </footer>
</body>
</html>`;
}

// ===================================
// WEBSITE CSS GENERATION
// ===================================
function generateWebsiteCSS(data) {
    const isDark = data.theme === 'dark';

    // FONT FAMILIES
    let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    if (data.fontStyle === 'crimson') fontFamily = "'Crimson Pro', serif";
    if (data.fontStyle === 'mono') fontFamily = "'JetBrains Mono', monospace";

    // COLORS
    const colors = isDark ? {
        bg: '#0a0a0a',
        bgSec: '#1a1a1a',
        text: '#ffffff',
        textSec: '#a0a0a0',
        border: '#2a2a2a'
    } : {
        bg: '#ffffff',
        bgSec: '#f3f4f6',
        text: '#111827',
        textSec: '#6b7280',
        border: '#e5e7eb'
    };

    // COMMON CSS
    const commonCSS = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --bg: ${colors.bg};
            --bg-sec: ${colors.bgSec};
            --text: ${colors.text};
            --text-sec: ${colors.textSec};
            --border: ${colors.border};
            --accent: ${data.accentColor};
            --font: ${fontFamily};
        }
        body {
            font-family: var(--font);
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
        }
        img { display: block; max-width: 100%; }
        a { text-decoration: none; color: inherit; }
        h1, h2, h3, h4, h5, h6 { color: var(--accent); line-height: 1.2; }
        p { color: var(--text-sec); }
        .site-footer {
            text-align: center;
            padding: 2rem;
            border-top: 1px solid var(--border);
            font-size: 0.875rem;
            color: var(--text-sec);
            margin-top: auto;
        }
    `;

    // LAYOUT DEFINITIONS
    const layouts = {

        // 1. MINIMAL EDITORIAL (Centered, Vertical, Clean)
        'minimal-editorial': `
            body { display: flex; flex-direction: column; align-items: center; }
            .container { width: 100%; max-width: 680px; padding: 3rem 1.5rem; flex: 1; }
            
            .hero-section { text-align: center; margin-bottom: 2rem; }
            .profile-photo { 
                width: 120px; height: 120px; border-radius: 50%; 
                margin: 0 auto 1.5rem; object-fit: cover;
                border: 3px solid var(--accent);
            }
            .name { font-size: 2.5rem; font-weight: 600; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
            .profession { font-size: 1.125rem; font-weight: 500; font-style: italic; margin-bottom: 0.5rem; }
            .education { font-size: 0.9rem; }
            
            .about-section { text-align: center; margin-bottom: 2rem; }
            .about-section h2 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; font-weight: 600; color: var(--text-sec); }
            .bio-text { font-size: 1.125rem; line-height: 1.8; }
            
            .links-section { width: 100%; margin-bottom: 2rem; }
            .links-grid { display: grid; gap: 1rem; }
            .link-card {
                display: flex; align-items: center; justify-content: space-between;
                padding: 1.25rem; border: 1px solid var(--border); border-radius: 8px;
                transition: 0.2s; background: var(--bg-sec);
            }
            .link-card:hover { border-color: var(--accent); transform: translateY(-2px); }
            .link-left { display: flex; align-items: center; gap: 1rem; }
            .link-icon { width: 24px; height: 24px; object-fit: contain; }
            .link-title { font-weight: 500; }
            .link-arrow { font-size: 1.25rem; opacity: 0.5; }
        `,

        // 2. SPLIT FOCUS (Two Columns: Left Identity, Right Content)
        'split-focus': `
            @media (min-width: 900px) {
                body { overflow-x: hidden; }
                .container { 
                    display: grid; grid-template-columns: 350px 1fr; 
                    min-height: 100vh;
                }
                .hero-section { 
                    position: sticky; top: 0; height: 100vh; 
                    background: var(--bg-sec); border-right: 1px solid var(--border);
                    display: flex; flex-direction: column; justify-content: center; 
                    padding: 2.5rem; text-align: left;
                }
                .content-wrapper { padding: 3rem; }
                .about-section, .links-section, .site-footer { grid-column: 2; }
            }
            @media (max-width: 899px) {
                .container { display: flex; flex-direction: column; }
                .hero-section { padding: 3rem 1.5rem; text-align: center; background: var(--bg-sec); }
                .about-section, .links-section { padding: 2rem 1.5rem; }
            }
            
            .profile-photo { width: 150px; height: 150px; border-radius: 12px; margin-bottom: 1.5rem; object-fit: cover; border: 4px solid var(--accent); }
            .name { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.1; }
            .profession { font-size: 1.25rem; margin-bottom: 1rem; font-weight: 500; }
            .education { font-size: 0.95rem; }
            
            .about-section { margin-bottom: 2.5rem; padding: 1.5rem 3rem; }
            .about-section h2 { font-size: 1.5rem; margin-bottom: 1rem; color: var(--text); border-bottom: 2px solid var(--accent); display: inline-block; padding-bottom: 0.25rem; }
            .bio-text { font-size: 1.15rem; line-height: 1.7; opacity: 0.9; }
            
            .links-section { padding: 0 3rem 2rem; }
            .links-grid { display: grid; gap: 1.5rem; }
            .link-card { 
                display: flex; align-items: center; gap: 1rem; 
                padding: 1.5rem; border: 1px solid var(--border); border-radius: 6px;
                background: transparent;
            }
            .link-card:hover { background: var(--bg-sec); border-color: var(--accent); }
            .link-icon { width: 30px; height: 30px; }
            .link-title { font-weight: 600; flex: 1; }
            .link-left { display: contents; } 
        `,

        // 3. BOLD STATEMENT (Huge Type, Block Layout)
        'bold-statement': `
            body { background: var(--accent); color: white; }
            .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
            
            .hero-section { 
                min-height: 80vh; display: flex; flex-direction: column; 
                justify-content: center; align-items: center; text-align: center;
            }
            .profile-photo { 
                width: 180px; height: 180px; border-radius: 50%; 
                border: 6px solid rgba(255,255,255,0.2); 
                margin-bottom: 2rem; object-fit: cover;
            }
            .name { 
                font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; 
                text-transform: uppercase; line-height: 0.9; 
                color: white; margin-bottom: 1rem;
            }
            .profession { 
                font-size: 1.5rem; font-weight: 700; 
                background: white; color: var(--accent);
                padding: 0.25rem 1rem; display: inline-block;
            }
            .education { margin-top: 1rem; opacity: 0.9; color: rgba(255,255,255,0.8); }
            
            .content-wrapper { background: var(--bg); color: var(--text); border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; }
            .about-section { margin-bottom: 2rem; text-align: center; background: var(--bg); padding: 2.5rem; border-radius: 16px; }
            .about-section h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; color: var(--accent); }
            .bio-text { font-size: 1.25rem; text-align: center; max-width: 700px; margin: 0 auto; color: var(--text); }
            
            .links-section { padding: 0 1.5rem; }
            .links-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
            .link-card { 
                background: var(--bg-sec); padding: 2rem; border-radius: 12px;
                text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem;
                transition: transform 0.2s; border: none; color: var(--text);
            }
            .link-card:hover { transform: scale(1.02); background: white; color: var(--accent); }
            .link-left { display: contents; }
            .link-icon { width: 48px; height: 48px; margin-bottom: 0.5rem; }
            .link-title { font-size: 1.25rem; font-weight: 700; }
            .link-arrow { display: none; }
            .site-footer { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }
        `,

        // 4. CARD MODULAR (Grid Styled, Floating Cards)
        'card-modular': `
            body { background: var(--bg-sec); }
            .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
            
            .hero-section {
                background: var(--bg); padding: 2.5rem; border-radius: 24px;
                text-align: center; margin-bottom: 1.5rem;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            }
            .profile-photo { width: 100px; height: 100px; border-radius: 20px; margin-bottom: 1rem; object-fit: cover; border: 3px solid var(--accent); }
            .name { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
            .profession { font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; }
            
            .about-section {
                background: var(--bg); padding: 2rem; border-radius: 24px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 1.5rem;
            }
            .about-section h2 { font-size: 1.5rem; margin-bottom: 1rem; }
            
            .links-section { display: flex; flex-direction: column; gap: 1rem; }
            .links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
            .link-card {
                background: var(--bg); padding: 1.5rem; border-radius: 16px;
                display: flex; align-items: center; gap: 1rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.03);
                transition: 0.2s;
            }
            .link-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); border: 1px solid var(--accent); }
            .link-left { display: flex; align-items: center; gap: 1rem; }
            .link-icon { width: 32px; height: 32px; }
            .link-title { font-weight: 600; }
        `,

        // 5. TIMELINE STORY (Vertical Line, Steps)
        'timeline-story': `
            .container { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; border-left: 2px solid var(--border); margin-left: max(2rem, calc(50% - 400px)); }
            
            .hero-section { padding-left: 2rem; margin-bottom: 3rem; position: relative; }
            .hero-section::before {
                content: ''; position: absolute; left: -2.6rem; top: 10px;
                width: 16px; height: 16px; background: var(--accent); border-radius: 50%;
                border: 4px solid var(--bg);
            }
            .profile-photo { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 1.5rem; border: 2px solid var(--border); }
            .name { font-size: 2.5rem; margin-bottom: 0.5rem; }
            .profession { font-size: 1.25rem; font-family: monospace; color: var(--accent); }
            
            .about-section { padding-left: 2rem; margin-bottom: 3rem; position: relative; }
            .about-section::before {
                content: ''; position: absolute; left: -2.6rem; top: 6px;
                width: 16px; height: 16px; background: var(--border); border-radius: 50%;
                border: 4px solid var(--bg);
            }
            .about-section h2 { font-size: 1.5rem; margin-bottom: 1rem; }
            
            .links-section { padding-left: 2rem; position: relative; }
            .links-grid { display: grid; gap: 1.5rem; }
            .link-card {
                position: relative; padding: 1.5rem; background: var(--bg-sec);
                border-radius: 0 12px 12px 12px;
                display: flex; align-items: center; justify-content: space-between;
            }
            .link-card::before {
                content: ''; position: absolute; left: -2.6rem; top: 2rem;
                width: 12px; height: 12px; background: var(--bg); border: 2px solid var(--accent); border-radius: 50%;
            }
            .link-card::after {
                content: ''; position: absolute; left: -2rem; top: 2.4rem;
                width: 2rem; height: 1px; background: var(--border);
            }
            .link-card:hover { transform: translateX(5px); }
            .link-left { display: flex; align-items: center; gap: 1rem; }
            .link-icon { width: 24px; height: 24px; }
            .link-title { font-weight: 600; }
        `
    };

    const selectedLayoutCSS = layouts[data.layoutStyle] || layouts['minimal-editorial'];
    return commonCSS + selectedLayoutCSS;
}

// ===================================
// PREVIEW DISPLAY
// ===================================
function displayPreview(html) {
    const iframe = document.getElementById('preview-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
}

// ===================================
// DOWNLOAD FUNCTIONALITY
// ===================================
function downloadWebsite() {
    if (!generatedWebsiteData) {
        alert('Please generate a website first.');
        return;
    }

    // Create embedded version (CSS in HTML)
    const embeddedHTML = generatedWebsiteData.html.replace(
        '<link rel="stylesheet" href="style.css">',
        `<style>${generatedWebsiteData.css}</style>`
    );

    // Download HTML file
    downloadFile('index.html', embeddedHTML);

    // Also offer standalone CSS
    setTimeout(() => {
        const downloadCSS = confirm('Website downloaded! Would you also like to download the CSS as a separate file?');
        if (downloadCSS) {
            downloadFile('style.css', generatedWebsiteData.css);
        }
    }, 500);
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
