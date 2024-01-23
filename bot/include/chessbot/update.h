#ifndef CHESSBOT_UPDATE_H
#define CHESSBOT_UPDATE_H

uint64_t currentFirmwareVersion = 0;

// Create the low-priority task to occasionally check for OTA updates
void launchUpdater();

#endif // ifndef CHESSBOT_UPDATE_H