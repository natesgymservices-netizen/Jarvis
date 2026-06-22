$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location "C:\Users\nates\jarvis"
& "C:\Program Files\nodejs\npm.cmd" run dev 2>&1 | ForEach-Object {
    $_ | Out-File -FilePath "C:\Users\nates\jarvis\dev.log" -Encoding utf8 -Append
}
