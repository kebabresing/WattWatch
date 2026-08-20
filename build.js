const fs = require('fs');

// Mengambil API Key dari Environment Variable yang akan di-setting di Vercel
const apiKey = process.env.FIREBASE_API_KEY || "";

const configContent = `export const firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "monitoring-oled.firebaseapp.com.firebaseapp.com",
  databaseURL: "https://monitoring-oled-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-oled"
};
`;

fs.writeFileSync('config.js', configContent);
console.log('File config.js berhasil di-generate untuk Vercel!');
