const secondPlayerPokemon = document.querySelector('.pokemonBot'); /*secondPlayer*/
const playerPokemon = document.querySelector('.pokemonPlayer'); /* First Player*/
let pokeballDefo = document.querySelector('.pokeballImg');
let pokeballImg = document.querySelector('.pokeballImg img'); /* For switch pokemon using pokeball animated pokeball */
let direction;

export function updateButtonAnimationForPokemon(who = 'player',attackName, arrayCord) {
    direction = who;
    const startX = (direction==='player' ? 13 : 32);
    const startY = (direction==='player' ? 42 : 59);
    const endX = (direction==='player' ? 32 : 13);
    const endY = (direction==='player' ? 59 : 42);

    
    let WhosPokemon = (direction === 'player' ? playerPokemon : secondPlayerPokemon);

    const attackMap = {
        'Vine Whip': () => { vineWhip(startX, startY, endX, endY, WhosPokemon); getHit(300); },
        'Razor Leaf': () => { paraballaNBack(startX, startY, endX, endY, 'energyball', WhosPokemon); getHit(450); },
        'Seed Bomb': () => { poisonAttack(startX, startY, endX, endY, WhosPokemon); getHit(600); },
        'Thunder Shock': () => { thunderShock(startX, startY, endX - 1, endY - 1, 'electroball', WhosPokemon); getHit(600); },
        'Thunderbolt': () => { bolt(startX, startY, endX, endY, WhosPokemon); getHit(250); },
        'Iron Tail': () => { paraballaNBack(startX, startY, endX, endY, 'electroball', WhosPokemon); getHit(450); },
        'Body Slam': () => { bodySlam(startX, startY, endX, endY, 'iceball', WhosPokemon); },
        'Swift': () => { Swift(startX, startY, endX, endY, 'iceball', WhosPokemon); getHit(300); },
        'Dig': () => { dig(startX, startY, endX - 1, endY, WhosPokemon); getHit(850); },
        'Ember': () => { thunderShock(startX, startY, endX - 1, endY - 1, 'flareball', WhosPokemon); getHit(600); },
        'Fire Fang': () => { paraballaNBack(startX, startY, endX, endY, 'bottombite', WhosPokemon); getHit(500); },
        'Flamethrower': () => { Swift(startX, startY, endX, endY, 'fireball', WhosPokemon); getHit(300); },
        'Ice Gun': () => { squirtle(startX, startY, endX, endY, WhosPokemon); getHit(300); },
        'Bubble Beam': () => { buble(startX+3, startY, endX, endY, WhosPokemon); getHit(600); },
        'Aqua Tail': () => { paraballaNBack(startX, startY, endX, endY, 'waterwisp', WhosPokemon); getHit(450); },
        'Splash': () => { paraballaNBack(startX, startY, endX, endY, 'magikarp', WhosPokemon); getHit(500); },
        'Water Beam': () => { water(startX, startY, endX, endY, WhosPokemon); getHit(600); },
        'Water Shot': () => { thunderShock(startX, startY, endX - 1, endY - 2, 'waterwisp', WhosPokemon); getHit(600); }
    };
    const animation = attackMap[attackName];
    if (animation) {
        animation();
    } 
    else {
        if(attackName === 'animateParabola'){
            let x1 = arrayCord[0], y1 = arrayCord[1], x2 = arrayCord[2], y2 = arrayCord[3];
            animateParabola(x1,y1,x2,y2);
        }
        else if(direction==='player'){
            playerPokemon.classList.add('pokemon-hit');
            getHit(600);
            setTimeout(() => { playerPokemon.classList.remove('pokemon-hit') }, 600);
            setTimeout(()=>{direction = 'enemy';},610);
        }
        else{
            secondPlayerPokemon.classList.add('EnemyPokemon-hit');
            getHit(600);
            setTimeout(() => { secondPlayerPokemon.classList.remove('EnemyPokemon-hit') }, 600);
            setTimeout(()=>{direction = 'player';},610);
        }
    }
    
}

function getHit(time) {
    setTimeout(() => {
        let q = (direction === 'player'? secondPlayerPokemon: playerPokemon);
        q.classList.add('pokemon-hit-effect');
        setTimeout(() => { q.classList.remove('pokemon-hit-effect'); }, 500);
    }, time);
}

function poisonAttack(startX, startY, endX, endY, q) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => { createPoisonBall(startX, startY, endX, endY + 4, q); }, i * 50);
    }
}

