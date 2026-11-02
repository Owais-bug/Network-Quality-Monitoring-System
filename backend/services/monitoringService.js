
const net = require("node:net");
const { Resolver } = require("node:dns").promises;
const http = require("node:http");
const https = require("node:https");
const { performance } = require("node:perf_hooks");

const DNS_TIMEOUT = 2000;
const CHECK_TIMEOUT = 5000;

// Reject private and special-use IPv4 addresses
const isBlockedIPv4 = (ip) => {
    if (net.isIP(ip) !== 4) return true;

    const [a, b, c] = ip.split(".").map(Number);

    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        a >= 224 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 192 && b === 0 && c === 0) ||
        (a === 192 && b === 0 && c === 2) ||
        (a === 192 && b === 88 && c === 99) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113)
    );
};

const isAllowedAddress = (ip) => {
    return net.isIP(ip) === 4 && !isBlockedIPv4(ip);
};

// Validate HTTP/HTTPS URL
const validateUrl = (url) => {
    try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return false;
        }

        if (parsed.username || parsed.password) return false;

        const port = parsed.port
            ? Number(parsed.port)
            : parsed.protocol === "https:" ? 443 : 80;

        if (![80, 443].includes(port)) return false;

        const hostname = parsed.hostname
            .toLowerCase()
            .replace(/\.$/, "");

        if (
            hostname === "localhost" ||
            hostname.endsWith(".localhost")
        ) {
            return false;
        }

        const normalized = hostname.replace(/^\[|\]$/g, "");
        const version = net.isIP(normalized);

        if (version === 6) return false;
        if (version === 4) return isAllowedAddress(normalized);

        return true;
    } catch {
        return false;
    }
};

// Bounded IPv4-only DNS lookup
const resolveHostname = async (hostname) => {
    const resolver = new Resolver({
        timeout: DNS_TIMEOUT,
        tries: 1
    });
resolver.setServers(["8.8.8.8"]);
    try {
        const addresses = await resolver.resolve4(hostname);

        return addresses.map((address) => ({
            address,
            family: 4
        }));
    }  catch (error) {
    console.error("DNS Resolution Error:", error.code, error.message);
    return [];
} finally {
        resolver.cancel();
    }
};

const validateDnsAddresses = async (hostname) => {
    const addresses = await resolveHostname(hostname);

    return addresses.length > 0 &&
        addresses.every((item) => isAllowedAddress(item.address));
};

// Select a verified IPv4 destination
const getSafeIPv4 = async (hostname) => {
    if (net.isIP(hostname) === 4) {
        if (!isAllowedAddress(hostname)) {
            throw new Error("Blocked IP address");
        }

        return hostname;
    }

    const addresses = await resolveHostname(hostname);

    if (
        addresses.length === 0 ||
        !addresses.every((item) => isAllowedAddress(item.address))
    ) {
        throw new Error("Unsafe or unavailable DNS destination");
    }

    return addresses[0].address;
};

// Main monitoring checker
const checkTarget = async (target) => {
    const startedAt = performance.now();

    const result = {
        target_id: target?.id ?? null,
        checked_at: new Date().toISOString(),
        success: false,
        http_status_code: null,
        response_time_ms: null,
        error_message: null
    };

    try {
        if (!target || !validateUrl(target.url)) {
            throw new Error("Invalid or blocked target URL");
        }

        const parsed = new URL(target.url);
        const hostname = parsed.hostname.replace(/^\[|\]$/g, "");

        const safeIP = await getSafeIPv4(hostname);

        const client = parsed.protocol === "https:"
            ? https
            : http;

        // Remaining time after DNS resolution
        const remaining = CHECK_TIMEOUT -
            (performance.now() - startedAt);

        if (remaining <= 0) {
            throw new Error("Request timeout");
        }

        const response = await new Promise((resolve, reject) => {
            const req = client.request(parsed, {
                method: "GET",
                agent: false,
                family: 4,
                lookup: (host, options, callback) => {
                    callback(null, safeIP, 4);
                },
                headers: {
                    "User-Agent": "NetworkQualityMonitor/1.0",
                    "Accept": "*/*"
                }
            }, (res) => {
                const elapsed = Math.round(
                    performance.now() - startedAt
                );

                const statusCode = res.statusCode;

                // Read headers only. Never follow redirects.
                res.destroy();

                resolve({ statusCode, elapsed });
            });

            const timer = setTimeout(() => {
                req.destroy(new Error("Request timeout"));
            }, remaining);

            req.on("close", () => clearTimeout(timer));
            req.on("error", reject);

            req.end();
        });

        result.http_status_code = response.statusCode;
        result.response_time_ms = response.elapsed;

        result.success =
            response.statusCode >= 200 &&
            response.statusCode < 300;

        if (!result.success) {
            result.error_message = `HTTP ${response.statusCode}`;
        }

    } catch (error) {
        result.response_time_ms = Math.round(
            performance.now() - startedAt
        );

        result.error_message = error.message;
    }

    return result;
};

// Phase 6: Determine target status
const determineTargetStatus = (result, thresholdMs) => {

    // Request failed or timed out
    if (!result || result.success !== true) {
        return "DOWN";
    }

    // Successful request but slow response
    if (result.response_time_ms >= thresholdMs) {
        return "SLOW";
    }

    // Successful request with normal response time
    return "UP";
};

module.exports = {
    validateUrl,
    resolveHostname,
    isAllowedAddress,
    validateDnsAddresses,
    checkTarget,
     determineTargetStatus
};
