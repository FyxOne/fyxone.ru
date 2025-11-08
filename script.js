let config = {};
let audioContext, analyser, dataArray, animationId;
let isPlaying = false;
let currentBgIndex = 0;
let visualizerColor = "#ffffff";

const elements = {
    panelToggle: document.getElementById('panel-toggle'),
    controlPanel: document.getElementById('control-panel'),
    musicToggle: document.getElementById('musicToggle'),
    audio: document.getElementById('lofiStream'),
    volumeSlider: document.getElementById('volumeSlider'),
    visualizer: document.getElementById('visualizer'),
    konata: document.getElementById('konata'),
    linksContainer: document.getElementById('linksContainer'),
    pixelBg: document.querySelector('.pixel-bg'),
    prevBg: document.getElementById('prev-bg'),
    nextBg: document.getElementById('next-bg'),
    radioUrl: document.getElementById('radio-url'),
    saveRadio: document.getElementById('save-radio'),
    resetRadio: document.getElementById('reset-radio'),
    bgUrl: document.getElementById('bg-url'),
    saveBg: document.getElementById('save-bg'),
    resetBg: document.getElementById('reset-bg'),
    konataUrl: document.getElementById('konata-url'),
    saveKonata: document.getElementById('save-konata'),
    resetKonata: document.getElementById('reset-konata'),
    visualizerColor: document.getElementById('visualizer-color'),
    datetimeWidget: document.getElementById('datetime-widget'),
    holidayWidget: document.getElementById('holiday-widget'),
    weatherIcon: document.getElementById('weather-icon'),
    weatherText: document.getElementById('weather-text'),
    userAvatar: document.getElementById('user-avatar'),
    userName: document.getElementById('user-name'),
    userBio: document.getElementById('user-bio')
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
    loadSavedSettings();
    setupUserProfile();
    setupBackground();
    setupAudio();
    generateLinks();
    setupKonata();
    setupEventListeners();
    resizeCanvas();
    startDateTime();
    loadWeather();
}

function setupUserProfile() {
    if (config.user) {
        if (config.user.avatar) {
            elements.userAvatar.src = config.user.avatar;
        }
        if (config.user.name) {
            elements.userName.textContent = config.user.name;
            document.title = config.user.name;
        }
        if (config.user.bio) {
            elements.userBio.textContent = config.user.bio;
        }
    }
}

function loadSavedSettings() {
    // ВСЕГДА случайный фон при каждой загрузке
    currentBgIndex = Math.floor(Math.random() * config.backgrounds.length);
    
    // Загрузка кастомного радио
    const savedRadioUrl = localStorage.getItem('customRadioUrl');
    if (savedRadioUrl) {
        config.audio = savedRadioUrl;
        elements.radioUrl.value = savedRadioUrl;
    }
    
    // Загрузка кастомного фона
    const savedBgUrl = localStorage.getItem('customBgUrl');
    if (savedBgUrl) {
        elements.bgUrl.value = savedBgUrl;
    }
    
    // Загрузка кастомной конаты
    const savedKonataUrl = localStorage.getItem('customKonataUrl');
    if (savedKonataUrl) {
        elements.konataUrl.value = savedKonataUrl;
        elements.konata.src = savedKonataUrl;
    }
    
    // Загрузка цвета визуализатора
    const savedColor = localStorage.getItem('visualizerColor');
    if (savedColor) {
        visualizerColor = savedColor;
        elements.visualizerColor.value = savedColor;
    } else if (config.visualizerColor) {
        visualizerColor = config.visualizerColor;
        elements.visualizerColor.value = config.visualizerColor;
    }
}

function setupBackground() {
    const savedBgUrl = localStorage.getItem('customBgUrl');
    
    // Если есть кастомный фон и мы на нем
    if (savedBgUrl && currentBgIndex === config.backgrounds.length) {
        elements.pixelBg.style.backgroundImage = `url('${savedBgUrl}')`;
    } 
    // Иначе используем случайный стандартный фон
    else if (currentBgIndex < config.backgrounds.length) {
        elements.pixelBg.style.backgroundImage = `url('${config.backgrounds[currentBgIndex]}')`;
    }
    // Если индекс вышел за пределы (на всякий случай)
    else {
        currentBgIndex = Math.floor(Math.random() * config.backgrounds.length);
        elements.pixelBg.style.backgroundImage = `url('${config.backgrounds[currentBgIndex]}')`;
    }
}

