if (!localStorage.getItem('player_id')) window.location.href = 'LoginForm/login.html';
if (!localStorage.getItem('battle_id')) window.location.href = 'menu.html';

import {updateButtonAnimationForPokemon} from '../mainLobby/animation.js';

/*=====================Переменные=====================*/
const myId = localStorage.getItem('player_id');
const battleId = localStorage.getItem('battle_id');
const textUnderImg = document.querySelector('.textUnderImg');
const switchHtml = document.querySelector('.pokemonToSwitch');
const HealToUse = document.querySelector('.HealToUse');
const playerPokemon = document.querySelector('.pokemonPlayer');
const enemyPokemon = document.querySelector('.pokemonBot');
const divSkillName = document.querySelector('.divSkillName');
const enemyHp = document.querySelector('.enemyHp');
const playerHp = document.querySelector('.playerHp');
const enemyFill = document.querySelector('.enemyHp .hp-bar-fill');
const enemyProcentText = document.querySelector('.enemyHp .procentOfHP');
const EnemypokemonNewName = document.querySelector('.enemyHp .pokemonName');
const myFill = document.querySelector('.playerHp .hp-bar-fill');
const myProcentText = document.querySelector('.playerHp .procentOfHP');
const mypokemonNewName = document.querySelector('.playerHp .pokemonName');
const battleLog = document.querySelector('.battleLog');

let pokemonSkills = [];
let battleData = [];
let turn = 1;
let blocked = false;
let isMyTurn = null; 
let isAsyncMode = localStorage.getItem('enemyId') ? true : false;
let currentPokemon = '';
let enemyCurrentPokemon = '';
let imgPokemon;
let myPokemonFainted = 0; // 0 - значт жив, 1 - значит умер, 2 - значит что мы не рисуем новый turn когда атакуем
let enemyFainted = 0;
let enemyId = null;


async function loadPokemonSkills() {
  const response = await fetch('http://localhost:5000/api/pokemonSkills');
  pokemonSkills = await response.json();
}
await loadPokemonSkills();
console.log('pokemonSkills:', pokemonSkills);
async function loadBattle() {
  const response = await fetch(`http://localhost:5000/api/battle/info?battle_id=${battleId}&player_id=${myId}`);
  battleData = await response.json();
}
await loadBattle();
enemyId = localStorage.getItem('enemyId') ? localStorage.getItem('enemyId') : (parseInt(myId) === battleData.player1_id) ? battleData.player2_id : battleData.player1_id;
isMyTurn = localStorage.getItem('enemyId') ? true : (parseInt(myId) === battleData.player1_id) ? true : false;
console.log(battleData);

async function loadInventory() {
  const response = await fetch(`http://localhost:5000/api/inventory?player_id=${myId}`);
  const data = await response.json();
  return data.items;
}


/*=====================HTML-Wrapper=====================*/
let htmlToadd = "";
battleData.my_team.forEach((element) => {
  if(element.статус==="active") currentPokemon = element.имя;
  if(element.статус === "fainted"){
    htmlToadd += `
      <button class="changePokemon lowopacity" style="disabled"><img src="../image/${element.имя}.png" class="imgSwitch" alt=""> ${element.имя}</button>
    `;   
  }
  else{
    htmlToadd += `
      <button class="changePokemon"><img src="../image/${element.имя}.png" class="imgSwitch" alt=""> ${element.имя}</button>
    `; 
  }
});
switchHtml.innerHTML = htmlToadd;

function updateTextUnderImg(pokemonName) {
  const allButtonAttack = document.querySelectorAll('.buttonsAttack');
  if (allButtonAttack.length == 0) {
    let htmlSkills = '';
    for (let i = 0; i < pokemonSkills.length; i++) {
      if (pokemonSkills[i].pokemonName === pokemonName) {
        pokemonSkills[i].skills.forEach((element) => {
          htmlSkills += `
            <button class="buttonsAttack" data-attack-id="${element.id}">${element.name}</button>
          `;
        });
        break;
      }
    }
    divSkillName.innerHTML = htmlSkills;
  } 
  else {
    for (let i = 0; i < pokemonSkills.length; i++) {
      if (pokemonSkills[i].pokemonName === pokemonName) {
        for (let j = 0; j < pokemonSkills[i].skills.length; j++) {
          allButtonAttack[j].innerText = pokemonSkills[i].skills[j].name;
          allButtonAttack[j].dataset.attackId = pokemonSkills[i].skills[j].id;
        }
        break;
      }
    }
  }
  playerPokemon.innerHTML = `
    <img src="../image/inMove_player/${pokemonName}.gif" alt="" class="PlayerPokemonImage">
  `;
  imgPokemon = document.querySelector('.PlayerPokemonImage');
  textUnderImg.innerHTML = `
    What will <span style="font-weight: 900;">${pokemonName}</span> do?
  `;
} //draw: button skills name, pokemon picture and text
updateTextUnderImg(currentPokemon);

