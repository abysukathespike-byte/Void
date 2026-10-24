document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

document.onkeydown = function(e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};

if (window.top !== window.self) { window.top.location = window.self.location; }

setInterval(function() { debugger; }, 1000);

let termuxURL = '';
let isLocked = false;
let violationCount = parseInt(localStorage.getItem('void_violation') || '0');

const style = document.createElement('style');
style.innerHTML = `
    #void-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 999999; font-family: sans-serif; }
    #void-modal-box { background: #fff; border: 3px solid #000; border-radius: 15px; padding: 25px; text-align: center; color: #000; max-width: 300px; width: 85%; box-shadow: 6px 6px 0px #000; }
    #void-modal-box h2 { color: #000; margin-bottom: 10px; font-size: 1.2rem; text-transform: uppercase; font-weight: 900; }
    #void-modal-box p { font-size: 0.9rem; color: #333; line-height: 1.4; font-weight: 600; }
`;
document.head.appendChild(style);

function showModal(title, msg) {
    let modal = document.getElementById('void-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'void-modal';
        modal.innerHTML = `<div id="void-modal-box"><h2 id="void-title"></h2><p id="void-msg"></p></div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('void-title').innerText = title;
    document.getElementById('void-msg').innerText = msg;
    modal.style.display = 'flex';
    isLocked = true;
}

async function getFingerprint() {
    const raw = navigator.userAgent + screen.width + 'x' + screen.height + navigator.language + navigator.hardwareConcurrency;
    const msgBuffer = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function reportViolation(type) {
    violationCount++;
    localStorage.setItem('void_violation', violationCount);
    
    if (violationCount === 1) {
        showModal('⚠️ PERINGATAN', 'Jangan coba-coba bypass atau inspect web ini. Ini peringatan terakhir!');
    } else if (violationCount === 2) {
        showModal('⛔ BANNED 1 HARI', 'Kamu melanggar aturan. Device, IP, dan Browser kamu dibanned selama 1 hari.');
    } else if (violationCount >= 3) {
        showModal('🚫 BANNED PERMANEN', 'Kamu melanggar aturan berkali-kali. Device, IP, dan Browser kamu dibanned permanen!');
    }

    try {
        const fp = await getFingerprint();
        const payload = {
            device: fp,
            browser: navigator.userAgent,
            violation_type: type,
            timestamp: Date.now(),
            count: violationCount
        };
        
        db.ref('violations/' + fp).set(payload);
    } catch(e) {}
}

async function checkConnection() {
    if (!navigator.onLine) {
        showModal('📡 OFFLINE', 'Aplikasi ini butuh koneksi internet buat diakses. Cek WiFi/Data kamu!');
        return false;
    }
    
    try {
        const res = await fetch('config.json');
        const cfg = await res.json();
        termuxURL = cfg.termux_server_url;
    } catch(e) {}
    
    return true;
}

function checkSession() {
    const session = localStorage.getItem('void_session');
    const protectedPages = ['home.html', 'wa.html', 'rat.html', 'globalchat.html', 'account.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!session && protectedPages.includes(currentPage)) {
        showModal('🔒 AKSES DITOLAK', 'Anda telah log out atau belum login. Kembali ke halaman login...');
        setTimeout(() => window.location.href = 'index.html', 3000);
        return false;
    }
    return true;
}

async function initSecurity() {
    await checkConnection();
    checkSession();

    window.addEventListener('offline', () => showModal('📡 OFFLINE', 'Koneksi internet terputus!'));
    window.addEventListener('online', () => { if(isLocked) location.reload(); });
}

document.addEventListener('DOMContentLoaded', initSecurity);

if (window.location.protocol === 'view-source:') {
    reportViolation('view-source-attempt');
}