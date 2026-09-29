[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Config,
    [ValidateRange(0,30)][int]$RetryDelaySeconds = 3,
    [switch]$Stop,
    [switch]$CheckOnly
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$configPath = (Resolve-Path -LiteralPath $Config).Path
$settings = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($settings.port -lt 1024 -or $settings.port -gt 65535) { throw 'Invalid origin port.' }
$nodePath = (Resolve-Path -LiteralPath $settings.nodeExe).Path
$serverPath = (Resolve-Path -LiteralPath $settings.serverScript).Path
New-Item -ItemType Directory -Path $settings.stateDir -Force | Out-Null
$statePath = Join-Path $settings.stateDir 'process.json'
$statusPath = Join-Path $settings.stateDir 'status.json'
$logPath = Join-Path $settings.stateDir 'monitor.log'
$healthUrl = "http://127.0.0.1:$($settings.port)/healthz"
function Write-JsonFile($Destination, $Value) {
    $temporary = $Destination + '.tmp'
    [IO.File]::WriteAllText($temporary, ($Value | ConvertTo-Json -Depth 6), (New-Object Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $temporary -Destination $Destination -Force
}
function Write-Log([string]$Message) {
    if ((Test-Path -LiteralPath $logPath) -and (Get-Item -LiteralPath $logPath).Length -gt 1MB) {
        Move-Item -LiteralPath $logPath -Destination ($logPath + '.old') -Force
    }
    Add-Content -LiteralPath $logPath -Value ("{0} {1}" -f [DateTime]::UtcNow.ToString('o'), $Message) -Encoding UTF8
}
function Read-Health {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 3
        $payload = $response.Content | ConvertFrom-Json
        if ($response.StatusCode -eq 200 -and $payload.ok -eq $true -and $payload.service -eq 'autokey-site' -and $payload.siteUrl -eq $settings.siteUrl) { return $payload }
    } catch { }
    return $null
}
function Get-OwnedProcess([int]$OwnedProcessId) {
    if ($OwnedProcessId -le 0) { return $null }
    $candidate = Get-CimInstance Win32_Process -Filter "ProcessId = $OwnedProcessId" -ErrorAction SilentlyContinue
    if (-not $candidate -or -not $candidate.ExecutablePath -or -not $candidate.CommandLine) { return $null }
    if ($candidate.ExecutablePath -ine $nodePath) { return $null }
    if ($candidate.CommandLine.IndexOf(('"' + $serverPath + '"'), [StringComparison]::OrdinalIgnoreCase) -lt 0 -or
        $candidate.CommandLine.IndexOf(('"' + $configPath + '"'), [StringComparison]::OrdinalIgnoreCase) -lt 0) { return $null }
    return $candidate
}
function Stop-OwnedProcess {
    if (-not (Test-Path -LiteralPath $statePath)) { return }
    $record = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
    $candidate = Get-OwnedProcess ([int]$record.pid)
    if ($candidate -and ([DateTimeOffset]::Parse($record.createdAtUtc).UtcDateTime -ne $candidate.CreationDate.ToUniversalTime())) {
        $candidate = $null
    }
    if ($candidate) {
        Stop-Process -Id $candidate.ProcessId -Force
        Write-Log "Stopped owned origin PID $($candidate.ProcessId)."
        Start-Sleep -Milliseconds 350
    } else { Write-Log 'Stored PID is absent or no longer owned; no process was stopped.' }
    Remove-Item -LiteralPath $statePath -Force
}
try { $lock = [IO.File]::Open((Join-Path $settings.stateDir 'monitor.lock'), 'OpenOrCreate', 'ReadWrite', 'None') }
catch [IO.IOException] { Write-Output 'Another origin check is already active.'; exit 0 }
try {
    if ($Stop) { Stop-OwnedProcess; Write-Output 'Origin stopped if owned.'; exit 0 }
    $health = $null
    $samples = 3
    if ($CheckOnly) { $samples = 1 }
    for ($sample = 1; $sample -le $samples; $sample++) {
        $health = Read-Health
        if ($health -and (Get-OwnedProcess ([int]$health.pid))) { break }
        $health = $null
        if ($sample -lt $samples -and $RetryDelaySeconds -gt 0) { Start-Sleep -Seconds $RetryDelaySeconds }
    }
    $restarted = $false
    if (-not $health -and -not $CheckOnly) {
        Stop-OwnedProcess
        $listener = @(Get-NetTCPConnection -LocalPort $settings.port -State Listen -ErrorAction SilentlyContinue)
        if ($listener.Count -gt 0) { throw "Port $($settings.port) belongs to a different listener. It was not stopped." }
        for ($attempt = 1; $attempt -le 3; $attempt++) {
            foreach ($filename in @('origin.stdout.log', 'origin.stderr.log')) {
                $file = Join-Path $settings.stateDir $filename
                if (Test-Path -LiteralPath $file) { Move-Item -LiteralPath $file -Destination ($file + '.old') -Force }
            }
            $arguments = '"{0}" --config "{1}"' -f $serverPath, $configPath
            $process = Start-Process -FilePath $nodePath -ArgumentList $arguments -WorkingDirectory (Split-Path -Parent $serverPath) -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $settings.stateDir 'origin.stdout.log') -RedirectStandardError (Join-Path $settings.stateDir 'origin.stderr.log')
            $created = (Get-CimInstance Win32_Process -Filter "ProcessId = $($process.Id)").CreationDate.ToUniversalTime().ToString('o')
            Write-JsonFile $statePath @{ pid=$process.Id; createdAtUtc=$created }
            Write-Log "Started origin PID $($process.Id), attempt $attempt."
            for ($wait = 0; $wait -lt 20; $wait++) {
                Start-Sleep -Milliseconds 300
                $health = Read-Health
                if ($health -and $health.pid -eq $process.Id) { break }
            }
            if ($health -and $health.pid -eq $process.Id) { $restarted = $true; break }
            $health = $null
            Stop-OwnedProcess
        }
    }
    $publicHealthy = $null
    if ($health -and $settings.checkPublic) {
        try {
            $publicResponse = Invoke-RestMethod -Uri ($settings.siteUrl.TrimEnd('/') + '/healthz') -TimeoutSec 10
            $publicHealthy = $publicResponse.ok -eq $true -and $publicResponse.service -eq 'autokey-site' -and $publicResponse.siteUrl -eq $settings.siteUrl
        } catch { $publicHealthy = $false }
        if (-not $publicHealthy) { Write-Log 'Origin is healthy; public HTTPS check failed. Check DNS, router, or shared Caddy; a healthy origin is preserved.' }
    }
    $result = @{ checkedAtUtc=[DateTime]::UtcNow.ToString('o'); localHealthy=[bool]$health; publicHealthy=$publicHealthy; restarted=$restarted; pid=0; intervalMinutes=60 }
    if ($health) { $result.pid = [int]$health.pid }
    Write-JsonFile $statusPath $result
    Write-Log "Health: local=$([bool]$health); public=$publicHealthy; restarted=$restarted."
    $result | ConvertTo-Json -Compress
    if (-not $health) { exit 1 }
    if ($publicHealthy -eq $false) { exit 2 }
} catch {
    Write-Log $_.Exception.Message
    Write-JsonFile $statusPath @{ checkedAtUtc=[DateTime]::UtcNow.ToString('o'); localHealthy=$false; error=$_.Exception.Message }
    Write-Error $_.Exception.Message
    exit 1
} finally { $lock.Dispose() }