function createPoisonBall(startX, startY, endX, endY, q) {
    const ball = document.createElement('div');
    ball.className = 'poison-ball';
    ball.style.left = (startX) + '%';
    ball.style.bottom = (startY) + '%';

    ball.style.width = '20px';
    ball.style.height = '20px';

    document.body.appendChild(ball);
    const duration = 500;

    let startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);

        const currX = startX + (endX - startX) * progress;
        const currY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * 25;
        ball.style.left = (currX) + '%';
        ball.style.bottom = (currY) + '%';
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            ball.remove();
        }
    }
    requestAnimationFrame(animate);
}

function vineWhip(startX, startY, endX, endY) {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => { createLeaf(startX, startY, endX, endY + 2, i); }, i * 100);
    }
}

function createLeaf(startX, startY, endX, endY, index) {
    const leaf = document.createElement('img');
    leaf.src = `../mainLobby/animationImg/leaf${index % 2 + 1}.png`;
    leaf.className = 'leaf-class';

    leaf.style.left = (startX) + '%';
    leaf.style.bottom = (startY) + '%';
    leaf.style.width = '80px';
    leaf.style.height = '80px';
    document.body.appendChild(leaf);

    let duration = 300;

    let startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currX = startX + (endX - startX) * progress;
        const currY = startY + (endY - startY) * progress;
        leaf.style.left = currX + '%';
        leaf.style.bottom = currY + '%';
        if (progress < 1) {
            leaf.style.opacity = 1 - progress / 2;
            requestAnimationFrame(animate);
        } else {
            leaf.remove();
        }
    }
    requestAnimationFrame(animate);
}

export function paraballaNBack(startX, startY, endX, endY, ballName, q) {
    const duration = 1000;
    let startTime = null;
    let check = false;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);

        if (progress <= 0.5) {
            const currX = startX + (endX - startX) * (progress * 2);
            const currY = startY + (endY - startY) * (2 * progress) + Math.sin(progress * Math.PI * 2) * 25;
            q.style.left = (currX) + '%';
            q.style.bottom = (currY) + '%';
        } else {
            const t = (progress - 0.5) * 2;
            const currX = endX + (startX - endX) * t;
            const currY = endY + (startY - endY) * t;
            q.style.left = (currX) + '%';
            q.style.bottom = (currY) + '%';
        }

        if (!check && progress > 0.5 && ballName != 'magikarp') {
            check = true;
            if (ballName == 'bottombite') {
                const bottom = document.createElement('img');
                const top = document.createElement('img');
                bottom.src = `../mainLobby/animationImg/${ballName}.png`;
                top.src = `../mainLobby/animationImg/topbite.png`;
                bottom.className = 'leaf-class';
                bottom.style.left = (endX) + '%';
                bottom.style.bottom = (endY - 8) + '%';
                bottom.style.width = '80px';
                bottom.style.height = '47px';
                top.className = 'leaf-class';
                top.style.left = (endX) + '%';
                top.style.bottom = (endY + 16) + '%';
                top.style.width = '80px';
                top.style.height = '47px';

                bottom.style.opacity = 0;
                top.style.opacity = 0;
                document.body.appendChild(bottom);
                document.body.appendChild(top);

                const durationX2 = 350;
                let startTimeX2 = null;

                function animatex2(currentTimeX2) {
                    if (!startTimeX2) startTimeX2 = currentTimeX2;
                    const progressX2 = Math.min((currentTimeX2 - startTimeX2) / durationX2, 1);
                    bottom.style.opacity = progressX2;
                    top.style.opacity = progressX2;

                    const newBottomB = endY - 8 + (endY - (endY - 8)) * progressX2;
                    const newBottomT = endY + 16 + (endY - (endY + 16)) * progressX2;
                    top.style.bottom = (newBottomT) + '%';
                    bottom.style.bottom = (newBottomB) + '%';
                    if (progressX2 < 1) {
                        requestAnimationFrame(animatex2);
                    } else {
                        bottom.remove();
                        top.remove();
                    }
                }
                requestAnimationFrame(animatex2);
            } else {
                const greenOrb = document.createElement('img');
                greenOrb.src = `../mainLobby/animationImg/${ballName}.png`;

                greenOrb.className = 'greenOrb';
                greenOrb.style.left = (endX) + '%';
                greenOrb.style.bottom = (endY) + '%';
                if (ballName == 'waterwisp') {
                    greenOrb.style.width = '120px';
                    greenOrb.style.height = '120px';
                    greenOrb.style.filter = 'contrast(1.5)';
                } else {
                    greenOrb.style.width = '80px';
                    greenOrb.style.height = '80px';
                }
                document.body.appendChild(greenOrb);
                setTimeout(() => { greenOrb.remove() }, 500);
            }
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

function thunderShock(startX, startY, endX, endY, ballName) {
    const electroball = document.createElement('img');
    electroball.src = `../mainLobby/animationImg/${ballName}.png`;
    electroball.className = 'leaf-class';

    electroball.style.left = (startX) + '%';
    electroball.style.bottom = (startY) + '%';
    electroball.style.width = '140px';
    electroball.style.height = '140px';
    document.body.appendChild(electroball);

    let duration = 700;

    let startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currX = startX + (endX - startX) * progress;
        const currY = startY + (endY - startY) * progress;
        electroball.style.left = currX + '%';
        electroball.style.bottom = currY + '%';
        if (progress < 1) {
            electroball.style.opacity = 1 - progress / 2;
            requestAnimationFrame(animate);
        } else {
            electroball.classList.add('electroball');
            setTimeout(() => { electroball.remove(); }, 200);
        }
    }
    requestAnimationFrame(animate);
}

function bolt(startX, startY, endX, endY) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => { Thunderbolt(endX, 10, (i % 2 == 1 ? -1 : 0)); }, 220 * i);
    }
}

function Thunderbolt(startX, startY, sizeOff) {
    const thunder = document.createElement('img');
    thunder.src = `../mainLobby/animationImg/lightning.png`;
    thunder.style.width = '90px';
    thunder.style.height = '0px';
    thunder.style.left = (startX + sizeOff) + '%';
    thunder.style.top = startY + '%';
    thunder.className = 'leaf-class';

    let duration = 200;
    let startTime = null;
    let goalHeight = 300;
    document.body.appendChild(thunder);

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const heigthProgress = (goalHeight) * progress;

        if (progress < 1) {
            thunder.style.height = heigthProgress + 'px';
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => { thunder.remove(); }, 150);
        }
    }
    requestAnimationFrame(animate);
}

function dig(startX, startY, endX, endY,q) {
    const duration = 2000;
    let startTime = null;
    const bottomTarget = 26;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        let firstTime = false;

        if (progress <= 0.3) {
            const newY = startY + (bottomTarget - startY) * (progress * 10 / 3);
            q.style.bottom = newY + '%';
            q.style.opacity = 1.1 - progress * 10 / 3;
        } else if (progress <= 0.5) {
            if (!firstTime) {
                q.style.left = endX + '%';
                firstTime = true;
            }
            q.style.opacity = (progress - 0.3) * 10 / 2;
            const newY = (endY - 10) + (12) * (progress - 0.3) * 10 / 2;
            q.style.bottom = newY + '%';
        } else if (progress <= 0.7) {
            if (firstTime) firstTime = false;
            const newY = endY + 2 + (endY - 10 - (endY + 2)) * (progress - 0.5) * 5;
            q.style.bottom = newY + '%';
            q.style.opacity = 1 - (progress - 0.5) * 5;
        } else if (progress < 1) {
            if (!firstTime) {
                q.style.left = startX + '%';
                firstTime = true;
            }
            const newY = bottomTarget + (startY - bottomTarget) * (progress - 0.7) * 10 / 3;
            q.style.bottom = newY + '%';
            q.style.opacity = (progress - 0.7) * 10 / 3;
        } else {
            setTimeout(() => {
                q.style.left = startX + '%';
                q.style.bottom = startY + '%';
            }, 100);
        }

        if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

function bodySlam(startX, startY, endX, endY, ballName, q) {
    const duration = 1000;
    const iceBallOrb1 = document.createElement('img');
    const iceBallOrb2 = document.createElement('img');
    iceBallOrb1.src = `../mainLobby/animationImg/${ballName}.png`;
    iceBallOrb2.src = `../mainLobby/animationImg/${ballName}.png`;
    iceBallOrb1.style.left = (endX) + '%';
    iceBallOrb1.style.bottom = (endY) + '%';
    iceBallOrb1.style.width = '80px';
    iceBallOrb1.style.height = '80px';
    iceBallOrb2.style.left = (endX) + '%';
    iceBallOrb2.style.bottom = (endY) + '%';
    iceBallOrb2.style.width = '80px';
    iceBallOrb2.style.height = '80px';
    iceBallOrb1.className = 'leaf-class';
    iceBallOrb2.className = 'leaf-class';

    const heightPokemon = parseInt(window.getComputedStyle((direction == 'player' ? secondPlayerPokemon: playerPokemon)).height);

    let startTime = null;
    let check = false;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);

        if (progress <= 0.5) {
            const currX = startX + (endX - startX) * (progress * 2);
            const currY = startY + (endY - startY) * (2 * progress) + Math.sin(progress * Math.PI * 2) * 25;
            q.style.left = (currX) + '%';
            q.style.bottom = (currY) + '%';
        } else {
            const t = (progress - 0.5) * 2;
            const currX = endX + (startX - endX) * t;
            const currY = endY + (startY - endY) * t;
            q.style.left = (currX) + '%';
            q.style.bottom = (currY) + '%';
            if (!check) {
                document.body.appendChild(iceBallOrb1);
                document.body.appendChild(iceBallOrb2);
                check = true;
            }
            const newX1 = endX + (endX - 10 - endX) * (progress - 0.5) * 2;
            const newX2 = endX + (endX + 10 - endX) * (progress - 0.5) * 2;
            iceBallOrb1.style.left = newX1 + '%';
            iceBallOrb2.style.left = newX2 + '%';
            iceBallOrb1.style.opacity = 0.9 - (progress - 0.5) * 2;
            iceBallOrb2.style.opacity = 0.9 - (progress - 0.5) * 2;

            const a = (direction == 'player' ? secondPlayerPokemon: playerPokemon)
            if (progress <= 0.75) {
                const newHeight = heightPokemon + (heightPokemon / 2 - heightPokemon) * (progress - 0.5) * 4;
                a.style.height = newHeight + 'px';
            } else {
                const newHeight = heightPokemon / 2 + (heightPokemon - heightPokemon / 2) * (progress - 0.75) * 4;
                a.style.height = newHeight + 'px';
            }
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            iceBallOrb2.remove();
            iceBallOrb1.remove();
        }
    }
    requestAnimationFrame(animate);
}

function Swift(startX, startY, endX, endY, ballName) {
    for (let i = 0; i < 6; i++) {
        if (ballName != 'fireball') setTimeout(() => { SwiftReady(startX, startY, endX + (Math.random() * 4 * ((i % 2 == 0 ? 1 : -0.7))), endY + 4 + (Math.random() * 4), ballName) }, i * 80);
        else setTimeout(() => { SwiftReady(startX, startY, endX + (Math.random() * 2 * ((i % 2 == 0 ? 1 : -0.7))), endY + (Math.random() * 2), ballName) }, i * 80);
    }
}

function SwiftReady(startX, startY, endX, endY, ballName) {
    const iceBall = document.createElement('img');
    iceBall.src = `../mainLobby/animationImg/${ballName}.png`;
    iceBall.style.left = startX + '%';
    iceBall.style.bottom = startY + '%';
    iceBall.style.width = '60px';
    iceBall.style.height = '60px';
    if (ballName != 'fireball') {
        iceBall.style.opacity = 0.6;
        iceBall.style.filter = 'blur(10px)';
    } else {
        iceBall.style.width = '85px';
        iceBall.style.height = '85px';
    }
    iceBall.className = 'leaf-class';

    document.body.appendChild(iceBall);
    let duration = 300;
    let startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const newY = (startY + (endY - startY) * progress);
        const newX = startX + (endX - startX) * progress;
        iceBall.style.left = newX + '%';
        iceBall.style.bottom = newY + '%';
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (ballName != 'fireball') iceBall.remove();
            else {
                iceBall.classList.add('greenOrb');
                setTimeout(() => { iceBall.remove() }, 250);
            }
        }
    }
    requestAnimationFrame(animate);
}

function squirtle(startX, startY, endX, endY) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => { watergun(startX, startY, endX + (Math.random() * 2 * ((i % 2 == 0 ? 1 : -0.7))), endY + (Math.random() * 2)) }, i * 120);
    }
}

