'use strict';

/* Attribution:
 * This file largely copied from https://github.com/makerdiary/web-device-cli
 * And Edited to remove the terminal-specific portions
 */

// These are the service IDs for the Nordic UART service
const bleNusServiceUUID  = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID   = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID   = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
// Default MTU is the safest choice
const MTU = 20;

var bleDevice;
var bleServer;
var nusService;
var rxCharacteristic;
var txCharacteristic;

var connected = false;

export function isConnected() {
    return connected;
}

export function connectionToggle() {
    if (connected) {
        disconnect();
    } else {
        connect();
    }
}

// This function will attempt to connect to any BLE device advertising the Nordic NUS
// NOTE: webbluetooth may only be called from a page, as it requires user input
// If the user is unable to see the popup or interact with it, this call will fail!
export function connect() {
    if (!navigator.bluetooth) {
        console.log('WebBluetooth API is not available.\r\n' +
                    'Please make sure the Web Bluetooth flag is enabled.');
        return;
    }
    console.log('Requesting Bluetooth Device...');
    // Require the NUS service
    navigator.bluetooth.requestDevice({
        filters: [{services: [bleNusServiceUUID]}],
        acceptAllDevices: false 
    })
    // If a device is found, automatically connect to it
    .then(device => {
        bleDevice = device; 
        console.log('Found ' + device.name);
        console.log('Connecting to GATT Server...');
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
        return device.gatt.connect();
    })
    // If connected, automatically retrieve the service details
    .then(server => {
        console.log('Locate NUS service');
        return server.getPrimaryService(bleNusServiceUUID);
    }).then(service => {
        nusService = service;
        console.log('Found NUS service: ' + service.uuid);
    })
    // Then get RX characteristic information (needed to send data)
    .then(() => {
        console.log('Locate RX characteristic');
        return nusService.getCharacteristic(bleNusCharRXUUID);
    })
    .then(characteristic => {
        rxCharacteristic = characteristic;
        console.log('Found RX characteristic');
    })
    // And TX characteristic information (needed to receive data)
    .then(() => {
        console.log('Locate TX characteristic');
        return nusService.getCharacteristic(bleNusCharTXUUID);
    })
    .then(characteristic => {
        txCharacteristic = characteristic;
        console.log('Found TX characteristic');
    })
    // Notify on the tx characteristic, so we'll be informed when data is sent
    .then(() => {
        console.log('Enable notifications');
        return txCharacteristic.startNotifications();
    })
    // Finally dispatch an event so that the app can know when BLE is connected
    .then(() => {
        console.log('Notifications started');
        txCharacteristic.addEventListener('characteristicvaluechanged',
                                          handleNotifications);
        connected = true;
        const newevent = new CustomEvent('ble-connected');
        window.dispatchEvent(newevent);
    })
    .catch(error => {
        console.log('' + error);
        if(bleDevice && bleDevice.gatt.connected)
        {
            bleDevice.gatt.disconnect();
        }
    });
}

export function disconnect() {
    if (!bleDevice) {
        console.log('No Bluetooth Device connected...');
        return;
    }
    console.log('Disconnecting from Bluetooth Device...');
    if (bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
        connected = false;
        console.log('Bluetooth Device connected: ' + bleDevice.gatt.connected);
    } else {
        console.log('> Bluetooth Device is already disconnected');
    }
}

// If device is disconnected, emit an event so that the app can know
export function onDisconnected() {
    connected = false;
    const newevent = new CustomEvent('ble-disconnected');
    window.dispatchEvent(newevent);
}

export function handleNotifications(event) {
    let value = event.target.value;
    // Convert raw data bytes to character values and use these to 
    // construct a string.
    let str = "";
    for (let i = 0; i < value.byteLength; i++) {
        str += String.fromCharCode(value.getUint8(i));
    }
    // console.log('notification '+str);
    // Emit an event so the main application can receive this data.
    const newevent = new CustomEvent('notification', { 'detail': str.replace(/(\r\n|\n|\r)/gm, "") });
    window.dispatchEvent(newevent);
}

// Send a string back to the device
export function nusSendString(s) {
    if(bleDevice && bleDevice.gatt.connected) {
        console.log("send: " + s);
        // Convert into a Unit8Array for sending
        let val_arr = new Uint8Array(s.length)
        for (let i = 0; i < s.length; i++) {
            let val = s[i].charCodeAt(0);
            val_arr[i] = val;
        }
        // send up to MTU bytes at a time
        sendNextChunk(val_arr);
    } else {
        console.log('Not connected to a device yet.');
    }
}

export function sendNextChunk(a) {
    // Send MTU bytes in this attempt
    let chunk = a.slice(0, MTU);
    rxCharacteristic.writeValue(chunk)
      // But once complete, send the next MTU bytes until complete.
      .then(function() {
          if (a.length > MTU) {
              sendNextChunk(a.slice(MTU));
          }
      });
}
