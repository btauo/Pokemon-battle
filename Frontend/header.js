
export function renderHeader() {
  const headerHTML = `
    <header class="header">
      <img src="../image/MyLogo.png" alt="">
      <div class="menu-settings">
        <button class="backToMenu menuButton"> <i class="fa fa-home"></i> Меню</button>
        <button class="backToMenu Settings"> <i class="fa fa-cog"></i> Настройки</button>
      </div>
      <div class="whiteBar"></div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}