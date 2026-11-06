#include <OpenImageIO/filesystem.h>
#include <OpenImageIO/imageio.h>
#include <OpenImageIO/oiioversion.h>
#include <emscripten/emscripten.h>

#include <cctype>
#include <cstdint>
#include <exception>
#include <limits>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

std::string g_error;
std::string g_filename;
std::vector<unsigned char> g_inputBytes;
std::vector<unsigned char> g_outputBytes;
std::vector<float> g_pixels;

std::unique_ptr<OIIO::Filesystem::IOMemReader> g_inputProxy;
std::unique_ptr<OIIO::ImageInput> g_input;

int g_width = 0;
int g_height = 0;
int g_channels = 0;

void clearError() {
    g_error.clear();
}

void setError(const std::exception& error) {
    g_error = error.what();
}

void setError(const std::string& error) {
    g_error = error;
}

std::string normalizeExtension(const char* extension) {
    if (extension == nullptr || *extension == '\0') {
        throw std::invalid_argument("Image extension is empty.");
    }

    std::string result(extension);

    if (!result.empty() && result.front() == '.') {
        result.erase(0, 1);
    }

    if (result.empty()) {
        throw std::invalid_argument("Invalid image extension.");
    }

    for (unsigned char character : result) {
        if (!std::isalnum(character)) {
            throw std::invalid_argument("Invalid image extension.");
        }
    }

    return "." + result;
}

std::uint64_t calculateFloatCount(
    int width,
    int height,
    int channels
) {
    if (width <= 0 || height <= 0 || channels <= 0) {
        throw std::invalid_argument("Invalid image dimensions.");
    }

    const std::uint64_t count =
        static_cast<std::uint64_t>(width) *
        static_cast<std::uint64_t>(height) *
        static_cast<std::uint64_t>(channels);

    if (count > std::numeric_limits<std::uint32_t>::max()) {
        throw std::length_error("Image exceeds the supported buffer size.");
    }

    return count;
}

void closeInput() {
    if (g_input) {
        g_input->close();
        g_input.reset();
    }

    g_inputProxy.reset();
    g_inputBytes.clear();
}

}

