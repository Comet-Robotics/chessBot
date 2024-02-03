SET(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-missing-field-initializers")

idf_component_register(SRC_DIRS "."
                    INCLUDE_DIRS "../include")
