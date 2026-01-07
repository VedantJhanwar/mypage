// ===================================
// STATE & DATA
// ===================================
let customSectionCount = 0;
let generatedWebsiteData = null;
let profilePhotoData = null;
let customSectionIcons = {};
let livePreviewTimeout = null;

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
                <h4>Section ${customSectionCount}</h4>
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
            <h2>About</h2>
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
    let fontFamily = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;

    if (data.fontStyle === 'crimson') {
        fontFamily = `'Crimson Pro', Georgia, serif`;
    } else if (data.fontStyle === 'mono') {
        fontFamily = `'JetBrains Mono', 'Courier New', monospace`;
    }

    // Layout-specific variables - VERY DISTINCT
    const layouts = {
        minimal: {
            containerWidth: '600px',
            padding: '3.5rem 1.5rem',
            titleSize: 'clamp(1.875rem, 5vw, 2.5rem)',
            professionSize: '1rem',
            lineHeight: '1.6',
            photoSize: '90px',
            photoRadius: '50%',
            cardPadding: '1rem'
        },
        editorial: {
            containerWidth: '900px',
            padding: '7rem 4rem',
            titleSize: 'clamp(3.5rem, 8vw, 5.5rem)',
            professionSize: '2rem',
            lineHeight: '2.0',
            photoSize: '170px',
            photoRadius: '50%',
            cardPadding: '2.5rem'
        },
        modern: {
            containerWidth: '1100px',
            padding: '2.5rem 3rem',
            titleSize: 'clamp(3rem, 8vw, 6rem)',
            professionSize: '1.625rem',
            lineHeight: '1.4',
            photoSize: '200px',
            photoRadius: '24px',
            cardPadding: '2rem'
        },
        classic: {
            containerWidth: '720px',
            padding: '5.5rem 3rem',
            titleSize: 'clamp(2.125rem, 5vw, 3rem)',
            professionSize: '1.25rem',
            lineHeight: '1.8',
            photoSize: '140px',
            photoRadius: '12px',
            cardPadding: '1.75rem'
        }
    };

    const layout = layouts[data.layoutStyle] || layouts.minimal;

    // Color palette based on theme
    const colors = isDark ? {
        bg: '#0a0a0a',
        bgSecondary: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        border: '#2a2a2a'
    } : {
        bg: '#ffffff',
        bgSecondary: '#f8f9fa',
        text: '#1a1a1a',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
    };

    return `/* Generated by mypage */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --color-bg: ${colors.bg};
    --color-bg-secondary: ${colors.bgSecondary};
    --color-text: ${colors.text};
    --color-text-secondary: ${colors.textSecondary};
    --color-border: ${colors.border};
    --color-accent: ${data.accentColor};
}

body {
    font-family: ${fontFamily};
    color: var(--color-text);
    background: var(--color-bg);
    line-height: ${layout.lineHeight};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* All headings use accent color */
h1, h2, h3, h4, h5, h6 {
    color: var(--color-accent);
}

.container {
    max-width: ${layout.containerWidth};
    margin: 0 auto;
    padding: ${layout.padding};
    flex: 1;
}

/* Hero Section */
.hero-section {
    text-align: center;
    margin-bottom: ${data.layoutStyle === 'editorial' ? '4rem' : '3rem'};
    padding-bottom: ${data.layoutStyle === 'editorial' ? '3rem' : '2rem'};
    border-bottom: ${data.layoutStyle === 'editorial' || data.layoutStyle === 'classic' ? '2px' : '1px'} solid var(--color-border);
}

.profile-photo {
    width: ${layout.photoSize};
    height: ${layout.photoSize};
    border-radius: ${layout.photoRadius};
    object-fit: cover;
    margin-bottom: ${data.layoutStyle === 'editorial' ? '2.5rem' : '1.5rem'};
    border: 3px solid var(--color-accent);
    ${data.layoutStyle === 'modern' ? 'box-shadow: 0 10px 40px rgba(0,0,0,0.5);' : ''}
}

.name {
    font-size: ${layout.titleSize};
    font-weight: ${data.layoutStyle === 'editorial' ? '600' : '700'};
    margin-bottom: ${data.layoutStyle === 'editorial' ? '1.25rem' : '0.75rem'};
    letter-spacing: ${data.layoutStyle === 'modern' ? '-0.04em' : data.layoutStyle === 'editorial' ? '0em' : '-0.02em'};
    color: var(--color-accent);
    ${data.layoutStyle === 'modern' ? 'text-transform: none;' : ''}
}

.profession {
    font-size: ${layout.professionSize};
    color: var(--color-accent);
    font-weight: ${data.layoutStyle === 'editorial' ? '500' : data.layoutStyle === 'modern' ? '700' : '600'};
    margin-bottom: 0.75rem;
    ${data.layoutStyle === 'modern' ? 'text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.875rem;' : ''}
    ${data.layoutStyle === 'editorial' ? 'font-style: italic;' : ''}
}

.education {
    color: var(--color-text-secondary);
    font-size: ${data.layoutStyle === 'editorial' ? '1.125rem' : '1rem'};
}

/* About Section */
.about-section {
    margin-bottom: 3rem;
}

.about-section h2 {
    font-size: ${data.layoutStyle === 'editorial' ? '2.75rem' : data.layoutStyle === 'modern' ? '2.5rem' : '1.75rem'};
    font-weight: 600;
    margin-bottom: ${data.layoutStyle === 'editorial' ? '2.5rem' : '1.5rem'};
    color: var(--color-accent);
    text-align: ${data.layoutStyle === 'editorial' || data.layoutStyle === 'modern' ? 'center' : 'left'};
    ${data.layoutStyle === 'modern' ? 'letter-spacing: -0.03em;' : ''}
    ${data.layoutStyle === 'editorial' ? 'position: relative; padding-bottom: 1.5rem;' : ''}
}

${data.layoutStyle === 'editorial' ? `.about-section h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: var(--color-accent);
}
` : ''}

.bio-text {
    font-size: ${data.layoutStyle === 'editorial' ? '1.375rem' : data.layoutStyle === 'modern' ? '1.1875rem' : '1.0625rem'};
    color: var(--color-text-secondary);
    max-width: ${data.layoutStyle === 'editorial' ? '850px' : data.layoutStyle === 'modern' ? '900px' : '100%'};
    ${data.layoutStyle === 'editorial' || data.layoutStyle === 'modern' ? 'margin: 0 auto;' : ''}
    text-align: ${data.layoutStyle === 'editorial' || data.layoutStyle === 'modern' ? 'center' : 'left'};
    ${data.layoutStyle === 'classic' ? 'text-indent: 2.5em; font-style: italic;' : ''}
}

/* Links Section */
.links-section {
    margin-bottom: 3rem;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(${data.layoutStyle === 'modern' ? '380px' : data.layoutStyle === 'editorial' ? '340px' : '240px'}, 1fr));
    gap: ${data.layoutStyle === 'modern' ? '2rem' : data.layoutStyle === 'editorial' ? '2.5rem' : '1.125rem'};
}

.link-card {
    display: flex;
    align-items: center;
    gap: ${data.layoutStyle === 'modern' ? '1.5rem' : '1.125rem'};
    padding: ${layout.cardPadding};
    background: var(--color-bg-secondary);
    border: ${data.layoutStyle === 'modern' ? '2px' : '1px'} solid var(--color-border);
    border-radius: ${data.layoutStyle === 'classic' ? '6px' : data.layoutStyle === 'modern' ? '20px' : '10px'};
    text-decoration: none;
    color: var(--color-text);
    transition: all 200ms ease;
    position: relative;
    ${data.layoutStyle === 'editorial' ? 'border-left: 5px solid var(--color-accent); padding-left: 2rem;' : ''}
    ${data.layoutStyle === 'modern' ? 'background: linear-gradient(135deg, var(--color-bg-secondary), #0f0f0f);' : ''}
}

.link-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-${data.layoutStyle === 'modern' ? '6px' : '3px'});
    box-shadow: 0 ${data.layoutStyle === 'modern' ? '16px 50px' : data.layoutStyle === 'editorial' ? '10px 30px' : '6px 20px'} rgba(0, 0, 0, 0.5);
    ${data.layoutStyle === 'modern' ? 'background: linear-gradient(135deg, #1a1a1a, #0a0a0a);' : ''}
}

.link-icon {
    width: ${data.layoutStyle === 'modern' ? '48px' : data.layoutStyle === 'editorial' ? '40px' : '32px'};
    height: ${data.layoutStyle === 'modern' ? '48px' : data.layoutStyle === 'editorial' ? '40px' : '32px'};
    object-fit: contain;
    flex-shrink: 0;
    ${data.layoutStyle === 'modern' ? 'filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));' : ''}
}

.link-title {
    flex: 1;
    font-weight: ${data.layoutStyle === 'modern' ? '700' : data.layoutStyle === 'editorial' ? '500' : '600'};
    font-size: ${data.layoutStyle === 'modern' ? '1.375rem' : data.layoutStyle === 'editorial' ? '1.25rem' : '1.0625rem'};
}

.link-arrow {
    color: var(--color-accent);
    font-size: ${data.layoutStyle === 'modern' ? '1.75rem' : '1.375rem'};
    transition: transform 200ms ease;
    font-weight: ${data.layoutStyle === 'modern' ? 'bold' : 'normal'};
}

.link-card:hover .link-arrow {
    transform: translateX(${data.layoutStyle === 'modern' ? '10px' : '6px'}) scale(${data.layoutStyle === 'modern' ? '1.2' : '1.1'});
}

/*  Footer */
.site-footer {
    text-align: center;
    padding: 2rem;
    margin-top: auto;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
}

.site-footer a {
    color: var(--color-accent);
    text-decoration: none;
}

.site-footer a:hover {
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 3rem 1.5rem;
    }
    
    .links-grid {
        grid-template-columns: 1fr;
    }
    
    .name {
        font-size: 2rem;
    }
    
    .profession {
        font-size: 1.125rem;
    }
}
`;
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
}

