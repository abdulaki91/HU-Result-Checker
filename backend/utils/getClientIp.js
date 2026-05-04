/**
 * Get the real client IP address from the request
 * Checks multiple headers and sources to find the actual client IP
 *
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
function getClientIp(req) {
  // Check various headers that might contain the real IP
  // These are set by proxies, load balancers, and CDNs

  // X-Forwarded-For header (most common)
  // Format: "client, proxy1, proxy2"
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    // Return the first IP (the original client)
    return ips[0];
  }

  // X-Real-IP header (used by nginx and others)
  const xRealIp = req.headers["x-real-ip"];
  if (xRealIp) {
    return xRealIp;
  }

  // CF-Connecting-IP (Cloudflare)
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // X-Client-IP
  const xClientIp = req.headers["x-client-ip"];
  if (xClientIp) {
    return xClientIp;
  }

  // Fastly-Client-IP (Fastly CDN)
  const fastlyClientIp = req.headers["fastly-client-ip"];
  if (fastlyClientIp) {
    return fastlyClientIp;
  }

  // True-Client-IP (Akamai and Cloudflare)
  const trueClientIp = req.headers["true-client-ip"];
  if (trueClientIp) {
    return trueClientIp;
  }

  // X-Cluster-Client-IP (Rackspace LB and Riverbed)
  const xClusterClientIp = req.headers["x-cluster-client-ip"];
  if (xClusterClientIp) {
    return xClusterClientIp;
  }

  // Fallback to Express's req.ip (works with trust proxy)
  if (req.ip) {
    return req.ip;
  }

  // Last resort: connection remote address
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  // If all else fails
  return "unknown";
}

module.exports = getClientIp;