async function reloadInventory() {
  const inventory = await loadInventory();
  console.log(inventory);
  let htmlToadd = "";
  inventory.forEach((item, index) => {
    htmlToadd += `
      <button class="changePokemon heal-button" data-item-id="${index + 1}">
        <img src="../image/${item.название}.png" class="imgSwitch" alt=""> 
        ${item.название} ×${item.количество}
      </button>
    `;
  });
  HealToUse.innerHTML = htmlToadd;
  
  // Обработчики на зелья
  document.querySelectorAll('.heal-button').forEach(btn => {
    btn.addEventListener('click', function() {
      if (blocked || !isMyTurn) return; 
      usePotion(this.dataset.itemId);
    });
  });
}
reloadInventory();

battleData.enemy_team.forEach((element) => {
  if(element.статус==="active") enemyCurrentPokemon = element.имя;
});
enemyPokemon.innerHTML = `<img src="../image/inMove_bot/${enemyCurrentPokemon}.gif" alt="" class="EnemyPokemonImage"></img>`;
const setPokemonName_HpBar = document.querySelectorAll('.pokemonName');
setPokemonName_HpBar[0].innerText = currentPokemon;
setPokemonName_HpBar[1].innerText = enemyCurrentPokemon;


battleLog.innerHTML += `
  <p class="log-entry log-join">☆${battleData.player1_name} and ☆${battleData.player2_name} joined</p>
  <p class="log-entry log-player-action">Go! ${currentPokemon}!</p>
  <p class="log-entry log-enemy-action">Ememy sent out ${enemyCurrentPokemon}</p>
`;


/*=====================Async-Functions=====================*/
async function enemySwitchPokemon() {
  const response = await fetch('http://localhost:5000/api/battle/enemy-switch', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      battle_id: battleId,
      enemy_id: enemyId
    })
  });
  return await response.json();
}//Бот меняет покемона на лучшего

async function enemyRandomAttack(pokemonForBlock) {
  const response = await fetch('http://localhost:5000/api/battle/enemy-attack', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      battle_id: battleId,
      enemy_id: enemyId
    })
  });

  const result = await response.json();
  console.log(result);
  enemyFainted = addToBattleLogAttack(result, enemyFainted, false, 'log-enemy-action');
  updateButtonAnimationForPokemon('enemy', result.attack_name, null);
  // Обновляем мой HP
  setTimeout(() => {
    let procent;
    if (result.defender_hp === 0) procent = 0;
    else {
      const myCurrentProcent = parseInt(document.querySelector('.playerHp .hp-bar-fill').style.width);
      procent = Math.floor((result.defender_hp) / ((result.defender_hp + result.damage) / myCurrentProcent));
    }
    myFill.style.width = procent + '%';
    myProcentText.textContent = procent + '%';
  }, 700);

  if (result.defender_fainted) {
    if (result.enemy_all_fainted) {
      await endBattle(enemyId, myId);
      showVictoryScreen(false);
    } 
    else {
      myPokemonFainted = 1;
      blockCurrentPokemon(pokemonForBlock);
    }
  }
  else setTimeout(() => { blocked = false; }, 1000);
  isMyTurn = true;
}

/*=====================Some-Functions=====================*/