extern "C" {

EMSCRIPTEN_KEEPALIVE
const char* nvts_oiio_version() {
    return OIIO_VERSION_STRING;
}

EMSCRIPTEN_KEEPALIVE
const char* nvts_oiio_last_error() {
    return g_error.c_str();
}

EMSCRIPTEN_KEEPALIVE
int nvts_oiio_open_image_memory(
    const unsigned char* data,
    std::uint32_t byteCount,
    const char* extension
) {
    try {
        if (data == nullptr || byteCount == 0) {
            throw std::invalid_argument("Image buffer is empty.");
        }

        closeInput();
        g_pixels.clear();

        const std::string suffix = normalizeExtension(extension);
        g_filename = "nvts_input" + suffix;

        g_inputBytes.assign(data, data + byteCount);

        g_inputProxy =
            std::make_unique<OIIO::Filesystem::IOMemReader>(
                g_inputBytes.data(),
                g_inputBytes.size()
            );

        g_input = OIIO::ImageInput::open(
            g_filename,
            nullptr,
            g_inputProxy.get()
        );

        if (!g_input) {
            const std::string error = OIIO::geterror();
            throw std::runtime_error(
                error.empty() ? "Could not open image." : error
            );
        }

        const OIIO::ImageSpec spec = g_input->spec();

        if (spec.depth != 1) {
            throw std::runtime_error(
                "Volumetric images are not supported by this adapter."
            );
        }

        const std::uint64_t floatCount = calculateFloatCount(
            spec.width,
            spec.height,
            spec.nchannels
        );

        g_pixels.resize(static_cast<std::size_t>(floatCount));

        if (!g_input->read_image(
            0,
            0,
            0,
            spec.nchannels,
            OIIO::TypeDesc::FLOAT,
            g_pixels.data()
        )) {
            const std::string error = g_input->geterror();
            throw std::runtime_error(
                error.empty() ? "Could not decode image pixels." : error
            );
        }

        g_width = spec.width;
        g_height = spec.height;
        g_channels = spec.nchannels;

        closeInput();
        clearError();

        return 1;
    }
    catch (const std::exception& error) {
        closeInput();
        g_pixels.clear();
        g_width = 0;
        g_height = 0;
        g_channels = 0;
        setError(error);
        return 0;
    }
}

EMSCRIPTEN_KEEPALIVE
int nvts_oiio_image_width() {
    return g_width;
}

EMSCRIPTEN_KEEPALIVE
int nvts_oiio_image_height() {
    return g_height;
}

EMSCRIPTEN_KEEPALIVE
int nvts_oiio_image_channels() {
    return g_channels;
}

EMSCRIPTEN_KEEPALIVE
std::uint32_t nvts_oiio_pixel_float_count() {
    return static_cast<std::uint32_t>(g_pixels.size());
}

EMSCRIPTEN_KEEPALIVE
float* nvts_oiio_image_pixels() {
    return g_pixels.empty() ? nullptr : g_pixels.data();
}

EMSCRIPTEN_KEEPALIVE
int nvts_oiio_encode_float_memory(
    const float* pixels,
    int width,
    int height,
    int channels,
    const char* extension,
    const char* compression
) {
    try {
        if (pixels == nullptr) {
            throw std::invalid_argument("Pixel buffer is null.");
        }

        const std::uint64_t floatCount =
            calculateFloatCount(width, height, channels);

        if (floatCount == 0) {
            throw std::invalid_argument("Invalid pixel buffer.");
        }

        const std::string suffix = normalizeExtension(extension);
        const std::string filename = "nvts_output" + suffix;

        g_outputBytes.clear();

        OIIO::Filesystem::IOVecOutput proxy(g_outputBytes);

        auto output = OIIO::ImageOutput::create(
            filename,
            &proxy
        );

        if (!output) {
            const std::string error = OIIO::geterror();
            throw std::runtime_error(
                error.empty() ? "Could not create image writer." : error
            );
        }

        if (!output->supports("ioproxy")) {
            throw std::runtime_error(
                "This image format does not support memory output."
            );
        }

        OIIO::ImageSpec spec(
            width,
            height,
            channels,
            OIIO::TypeDesc::FLOAT
        );

        if (compression != nullptr && *compression != '\0') {
            spec.attribute("compression", compression);
        }

        if (!output->open(filename, spec)) {
            const std::string error = output->geterror();
            throw std::runtime_error(
                error.empty() ? "Could not open image writer." : error
            );
        }

        if (!output->write_image(
            OIIO::TypeDesc::FLOAT,
            pixels
        )) {
            const std::string error = output->geterror();
            output->close();

            throw std::runtime_error(
                error.empty() ? "Could not encode image." : error
            );
        }

        if (!output->close()) {
            const std::string error = output->geterror();
            throw std::runtime_error(
                error.empty() ? "Could not finalize image." : error
            );
        }

        if (g_outputBytes.empty()) {
            throw std::runtime_error("Encoded image is empty.");
        }

        if (
            g_outputBytes.size() >
            std::numeric_limits<std::uint32_t>::max()
        ) {
            throw std::length_error("Encoded image is too large.");
        }

        clearError();
        return 1;
    }
    catch (const std::exception& error) {
        g_outputBytes.clear();
        setError(error);
        return 0;
    }
}

EMSCRIPTEN_KEEPALIVE
const unsigned char* nvts_oiio_output_data() {
    return g_outputBytes.empty() ? nullptr : g_outputBytes.data();
}

EMSCRIPTEN_KEEPALIVE
std::uint32_t nvts_oiio_output_size() {
    return static_cast<std::uint32_t>(g_outputBytes.size());
}

EMSCRIPTEN_KEEPALIVE
void nvts_oiio_reset() {
    closeInput();

    g_pixels.clear();
    g_outputBytes.clear();
    g_width = 0;
    g_height = 0;
    g_channels = 0;

    clearError();
}

}
