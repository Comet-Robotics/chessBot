# chessBots Embedded Code

## First Time Setup
1. Open the `./bot` folder in Visual Studio Code.
2. Create a file `env.h` and initialize it with the environment-specific information using this template:
```
// Put your IP here and uncomment if you aren't on the special router
//#define FIXED_SERVER_IP "10.0.0.1"

// Comment this out if you have a working OTA router
#define OTA_UPDATE_OPTIONAL

// Uncomment this when you are testing your binary image in the emulator
// #define WOKWI_COMPAT

#ifdef WOKWI_COMPAT
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#else
#define WIFI_SSID "ChessBot"
#define WIFI_PASSWORD ""
#endif

/*
router-ssh-user=admin
router-ssh-password=

binary-location=build
esp32-serial=

do-build=false
*/
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