SET(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-missing-field-initializers")

idf_component_register(SRCS "adc.cpp" "dac.cpp" "update.cpp" "wireless.cpp" "main.cpp"
                    INCLUDE_DIRS "../include")