function showPreview() {
    showView('preview-view');
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
                <h4>Section ${customSectionCount}</h4>
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

    // Add event listener for icon upload
    document.getElementById(`section-icon-${customSectionCount}`).addEventListener('change', handleSectionIconUpload);
}

function removeCustomSection(id) {
    const section = document.getElementById(`custom-section-${id}`);
    if (section) {
        section.remove();
        delete customSectionIcons[id];
    }
}

function handleSectionIconUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const sectionId = event.target.id.match(/\d+/)[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            customSectionIcons[sectionId] = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ===================================
// PROFILE PHOTO HANDLING
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    const profilePhotoInput = document.getElementById('profilePhoto');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePhotoData = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

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
        fullName: document.getElementById('fullName').value,
        profession: document.getElementById('profession').value,
        education: document.getElementById('education').value,
        bio: document.getElementById('bio').value,
        profilePhoto: profilePhotoData,
        theme: document.querySelector('input[name="theme"]:checked').value,
        accentColor: document.querySelector('input[name="accentColor"]:checked').value,
        fontStyle: document.querySelector('input[name="fontStyle"]:checked').value,
        layoutStyle: document.querySelector('input[name="layoutStyle"]:checked').value,
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
    const fontLink = data.fontStyle === 'crimson'
        ? `<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet">`
        : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

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
            <h2>About</h2>
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
    const fontFamily = data.fontStyle === 'crimson'
        ? `'Crimson Pro', Georgia, serif`
        : `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;

    const isEditorial = data.layoutStyle === 'editorial';

    // Color palette based on theme
    const colors = isDark ? {
        bg: '#0a0a0a',
        bgSecondary: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        border: '#2a2a2a'
    } : {
        bg: '#ffffff',
        bgSecondary: '#f8f9fa',
        text: '#1a1a1a',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
    };

    return `/* Generated by mypage */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --color-bg: ${colors.bg};
    --color-bg-secondary: ${colors.bgSecondary};
    --color-text: ${colors.text};
    --color-text-secondary: ${colors.textSecondary};
    --color-border: ${colors.border};
    --color-accent: ${data.accentColor};
}

