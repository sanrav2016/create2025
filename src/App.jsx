import { useState, useRef, useEffect } from 'react';
import './App.css';

export default function App() {
  const [characteristic, setCharacteristic] = useState(null);
  const [motorValues, setMotorValues] = useState([0, 0, 0, 0]);
  const [profile, setProfile] = useState("default");
  const [profiles, setProfiles] = useState({
    Custom: [0, 0, 0, 0],
    Default: [0, 0, 0, 0],
    Low: [100, 150, 200, 255],
    High: [50, 75, 125, 175],
  });

  const canvasRef = useRef(null);

  async function connect() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      setCharacteristic(await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8'));

    } catch (error) {
      console.error("Bluetooth Connection Error: ", error);
    }
  }

  function reset() {
    setMotorValues([0, 0, 0, 0]);
  }

  useEffect(() => {
    console.log(motorValues)
  }, [motorValues]);

  function updateMotorValues(ind, val) {
    const newValues = [...motorValues];
    newValues[ind] = parseInt(val);
    setMotorValues(newValues);
    setProfile("custom");
    setProfiles({ ...profiles, custom: newValues });
  }

  function handleProfileChange(e) {
    const selectedProfile = e.target.value;
    setProfile(selectedProfile);
    if (profiles[selectedProfile]) {
      setMotorValues(profiles[selectedProfile]);
    }
  }

  function saveCurrentProfile() {
    if (profile === "custom") {
      const newProfileName = prompt("Enter profile name: ");
      if (newProfileName) {
        setProfiles({ ...profiles, [newProfileName]: motorValues });
        setProfile(newProfileName);
      }
    } else {
      setProfiles({ ...profiles, [profile]: motorValues });
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, 150 - motorValues[0] * 0.5);

    motorValues.forEach((val, i) => {
      const x = (canvas.width / (motorValues.length - 1)) * i;
      const y = 150 - val * 0.5;
      ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, "rgba(0,255,0,0.4)");
    gradient.addColorStop(1, "rgba(0,255,0,0)");

    ctx.lineTo(canvas.width, 150);
    ctx.lineTo(0, 150);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [motorValues]);

  return (
    <div className="p-4 text-center font-sans max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">ESP32 Control Panel</h1>
      <button onClick={connect} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Connect to ESP32</button>

      <div className="flex justify-between items-center mb-4">
        <select value={profile} onChange={handleProfileChange} className="p-2 border rounded">
          {Object.keys(profiles).map((profileName) => (
            <option key={profileName} value={profileName}>{profileName}</option>
          ))}
        </select>
        <button onClick={saveCurrentProfile} className="ml-2 bg-yellow-500 text-white p-2 rounded">Save</button>
      </div>

      <canvas ref={canvasRef} width={400} height={150} className="mx-auto mb-4 border rounded"></canvas>

      <div className="flex justify-between items-end w-full px-2">
        {motorValues.map((val, index) => (
          <div key={index} className="flex flex-col items-center">
            <input
              type="range"
              min="0"
              max="255"
              value={val}
              onChange={(e) => updateMotorValues(index, e.target.value)}
              className="transform -rotate-90 w-36 mb-2"
            />
            <span>{val}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button onClick={reset} id="resetButton" className="bg-gray-500 text-white px-4 py-2 rounded">Reset</button>
        <button id="sendButton" className="bg-green-500 text-white px-4 py-2 rounded" onClick={async () => {
          const command = "0," + motorValues.join(',');
          console.log(command);
          const encoder = new TextEncoder();
          await characteristic.writeValue(encoder.encode(command));
        }}>Send</button>
      </div>
    </div>
  );
}
