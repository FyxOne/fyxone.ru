let config = {};
let audioContext, analyser, dataArray, animationId;
let isPlaying = false;

const elements = {
    musicToggle: document.getElementById('musicToggle'),
    audio: document.getElementById('lofiStream'),
    volumeSlider: document.getElementById('volumeSlider'),
    visualizer: document.getElementById('visualizer'),
    konata: document.getElementById('konata'),
    linksContainer: document.getElementById('linksContainer'),
    pixelBg: document.querySelector('.pixel-bg'),
    volumeContainer: document.querySelector('.volume-container'),
    audioControls: document.querySelector('.audio-controls')
};

const ctx = elements.visualizer.getContext('2d');

// Загрузка конфига
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        init();
    } catch (error) {
        console.error('Ошибка загрузки config.json:', error);
    }
}

// Инициализация
function init() {
    setupBackground();
    setupAudio();
    generateLinks();
    setupKonata();
    setupEventListeners();
    resizeCanvas();
}

function setupBackground() {
    // Выбираем случайную гифку из массива
    const randomIndex = Math.floor(Math.random() * config.backgrounds.length);
    const randomBackground = config.backgrounds[randomIndex];
    elements.pixelBg.style.backgroundImage = `url('${randomBackground}')`;
    
    console.log(`Selected background: ${randomBackground}`);
}

function setupAudio() {
    elements.audio.src = config.audio;
    elements.audio.volume = elements.volumeSlider.value / 100;
}

function generateLinks() {
    elements.linksContainer.innerHTML = '';
    config.links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.className = 'link-button';
        linkElement.style.backgroundColor = link.color;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.innerHTML = `
            <div class="link-icon"><i class="${link.icon}"></i></div>
            <div class="link-text">${link.name}</div>
        `;
        elements.linksContainer.appendChild(linkElement);
    });
}

function setupKonata() {
    elements.konata.src = config.konataGif;
}

function setupEventListeners() {
    elements.musicToggle.addEventListener('click', toggleAudio);
    elements.volumeSlider.addEventListener('input', updateVolume);
    window.addEventListener('resize', resizeCanvas);
    setupKonataDrag();
    
    elements.audioControls.addEventListener('mouseenter', () => {
        elements.volumeContainer.style.opacity = '1';
        elements.volumeContainer.style.transform = 'translateX(0)';
    });
    
    elements.audioControls.addEventListener('mouseleave', () => {
        elements.volumeContainer.style.opacity = '0';
        elements.volumeContainer.style.transform = 'translateX(-10px)';
    });
    
    elements.audio.addEventListener('error', handleAudioError);
}

async function toggleAudio() {
    try {
        if (!isPlaying) {
            await startAudio();
        } else {
            stopAudio();
        }
    } catch (error) {
        console.error('Audio error:', error);
    }
}

async function startAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(elements.audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    
    await elements.audio.play();
    isPlaying = true;
    elements.musicToggle.classList.add('playing');
    elements.visualizer.classList.add('active');
    elements.konata.classList.add('show');
    drawVisualizer();
}

function stopAudio() {
    elements.audio.pause();
    isPlaying = false;
    elements.musicToggle.classList.remove('playing');
    elements.visualizer.classList.remove('active');
    elements.konata.classList.remove('show');
    cancelAnimationFrame(animationId);
}

function updateVolume() {
    elements.audio.volume = elements.volumeSlider.value / 100;
}

function handleAudioError() {
    console.log('Audio error');
}

function drawVisualizer() {
    if (!analyser || !isPlaying) return;
    
    animationId = requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, elements.visualizer.width, elements.visualizer.height);
    
    const box = document.querySelector('.box');
    const boxRect = box.getBoundingClientRect();
    const boxX = boxRect.left;
    const boxY = boxRect.top;
    const boxWidth = boxRect.width;
    
    const barCount = 50;
    const barWidth = 3;
    const maxBarHeight = 30;
    const barSpacing = 4;
    const totalWidth = (barWidth * barCount) + (barSpacing * (barCount - 1));
    const startX = boxX + (boxWidth - totalWidth) / 2;
    
    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 256;
        const barHeight = 5 + (amplitude * maxBarHeight);
        const x = startX + (i * (barWidth + barSpacing));
        const y = boxY - 15;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + amplitude * 0.4})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(x, y, barWidth, -barHeight);
    }
    ctx.shadowBlur = 0;
}

function setupKonataDrag() {
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    elements.konata.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = elements.konata.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        elements.konata.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        elements.konata.style.left = (e.clientX - dragOffset.x) + 'px';
        elements.konata.style.top = (e.clientY - dragOffset.y) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        elements.konata.style.cursor = 'grab';
    });

    elements.konata.addEventListener('dragstart', (e) => e.preventDefault());
}

function resizeCanvas() {
    elements.visualizer.width = window.innerWidth;
    elements.visualizer.height = window.innerHeight;
}

document.addEventListener('DOMContentLoaded', loadConfig);
document.body.addEventListener('click', function initAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });