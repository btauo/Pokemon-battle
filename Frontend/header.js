
document.addEventListener('DOMContentLoaded', ()=>{
    const headerHTML = `
        <header class="header">
            <img src="../image/MyLogo.png" alt="">
            <div class="menu-settings">
            <a href="../menu.html" class="backToMenu"> <i class="fa fa-home"></i> Меню</a>
            <button class="backToMenu Settings"> <i class="fa fa-cog"></i> Настройки</button>
            </div>

            <div class="whiteBar"></div>
        </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
});