function changeBackground(direction) {
    const savedBgUrl = localStorage.getItem('customBgUrl');
    const totalBackgrounds = config.backgrounds.length + (savedBgUrl ? 1 : 0);
    
    if (direction === 'next') {
        currentBgIndex = (currentBgIndex + 1) % totalBackgrounds;
    } else {
        currentBgIndex = (currentBgIndex - 1 + totalBackgrounds) % totalBackgrounds;
    }
    
    setupBackground();
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
        linkElement.className = 'link-tile';
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        
        // Устанавливаем фон кнопки
        if (link.customBackground) {
            linkElement.style.backgroundImage = `url('${link.customBackground}')`;
            linkElement.style.backgroundSize = 'cover';
            linkElement.style.backgroundPosition = 'center';
        } else {
            linkElement.style.backgroundColor = link.color;
        }
        
        // Создаем иконку
        const iconElement = document.createElement('div');
        iconElement.className = 'link-icon';
        
        if (link.customIcon) {
            // Кастомная иконка как изображение
            iconElement.innerHTML = `<img src="${link.customIcon}" alt="${link.name}">`;
            iconElement.classList.add('custom-image');
        } else if (link.icon) {
            // Иконка FontAwesome
            iconElement.innerHTML = `<i class="${link.icon}"></i>`;
        } else {
            // Первая буква названия как fallback
            iconElement.textContent = link.name.charAt(0);
            iconElement.style.fontSize = '24px';
            iconElement.style.fontWeight = 'bold';
        }
        
        linkElement.appendChild(iconElement);
        linkElement.title = link.name; // Добавляем подсказку с названием
        
        elements.linksContainer.appendChild(linkElement);
    });
}

function setupKonata() {
    const savedKonataUrl = localStorage.getItem('customKonataUrl');
    if (savedKonataUrl) {
        elements.konata.src = savedKonataUrl;
    } else {
        elements.konata.src = config.konataGif;
    }
}

