# RL^2 Soccer Bot Embedded Code

## First Time Setup
1. Open this folder in Visual Studio Code.
2. Create a file `env.h` and initialize it with the environment-specific information using this template:
```
#define OTA_UPDATE_OPTIONAL

// #define WOKWI_COMPAT

#ifdef WOKWI_COMPAT
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#else
#define WIFI_SSID ""
#define WIFI_PASSWORD ""
#endif
```
3. Open the extensions tab on the left (4 squares).
4. Install the ESP-IDF and Serial Monitor extensions. 
5. Choose "EXPRESS" installation after it finishes installing.
6. Set "Select ESP-IDF version" to "v5.3 (release version)" and click "Install".
7. Plug the target S2 Mini into your computer.
8. Press the RST button on the S2 Mini while holding the 0 button. This puts the ESP32 into bootloader mode and allows it to be flashed manually.
9. Run the command "ESP-IDF: Select port to use" and 
10. Run the command "ESP-IDF: Build, Flash, and start a monitor on your device"
11. You should see an error about the flash failing. To verify it worked, enter the Terminal tab and it should say the flash reached 100%. If it didn't, you likely picked the wrong serial port or didn't enter the bootloader.
12. Press the RST button on the S2 Mini to reboot into your new firmware.
13. Open the "SERIAL MONITOR" tab in the terminal modal in the bottom right.
14. Select the serial port for the S2 Mini and "Start Monitoring".