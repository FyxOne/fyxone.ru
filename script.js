document.addEventListener('DOMContentLoaded', function() {
    const linksContainer = document.getElementById('linksContainer');
    const zoomControls = document.querySelector('.game-zoom-controls');
    const gameZoom = document.getElementById('gameZoom');
    const zoomValue = document.getElementById('zoomValue');
    const resetZoom = document.getElementById('resetZoom');
    
    // Исходные ссылки
    const originalLinks = `
        <a href="https://www.youtube.com/@FyxOne_" class="youtube">YouTube</a>
        <a href="https://www.twitch.tv/fyxone" class="twitch">Twitch</a>
        <a href="https://t.me/fyxone_alstr" class="telegram">Telegram</a>
        <a href="https://steamcommunity.com/id/FyxOne/" class="steam">Steam</a>
        <a href="https://github.com/FyxOne" class="github">GitHub</a>
        <a href="https://www.donationalerts.com/r/fyxone" class="donationalerts">Donation Alerts</a>
        <button id="playGameBtn" class="game-btn">Games</button>
    `;
    
    // Список игр
    const games = [
        {
            name: "FyxRun",
            url: "https://unruffled-mcclintock-c34fe1.netlify.app/",
            orientation: "vertical"
        },
        {
            name: "Cut the rope", 
            url: "https://www.vortice.app/play/cut-the-rope/",
            orientation: "horizontal"
        },
        {
            name: "Slow Roads",
            url: "https://slowroads.io",
            orientation: "horizontal"
        },
        {
            name: "Half Life",
            url: "https://x8bitrain.github.io/webXash/",
            orientation: "horizontal"
        },
        {
            name: "Subway Surfers", 
            url: "https://lnahtml.github.io/a8/subway-surfers-newyork",
            orientation: "vertical"
        },
        {
            name: "Minecraft Classic", 
            url: "https://emupedia.net/emupedia-game-minecraft-classic/",
            orientation: "horizontal"
        },
        {
            name: "Fruit Ninja", 
            url: "https://emupedia.net/emupedia-game-fruit-ninja/",
            orientation: "horizontal"
        },
        {
            name: "Minesweeper", 
            url: "https://emupedia.net/emupedia-game-minesweeper/",
            orientation: "vertical"
        }
    ];

    // Инициализация страницы
    function initPage() {
        linksContainer.innerHTML = originalLinks;
        document.getElementById('playGameBtn').addEventListener('click', showGamesMenu);
        zoomControls.style.display = 'none';
    }

    // Показать меню игр
    function showGamesMenu() {
        let gamesHTML = games.map(game => `
            <button class="game-btn" data-url="${game.url}" data-orientation="${game.orientation}">
                ${game.name}
            </button>
        `).join('');
        
        gamesHTML += `<button id="backBtn" class="game-btn">Back</button>`;
        linksContainer.innerHTML = gamesHTML;
        
        // Назначить обработчики для всех игр
        document.querySelectorAll('.game-btn').forEach((btn, index) => {
            if (games[index]) {
                btn.addEventListener('click', () => {
                    showGame(games[index].url, games[index].orientation);
                });
            }
        });
        
        document.getElementById('backBtn').addEventListener('click', initPage);
        zoomControls.style.display = 'none';
    }

    // Показать конкретную игру
    function showGame(url, orientation) {
        linksContainer.innerHTML = `
            <div class="game-container ${orientation}">
                <iframe id="gameIframe" src="${url}" allowfullscreen></iframe>
            </div>
            <button id="backToGamesBtn" class="game-btn">Back</button>
        `;
        
        document.getElementById('backToGamesBtn').addEventListener('click', showGamesMenu);
        
        // Показываем контролы масштабирования
        zoomControls.style.display = 'flex';
        setupGameZoom();
    }

    // Настройка масштабирования игры
    function setupGameZoom() {
        const iframe = document.getElementById('gameIframe');
        let currentZoom = 100;

        function updateZoom() {
            iframe.style.transform = `scale(${currentZoom / 100})`;
            iframe.style.transformOrigin = '0 0';
            iframe.style.width = `${10000/currentZoom}%`;
            iframe.style.height = `${10000/currentZoom}%`;
            zoomValue.textContent = `${currentZoom}%`;
            gameZoom.value = currentZoom;
        }

        gameZoom.addEventListener('input', function() {
            currentZoom = parseInt(this.value);
            updateZoom();
        });

        resetZoom.addEventListener('click', function() {
            currentZoom = 100;
            updateZoom();
        });

        // Инициализация
        updateZoom();
    }

    // Запуск
    initPage();
});