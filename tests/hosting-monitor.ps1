$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$project = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$monitor = Join-Path $project 'tools\hosting\monitor.ps1'
if (-not (Test-Path -LiteralPath $monitor)) { throw 'Missing production monitor.' }
$scratch = Join-Path $project ('output\hosting-tests\monitor-' + [guid]::NewGuid().ToString('N'))
$state = Join-Path $scratch 'run'
New-Item -ItemType Directory -Path $state -Force | Out-Null
$fixtureRoot = Join-Path $scratch 'site'
Copy-Item -LiteralPath (Join-Path $project 'public') -Destination $fixtureRoot -Recurse
$config = Join-Path $scratch 'config.json'
$node = (Get-Command node.exe).Source
$powershell = Join-Path $PSHOME 'powershell.exe'
$settings = @{ nodeExe=$node; serverScript=(Join-Path $project 'tools\hosting\server.mjs'); root=$fixtureRoot; stateDir=$state; port=19181; siteUrl='https://autokey.desktoppetstudio.com/'; checkPublic=$false }
$settings | ConvertTo-Json | Set-Content -LiteralPath $config -Encoding UTF8
function Assert($Condition, $Message) { if (-not $Condition) { throw $Message }; Write-Output "PASS: $Message" }
function Run-Monitor([string[]]$Extra = @()) {
    $arguments = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Config "{1}" -RetryDelaySeconds 0 {2}' -f $monitor,$config,($Extra -join ' ')
    $invocation = Start-Process -FilePath $powershell -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $scratch 'invocation.stdout.log') -RedirectStandardError (Join-Path $scratch 'invocation.stderr.log')
    # Wait for the monitor itself; native output capture can wait for inherited
    # descendant handles even after the monitor has successfully exited.
    $null = $invocation.Handle
    if (-not $invocation.WaitForExit(45000)) { Stop-Process -Id $invocation.Id -Force; throw 'Monitor exceeded its test deadline.' }
    return $invocation.ExitCode
}
$foreign = $null
try {
    Assert ((@(Run-Monitor @('-CheckOnly')))[-1] -eq 1) 'CheckOnly detects a missing origin without starting it'
    Assert ((@(Run-Monitor))[-1] -eq 0) 'Monitor starts an absent origin'
    $first = Get-Content (Join-Path $state 'status.json') -Raw | ConvertFrom-Json
    Assert ($first.localHealthy -and $first.restarted) 'Startup records healthy recovery'
    Assert ((@(Run-Monitor))[-1] -eq 0) 'Second check succeeds'
    $second = Get-Content (Join-Path $state 'status.json') -Raw | ConvertFrom-Json
    Assert ($second.pid -eq $first.pid -and -not $second.restarted) 'Healthy origin is preserved without duplicate process'
    Stop-Process -Id $first.pid -Force
    Assert ((@(Run-Monitor))[-1] -eq 0) 'Monitor recovers after the origin is killed'
    $recovered = Get-Content (Join-Path $state 'status.json') -Raw | ConvertFrom-Json
    Assert ($recovered.localHealthy -and $recovered.restarted -and $recovered.pid -ne $first.pid) 'Recovery uses a new healthy PID'
    $lock = [IO.File]::Open((Join-Path $state 'monitor.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    try { Assert ((@(Run-Monitor))[-1] -eq 0) 'Overlapping monitor is skipped' } finally { $lock.Dispose() }
    Assert ((@(Run-Monitor @('-Stop')))[-1] -eq 0) 'Owned origin can be stopped'
    $recordPath = Join-Path $state 'process.json'
    $damagedRecords = @(
        @{ name='zero-filled'; content=([string][char]0) * 76 },
        @{ name='empty'; content='' },
        @{ name='truncated'; content='{"pid":' },
        @{ name='missing timestamp'; content='{"pid":123}' },
        @{ name='invalid timestamp'; content='{"pid":123,"createdAtUtc":"invalid"}' }
    )
    foreach ($damaged in $damagedRecords) {
        [IO.File]::WriteAllText($recordPath, $damaged.content)
        $damagedHash = (Get-FileHash -LiteralPath $recordPath).Hash
        Assert ((@(Run-Monitor))[-1] -eq 0) "Monitor recovers from a $($damaged.name) process record"
        $repaired = Get-Content (Join-Path $state 'status.json') -Raw | ConvertFrom-Json
        $health = Invoke-RestMethod -Uri 'http://127.0.0.1:19181/healthz' -TimeoutSec 2
        Assert ($repaired.localHealthy -and $repaired.restarted -and $health.ok -and $health.pid -eq $repaired.pid) 'Recovered origin serves healthy HTTP'
        $saved = @(Get-ChildItem -LiteralPath $state -Filter 'process.json.invalid-*' | Where-Object { (Get-FileHash -LiteralPath $_.FullName).Hash -eq $damagedHash })
        Assert ($saved.Count -gt 0) 'Damaged process record is preserved for diagnosis'
        Assert ((@(Run-Monitor @('-Stop')))[-1] -eq 0) 'Recovered origin can be stopped safely'
    }
    $foreignScript = Join-Path $scratch 'foreign.mjs'
    [IO.File]::WriteAllText($foreignScript, "import http from 'node:http'; http.createServer((q,s)=>{s.setHeader('Content-Type','text/plain');s.end('unrelated');}).listen(19181, '127.0.0.1');")
    $foreign = Start-Process -FilePath $node -ArgumentList ('"{0}"' -f $foreignScript) -WindowStyle Hidden -PassThru
    for ($attempt=0; $attempt -lt 30; $attempt++) {
        try { if ((Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:19181' -TimeoutSec 1).Content -eq 'unrelated') { break } } catch { }
        Start-Sleep -Milliseconds 100
    }
    @{pid=$foreign.Id; createdAtUtc=$foreign.StartTime.ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $state 'process.json') -Encoding UTF8
    $failure = @(Run-Monitor)
    Assert ($failure[-1] -eq 1) 'Foreign listener causes a clear failure'
    Assert (-not $foreign.HasExited) 'A stale PID never kills a different Node application'
    Assert ((Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:19181' -TimeoutSec 2).Content -eq 'unrelated') 'Foreign service remains reachable'
    @{pid=$foreign.Id; createdAtUtc='invalid'} | ConvertTo-Json | Set-Content -LiteralPath $recordPath -Encoding UTF8
    Assert ((@(Run-Monitor))[-1] -eq 1) 'Corrupt state with an occupied port still fails safely'
    Assert (-not $foreign.HasExited -and (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:19181' -TimeoutSec 2).Content -eq 'unrelated') 'Corrupt state never authorizes stopping another service'
} finally {
    if ($foreign -and -not $foreign.HasExited) { Stop-Process -Id $foreign.Id -Force }
    Run-Monitor @('-Stop') | Out-Null
    $resolved = (Resolve-Path -LiteralPath $scratch).Path
    if (-not $resolved.StartsWith((Join-Path $project 'output\hosting-tests\monitor-'), [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe cleanup path' }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