function watergun(startX, startY, endX, endY) {
    const icegun = document.createElement('img');
    icegun.src = `../mainLobby/animationImg/icicle.png`;
    icegun.style.left = startX + '%';
    icegun.style.bottom = startY + '%';
    icegun.style.width = '80px';
    icegun.style.height = '90px';
    icegun.className = 'leaf-class';

    document.body.appendChild(icegun);
    let startTime = null;
    const duration = 350;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min(1, (currentTime - startTime) / duration);
        const newY = (startY + (endY - startY) * progress);
        const newX = startX + (endX - startX) * progress;
        icegun.style.left = newX + '%';
        icegun.style.bottom = newY + '%';
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else setTimeout(() => { icegun.remove(); }, 250);
    }
    requestAnimationFrame(animate);
}

function buble(startX, startY, endX, endY) {
    bigBall(startX - 2, startY + 3, endX, endY);
    setTimeout(() => {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => { bubleBeam(startX, startY, endX + (Math.random() * 2 * ((i % 2 == 0 ? 1 : -0.7))), endY - 2 + (Math.random() * 2)) }, i * 80);
        }
    }, 350);
}

function bubleBeam(startX, startY, endX, endY) {
    const ball = document.createElement('img');
    ball.src = `../mainLobby/animationImg/waterwisp.png`;
    ball.style.width = '120px';
    ball.style.height = '120px';
    ball.style.position = 'absolute';
    ball.style.left = startX + '%';
    ball.style.bottom = startY + '%';
    document.body.appendChild(ball);

    let startTime = null;
    const duration = 350;
    let check = false;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min(1, (currentTime - startTime) / duration);

        const newY = 80 + (endY - 80) * (progress);
        const newX = startX + (endX - startX) * (progress);
        ball.style.bottom = newY + '%';
        ball.style.left = newX + '%';

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => { ball.remove() }, 120);
        }

    }
    requestAnimationFrame(animate);
}

function bigBall(startX, startY, endX, endY) {
    const ball = document.createElement('img');
    ball.src = `../mainLobby/animationImg/waterwisp.png`;
    ball.style.width = '50px';
    ball.style.height = '50px';
    ball.style.position = 'absolute';
    ball.style.left = startX + '%';
    ball.style.bottom = startY + '%';

    document.body.appendChild(ball);

    let startTime = null;
    const duration = 350;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min(1, (currentTime - startTime) / duration);

        ball.style.opacity = 0.6 * (1 - progress);
        const scale = 1 + (progress * 16);
        ball.style.transform = `scale(${scale})`;
        ball.style.opacity = 1 - progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => { ball.remove(); }, 120);
        }
    }
    requestAnimationFrame(animate);
}

function water(startX, startY, endX, endY) {
    bigBall(startX - 2, startY + 3, endX, endY);
    setTimeout(() => {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => { waterBeam(startX, startY, endX + (Math.random() * 2 * ((i % 2 == 0 ? 1 : -0.7))), endY - 2 + (Math.random() * 2)) }, i * 80);
        }
    }, 350);
}

function waterBeam(startX, startY, endX, endY) {
    const ball = document.createElement('img');
    ball.src = `../mainLobby/animationImg/waterwisp.png`;
    ball.style.width = '120px';
    ball.style.height = '120px';
    ball.style.position = 'absolute';
    ball.style.left = startX + '%';
    ball.style.bottom = startY + '%';
    document.body.appendChild(ball);

    let startTime = null;
    const duration = 350;
    let check = false;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min(1, (currentTime - startTime) / duration);

        const newY = startY + (endY - startY) * (progress);
        const newX = startX + (endX - startX) * (progress);
        ball.style.bottom = newY + '%';
        ball.style.left = newX + '%';

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => { ball.remove() }, 120);
        }

    }
    requestAnimationFrame(animate);
}


function animateParabola(startX,startY,endX,endY) {
  let duration = 450;
  let startTime = performance.now();
  function update(currentTime) {
    let elapsed = currentTime - startTime;
    let progress = Math.min(1, elapsed / duration);
    pokeballImg.style.opacity = (1-progress+0.3);
    
    let currentX = startX + (endX - startX) * progress;
    let parabolaHeight = 40;
    let currentY = startY + (endY - startY) * progress + progress * (1 - progress);
    
    
    pokeballDefo.style.left = currentX + '%';
    pokeballDefo.style.bottom = currentY + '%';
    
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      pokeballDefo.style.left = '-9999px';
    }
  }
  
  requestAnimationFrame(update);
}
