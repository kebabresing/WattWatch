import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const currentRef = ref(db, "monitorDaya/current");

const els = {
  v: document.getElementById("v-value"),
  a: document.getElementById("a-value"),
  w: document.getElementById("w-value"),
  needleV: document.getElementById("needle-v"),
  needleA: document.getElementById("needle-a"),
  needleW: document.getElementById("needle-w"),
  status: document.getElementById("conn-status"),
  lastUpdate: document.getElementById("last-update"),
  logBody: document.getElementById("log-body"),
  kwh: document.getElementById("kwh-value"),
};

const LIMITS = { v: 500, a: 30, w: 5000 }; // skala penuh gauge (sesuaikan dgn trainer)
let energyWs = 0;     // akumulasi energi (W-detik) sejak halaman dibuka
let lastTick = null;

function setNeedle(el, pct) {
  const deg = -120 + (Math.min(1, Math.max(0, pct)) * 240);
  el.setAttribute("transform", `rotate(${deg} 100 100)`);
}

function fmt(n, d = 1) { return Number(n).toFixed(d); }

function markConnected(state) {
  els.status.textContent = state ? "LINK ESTABLISHED" : "NO SIGNAL";
  els.status.className = "pill " + (state ? "pill-ok" : "pill-bad");
}

onValue(currentRef, (snap) => {
  const d = snap.val();
  if (!d) return;
  markConnected(true);

  els.v.textContent = fmt(d.tegangan, 1);
  els.a.textContent = fmt(d.arus, 2);
  els.w.textContent = fmt(d.daya, 0);

  setNeedle(els.needleV, d.tegangan / LIMITS.v);
  setNeedle(els.needleA, d.arus / LIMITS.a);
  setNeedle(els.needleW, d.daya / LIMITS.w);

  const now = Date.now();
  if (lastTick) {
    const dtHours = (now - lastTick) / 3600000;
    energyWs += d.daya * dtHours;
    els.kwh.textContent = fmt(energyWs / 1000, 4);
  }
  lastTick = now;

  const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
  els.lastUpdate.textContent = timeStr;

  // Local History untuk Chart & Table
  trendData.push({ x: timeStr, y: d.daya });
  if (trendData.length > 40) trendData.shift();
  if (chart) chart.updateSeries([{ data: trendData }]);

  logRows.unshift({ time: timeStr, v: d.tegangan, a: d.arus, w: d.daya });
  if (logRows.length > 12) logRows.pop();
  els.logBody.innerHTML = logRows.map(r => `
    <tr>
      <td>${r.time}</td>
      <td>${fmt(r.v, 1)} V</td>
      <td>${fmt(r.a, 2)} A</td>
      <td>${fmt(r.w, 0)} W</td>
    </tr>`).join("");

}, () => markConnected(false));

let trendData = [];
let logRows = [];
let chart;

const chartOptions = {
  series: [{ name: 'Daya (W)', data: [] }],
  chart: {
    type: 'area', height: '100%',
    animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
    toolbar: { show: false }, zoom: { enabled: false },
    background: 'transparent'
  },
  colors: ['#ffb02e'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0.1, stops: [0, 90, 100] }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  grid: {
    borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4,
    xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } },
    padding: { top: 0, right: 0, bottom: 0, left: 10 }
  },
  xaxis: {
    type: 'category',
    labels: { show: false },
    tooltip: { enabled: false },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: { style: { colors: '#7c8b83', fontFamily: 'JetBrains Mono' } }
  },
  theme: { mode: 'dark' }
};

chart = new ApexCharts(document.getElementById("trend"), chartOptions);
chart.render();


