import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from 'firebase/firestore';

const modes = ['Focus', 'Relax', 'Workout'];

const App = () => {
  const [motorValues, setMotorValues] = useState([0, 0, 0]);
  const [characteristic, setCharacteristic] = useState(null);
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    const fetchProfiles = async () => {
      const snapshot = await getDocs(collection(db, 'motorProfiles'));
      const data = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data().values;
      });
      setProfiles(data);
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(async () => {
        setTimeLeft((prev) => prev - 1);

        if (characteristic) {
          const command = "0," + motorValues.join(',');
          const encoder = new TextEncoder();
          await characteristic.writeValue(encoder.encode(command));
        }
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, characteristic, motorValues]);

  const handleSliderChange = (index, value) => {
    const updated = [...motorValues];
    updated[index] = parseInt(value);
    setMotorValues(updated);
  };

  const handleSaveProfile = async () => {
    await setDoc(doc(db, 'motorProfiles', selectedMode), {
      values: motorValues,
    });
    setProfiles((prev) => ({ ...prev, [selectedMode]: motorValues }));
  };

  const handleLoadProfile = async (mode) => {
    const docRef = doc(db, 'motorProfiles', mode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setMotorValues(docSnap.data().values);
    }
  };

  const connectToDevice = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['battery_service'] }]
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('battery_service');
      const char = await service.getCharacteristic('battery_level');
      setCharacteristic(char);
    } catch (error) {
      console.error('Bluetooth connection failed', error);
    }
  };

  return (
    <div className="p-4 font-sans max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Motor Control Timer</h1>

      <button
        onClick={connectToDevice}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Connect to Bluetooth
      </button>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Mode</label>
        <select
          value={selectedMode}
          onChange={(e) => {
            setSelectedMode(e.target.value);
            handleLoadProfile(e.target.value);
          }}
          className="p-2 border rounded w-full"
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
        <button
          onClick={handleSaveProfile}
          className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
        >
          Save Profile
        </button>
      </div>

      <div className="mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="mb-2">
            <label className="block">Motor {i + 1}: {motorValues[i]}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={motorValues[i]}
              onChange={(e) => handleSliderChange(i, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Set Duration (seconds)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="p-2 border rounded w-24"
          min="1"
        />
        <button
          onClick={() => {
            setTimeLeft(duration);
            setTimerRunning(true);
          }}
          className="ml-4 bg-red-500 text-white px-4 py-2 rounded"
          disabled={timerRunning}
        >
          Start Timer
        </button>

        {timerRunning && (
          <div className="mt-2 text-lg font-semibold">
            Time Left: {timeLeft}s
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-2">Saved Profiles</h2>
        {Object.entries(profiles).map(([mode, values]) => (
          <div key={mode} className="mb-2">
            <strong>{mode}:</strong> [{values.join(', ')}]
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
