# Power Monitoring Terminal ⚡

A real-time web dashboard for monitoring power consumption, voltage, and current using Firebase Realtime Database. This project is designed to work with an ESP32 trainer node (UNIT PWR-01).

## 🌟 Features

- **Real-Time Data**: Live updates for Voltage (V), Current (A), and Power (W).
- **Interactive Gauges**: Visual gauges to easily monitor electrical parameters.
- **Power Trend Chart**: A live chart showing the power usage trend for the last 40 samples.
- **Energy Calculation**: Calculates energy consumed (kWh) during the active session.
- **Log History**: Displays the latest reading logs in a tabular format.
- **Responsive Design**: Modern, dark-themed UI that looks great on both desktop and mobile devices.

## 🚀 Getting Started

### Prerequisites

To run this dashboard, you need a Firebase project set up.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Realtime Database**.
4. Register a web app in your project settings to get your Firebase config.

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/power-monitoring-terminal.git
   ```
2. Open `app.js` and replace the placeholder Firebase configuration with your actual Firebase project credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "YOUR_PROJECT",
   };
   ```
3. Open `index.html` in your web browser. (Note: Since this project uses ES6 Modules, you will need to serve it using a local web server like VSCode Live Server, `npx serve`, or Python's `http.server`).

## 🗄️ Database Structure

The dashboard expects the following structure in your Firebase Realtime Database:

```json
{
  "monitorDaya": {
    "current": {
      "tegangan": 220.5,
      "arus": 1.2,
      "daya": 264.6
    },
    "history": {
      "timestamp1": {
        "tegangan": 220.5,
        "arus": 1.2,
        "daya": 264.6
      },
      ...
    }
  }
}
```

## 🛠️ Built With

- HTML5 / CSS3
- Vanilla JavaScript (ES6 Modules)
- Firebase Realtime Database SDK (v10)
- HTML Canvas (for charting)

## 📄 License

This project is licensed under the MIT License.
