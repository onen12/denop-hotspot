import { Package } from "@/lib/types";

export interface ScriptOptions {
  routerName: string;
  identity: string;
  wanInterface: string;
  dnsName: string;
  portalDomain: string;
  packages: Package[];
}

export function generateRouterScript(opts: ScriptOptions): string {
  const {
    routerName,
    identity,
    wanInterface,
    dnsName,
    portalDomain,
    packages,
  } = opts;

  const hotspotIp = "172.16.0.1";
  const network = "172.16.0.0/16";
  const poolRange = "172.16.0.2-172.16.255.254";
  const bridgeName = "bridge-hotspot";

  const profileScripts = packages
    .filter((p) => p.is_active)
    .map((pkg) => {
      const rateLimit = `${pkg.upload_speed}/${pkg.download_speed}`;
      const sessionTimeout = minutesToRos(pkg.duration_minutes);
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
    add-mac-cookie=yes \\
    mac-cookie-timeout=1d \\
    on-login=":log info \\"HS login: \\$user (\\$address)\\"" \\
    on-logout=":log info \\"HS logout: \\$user\\""
`;
    })
    .join("\n");

  return `# ============================================
# Denop Hostel Wifi - Clean Auto Configuration
# Router: ${routerName}
# Generated: ${new Date().toISOString()}
# RouterOS 7 compatible
# ============================================
# 1. Make a backup: /system backup save name=before-denop
# 2. Paste this whole script
# 3. AFTER it finishes, add your ports manually:
#    /interface bridge port add bridge=${bridgeName} interface=ether2
#    /interface bridge port add bridge=${bridgeName} interface=wifi1
# 4. Upload login.html to Files > hotspot
# ============================================

:log info "=== Starting Denop Hostel Wifi configuration ==="

/system identity set name="${identity}"

:do {
  /interface bridge add name=${bridgeName} comment="Denop Hotspot Bridge"
} on-error={
  :log warning "Bridge ${bridgeName} already exists"
}

/ip address
:do { remove [find where address~"172.16.0." and comment~"Denop"] } on-error={}
add address=${hotspotIp}/16 interface=${bridgeName} network=172.16.0.0 comment="Denop Hotspot Gateway"

/ip pool
:do { remove [find name=hs-pool-denop] } on-error={}
add name=hs-pool-denop ranges=${poolRange}

/ip dhcp-server
:do { remove [find name=dhcp-denop] } on-error={}
add name=dhcp-denop interface=${bridgeName} address-pool=hs-pool-denop lease-time=1h disabled=no

/ip dhcp-server network
:do { remove [find where address="${network}" and comment~"Denop"] } on-error={}
add address=${network} gateway=${hotspotIp} dns-server=${hotspotIp} comment="Denop Hotspot DHCP"

/ip dns set allow-remote-requests=yes
:do { /ip dns set servers=8.8.8.8,1.1.1.1 } on-error={}

/ip firewall nat
:do { remove [find where comment~"Denop"] } on-error={}
add chain=srcnat action=masquerade src-address=${network} out-interface=${wanInterface} comment="Denop Hotspot NAT"

/ip hotspot profile
:do { remove [find name=hsprof-denop] } on-error={}
add name=hsprof-denop \\
    hotspot-address=${hotspotIp} \\
    dns-name="${dnsName || ""}" \\
    html-directory=hotspot \\
    login-by=http-chap,http-pap,cookie,mac-cookie \\
    http-cookie-lifetime=1d \\
    split-user-domain=no \\
    use-radius=no

/ip hotspot
:do { remove [find name=hotspot-denop] } on-error={}
add name=hotspot-denop \\
    interface=${bridgeName} \\
    address-pool=hs-pool-denop \\
    profile=hsprof-denop \\
    idle-timeout=15m \\
    keepalive-timeout=2m \\
    addresses-per-mac=2 \\
    disabled=no

${profileScripts}

/ip hotspot user profile
:do {
  add name="trial-10min" session-timeout=10m idle-timeout=5m rate-limit="1M/2M" shared-users=1 add-mac-cookie=yes
} on-error={}

/ip hotspot walled-garden
:do { remove [find where comment~"Denop"] } on-error={}
add dst-host="${portalDomain}" action=allow comment="Denop Payment Portal"
add dst-host="*.${portalDomain}" action=allow comment="Denop Payment Portal wildcard"
add dst-host="captive.apple.com" action=allow comment="Apple CNA"
add dst-host="*.apple.com" action=allow comment="Apple services"
add dst-host="www.msftconnecttest.com" action=allow comment="Windows captive"
add dst-host="connectivitycheck.gstatic.com" action=allow comment="Android captive"
add dst-host="clients3.google.com" action=allow comment="Android captive"

/ip hotspot walled-garden ip
:do { remove [find where comment~"Denop"] } on-error={}
add action=accept dst-address=${hotspotIp} comment="Denop gateway"
add action=accept dst-address=8.8.8.8 comment="Google DNS"
add action=accept dst-address=1.1.1.1 comment="Cloudflare DNS"
add action=accept dst-address=17.0.0.0/8 comment="Apple CNA range"

/ip firewall filter
:do { remove [find where comment~"Denop"] } on-error={}
add chain=forward action=accept connection-state=established,related comment="Denop established"
add chain=forward action=drop connection-state=invalid comment="Denop drop invalid"
add chain=input action=accept protocol=udp dst-port=53 src-address=${network} comment="Denop DNS"
add chain=input action=accept protocol=tcp dst-port=53 src-address=${network} comment="Denop DNS TCP"
add chain=input action=accept protocol=tcp dst-port=80,443 src-address=${network} comment="Denop hotspot web"
add chain=forward action=drop src-address=${network} dst-address=${network} comment="Denop client isolation"
add chain=input action=drop src-address=${network} comment="Denop drop other input from guests"

/system ntp client
set enabled=yes
:do { /system ntp client servers add address=pool.ntp.org } on-error={}
:do { /system ntp client servers add address=time.google.com } on-error={}

:log info "=== Denop Hostel Wifi configuration completed ==="
:put ""
:put "============================================"
:put "Denop Hostel Wifi setup finished!"
:put "Hotspot gateway : ${hotspotIp}"
:put "Bridge          : ${bridgeName}"
:put ""
:put "NEXT MANUAL STEPS:"
:put "1. Add ports to the bridge, example:"
:put "   /interface bridge port add bridge=${bridgeName} interface=ether2"
:put "   /interface bridge port add bridge=${bridgeName} interface=wifi1"
:put "2. Upload login.html into Files > hotspot"
:put "============================================"
`;
}

function minutesToRos(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
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