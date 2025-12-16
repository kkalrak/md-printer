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
        fileName.textContent = '선택된 파일 없음';
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
        alert('프린트할 내용이 없습니다. Markdown 파일을 업로드하거나 텍스트를 입력해주세요.');
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
    if (confirm('모든 내용을 초기화하시겠습니까?')) {
        currentMarkdown = '';
        markdownInput.value = '';
        fileInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        previewContent.innerHTML = '';
        previewSection.classList.remove('active');
        printArea.innerHTML = '';
    }
});

// Render Preview Function
function renderPreview() {
    if (!currentMarkdown) {
        alert('미리볼 내용이 없습니다. Markdown 파일을 업로드하거나 텍스트를 입력해주세요.');
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
        alert('Markdown 파싱 중 오류가 발생했습니다: ' + error.message);
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
            alert('Markdown 파일(.md, .markdown) 또는 텍스트 파일(.txt)만 지원됩니다.');
        }
    }
});

// Initialize
console.log('Markdown 프린터가 준비되었습니다.');
console.log('단축키: Ctrl/Cmd + P (프린트), Ctrl/Cmd + Enter (미리보기)');