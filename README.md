# google-meet-BLE-NUS-remote

** This extension is a very loose fork from `google-meet-push-to-talk` by [BashVideo](https://github.com/BashVideo/google-meet-push-to-talk). The previous README at the point of fork can be found below **

This is a simple extension that allows you to mute and unmute yourself using a remote device that connects over Bluetooth Low Energy. It supports BLE devices that use the Nordic Uart Service (NUS). The commands received/sent are hard-coded to support sample firmware featuring the Open Hardware Summit 2020 Badge, a circuitPython project. However this project was designed to act as an example for other simple BLE protocols.

BashVideo/google-meet-push-to-talk was chosen as an arbitrary starting point for an extension targetting google meet. This project diverges significantly from the original project: we add hardware support for a BLE remote. 

## To use:
* First deploy the sample script to a OHSummit 2020 Badge PCB, or a compatible CircuitPython board.
    * TODO - link to the sample project!
* Then install this extension to your browser
* Join a Google Meet
* Upon opening the meet link, a popup should appear requesting connection to a BLE device
    * If a popup does not appear, refresh the page and be careful to keep your cursor within the Meet window
* Select the correct entry, that probably starts with CIRCUITPY
* Once connected the screen should change to display a logo
* Press buttonD (upper right hand corner) to unmute
* Press buttonC (upper left hand corner) to mute
* Mute status should be displayed as icons on the screen

If you run into issues, inspect the javascript console on the meet window, and debug further from there.


# google-meet-push-to-talk

Simple extension that allows you to mute and unmute yourself with a key press instead of fumbling around trying to click the icon.

## 📚 DOCUMENTATION

🎉 Install the [Chrome extension](https://chrome.google.com/webstore/detail/google-meet-push-to-talk/pgpidfocdapogajplhjofamgeboonmmj) (reload your Meet tab if you have one open)  
🔕 Mute/unmute: Quick push <kbd>space</kbd>  
🔈 Hold <kbd>space</kbd> (default) to talk, release to go back to mute  
⌨️ Configure your own hotkey if you don't like <kbd>space</kbd>  
📣 Mute will be on by default, but you can disable that feature in settings  
⚠️ This extensions only works on Google Meet, it will not work on Google Hangouts ⚠️

## 🤔 PURPOSE

This extension was made to help all the teachers and students figuring out distance learning together due to COVID-19.

## 🕵️‍♀️ PRIVACY POLICY

We don't store your data, period.

## 🙏 ACKNOWLEDGEMENTS

👩‍🏫👨‍🏫Teachers! School administrators! IT Staff!  
🙌Casey Watts and all the contributors at the [original gist](https://gist.github.com/caseywatts/561bc498b6feec3d419b29a65d916663) for finding a clean and simple solution  
🤝Tim Oxley and the [keycode library](https://github.com/timoxley/keycode)  
👉Joshua Wilson for [element-ready.js](https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e)  
💪[Google Meet Grid View](https://chrome.google.com/webstore/detail/google-meet-grid-view/bjkegbgpfgpikgkfidhcihhiflbjgfic?hl=en-US) for being another great Chrome extension for group meetings and inspiring this  
🙊Icons created by [Freepik](https://www.flaticon.com/authors/freepik) from [https://www.flaticon.com](www.flaticon.com)

## 📦 CHANGELOG

### v1.1.1 - 2020-04-21

#### Fixed

- Fix canceling hotkey entry

### v1.1.0 - 2020-04-20

#### Added

- "Mute on Join" setting, on by default

### v1.0.2 - 2020-04-19

#### Added

- Configurable hotkeys

#### Fixed

- Default hotkey wasn't loading after upgrading
- Transpiling for older version of Chrome
- Only disable toggling when textarea or input is targeted
- Non-stop toggling on camera control

### v0.0.3 - 2020-04-08

#### Fixed

- Non-stop toggling after clicking microphone control

### v0.0.2 - 2020-04-07

#### Fixed

- Disable toggling when chat window is open
