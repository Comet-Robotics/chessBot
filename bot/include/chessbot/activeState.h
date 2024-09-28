// Active state is something that changes often. It is managed by the robot, rather than by the server.
// Usually, it will be sent from the robot to the server at a regular interval.

#ifndef CHESSBOT_ACTIVE_STATE_H
#define CHESSBOT_ACTIVE_STATE_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <cstdint>

namespace chessbot {

enum class StateKey : uint32_t {
    POS_X,
    POS_Y,

    VEL_X,
    VEL_Y,

    STATE_COUNT
};

extern uint32_t stateStore[(size_t)StateKey::CONFIG_COUNT];

struct StateSubscription {
    TickType_t interval;
    StateKey offset;
}


}; // namespace chessbot

#endif // ifndef CHESSBOT_ACTIVE_STATE_H