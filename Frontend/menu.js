if (!localStorage.getItem('player_id')) window.location.href = 'LoginForm/login.html';

localStorage.removeItem('enemyId');
localStorage.removeItem('battle_id');

window.addEventListener('load', function() {
    ChangeStatus('afk');
});




/*=====================Переменные=====================*/
const arrayText = ['🏆 Побед', '💔 Поражений', '⭐ Рейтинг', '🎮 Игр', '🏅 Winrate', `<img src="./image/coin.png" alt="" class="coinImage">&nbsp;Монет`]; /* two array to draw html */
const arrayObj = ['победы', 'поражения', 'рейтинг', 'всего_боёв', '🏅 Winrate', 'монеты']; /* two array to draw html */
const imgname = ['smallHeal', 'mediumHeal', 'bigHeal']; /* image name of heal */
const potionName = ['Малое зелье', 'Среднее зелье', 'Большое зелье']; /* name of heal */
const price = [100,300,800]; /* price of heal */
const pokemonGrid = document.querySelector('.pokemonGrid'); /* grid of six pokemons later draw html */
const setText = document.querySelector('.setText'); /* text under six pokemons "Выбрано: 0/3" - selected 0/3. to change number*/
const buttonBattle = document.querySelector('.pokemonCard-button'); /* button under six pokemons to enter fidner battle */
const myPokemons = await loadMyPokemons(); /* [{имя,опыт,опыт_некст,уровень}, ...] */
const players = await getAllPlayers(); /* list of player with some info like status etc */
let stats = document.querySelector('.statistic-grid'); /* stats of player like amonut of games winrate etc */
let allpotionBlock = document.querySelector('.allpotion'); /* potions of healing spells */
let pointerPlayerList = document.querySelector('.player-list');/* player in menu righted */
let menu_stats_of_player_html_set = '';
let six_pokemon_grid_html = '';
let potion_HTML_to_Set = '';
let htmlToAddToPlayerList = ''; /* list of player right in menu change every 3 secends */
let PlayerPick = []; /* current selected pokemons */
let checkForReady = false; /* boolean checking for is pressed button_battle? if not we can change selected pokemon */
let statisticOfPlayer = null; /* {amount_battle, date_reg, nickname, coins, exp, wins, loses, raiting, status, level} */


/*=====================async-functions=====================*/
async function loadMyStats() {
    const playerId = localStorage.getItem('player_id');
    const response = await fetch(`http://localhost:5000/api/player/stats?player_id=${playerId}`);
    const data = await response.json();
    statisticOfPlayer = data;
}
await loadMyStats();
document.querySelector('.Nickname').innerText = statisticOfPlayer.имя;

async function loadMyPokemons() {
    const playerId = localStorage.getItem('player_id');
    const response = await fetch(`http://localhost:5000/api/player/my-pokemons?player_id=${playerId}`);
    const data = await response.json();
    return data.pokemons;
}

async function getAllPlayers() {
    const myId = localStorage.getItem('player_id');
    const response = await fetch(`http://localhost:5000/api/players?player_id=${myId}`);
    const data = await response.json();
    return data.players;
}

// Функция обновления монет
async function updateCoinsDisplay() {
    const playerId = localStorage.getItem('player_id');
    const response = await fetch(`http://localhost:5000/api/player/stats?player_id=${playerId}`);
    const data = await response.json();
    
    // Обновляем монеты в статистике
    const statsElements = document.querySelectorAll('.stats');
    if (statsElements.length >= 5) {
        statsElements[5].querySelector('p').innerHTML = `${data.монеты} <img src="./image/coin.png" alt="" class="coinImage">`;
    }
}

/*=====================functions=====================*/
function ChangeStatus(status){
    fetch('http://localhost:5000/api/player/status', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            player_id: localStorage.getItem('player_id'),
            status: status
        })
    });
}

/*=====================Drawing-HTML=====================*/

                  /*STATS*/
