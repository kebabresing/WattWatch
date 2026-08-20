import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const currentRef = ref(db, "monitorDaya/current");
const historyRef = query(ref(db, "monitorDaya/history"), limitToLast(40));

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

  els.lastUpdate.textContent = new Date().toLocaleTimeString('id-ID', { hour12: false });
}, () => markConnected(false));

onValue(historyRef, (snap) => {
  const rows = [];
  snap.forEach(child => rows.push(child.val()));
  rows.reverse();
  els.logBody.innerHTML = rows.slice(0, 12).map(r => `
    <tr>
      <td>${new Date().toLocaleTimeString('id-ID', { hour12: false })}</td>
      <td>${fmt(r.tegangan, 1)} V</td>
      <td>${fmt(r.arus, 2)} A</td>
      <td>${fmt(r.daya, 0)} W</td>
    </tr>`).join("");
  drawTrend(rows);
});

function drawTrend(rows) {
  const canvas = document.getElementById("trend");
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.clearRect(0, 0, w, h);
  if (rows.length < 2) return;

  const data = rows.slice(-40).map(r => r.daya);
  const max = Math.max(...data, 10);
  const min = 0;
  const stepX = w / (data.length - 1);

  ctx.beginPath();
  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.strokeStyle = "#ffb02e";
  ctx.shadowColor = "rgba(255,176,46,.5)";
  ctx.shadowBlur = 8;
  data.forEach((val, i) => {
    const x = i * stepX;
    const y = h - ((val - min) / (max - min)) * (h * 0.85) - (h * 0.05);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,.06)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}