function blockCurrentPokemon(pokemonName) {
  document.querySelectorAll('.changePokemon').forEach((element) => {
    if (element.innerText === pokemonName) {
      element.classList.add('lowopacity');
      element.disabled = true;
    }
  });
  blocked = true;
}
function addToBattleLogSwitch(oldPokemon, newPokemon, who){
  let player = who? `${newPokemon} вышел на поле!`: `Противник убрал ${oldPokemon} и выпустил ${newPokemon}!`;
  battleLog.insertAdjacentHTML('beforeend', `
      <p class="log-entry log-turn">Turn ${turn}</p>
      <p class="log-entry log-switch">${player}</p>
  `);
  scrollBattleLog();
  turn++;
}
function addToBattleLogHeal(amount, who) {
  const healAmount = Math.abs(amount);
  const className = who ? 'log-heal-player' : 'log-heal-enemy';
  const player = who 
    ? `${currentPokemon} использовал зелье и восстановил ${healAmount} HP!`
    : `${enemyCurrentPokemon} использовал зелье и восстановил ${healAmount} HP!`;
  
  battleLog.insertAdjacentHTML('beforeend', `
    <p class="log-entry log-turn">Turn ${turn}</p>
    <p class="log-entry ${className}">${player}</p>
  `);
  scrollBattleLog();
  turn++;
}

function addToBattleLogAttack(result, whatCheck, player, className){
  let f = player?currentPokemon:enemyCurrentPokemon;
  let s = player?enemyCurrentPokemon:currentPokemon;
  if (whatCheck === 0) {
    battleLog.insertAdjacentHTML('beforeend', `
      <p class="log-entry log-turn">Turn ${turn}</p>
    `);
  }
  else if(whatCheck === 2) {
    whatCheck = 0;
    turn--;
  }
  battleLog.insertAdjacentHTML('beforeend', `
    <p class="log-entry log-timer">Battle timer is ON: inactive players will automatically lose when time's up.</p>
    <p class="log-entry ${className}">${f} использовал ${result.attack_name} и нанёс ${result.damage} урона!</p>
  `);

  if (result.multiplier > 1) {
    battleLog.insertAdjacentHTML('beforeend', `
      <p class="log-entry log-effective">Это очень эффективно! ×${result.multiplier}</p>
    `);
  }
  else if (result.multiplier < 1) {
    battleLog.insertAdjacentHTML('beforeend', `
      <p class="log-entry log-weak">Это не очень эффективно... ×${result.multiplier}</p>
    `);
  }

  if (result.defender_fainted) {
    battleLog.insertAdjacentHTML('beforeend',`
      <p class="log-entry log-fainted">${s} потерял сознание!</p>
    `);
  }
  scrollBattleLog();
  turn++;
  return whatCheck;
}

async function switchPokemon(pokemonId) {
  const response = await fetch('http://localhost:5000/api/battle/switch-pokemon', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      battle_id: battleId,
      player_id: myId,
      pokemon_id: pokemonId
    })
  });
  return await response.json();
}
async function usePotion(itemId) {
  const response = await fetch('http://localhost:5000/api/battle/use-potion', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      player_id: myId,
      item_id: itemId,
      battle_id: battleId
    })
  });
  
  const result = await response.json();
  if (result.status === 'ok') {
    addToBattleLogHeal(result.healed, true);
    // Обновляем HP бар
    const procent = Math.floor((result.new_hp / result.max_hp) * 100);
    myFill.style.width = procent + '%';
    myProcentText.textContent = procent + '%';
    
    // Перезагружаем инвентарь
    reloadInventory();
    if(isAsyncMode) setTimeout(async () => { enemyRandomAttack(currentPokemon); }, 1000);
    blocked = true;
    isMyTurn = false;
  }
  
  return result;
}
async function endBattle(winnerId, loserId) {
  const response = await fetch('http://localhost:5000/api/battle/end', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      battle_id: battleId,
      winner_id: winnerId,
      loser_id: loserId
    })
  });
  const data = await response.json();
  console.log('Результат боя:', data);
  return data;
}

function showVictoryScreen(isPlayerWin) {
  document.querySelector('.modal-windows-victoryLose').classList.add('show');
  const winorlose = document.querySelector('.victoryLose');
  if (isPlayerWin) winorlose.innerText = 'Victory';
  else {
    winorlose.innerText = 'Defeat';
    winorlose.classList.add('defeat-theme');
  }
  winorlose.classList.add('animateModalWindowLoseWin');

  localStorage.removeItem('battle_id');
  localStorage.removeItem('enemyId');
  setTimeout(() => {
    window.location.href = '../menu.html';
  }, 5000);
}

function scrollBattleLog() {
    battleLog.scrollTop = battleLog.scrollHeight;
}

/*=====================Event-Listener=====================*/

