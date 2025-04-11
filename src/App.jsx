import { useState } from 'react'
 import reactLogo from './assets/react.svg'
 import viteLogo from '/vite.svg'
 import './App.css'
 
 export default function App() {
   async function connect() {
     try {
       const device = await navigator.bluetooth.requestDevice({
         acceptAllDevices: true,
         optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
       });
 
       const server = await device.gatt.connect();
       const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
       const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
 
       document.getElementById("sendButton").onclick = async function() {
         const servoAngle = document.getElementById("servoAngle").value;
         const motor1 = document.getElementById("motor1").value;
         const motor2 = document.getElementById("motor2").value;
         const motor3 = document.getElementById("motor3").value;
         const motor4 = document.getElementById("motor4").value;
 
         const command = `${servoAngle},${motor1},${motor2},${motor3},${motor4}`;
         const encoder = new TextEncoder();
         await characteristic.writeValue(encoder.encode(command));
       };
     } catch (error) {
       console.error("Bluetooth Connection Error: ", error);
     }
   }
 
   return (
     <div className="p-4 text-center">
       <h1 className="text-xl font-bold">ESP32 Control Panel</h1>
       <button onClick={connect} className="bg-blue-500 text-white p-2 rounded">Connect to ESP32</button>
       <div className="mt-4">
         <label>Servo Angle: <input id="servoAngle" type="range" min="0" max="180" defaultValue="90" /></label><br/>
         <label>Motor 1: <input id="motor1" type="range" min="0" max="255" defaultValue="0" /></label><br/>
         <label>Motor 2: <input id="motor2" type="range" min="0" max="255" defaultValue="0" /></label><br/>
         <label>Motor 3: <input id="motor3" type="range" min="0" max="255" defaultValue="0" /></label><br/>
         <label>Motor 4: <input id="motor4" type="range" min="0" max="255" defaultValue="0" /></label><br/>
         <button id="sendButton" className="bg-green-500 text-white p-2 rounded mt-2">Send</button>
       </div>
     </div>
   );
 }