for(let i = 0;i < arrayText.length;i++){
    let value;
    if(i === 4) { 
        const wins = statisticOfPlayer[arrayObj[0]]; 
        const losses = statisticOfPlayer[arrayObj[1]];
        const total = wins + losses;
        value = total > 0 ? Math.round((wins / total) * 100) + '%' : '0%';
    } 
    else value = statisticOfPlayer[arrayObj[i]];
    menu_stats_of_player_html_set += `
        <div class="stats">
            <p>${value}</p>
            <span class="miniText">${arrayText[i]}</span>
        </div>
    `;
}
stats.innerHTML = menu_stats_of_player_html_set;

                  /*pokemonGrid+expLevel*/
for (let i = 0; i < 6; i++) {
    let name = myPokemons[i].имя;
    let currExp = myPokemons[i].опыт;
    let nextLvlExp = myPokemons[i].опыт_до_след_уровня;
    let level = myPokemons[i].уровень;
    let procent = Math.round((currExp/nextLvlExp)*100);
    six_pokemon_grid_html += `<div class="pokemonCard" data-name="${name}">
        <div class="onePokemonCard"><img src="image/${name}.png" alt="" class="imagePokemon"></div>
        <p class="textNamePokemon">${name}</p>
        
        <div class="infoAboutLvlAndExp">
            <span class="lvlofPokemon">Lvl <span class="level-number">${level}</span></span>
            <div class="exp-row">
                <span class="span-exp">Exp</span>
                <div class="exp-bar-bg">                    
                    <div class="exp-bar-fill" style="width: ${procent}%;"></div> 
                </div>  
                <span class="span-exp span-procent-exp">${procent}%</span>          
            </div>
            <p class="amountOfExp">${currExp}/${nextLvlExp}</p>
        </div>
    </div>`;
}
pokemonGrid.innerHTML = six_pokemon_grid_html;
setText.innerText = 'Выбрано: 0/3';

                  /*PotionHTML*/
async function loadInventory() {
    const playerId = localStorage.getItem('player_id');
    const response = await fetch(`http://localhost:5000/api/inventory?player_id=${playerId}`);
    const data = await response.json();
    return data.items;
}

// Отрисовка магазина
async function drawShop() {
    const inventory = await loadInventory();
    potion_HTML_to_Set = '';
    inventory.forEach( (item,index) => {
        potion_HTML_to_Set += `
            <div class="potion">
                <img src="./image/${item.название}.png" alt="" class="potionImage">
                <p>${item.название}</p>
                <p>${price[index]} <img src="./image/coin.png" alt="" class="coinImage"></p>
                <p> У вас: ${item.количество} шт.</p>
                <button class="button-potions" data-item-id="${index + 1}">Купить</button>
            </div>
        `;
    });
    
    allpotionBlock.innerHTML = potion_HTML_to_Set;
    
    // Обработчики на кнопки покупки
    document.querySelectorAll('.button-potions').forEach(btn => {
        btn.addEventListener('click', async function() {
            const playerId = localStorage.getItem('player_id');
            const response = await fetch('http://localhost:5000/api/shop/buy', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    player_id: playerId,
                    item_id: this.dataset.itemId
                })
            });
            
            const result = await response.json();
            alert(result.message);
            if (result.status === 'ok') {
                drawShop();
                updateCoinsDisplay();
            }
        });
    });
}

drawShop();

                  /*Players in lobby*/