const skillsButtons = document.querySelectorAll('.buttonsAttack');
skillsButtons.forEach((element)=>{
  element.addEventListener('click', async function(e){
    console.log('blocked:', blocked, 'isMyTurn:', isMyTurn);
    if (blocked || !isMyTurn) return;

    const attackId = e.target.dataset.attackId;
    updateButtonAnimationForPokemon('player', e.target.innerText, null); // Отрисовка скилла
    isMyTurn = false;
    blocked = true;


    const response = await fetch('http://localhost:5000/api/battle/attack', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        battle_id: battleId,
        player_id: myId,
        attack_id: attackId
      })
    });
    const result = await response.json();
    console.log(result);// Атаковали сняли в бд хп противнику 
    myPokemonFainted = addToBattleLogAttack(result, myPokemonFainted, true, "log-player-action");

    const enemyCurrentProcent = parseInt(document.querySelector('.enemyHp .hp-bar-fill').style.width);
    let procent;
    if (result.defender_hp === 0) procent = 0;
    else procent = Math.floor((result.defender_hp)/((result.defender_hp+result.damage)/enemyCurrentProcent));
    setTimeout(()=>{    
      enemyFill.style.width = procent + '%';
      enemyProcentText.textContent = procent + '%';
    },500);// Обновили хп у покемона 

    if (isAsyncMode) {
      if(result.defender_fainted){
        if (result.enemy_all_fainted) {
          await endBattle(myId, enemyId);
          showVictoryScreen(true);
          return;
        } 
        else {
            const switchResult = await enemySwitchPokemon();
            let imgEnemy = document.querySelector('.EnemyPokemonImage');
            enemyFainted = 1;
            imgEnemy.classList.add('pokemon-resize');
            setTimeout(async () => {
              updateButtonAnimationForPokemon('enemy', 'animateParabola', [37, 60, 42, 64]);
              setTimeout(async () => {
                updateButtonAnimationForPokemon('enemy', 'animateParabola', [42, 68, 37, 64]);
                setTimeout(async () => {
                  enemyPokemon.innerHTML = `<img src="../image/inMove_bot/${switchResult.new_pokemon}.gif" alt="" class="EnemyPokemonImage"></img>`;

                  addToBattleLogSwitch(enemyCurrentPokemon, switchResult.new_pokemon, false);
                  enemyCurrentPokemon = switchResult.new_pokemon;
                  EnemypokemonNewName.innerText = switchResult.new_pokemon;
                  enemyFill.style.width = 100 + '%';
                  enemyProcentText.textContent = 100 + '%';
                  
                  imgEnemy = document.querySelector('.EnemyPokemonImage');
                  imgEnemy.classList.add('pokemon-appearance');
                  setTimeout(async () => {
                    imgEnemy.classList.remove('pokemon-appearance');
                    setTimeout(() => enemyRandomAttack(result.active_pokemon), 2500);
                  }, 400);
                }, 200);
              }, 450);
            }, 600);
        }
      }
      else setTimeout(() => enemyRandomAttack(result.active_pokemon), 2500);
    }
    else{
      if(result.defender_fainted){
        if (result.enemy_all_fainted) {
          await endBattle(myId, enemyId);
          showVictoryScreen(true);
          return;
        }
        enemyFainted = 1;
      }
    }
  });
});

const pokemonSwitchButtons = document.querySelectorAll('.changePokemon');
pokemonSwitchButtons.forEach((element)=>{
  element.addEventListener('click', async function(e) {
    if (this.innerText === currentPokemon || e.target.disabled || !isMyTurn) return;
    if(blocked && myPokemonFainted==0) return;
    blocked = true;
    currentPokemon = this.innerText;
    let idPokemon = null;
    battleData.my_team.forEach((element) => {
      console.log(element.имя, currentPokemon, element.id);
      if (element.имя === currentPokemon) idPokemon = element.id;
    });    

    imgPokemon.classList.add('pokemon-resize');
    setTimeout(async () => {
      playerHp.style.display = 'none';
      updateButtonAnimationForPokemon('player', 'animateParabola', [16, 43, 11, 47]);
      setTimeout(async () => {
        updateButtonAnimationForPokemon('player', 'animateParabola', [11, 51, 16, 47]);
        setTimeout(async () => {
          updateTextUnderImg(currentPokemon);
          imgPokemon.classList.add('pokemon-appearance');
          setTimeout(async () => {
            addToBattleLogSwitch(mypokemonNewName.innerText, currentPokemon, true);
            playerHp.style.display = 'block';
            myFill.style.width = 100 + '%';
            myProcentText.textContent = 100 + '%';
            mypokemonNewName.innerText = currentPokemon;
            await switchPokemon(idPokemon);

            if (isAsyncMode) {
              if(myPokemonFainted==0){
                setTimeout(async () => { enemyRandomAttack(currentPokemon); }, 1000);
              } 
              else {
                myPokemonFainted = 2;
                blocked = false;
                isMyTurn = true;
              }
            }
            else{
              if(myPokemonFainted==0){
                isMyTurn = false;
                blocked = true;
              }
              else{
                myPokemonFainted = 2;
                isMyTurn = true;
                blocked = false;          
              }
            }
            imgPokemon.classList.remove('pokemon-appearance');
          }, 400);
        }, 200);
      }, 450);
    }, 600);
  });
});