// Дата, время и праздники
function startDateTime() {
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function updateDateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        const timeString = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Делаем первую букву заглавной
        const capitalizedDate = capitalizeFirst(dateString);
        
        elements.datetimeWidget.textContent = `${capitalizedDate} • ${timeString}`;
        checkHolidays(now);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function checkHolidays(date) {
    const today = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const holiday = config.holidays.find(h => h.date === today);
    
    if (holiday) {
        elements.holidayWidget.textContent = holiday.name;
        elements.holidayWidget.style.display = 'block';
    } else {
        elements.holidayWidget.style.display = 'none';
    }
}

// Реальная погода по IP
async function loadWeather() {
    const iconEl = document.getElementById('weather-icon');
    const textEl = document.getElementById('weather-text');

    try {
        const configRes = await fetch('config.json');
        const config = await configRes.json();

        const geoRes = await fetch('https://ipwhois.app/json/');
        if (!geoRes.ok) throw new Error('Не удалось получить данные по IP');
        const geoData = await geoRes.json();

        const latitude = geoData.latitude;
        const longitude = geoData.longitude;
        const city = geoData.city || 'Ваш город';

        if (!latitude || !longitude) throw new Error('Не удалось определить координаты');

        const apiKey = '9289b36e7978be851080777d8e597146';
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=ru&appid=${apiKey}`
        );
        if (!weatherRes.ok) throw new Error('Ошибка запроса к OpenWeatherMap');

        const weather = await weatherRes.json();
        const temp = Math.round(weather.main.temp);
        const desc = weather.weather[0].description;
        const main = weather.weather[0].main;

        const emoji = config.weatherEmojis[main] || config.weatherEmojis[desc] || '🌤️';

        iconEl.textContent = emoji;
        textEl.textContent = `${city}: ${temp}°C, ${desc}`;
    } catch (err) {
        console.error('❌ Ошибка загрузки погоды:', err);
        iconEl.textContent = '🌤️';
        textEl.textContent = 'Погода недоступна';
    }
}

function setupEventListeners() {
    // Панель управления
    elements.panelToggle.addEventListener('click', () => {
        const isOpening = !elements.controlPanel.classList.contains('open');
        elements.controlPanel.classList.toggle('open');
        
        // На мобилках добавляем/убираем класс для блокировки скролла
        if (window.innerWidth <= 768) {
            if (isOpening) {
                document.body.classList.add('control-panel-open');
            } else {
                document.body.classList.remove('control-panel-open');
            }
        }
    });
    
    // Музыка
    elements.musicToggle.addEventListener('click', toggleAudio);
    elements.volumeSlider.addEventListener('input', updateVolume);
    
    // Фоны
    elements.nextBg.addEventListener('click', () => changeBackground('next'));
    elements.prevBg.addEventListener('click', () => changeBackground('prev'));
    
    // Радио
    elements.saveRadio.addEventListener('click', saveCustomRadio);
    elements.resetRadio.addEventListener('click', resetCustomRadio);
    
    // Кастомный фон
    elements.saveBg.addEventListener('click', saveCustomBg);
    elements.resetBg.addEventListener('click', resetCustomBg);
    
    // Кастомная коната
    elements.saveKonata.addEventListener('click', saveCustomKonata);
    elements.resetKonata.addEventListener('click', resetCustomKonata);
    
    // Цвет визуализатора
    elements.visualizerColor.addEventListener('input', updateVisualizerColor);
    
    // Остальное
    window.addEventListener('resize', resizeCanvas);
    setupKonataDrag();
    elements.audio.addEventListener('error', handleAudioError);
    
    // Закрытие панели при клике вне её
    document.addEventListener('click', (e) => {
        if (!elements.controlPanel.contains(e.target) && !elements.panelToggle.contains(e.target)) {
            elements.controlPanel.classList.remove('open');
            document.body.classList.remove('control-panel-open');
        }
    });
}

function saveCustomRadio() {
    const url = elements.radioUrl.value.trim();
    if (url) {
        config.audio = url;
        localStorage.setItem('customRadioUrl', url);
        setupAudio();
        if (isPlaying) {
            elements.audio.play();
        }
    }
}

function resetCustomRadio() {
    localStorage.removeItem('customRadioUrl');
    config.audio = "https://lofi.stream.laut.fm/lofi?t302=2025-10-10_15-05-27&uuid=3b887987-e28a-4db9-abf2-1ac9807c1120";
    elements.radioUrl.value = '';
    setupAudio();
    if (isPlaying) {
        elements.audio.play();
    }
}

function saveCustomBg() {
    const url = elements.bgUrl.value.trim();
    if (url) {
        localStorage.setItem('customBgUrl', url);
        currentBgIndex = config.backgrounds.length; // Переключаемся на кастомный фон
        setupBackground();
    }
}

function resetCustomBg() {
    localStorage.removeItem('customBgUrl');
    elements.bgUrl.value = '';
    currentBgIndex = Math.floor(Math.random() * config.backgrounds.length);
    setupBackground();
}

function saveCustomKonata() {
    const url = elements.konataUrl.value.trim();
    if (url) {
        localStorage.setItem('customKonataUrl', url);
        elements.konata.src = url;
    }
}

function resetCustomKonata() {
    localStorage.removeItem('customKonataUrl');
    elements.konataUrl.value = '';
    elements.konata.src = config.konataGif;
}

function updateVisualizerColor() {
    visualizerColor = elements.visualizerColor.value;
    localStorage.setItem('visualizerColor', visualizerColor);
}

async function toggleAudio() {
    try {
        if (!isPlaying) {
            await startAudio();
            elements.musicToggle.innerHTML = '<i class="fas fa-pause"></i><span>Pause Music</span>';
        } else {
            stopAudio();
            elements.musicToggle.innerHTML = '<i class="fas fa-play"></i><span>Play Music</span>';
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
    elements.visualizer.classList.add('active');
    elements.konata.classList.add('show');
    drawVisualizer();
}

function stopAudio() {
    elements.audio.pause();
    isPlaying = false;
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
    
    // Конвертируем hex в rgba для прозрачности
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 256;
        const barHeight = 5 + (amplitude * maxBarHeight);
        const x = startX + (i * (barWidth + barSpacing));
        const y = boxY - 15;
        
        ctx.fillStyle = hexToRgba(visualizerColor, 0.6 + amplitude * 0.4);
        ctx.shadowBlur = 10;
        ctx.shadowColor = hexToRgba(visualizerColor, 0.5);
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