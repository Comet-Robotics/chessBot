SET(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-missing-field-initializers")

idf_component_register(SRCS "update.cpp" "wireless.cpp" "main.cpp"
                    INCLUDE_DIRS "../include")