body {
    font-family: ${fontFamily};
    color: var(--color-text);
    background: var(--color-bg);
    line-height: ${isEditorial ? '1.8' : '1.6'};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    max-width: ${isEditorial ? '800px' : '700px'};
    margin: 0 auto;
    padding: ${isEditorial ? '5rem 2rem' : '4rem 2rem'};
    flex: 1;
}

/* Hero Section */
.hero-section {
    text-align: center;
    margin-bottom: ${isEditorial ? '4rem' : '3rem'};
    padding-bottom: ${isEditorial ? '3rem' : '2rem'};
    border-bottom: ${isEditorial ? '2px' : '1px'} solid var(--color-border);
}

.profile-photo {
    width: ${isEditorial ? '140px' : '120px'};
    height: ${isEditorial ? '140px' : '120px'};
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1.5rem;
    border: 3px solid var(--color-border);
}

.name {
    font-size: ${isEditorial ? 'clamp(2.5rem, 5vw, 3.5rem)' : 'clamp(2rem, 5vw, 3rem)'};
    font-weight: ${isEditorial ? '600' : '700'};
    margin-bottom: 0.5rem;
    letter-spacing: ${isEditorial ? '-0.01em' : '-0.02em'};
}

.profession {
    font-size: ${isEditorial ? '1.5rem' : '1.25rem'};
    color: var(--color-accent);
    font-weight: ${isEditorial ? '400' : '500'};
    margin-bottom: 0.5rem;
}