/*=====================Blitz-Battle=====================*/
let lastTurn = 0;


let isChecking = false;
async function checkEnemyAttack() {
  if (isChecking) return false;
  isChecking = true;
  const response = await fetch(`http://localhost:5000/api/battle/check-turn?battle_id=${battleId}&player_id=${myId}&last_turn=${lastTurn}`);
  const result = await response.json();
  console.log(result);

  if (result.battle_finished) {
    if (parseInt(result.winner_id) === parseInt(myId)) showVictoryScreen(true);
    else showVictoryScreen(false);
    
    return false; 
  }
  if (result.enemy_active_pokemon && result.enemy_active_pokemon !== enemyCurrentPokemon) {
    enemyCurrentPokemon = result.enemy_active_pokemon;
    
    let imgEnemy = document.querySelector('.EnemyPokemonImage');
    imgEnemy.classList.add('pokemon-resize');
    
    setTimeout(async () => {
      enemyHp.style.display = 'none';
      updateButtonAnimationForPokemon('player', 'animateParabola', [37, 60, 42, 64]);
      setTimeout(async () => {
        updateButtonAnimationForPokemon('player', 'animateParabola', [42, 68, 37, 64]);
        setTimeout(async () => {
          enemyPokemon.innerHTML = `<img src="../image/inMove_bot/${result.enemy_active_pokemon}.gif" alt="" class="EnemyPokemonImage"></img>`;
          imgEnemy = document.querySelector('.EnemyPokemonImage');
          imgEnemy.classList.add('pokemon-appearance');
          setTimeout(async () => {
            addToBattleLogSwitch(EnemypokemonNewName.innerText, enemyCurrentPokemon, false);
            enemyHp.style.display = 'block';
            enemyFill.style.width = 100 + '%';
            enemyProcentText.textContent = 100 + '%';
            imgEnemy.classList.remove('pokemon-appearance');
            EnemypokemonNewName.innerText = enemyCurrentPokemon;
            setTimeout(()=>{blocked = false;},100);
          }, 400);
        }, 200);
      }, 450);
    }, 600);

    if(enemyFainted == 0){
      isMyTurn = true;
      blocked = false;           
    }
    else enemyFainted = 2;
  }

  if (result.enemy_attacked) {
    lastTurn = result.turn;
    
    if (result.damage >= 0) {
      console.log("скок раз ");
      updateButtonAnimationForPokemon('enemy', result.attack_name, null);
      enemyFainted = addToBattleLogAttack(result, enemyFainted, false, "log-enemy-action");
      
      // Обновляем мой HP
      setTimeout(() => {
        let procent;
        if (result.my_current_hp === null) procent = 0;
        else procent = Math.floor((result.my_current_hp / result.my_max_hp) * 100);
        
        myFill.style.width = procent + '%';
        myProcentText.textContent = procent + '%';
      }, 700);
    } 
    else {
      addToBattleLogHeal(result.enemy_attacked, false);
      const procent = Math.floor((result.enemy_current_hp / result.enemy_max_hp) * 100);
      enemyFill.style.width = procent + '%';
      enemyProcentText.textContent = procent + '%';
    }
    
    if (result.defender_fainted) {
        if (result.my_all_fainted) {
          await endBattle(enemyId, myId);
          showVictoryScreen(false);
        } 
        else {
          
          myPokemonFainted = 1;
          blockCurrentPokemon(currentPokemon);
        }
    } 
    else blocked = false;
    isMyTurn = true;
    isChecking = false;
    return true;
  }
  isChecking = false;
  return false;
}

if (!isAsyncMode) {
  setInterval(async () => {
    if (!isMyTurn) {
      await checkEnemyAttack();
    }
  }, 300);
}