async function refreshPlayerList() {
    const players = await getAllPlayers();
    let htmlToAddToPlayerList = `
        <p class="menuText marginADD">
        <i class="fa fa-users"></i>&nbsp;
        Игроки в лобби 
        </p>
    `;
    
    players.forEach(p => {
        let statusText, statusClass;
        if (p.статус === 'ready') {
            statusText = '🟢 Ready';
            statusClass = 'ready';
        } else if (p.статус === 'in-battle') {
            statusText = '🔴 In battle';
            statusClass = 'in-battle';
        } else if(p.статус === 'afk'){
            statusText = '🟡 AFK';
            statusClass = 'afk';
        }
        else{
            statusText = '⚫ Offline';
            statusClass = 'offline';            
        }
        htmlToAddToPlayerList += `
            <div class="player-card">
                <div class="firstRow-playerCard">
                    <div class="flex">
                        <span class="status-dot ${statusClass}"></span>
                        <p class="nickColor">${p.имя}</p>
                    </div>
                    <span class="miniText">${statusText}</span>
                </div>
                <button class="playerCardButton green" data-player-id="${p.id}" ${p.статус !== 'ready' ? 'disabled' : ''}>⚡ Блиц-бой</button>
                <button class="playerCardButton gray" data-player-id="${p.id}">📩 Асинхрон</button>
                <div class="playerOnlineCardLastRow">
                    <p>🏆 ${p.победы} <span class="miniText">побед</span></p>
                    <span class="mmr-display">Рейтинг: ${p.рейтинг}</span>
                </div>
            </div>
        `;
    });
    
    pointerPlayerList.innerHTML = htmlToAddToPlayerList;
    // Блиц-бой
    document.querySelectorAll('.playerCardButton.green').forEach(btn => {
        btn.addEventListener('click', function() {
            challengeBlitz(this.dataset.playerId);
        });
    });
    const asyncBattle = document.querySelectorAll('.playerCardButton.gray');
    asyncBattle.forEach((element)=>{
        element.addEventListener('click', async function(){
            if(buttonBattle.classList.contains('readyPokemonCard-button')){
                const myId = localStorage.getItem('player_id');
                const enemyId = this.dataset.playerId;
                const response = await fetch('http://localhost:5000/api/battle/async/start', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        player1_id: myId,
                        player2_id: enemyId,
                        team1: PlayerPick
                    })
                });
                
                const data = await response.json();
                localStorage.setItem('battle_id', data.battle_id);
                localStorage.setItem('enemyId', enemyId);
                window.location.href = './BattleForm/pokemon.html';
            }       
        });
    });
}
refreshPlayerList();
setInterval(refreshPlayerList, 3000);



/*=====================addEventListener-click=====================*/
const pokemonCard = document.querySelectorAll('.pokemonCard'); /* array of div pokemonCards */
pokemonCard.forEach((element) => {
    element.addEventListener('click', () => {
        console.log('fsdfsd');
        if(!checkForReady){
            const pokemonName = element.getAttribute('data-name');
            if (!element.classList.contains('selected') && PlayerPick.length < 3) {
                element.classList.add('selected');
                PlayerPick.push(pokemonName);
                setText.innerText = `Выбрано: ${PlayerPick.length}/3`;
                
            }
            else if (element.classList.contains('selected')) {
                const index = PlayerPick.indexOf(pokemonName);
                if (index !== -1) {
                    PlayerPick.splice(index, 1);
                }
                element.classList.remove('selected');
                setText.innerText = `Выбрано: ${PlayerPick.length}/3`;
            }
        }
    });
});
buttonBattle.addEventListener('click', function(event) {
    event.preventDefault();

    if(PlayerPick.length === 3) {
        if(!buttonBattle.classList.contains('readyPokemonCard-button')){
            buttonBattle.innerText = '🔍 Ожидание соперника';
            ChangeStatus('ready');
            checkForReady = true;
            buttonBattle.classList.add('readyPokemonCard-button');
        }
        else{
            buttonBattle.innerText = '⚔️ В бой';
            ChangeStatus('afk');
            checkForReady = false;
            buttonBattle.classList.remove('readyPokemonCard-button');
        }
    }
});


document.querySelector('.btn-logout').addEventListener('click', async () => {
    ChangeStatus('offline');
    localStorage.removeItem('player_id');
    window.location.href = 'LoginForm/login.html';
});




/*=====================Settings=====================*/
const soundToggle = document.querySelectorAll('.toggle');
const modal = document.querySelector('.modal-window');
const settingsButton = document.querySelector('.Settings');
const chevron = document.querySelector('.fa-solid');
let soundOn = true;

soundToggle.forEach((element)=>{
    element.addEventListener('click', () => {
        soundOn = !soundOn;
        element.classList.toggle('on');
    });
});

