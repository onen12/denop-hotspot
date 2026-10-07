import { Package } from "@/lib/types";

export interface ScriptOptions {
  routerName: string;
  identity: string;
  hotspotInterface: string; // e.g. "bridge-hotspot" or "ether2" or "wifi1"
  wanInterface: string; // e.g. "ether1"
  dnsName: string; // e.g. "wifi.denophostel.com" or leave empty
  portalDomain: string; // your Render domain, e.g. "denop-hotspot.onrender.com"
  packages: Package[];
}

/**
 * Generates a complete RouterOS .rsc script for Denop Hostel Wifi hotspot.
 * IP range: 172.16.0.0/16
 * Includes: addresses, pool, DHCP, hotspot server, profiles, firewall, NAT,
 * AP isolation, walled garden, and basic HTML directory setup.
 */
export function generateRouterScript(opts: ScriptOptions): string {
  const {
    routerName,
    identity,
    hotspotInterface,
    wanInterface,
    dnsName,
    portalDomain,
    packages,
  } = opts;

  const hotspotIp = "172.16.0.1";
  const network = "172.16.0.0/16";
  const poolRange = "172.16.0.2-172.16.255.254";

  // Build user profiles from packages
  const profileScripts = packages
    .filter((p) => p.is_active)
    .map((pkg) => {
      const rateLimit = `${pkg.upload_speed}/${pkg.download_speed}`;
      const sessionTimeout = minutesToRos(pkg.duration_minutes);
      const dataLimit = pkg.data_mb ? `${pkg.data_mb}M` : "0";
      return `
# Profile: ${pkg.name} (${pkg.price} UGX)
/ip hotspot user profile
add name="${sanitize(pkg.name)}" \\
    session-timeout=${sessionTimeout} \\
    idle-timeout=15m \\
    keepalive-timeout=2m \\
    status-autorefresh=1m \\
    shared-users=${pkg.shared_users} \\
    rate-limit="${rateLimit}" \\
    address-list="hs-${sanitize(pkg.name)}" \\
    ${pkg.data_mb ? `limit-bytes-total=${dataLimit} \\` : ""}
    add-mac-cookie=yes \\
    mac-cookie-timeout=1d \\
    on-login=":log info \\"Hotspot login: \\$user (\\$address)\\"" \\
    on-logout=":log info \\"Hotspot logout: \\$user\\""
`;
    })
    .join("\n");

  const script = `# ============================================
# Denop Hostel Wifi - Auto Configuration Script
# Router: ${routerName}
# Generated: ${new Date().toISOString()}
# ============================================
# INSTRUCTIONS:
# 1. Connect to the MikroTik via Winbox / Terminal
# 2. Make a backup first: /system backup save name=before-denop
# 3. Paste this entire script and press Enter
# 4. Wait for it to finish (may take 10-30 seconds)
# 5. Upload the HTML files from the admin panel to Files > hotspot
# ============================================

:log info "=== Starting Denop Hostel Wifi configuration ==="

# --- System Identity ---
/system identity set name="${identity}"

# --- Create Bridge for Hotspot (if using multiple ports/APs) ---
# Comment out the next lines if you already have a bridge or use a single interface
:do {
  /interface bridge add name=bridge-hotspot comment="Denop Hotspot Bridge"
} on-error={}

# Add the chosen interface to the bridge (adjust as needed)
:do {
  /interface bridge port add bridge=bridge-hotspot interface=${hotspotInterface} horizon=1 comment="AP Isolation horizon"
} on-error={}

# Use the bridge as hotspot interface if created, otherwise use the provided interface
:local hsInterface "${hotspotInterface}"
:if ([:len [/interface bridge find name=bridge-hotspot]] > 0) do={
  :set hsInterface "bridge-hotspot"
}

# --- IP Address for Hotspot ---
/ip address
:do { remove [find address~"172.16.0."] } on-error={}
add address=${hotspotIp}/16 interface=\$hsInterface network=172.16.0.0 comment="Denop Hotspot Gateway"

# --- Address Pool ---
/ip pool
:do { remove [find name=hs-pool-denop] } on-error={}
add name=hs-pool-denop ranges=${poolRange}

# --- DHCP Server ---
/ip dhcp-server
:do { remove [find name=dhcp-denop] } on-error={}
add name=dhcp-denop interface=\$hsInterface address-pool=hs-pool-denop lease-time=1h disabled=no

/ip dhcp-server network
:do { remove [find address="${network}"] } on-error={}
add address=${network} gateway=${hotspotIp} dns-server=${hotspotIp} comment="Denop Hotspot DHCP"

# --- DNS ---
/ip dns set allow-remote-requests=yes servers=8.8.8.8,1.1.1.1

# --- NAT (Masquerade) ---
/ip firewall nat
:do { remove [find comment~"Denop"] } on-error={}
add chain=srcnat action=masquerade src-address=${network} out-interface=${wanInterface} comment="Denop Hotspot NAT"

# --- Hotspot Server Profile ---
/ip hotspot profile
:do { remove [find name=hsprof-denop] } on-error={}
add name=hsprof-denop \\
    hotspot-address=${hotspotIp} \\
    dns-name="${dnsName || ""}" \\
    html-directory=hotspot \\
    html-directory-override="" \\
    login-by=http-chap,http-pap,cookie,mac-cookie \\
    http-cookie-lifetime=1d \\
    split-user-domain=no \\
    use-radius=no \\
    radius-accounting=no

# --- Hotspot Server ---
/ip hotspot
:do { remove [find name=hotspot-denop] } on-error={}
add name=hotspot-denop \\
    interface=\$hsInterface \\
    address-pool=hs-pool-denop \\
    profile=hsprof-denop \\
    idle-timeout=15m \\
    keepalive-timeout=2m \\
    addresses-per-mac=2 \\
    disabled=no

# --- User Profiles (from packages) ---
${profileScripts}

# --- Default trial / free profile (optional short trial) ---
/ip hotspot user profile
:do {
  add name="trial-10min" session-timeout=10m idle-timeout=5m rate-limit="1M/2M" shared-users=1 add-mac-cookie=yes
} on-error={}

# --- Walled Garden (allow payment portal + Apple CNA + DNS before login) ---
/ip hotspot walled-garden
:do { remove [find comment~"Denop"] } on-error={}
add dst-host="${portalDomain}" action=allow comment="Denop Payment Portal"
add dst-host="*.${portalDomain}" action=allow comment="Denop Payment Portal wildcard"
add dst-host="captive.apple.com" action=allow comment="Apple CNA"
add dst-host="*.apple.com" action=allow comment="Apple services"
add dst-host="www.msftconnecttest.com" action=allow comment="Windows captive"
add dst-host="connectivitycheck.gstatic.com" action=allow comment="Android captive"
add dst-host="clients3.google.com" action=allow comment="Android captive"

/ip hotspot walled-garden ip
:do { remove [find comment~"Denop"] } on-error={}
add action=accept dst-address=${hotspotIp} comment="Denop gateway DNS/HTTP"
add action=accept dst-address=8.8.8.8 comment="Google DNS"
add action=accept dst-address=1.1.1.1 comment="Cloudflare DNS"
add action=accept dst-address=17.0.0.0/8 comment="Apple CNA range"

# --- Firewall: Basic security + AP Isolation helpers ---
/ip firewall filter
:do { remove [find comment~"Denop"] } on-error={}

# Accept established/related
add chain=forward action=accept connection-state=established,related comment="Denop established"

# Drop invalid
add chain=forward action=drop connection-state=invalid comment="Denop drop invalid"

# Allow DNS from hotspot network
add chain=input action=accept protocol=udp dst-port=53 src-address=${network} comment="Denop DNS"
add chain=input action=accept protocol=tcp dst-port=53 src-address=${network} comment="Denop DNS TCP"

# Allow hotspot HTTP/HTTPS to router
add chain=input action=accept protocol=tcp dst-port=80,443 src-address=${network} comment="Denop hotspot web"

# Drop hotspot clients talking to each other (extra isolation)
add chain=forward action=drop src-address=${network} dst-address=${network} comment="Denop client isolation"

# Drop hotspot to router management (except hotspot ports)
add chain=input action=drop src-address=${network} comment="Denop drop other input from guests"

# --- IP Binding (optional - block unauthorized by default can be strict) ---
# /ip hotspot ip-binding
# add type=bypassed address=${hotspotIp} comment="Gateway"

# --- Clock / NTP (important for cookie timeouts) ---
/system ntp client
set enabled=yes primary-ntp=pool.ntp.org secondary-ntp=time.google.com

# --- Finish ---
:log info "=== Denop Hostel Wifi configuration completed successfully ==="
:put "============================================"
:put "Denop Hostel Wifi setup finished!"
:put "Hotspot gateway: ${hotspotIp}"
:put "Network: ${network}"
:put "Interface: \$hsInterface"
:put "Next steps:"
:put "1. Upload HTML files to /hotspot folder (Files menu)"
:put "2. Create users or use the billing portal vouchers"
:put "3. Test by connecting a client device"
:put "============================================"
`;

  return script;
}

function minutesToRos(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d${remHours}h` : `${days}d`;
}

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}
