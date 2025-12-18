// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const markdownInput = document.getElementById('markdownInput');
const previewBtn = document.getElementById('previewBtn');
const printBtn = document.getElementById('printBtn');
const clearBtn = document.getElementById('clearBtn');
const previewSection = document.getElementById('previewSection');
const previewContent = document.getElementById('previewContent');
const printArea = document.getElementById('printArea');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Current markdown content
let currentMarkdown = '';

// Initialize i18n and update placeholders
window.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    updatePlaceholders();
});

// Language change handler
window.addEventListener('languageChanged', () => {
    updatePlaceholders();
    updateFileName();
});

// Update placeholders with current language
function updatePlaceholders() {
    markdownInput.placeholder = i18n.t('input.placeholder');
}

// Update file name display
function updateFileName() {
    if (!fileInput.files || fileInput.files.length === 0) {
        fileName.textContent = i18n.t('upload.noFile');
    }
}

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// File Upload Handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        fileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentMarkdown = event.target.result;
            markdownInput.value = currentMarkdown;

            // Auto preview
            renderPreview();
        };
        reader.readAsText(file);
    } else {
        fileName.textContent = i18n.t('upload.noFile');
    }
});

// Markdown Input Handler
markdownInput.addEventListener('input', (e) => {
    currentMarkdown = e.target.value;
});

// Preview Button Handler
previewBtn.addEventListener('click', () => {
    renderPreview();
});

// Print Button Handler
printBtn.addEventListener('click', () => {
    if (!currentMarkdown) {
        alert(i18n.t('messages.noPrintContent'));
        return;
    }

    // Render content to print area
    const html = marked.parse(currentMarkdown);
    printArea.innerHTML = html;

    // Trigger print
    window.print();
});

// Clear Button Handler
clearBtn.addEventListener('click', () => {
    if (confirm(i18n.t('messages.confirmClear'))) {
        currentMarkdown = '';
        markdownInput.value = '';
        fileInput.value = '';
        fileName.textContent = i18n.t('upload.noFile');
        previewContent.innerHTML = '';
        previewSection.classList.remove('active');
        printArea.innerHTML = '';
    }
});

// Render Preview Function
function renderPreview() {
    if (!currentMarkdown) {
        alert(i18n.t('messages.noPreviewContent'));
        return;
    }

    try {
        // Configure marked options
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        // Parse markdown to HTML
        const html = marked.parse(currentMarkdown);

        // Display preview
        previewContent.innerHTML = html;
        previewSection.classList.add('active');

        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        alert(i18n.t('messages.parseError') + error.message);
        console.error('Markdown parsing error:', error);
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printBtn.click();
    }

    // Ctrl/Cmd + Enter for preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        previewBtn.click();
    }
});

// Drag and Drop Support
const uploadArea = document.querySelector('.file-upload label');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#e8e8ff';
    uploadArea.style.borderColor = '#764ba2';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#f9f9ff';
    uploadArea.style.borderColor = '#667eea';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#f9f9ff';
    uploadArea.style.borderColor = '#667eea';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];

        // Check if file is markdown or text
        if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt')) {
            // Manually set the file to input
            fileInput.files = files;
            fileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (event) => {
                currentMarkdown = event.target.result;
                markdownInput.value = currentMarkdown;
                renderPreview();
            };
            reader.readAsText(file);
        } else {
            alert(i18n.t('messages.fileTypeError'));
        }
    }
});

// Initialize - console logs will be shown after i18n is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for i18n to initialize
    setTimeout(() => {
        console.log(i18n.t('messages.ready'));
        console.log(i18n.t('messages.shortcuts'));
    }, 100);
});