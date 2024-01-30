# chessBots Embedded Code

## Setup
1. Open ./bot folder in Visual Studio Code
2. Open the extensions tab on the left.
3. Install Espressif IDF extension from the Marketplace
4. 
3. Plug in the target S2 Mini to your computer
4. Press the RST button on the S2 Mini while holding the 0 button. This puts the ESP32 into bootloader mode and allows it to be flashed manually.
5. Run the command "ESP-IDF: Select port to use" and 
6. Run the command "ESP-IDF: Build, Flash, and start a monitor on your device"
7. You should see an error about the flash failing. To verify it worked, enter the Terminal tab and it should say the flash reached 100%. If it didn't, you likely picked the wrong serial port or didn't enter the bootloader.
8. Press the RST button on the S2 Mini to reboot into your new firmware.

## OTA Update Guide
1. Run the command "ESP-IDF: Build your project"
2. Publish ./build/chessbot.bin to the /update/chessbot folder of the web server
3. Edit /update/chessbot/info.json to point to the new update's timestamp and path