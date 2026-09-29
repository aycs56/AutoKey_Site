[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$NodeExe,
    [Parameter(Mandatory=$true)][string]$GatewayRoot,
    [switch]$DryRun
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$installRoot = Join-Path $env:ProgramData 'AutoKeySite'
$taskName = 'AutoKey Site Monitor'
$siteUrl = 'https://autokey.desktoppetstudio.com/'
$caddyExe = Join-Path $GatewayRoot 'caddy\caddy.exe'
$caddyFile = Join-Path $GatewayRoot 'caddy\Caddyfile'
$nodeSource = (Resolve-Path -LiteralPath $NodeExe).Path
$buildRecord = Get-Content -LiteralPath (Join-Path $projectRoot 'output\hosting-build.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$dist = (Resolve-Path -LiteralPath $buildRecord.root).Path
if (-not $dist.StartsWith((Join-Path $projectRoot 'output\hosting-builds\release-'), [StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected deployment snapshot path.' }
$powershellExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$utf8 = New-Object Text.UTF8Encoding($false)
$markerPath = Join-Path $installRoot 'installation.json'
foreach ($file in @($caddyExe,$caddyFile,(Join-Path $dist 'index.html'),(Join-Path $dist 'locales.js'),(Join-Path $dist 'assets\autokey.svg'))) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Required file is missing: $file" }
}
$links = @(Get-Item -LiteralPath $dist -Force; Get-ChildItem -LiteralPath $dist -Recurse -Force) | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }
if (@($links).Count) { throw 'Published content must not contain junctions or symlinks.' }
if (Test-Path -LiteralPath $installRoot) {
    if ((Get-Item -LiteralPath $installRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Installation root must not be a junction or symlink.' }
    if (-not (Test-Path -LiteralPath $markerPath)) { throw 'Existing directory is not a recognized website installation.' }
    $marker = Get-Content -LiteralPath $markerPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($marker.service -ne 'autokey-site') { throw 'Installation marker does not match.' }
    $links = @(Get-ChildItem -LiteralPath $installRoot -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint })
    if ($links.Count) { throw 'Installation contains a reparse point; inspect it before updating.' }
}
$route = @'
# BEGIN AUTOKEY SITE
autokey.desktoppetstudio.com {
    reverse_proxy 127.0.0.1:18181
}
# END AUTOKEY SITE
'@
$originalConfig = [IO.File]::ReadAllText($caddyFile)
$routePattern = '(?ms)^# BEGIN AUTOKEY SITE\r?\n.*?^# END AUTOKEY SITE\r?\n?'
$withoutRoute = [regex]::Replace($originalConfig, $routePattern, '')
if ($withoutRoute -match '(?i)autokey\.desktoppetstudio\.com') { throw 'An unmanaged route already uses this hostname; reconcile it first.' }
$candidateConfig = $withoutRoute.TrimEnd() + "`r`n`r`n" + $route + "`r`n"
$gatewayTaskNames = @('AI Taiwan Stock Predictor Services','AI Taiwan Stock Predictor Health Monitor')
if ($DryRun) {
    [ordered]@{ dryRun=$true; installRoot=$installRoot; staticSource=$dist; nodeSource=$nodeSource; taskName=$taskName; principal='LOCAL SERVICE (S-1-5-19)'; triggers=@('AtStartup + 30 seconds','PT1H indefinitely'); origin='127.0.0.1:18181'; siteUrl=$siteUrl; caddyFile=$caddyFile; appendedRoute=$route; checksExistingGatewayTasks=$gatewayTaskNames; gatewayRestart=$false; firewallChanges=$false } | ConvertTo-Json -Depth 4
    return
}
if (-not (([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))) { throw 'Administrator rights are required to install the boot task and protected runtime. Use -DryRun to inspect first.' }

function Write-Json($Destination, $Value) { [IO.File]::WriteAllText($Destination, ($Value | ConvertTo-Json -Depth 8), $utf8) }
function Protect-Root {
    $acl = New-Object Security.AccessControl.DirectorySecurity
    $acl.SetAccessRuleProtection($true,$false)
    $acl.SetOwner((New-Object Security.Principal.SecurityIdentifier('S-1-5-32-544')))
    foreach ($entry in @(@('S-1-5-18','FullControl'),@('S-1-5-32-544','FullControl'),@('S-1-5-32-545','ReadAndExecute'),@('S-1-5-19','ReadAndExecute'))) {
        $sid = New-Object Security.Principal.SecurityIdentifier($entry[0])
        $rule = New-Object Security.AccessControl.FileSystemAccessRule($sid,$entry[1],'ContainerInherit,ObjectInherit','None','Allow')
        $acl.AddAccessRule($rule)
    }
    Set-Acl -LiteralPath $installRoot -AclObject $acl
}
New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
Protect-Root
if (-not (Test-Path -LiteralPath $markerPath)) { Write-Json $markerPath @{ service='autokey-site'; siteUrl=$siteUrl; source=$projectRoot; state='preparing' } }
$resultPath = Join-Path $installRoot 'install-result.json'
try {
    $gatewayTasks = @()
    foreach ($name in $gatewayTaskNames) {
        $existing = Get-ScheduledTask -TaskName $name -ErrorAction Stop
        if ($existing.State -eq 'Disabled') { throw "Shared gateway task is disabled: $name" }
        $gatewayTasks += @{ name=$name; state=[string]$existing.State; principal=$existing.Principal.UserId; triggers=@($existing.Triggers | ForEach-Object { $_.CimClass.CimClassName }) }
    }
    $gatewayBoot = Get-ScheduledTask -TaskName $gatewayTaskNames[0]
    if (-not @($gatewayBoot.Triggers | Where-Object { $_.CimClass.CimClassName -eq 'MSFT_TaskBootTrigger' }).Count) { throw 'The shared gateway has no boot trigger; its owner must restore its startup configuration.' }
    $gatewayMonitor = Get-ScheduledTask -TaskName $gatewayTaskNames[1]
    $gatewayIntervals = @($gatewayMonitor.Triggers | Where-Object { $_.Repetition.Interval } | ForEach-Object { [Xml.XmlConvert]::ToTimeSpan($_.Repetition.Interval).TotalMinutes })
    if (-not @($gatewayIntervals | Where-Object { $_ -gt 0 -and $_ -le 60 }).Count) { throw 'The shared gateway must check health at least once per hour.' }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    Write-Json $markerPath @{ service='autokey-site'; siteUrl=$siteUrl; source=$projectRoot; installedAtUtc=[DateTime]::UtcNow.ToString('o') }
    foreach ($directory in @('bin','app','run','backups','releases')) { New-Item -ItemType Directory -Path (Join-Path $installRoot $directory) -Force | Out-Null }
    $runDir = Join-Path $installRoot 'run'
    $runAcl = Get-Acl -LiteralPath $runDir
    $runAcl.AddAccessRule((New-Object Security.AccessControl.FileSystemAccessRule((New-Object Security.Principal.SecurityIdentifier('S-1-5-19')),'Modify','ContainerInherit,ObjectInherit','None','Allow')))
    Set-Acl -LiteralPath $runDir -AclObject $runAcl
    $configPath = Join-Path $installRoot 'config.json'
    $installedMonitor = Join-Path $installRoot 'app\monitor.ps1'
    $oldTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($oldTask) { Disable-ScheduledTask -TaskName $taskName | Out-Null; Stop-ScheduledTask -TaskName $taskName }
    if ((Test-Path -LiteralPath $configPath) -and (Test-Path -LiteralPath $installedMonitor)) {
        Copy-Item -LiteralPath $configPath -Destination (Join-Path $installRoot "backups\config-$stamp.json")
        & $powershellExe -NoProfile -ExecutionPolicy Bypass -File $installedMonitor -Config $configPath -Stop
        if ($LASTEXITCODE -ne 0) { throw 'Unable to stop the previously installed origin safely.' }
    }
    $releaseDir = Join-Path $installRoot "releases\$stamp"
    New-Item -ItemType Directory -Path $releaseDir | Out-Null
    Get-ChildItem -LiteralPath $dist -Force | Copy-Item -Destination $releaseDir -Recurse -Force
    $installedNode = Join-Path $installRoot 'bin\node.exe'
    Copy-Item -LiteralPath $nodeSource -Destination $installedNode -Force
    foreach ($file in @('server.mjs','monitor.ps1')) { Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $installRoot "app\$file") -Force }
    Write-Json $configPath @{ nodeExe=$installedNode; serverScript=(Join-Path $installRoot 'app\server.mjs'); root=$releaseDir; stateDir=$runDir; port=18181; siteUrl=$siteUrl; checkPublic=$true }
    $arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}" -Config "{1}"' -f $installedMonitor,$configPath
    $action = New-ScheduledTaskAction -Execute $powershellExe -Argument $arguments -WorkingDirectory $installRoot
    $boot = New-ScheduledTaskTrigger -AtStartup
    $boot.Delay = 'PT30S'
    $hourly = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Hours 1)
    $principal = New-ScheduledTaskPrincipal -UserId 'S-1-5-19' -LogonType ServiceAccount -RunLevel Limited
    $taskSettings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($boot,$hourly) -Principal $principal -Settings $taskSettings -Description 'Runs the AutoKey static website at boot and checks/restarts its own origin every hour.' -Force | Out-Null
    $installedTask = Get-ScheduledTask -TaskName $taskName
    [xml]$taskXml = Export-ScheduledTask -TaskName $taskName
    if ($installedTask.Principal.UserId -notin @('S-1-5-19','LOCAL SERVICE','NT AUTHORITY\LOCAL SERVICE') -or $taskXml.Task.Triggers.TimeTrigger.Repetition.Interval -ne 'PT1H' -or -not $taskXml.Task.Triggers.BootTrigger) { throw 'Task readback did not match boot/hourly/LocalService requirements.' }
    [IO.File]::WriteAllText((Join-Path $installRoot 'installed-task.xml'), $taskXml.OuterXml, [Text.Encoding]::Unicode)
    Start-ScheduledTask -TaskName $taskName
    $localHealthy = $false
    for ($attempt=0; $attempt -lt 45; $attempt++) {
        Start-Sleep -Seconds 1
        try { $health = Invoke-RestMethod -Uri 'http://127.0.0.1:18181/healthz' -TimeoutSec 2; if ($health.ok -and $health.service -eq 'autokey-site') { $localHealthy=$true; break } } catch { }
    }
    if (-not $localHealthy) { throw 'Installed origin failed its health check. Inspect run/monitor.log and task history.' }
    $candidatePath = Join-Path $installRoot 'backups\Caddyfile.candidate'
    [IO.File]::WriteAllText($candidatePath,$candidateConfig,$utf8)
    $env:XDG_CONFIG_HOME = Join-Path $GatewayRoot 'caddy\runtime\xdg-config'
    $env:XDG_DATA_HOME = Join-Path $GatewayRoot 'caddy\runtime\xdg-data'
    & $caddyExe validate --config $candidatePath --adapter caddyfile
    if ($LASTEXITCODE -ne 0) { throw 'Caddy rejected the candidate; live configuration was not changed.' }
    if ([IO.File]::ReadAllText($caddyFile) -cne $originalConfig) { throw 'Shared configuration changed during installation; inspect and retry without overwriting it.' }
    $backupPath = Join-Path $installRoot "backups\Caddyfile-$stamp"
    Copy-Item -LiteralPath $caddyFile -Destination $backupPath
    try {
        [IO.File]::WriteAllText($caddyFile,$candidateConfig,$utf8)
        & $caddyExe reload --config $caddyFile --adapter caddyfile --address 127.0.0.1:2019
        if ($LASTEXITCODE -ne 0) { throw 'Gateway reload failed.' }
    } catch {
        Copy-Item -LiteralPath $backupPath -Destination $caddyFile -Force
        & $caddyExe reload --config $caddyFile --adapter caddyfile --address 127.0.0.1:2019
        throw
    }
    $result = @{ ok=$true; installedAtUtc=[DateTime]::UtcNow.ToString('o'); task=$taskName; principal=$installedTask.Principal.UserId; interval='PT1H'; boot=$true; localHealthy=$true; pid=$health.pid; siteUrl=$siteUrl; caddyBackup=$backupPath; existingGatewayTasks=$gatewayTasks; publicHttpsVerification='Required after certificate issuance' }
    Write-Json $resultPath $result
    $result | ConvertTo-Json -Depth 6
} catch {
    Write-Json $resultPath @{ ok=$false; error=$_.Exception.Message; checkedAtUtc=[DateTime]::UtcNow.ToString('o') }
    Write-Error $_.Exception.Message
    exit 1
}
