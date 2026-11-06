#include <OpenColorIO/OpenColorIO.h>
#include <emscripten/emscripten.h>

#include <cstdint>
#include <exception>
#include <stdexcept>
#include <string>

namespace OCIO = OCIO_NAMESPACE;

namespace {

OCIO::ConstConfigRcPtr g_config;
std::string g_error;
std::string g_colorSpaceName;

void setError(const std::exception& error) {
    g_error = error.what();
}

}

extern "C" {

EMSCRIPTEN_KEEPALIVE
const char* nvts_ocio_version() {
    return OCIO::GetVersion();
}

EMSCRIPTEN_KEEPALIVE
int nvts_ocio_load_builtin_config(const char* name) {
    try {
        if (name == nullptr || *name == '\0') {
            throw std::invalid_argument("Configuration name is empty.");
        }

        auto config = OCIO::Config::CreateFromBuiltinConfig(name);

        if (!config) {
            throw std::runtime_error("Could not create OCIO configuration.");
        }

        g_config = config;
        g_error.clear();

        return 1;
    }
    catch (const std::exception& error) {
        setError(error);
        return 0;
    }
}

EMSCRIPTEN_KEEPALIVE
int nvts_ocio_color_space_count() {
    if (!g_config) {
        g_error = "OpenColorIO configuration is not initialized.";
        return 0;
    }

    return g_config->getNumColorSpaces();
}

EMSCRIPTEN_KEEPALIVE
const char* nvts_ocio_color_space_name(int index) {
    if (!g_config) {
        g_error = "OpenColorIO configuration is not initialized.";
        return "";
    }

    const char* name = g_config->getColorSpaceNameByIndex(index);

    g_colorSpaceName = name ? name : "";

    return g_colorSpaceName.c_str();
}

EMSCRIPTEN_KEEPALIVE
const char* nvts_ocio_last_error() {
    return g_error.c_str();
}

EMSCRIPTEN_KEEPALIVE
int nvts_ocio_process_rgba(
    float* pixels,
    int width,
    int height,
    unsigned int floatCount,
    const char* inputColorSpace,
    const char* outputColorSpace
) {
    try {
        if (!g_config) {
            throw std::runtime_error("OpenColorIO is not initialized.");
        }

        if (
            pixels == nullptr ||
            inputColorSpace == nullptr ||
            outputColorSpace == nullptr ||
            width <= 0 ||
            height <= 0
        ) {
            throw std::invalid_argument("Invalid image parameters.");
        }

        const std::uint64_t expectedCount =
            static_cast<std::uint64_t>(width) *
            static_cast<std::uint64_t>(height) * 4;

        if (expectedCount != floatCount) {
            throw std::invalid_argument("RGBA buffer size does not match dimensions.");
        }

        auto processor = g_config->getProcessor(
            inputColorSpace,
            outputColorSpace
        );

        auto cpuProcessor = processor->getDefaultCPUProcessor();

        OCIO::PackedImageDesc image(
            pixels,
            static_cast<long>(width),
            static_cast<long>(height),
            4
        );

        cpuProcessor->apply(image);

        g_error.clear();

        return 1;
    }
    catch (const std::exception& error) {
        setError(error);
        return 0;
    }
}

}
