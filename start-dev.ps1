$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
# Force IPv4 DNS + increase header size limit; helps with Google API on Node.js 24
$env:NODE_OPTIONS = "--dns-result-order=ipv4first --max-http-header-size=32768"
Set-Location "C:\Users\nates\jarvis"
& "C:\Program Files\nodejs\npm.cmd" run dev 2>&1 | ForEach-Object {
    $_ | Out-File -FilePath "C:\Users\nates\jarvis\dev.log" -Encoding utf8 -Append
}
