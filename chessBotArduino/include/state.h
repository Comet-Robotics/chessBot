
enum class Type {
    UINT8,
    UINT16,
    UINT32,
    UINT64,
    INT8,
    INT16,
    INT32,
    INT64,
    FLOAT,
    DOUBLE,
    STR
};

char* TYPE_NAMES[] = {
    "U3", // UINT8
    "U4", // UINT16
    "U5", // UINT32
    "U6", // UINT64
    "S3", // UINT8
    "S4", // UINT16
    "S5", // UINT32
    "S6", // UINT64
    "FP", // FLOAT
    "DP", // DOUBLE
    "ST", // STR
};

struct ConfigNode {
    char* name;
    char type[2];
    void* slot;
};

// MOTOR_LEFT_SCALE FP