modal.addEventListener('click', (e)=>{
    if(e.target == modal) {
        modal.style.display = 'none';
    }
});
chevron.addEventListener('click', ()=>{
    modal.style.display = 'none';
});
settingsButton.addEventListener('click', ()=>{
    modal.style.display = 'block';
});

/*=====================AvatarsButton=====================*/
let avatarsNewHtml = document.querySelector('.avatars');
let avatarsAdd = '';
let count = 293;
const defRow = 16;
const defCol = 19;


for(let i = 0; i < defRow;i++){
    for(let j = 0;j < defCol;j++){
        avatarsAdd += `
            <button class="avatar" style="background-position: -${j*80}px -${i*80}px;"></button>
        `;
    }
}
avatarsNewHtml.innerHTML = avatarsAdd;

const closeAvatars = document.querySelector('.closeAvatars');
const modalWindowForAvatar = document.querySelector('.modalWindowForAvatar');
const openAvatar = document.querySelector('.openAvatar');
closeAvatars.addEventListener('click', ()=>{
    modalWindowForAvatar.style.display = 'none';
});
openAvatar.addEventListener('click', ()=>{
    modalWindowForAvatar.style.display = 'block';
});
modalWindowForAvatar.addEventListener('click', (e)=>{
    if(e.target === modalWindowForAvatar) modalWindowForAvatar.style.display = 'none';
});


// ========== БЛИЦ-БОЙ ==========

function showChallengePopup(battleId) {
    let existing = document.getElementById('challenge-popup');
    if (existing) existing.remove();
    
    let popup = document.createElement('div');
    popup.id = 'challenge-popup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #2a2a4a; border: 2px solid gold; border-radius: 12px;
        padding: 30px; z-index: 9999; text-align: center; color: white;
    `;
    popup.innerHTML = `
        <h3>⚔️ Вас вызывают на бой!</h3>
        <button id="accept-blitz" style="margin:10px; padding:10px 30px; background:#4CAF50; border:none; border-radius:8px; color:white; cursor:pointer; font-size:16px;">Принять</button>
        <button id="decline-blitz" style="margin:10px; padding:10px 30px; background:#f44336; border:none; border-radius:8px; color:white; cursor:pointer; font-size:16px;">Отклонить</button>
    `;
    document.body.appendChild(popup);
    
    document.getElementById('accept-blitz').onclick = () => acceptChallenge(battleId);
    document.getElementById('decline-blitz').onclick = () => cancelChallenge(battleId);
}

function hideChallengePopup() {
    let popup = document.getElementById('challenge-popup');
    if (popup) popup.remove();
}

async function acceptChallenge(battleId) {
    await fetch('http://localhost:5000/api/battle/accept', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            battle_id: battleId,
            player_id: localStorage.getItem('player_id'),
            team: PlayerPick 
        })
    });
    localStorage.setItem('battle_id', battleId);
    window.location.href = './BattleForm/pokemon.html';
}

async function cancelChallenge(battleId) {
    await fetch('http://localhost:5000/api/battle/cancel', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({battle_id: battleId})
    });
    hideChallengePopup();
}

async function challengeBlitz(targetId) {
    if(buttonBattle.classList.contains('readyPokemonCard-button')){
        const myId = localStorage.getItem('player_id');
        await fetch('http://localhost:5000/api/battle/challenge', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                challenger_id: myId,
                target_id: targetId,
                team: PlayerPick  
            })
        });
    }
}

async function checkBattle() {
    const playerId = localStorage.getItem('player_id');
    
    // Проверяем вызвали ли меня
    const checkRes = await fetch(`http://localhost:5000/api/battle/check?player_id=${playerId}`);
    const checkData = await checkRes.json();
    
    if (checkData.called) {
        showChallengePopup(checkData.battle_id);
    }
    
    // Проверяем не начался ли бой
    const startRes = await fetch(`http://localhost:5000/api/battle/check-start?player_id=${playerId}`);
    const startData = await startRes.json();
    
    if (startData.active) {
        localStorage.setItem('battle_id', startData.battle_id);
        window.location.href = './BattleForm/pokemon.html';
    }
}

setInterval(checkBattle, 2000);