.education {
    color: var(--color-text-secondary);
    font-size: ${isEditorial ? '1.125rem' : '1rem'};
}

/* About Section */
.about-section {
    margin-bottom: 3rem;
}

.about-section h2 {
    font-size: ${isEditorial ? '2rem' : '1.5rem'};
    font-weight: 600;
    margin-bottom: 1rem;
    ${isEditorial ? 'text-align: center;' : ''}
}

.bio-text {
    font-size: ${isEditorial ? '1.125rem' : '1rem'};
    color: var(--color-text-secondary);
    max-width: ${isEditorial ? '700px' : '600px'};
    ${isEditorial ? 'margin: 0 auto;' : ''}
    ${isEditorial ? 'text-align: center;' : ''}
}

/* Links Section */
.links-section {
    margin-bottom: 3rem;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(${isEditorial ? '300px' : '280px'}, 1fr));
    gap: 1rem;
}

.link-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: ${isEditorial ? '1.5rem' : '1.25rem'};
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: ${isEditorial ? '4px' : '8px'};
    text-decoration: none;
    color: var(--color-text);
    transition: all 150ms ease;
    position: relative;
}

.link-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, ${isDark ? '0.3' : '0.1'});
}

.link-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
}

.link-title {
    flex: 1;
    font-weight: 500;
    font-size: ${isEditorial ? '1.125rem' : '1rem'};
}

.link-arrow {
    color: var(--color-accent);
    font-size: 1.25rem;
    transition: transform 150ms ease;
}

.link-card:hover .link-arrow {
    transform: translateX(4px);
}

/* Footer */
.site-footer {
    text-align: center;
    padding: 2rem;
    margin-top: auto;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
}

.site-footer a {
    color: var(--color-accent);
    text-decoration: none;
}

.site-footer a:hover {
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 3rem 1.5rem;
    }
    
    .links-grid {
        grid-template-columns: 1fr;
    }
    
    .name {
        font-size: 2rem;
    }
    
    .profession {
        font-size: 1.125rem;
    }
}
`;
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

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    // Add initial custom section
    addCustomSection();
});
