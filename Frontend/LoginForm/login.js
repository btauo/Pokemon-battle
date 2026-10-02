const API = 'http://localhost:5000/api';

const revealPassword = document.querySelector('.changeType');
const icoClickOn = document.querySelector('.clickToreveal');

icoClickOn.addEventListener('click', ()=>{
  if(icoClickOn.classList.contains('fa-lock')){
    icoClickOn.classList.remove('fa-lock');
    icoClickOn.classList.add('fa-eye');
    revealPassword.type = 'text';
  }
  else{
    icoClickOn.classList.add('fa-lock');
    icoClickOn.classList.remove('fa-eye'); 
    revealPassword.type = 'password';   
  }
});

const textOnRegLog = document.querySelector('.registerText');
textOnRegLog.innerHTML = `
  <span>Новый тренер?</span>
  <a href="#" class="register">Зарегистрироваться</a>
`;

const spanForm = document.querySelector('.spanForm');

spanForm.innerText = `Тренер, войди в аккаунт!`;

const registerHref = document.querySelector('.register');

const buttonLogin = document.querySelector('.buttonLogin');
buttonLogin.innerText = 'Войти';

let isLoginMode = true;

registerHref.addEventListener('click', (e)=>{
  e.preventDefault();

  if(isLoginMode){
    spanForm.innerText = 'Тренер, зарегистрируйся!';
    registerHref.innerText = 'Войти';
    document.querySelector('.registerText span').innerText = 'Есть аккаунт?';
    buttonLogin.innerText = 'Зарегистрироваться';
    isLoginMode = false;
  }
  else{
    spanForm.innerText = `Тренер, войди в аккаунт!`;
    registerHref.innerText = 'Зарегистрироваться';
    document.querySelector('.registerText span').innerText = 'Новый тренер?';    
    buttonLogin.innerText = 'Войти';
    isLoginMode = true;
  }
});


buttonLogin.addEventListener('click', async ()=>{
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if(!username || !password){
    message.textContent = 'Заполните все поля';
    return;
  }
  
  const url = isLoginMode ? `${API}/login` : `${API}/register`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });
    
    const data = await response.json();
    
    if(data.status === 'ok'){
      localStorage.setItem('player_id', data.player_id);
      localStorage.setItem('username', data.username || username);
      window.location.href = '../menu.html';
    }
    else {
      message.textContent = data.message;
    }
  }
  catch(error){
    message.textContent = 'Сервер недоступен';
    console.log(error);
  }
});