let seen = new Set();
let allLogs = [];
let recentLogs = [];
let timer = null;

async function loadLogs() {
    if (!document.getElementById('autoRefresh').checked) return;

    const res = await fetch('/api/monitor');
    const logs = await res.json();

    const container = document.getElementById('logs');

    const urlFilter = document.getElementById('urlFilter').value;
    const methodFilter = document.getElementById('methodFilter').value;
    const bodyFilter = document.getElementById('bodyFilter').value;

    const now = Date.now();

    logs.forEach(log => {
        if (log.url === "/api/monitor") return;

        const key = log.method + log.url + log.body + log.time;
        if (seen.has(key)) return;

        if (urlFilter && !log.url.includes(urlFilter)) return;
        if (methodFilter && log.method !== methodFilter) return;
        if (bodyFilter && !(log.body || "").includes(bodyFilter)) return;

        seen.add(key);

        const logTime = log.time || now;

        const div = document.createElement('div');
        div.className = 'log';

        // 🔥 상태 강조
        if (log.duration > 1000) div.classList.add('slow');
        if (log.status >= 500) div.classList.add('error');

        div.innerHTML = `
            <div class="method ${log.method}">${log.method}</div>
            <div class="url">${log.url}</div>
            <div class="time">${new Date(logTime).toLocaleTimeString()}</div>
            <div class="body">${log.body || ''}</div>
        `;

        container.prepend(div);

        allLogs.push({ ...log, time: logTime });
        recentLogs.push({ time: logTime, method: log.method });

        // 메모리 관리
        if (recentLogs.length > 1000) {
            recentLogs.shift();
        }
    });
}

function updateStats() {
    const now = Date.now();

    const last1s = recentLogs.filter(l => now - l.time < 1000);
    const last5s = recentLogs.filter(l => now - l.time < 5000);

    const rps = last1s.length;
    document.getElementById('rps').innerText = rps;
    document.getElementById('rpsBar').style.width = Math.min(rps * 5, 100) + "%";

    const total = last5s.length || 1;
    const getCount = last5s.filter(l => l.method === "GET").length;

    document.getElementById('getRatio').innerText =
        Math.round((getCount / total) * 100) + "%";

    document.getElementById('recentCount').innerText = total;
}

function startInterval() {
    if (timer) clearInterval(timer);
    const interval = document.getElementById('intervalInput').value || 1000;
    timer = setInterval(loadLogs, interval);
}

function clearLogs() {
    document.getElementById('logs').innerHTML = '';
    seen.clear();
    allLogs = [];
    recentLogs = [];
}

function downloadLogs() {
    const blob = new Blob([JSON.stringify(allLogs, null, 2)], {
        type: 'application/json'
    });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logs.json';
    a.click();
}

/* 이벤트 */
document.getElementById('intervalInput').addEventListener('change', startInterval);
document.getElementById('clearBtn').addEventListener('click', clearLogs);
document.getElementById('downloadBtn').addEventListener('click', downloadLogs);

/* 실행 */
startInterval();
setInterval(updateStats, 1000);
loadLogs();
