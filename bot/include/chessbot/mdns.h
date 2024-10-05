#ifndef CHESSBOT_MDNS_H
#define CHESSBOT_MDNS_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <mdns.h>

#include <chessbot/util.h>

namespace chessbot {

inline void startMdnsAdvertise()
{
    // Init service
    CHECK(mdns_init());

    mdns_hostname_set("my-esp32");
    mdns_instance_name_set("Jhon's ESP32 Thing");

    mdns_instance_name_set("");
    //mdns_service_add(NULL, "_jsonbot", 80, NULL, 0);
}

}; // namespace chessbot

#endif // ifndef CHESSBOT_MDNS_H