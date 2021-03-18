import Hotkey from "./js/hotkey";
import { getSavedValues, addChangeListener } from "./js/storage";
import { elementReady } from "./js/element-ready";
import { connect, disconnect, connectionToggle, isConnected, nusSendString } from "./js/ble";

const MIC_OFF = {
  en: "Turn off microphone",
  ja: "マイクをオフにする"
}

const MIC_ON = {
  en: "Turn on microphone",
  ja: "マイクをオンにする"
}

let currentHotkey, keydownToggle, keyupToggle;

const currentLanguage = () => window.navigator.language.split("-")[0];

const micButtonSelector = (tip) => `[data-tooltip*='${tip}']`;

const toggle = (hotkey, tip) => {
  // actual event listener
  return (event) => {
    if (event.target && ["input", "textarea"].includes(event.target.type)) {
      return;
    }

    const tooltip = event.target?.dataset?.tooltip;
    if (tooltip?.includes("microphone") || tooltip?.includes("camera")) {
      event.stopPropagation();
    }

    if (event.type === "keydown" && !hotkey.matchKeydown(event)) {
      return;
    }

    if (event.type === "keyup" && !hotkey.matchKeyup(event)) {
      return;
    }

    event.preventDefault();
    document.querySelector(micButtonSelector(tip))?.click();
  };
};

const hookUpListeners = (hotkey) => {
  if (currentHotkey) {
    document.body.removeEventListener("keydown", keydownToggle);
    document.body.removeEventListener("keyup", keyupToggle);
  }
  currentHotkey = hotkey;
  keydownToggle = toggle(hotkey, MIC_ON[currentLanguage()]);
  keyupToggle = toggle(hotkey, MIC_OFF[currentLanguage()]);

  document.body.addEventListener("keydown", keydownToggle);
  document.body.addEventListener("keyup", keyupToggle);
};

getSavedValues(({ hotkey, muteOnJoin }) => {
  hookUpListeners(hotkey);

  if (muteOnJoin) {
    elementReady(micButtonSelector(MIC_OFF[currentLanguage()])).then((button) => {
      button.click();
    });
  }
});

addChangeListener(({ hotkey }) => {
  hookUpListeners(hotkey);
});

// Determine if microphone is muted. Return True if muted, False otherwise
const micIsMuted = () => {
    // We'll look for the microphone button to have a special tooltip
    const button = document.querySelector(micButtonSelector(MIC_OFF[currentLanguage()]));
    // If the button with the MIC_OFF tooltip is present, we must be muted!
    if (button) {
        return false;
    }
    return true;
}

// Retrieve a reference to the Mute/Unmute button
const getButton = () => {
    const button = document.querySelector(micButtonSelector(MIC_ON[currentLanguage()]));
    if (!button) {
      button = document.querySelector(micButtonSelector(MIC_OFF[currentLanguage()]));
    }
    return button;
}

let timer_id = null;
// When BLE is connected, listen for button changes via a timer
// Initially I tried using a click handler, but ran into some issues with it
// TODO - use elementReady(micButtonSelector(MIC_OFF[currentLanguage()]))
// But solve the issues of multiple callbacks and the ordering of click events
// Make sure the behavior is consistent when the remote is used VS mouse is used
window.addEventListener('ble-connected', function(e) {
    if (timer_id !== null) {
        clearInterval(timer_id);
         timer_id = null;
    }
    let last_muted = micIsMuted();
    timer_id = setInterval(function() {
        // Every 100ms, check to see if the button is muted
        const new_muted = micIsMuted();
        // If the button has changed state, then inform the remote device!
        if (new_muted != last_muted) {
            last_muted = new_muted;
            if (new_muted) {
                // This will display a Red cancel button
                // If you don't have the image loaded, try 'red\n' instead.
                nusSendString('cancel\n');
            } else {
                // This will display a green OK button
                // If you don't have the image loaded, try 'green\n' instead.
                nusSendString('ok\n');
            }
        }
    }, 100);
    // Also immediately update the status
    if (last_muted) {
        // This will display a Red cancel button
        // If you don't have the image loaded, try 'red\n' instead.
        nusSendString('cancel\n');
    } else {
        // This will display a green OK button
        // If you don't have the image loaded, try 'green\n' instead.
        nusSendString('ok\n');
    }
});

// Cease checking the button when BLE disconnects
window.addEventListener('ble-disconnected', function(e) {
 if (timer_id !== null) {
    clearInterval(timer_id);
     timer_id = null;
 }
});

// Automatically attempt to connect to BLE once page is completely loaded
// TODO - Add a UI element to connect instead (and show connection status)
window.addEventListener("load", function() {
  console.log('Window loaded');
  connect();
});

// When data is emitted from the remote device, do something about it
// TODO - add support for more buttons, add sensors
window.addEventListener("notification", function(e) {
  // When buttonC is pressed, turn off the mic
  if (e.detail == 'buttonC') {
    console.log('MIC OFF');
    let button = document.querySelector(micButtonSelector(MIC_OFF[currentLanguage()]));
    if (button) {
        button.click();
    }
  // When buttonD is pressed, turn on the mic
  } else if (e.detail == 'buttonD') {
    console.log('MIC ON');
    let button = document.querySelector(micButtonSelector(MIC_ON[currentLanguage()]));
    if (button) {
        button.click();
    }
  } else {
    console.log("unhandled notification " + e.detail);
  }
});
