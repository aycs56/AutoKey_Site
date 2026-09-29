[CmdletBinding()]
param([switch]$ExerciseRecovery)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$installRoot = Join-Path $env:ProgramData 'AutoKeySite'
$taskName = 'AutoKey Site Monitor'
$healthUrl = 'http://127.0.0.1:18181/healthz'
function Wait-Healthy {
    for ($attempt=0; $attempt -lt 45; $attempt++) {
        try {
            $value = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
            if ($value.ok -and $value.service -eq 'autokey-site') { return $value }
        } catch { }
        Start-Sleep -Seconds 1
    }
    throw 'Installed origin did not recover within the deadline.'
}
function Wait-Task {
    for ($attempt=0; $attempt -lt 45; $attempt++) {
        if ((Get-ScheduledTask -TaskName $taskName).State -ne 'Running') { return }
        Start-Sleep -Seconds 1
    }
    throw 'Monitor did not complete within the deadline.'
}
$task = Get-ScheduledTask -TaskName $taskName
[xml]$xml = Export-ScheduledTask -TaskName $taskName
if (-not $xml.Task.Triggers.BootTrigger -or $xml.Task.Triggers.TimeTrigger.Repetition.Interval -ne 'PT1H') { throw 'Boot/hourly triggers do not match.' }
if ($task.Principal.UserId -notin @('S-1-5-19','LOCAL SERVICE','NT AUTHORITY\LOCAL SERVICE')) { throw 'Unexpected task account.' }
Wait-Task
$before = Wait-Healthy
$recovered = $null
if ($ExerciseRecovery) {
    $owned = Get-CimInstance Win32_Process -Filter "ProcessId = $($before.pid)"
    $record = Get-Content -LiteralPath (Join-Path $installRoot 'run\process.json') -Raw | ConvertFrom-Json
    if ($owned.ExecutablePath -ine (Join-Path $installRoot 'bin\node.exe') -or
        $owned.CommandLine -notlike '*"C:\ProgramData\AutoKeySite\app\server.mjs" --config "C:\ProgramData\AutoKeySite\config.json"*' -or
        [DateTimeOffset]::Parse($record.createdAtUtc).UtcDateTime -ne $owned.CreationDate.ToUniversalTime()) { throw 'Recovery target is not the installed origin.' }
    Stop-Process -Id $owned.ProcessId -Force
    Start-ScheduledTask -TaskName $taskName
    Start-Sleep -Seconds 1
    $recovered = Wait-Healthy
    Wait-Task
    if ($recovered.pid -eq $before.pid) { throw 'Recovery did not launch a new origin.' }
}
$healthy = Wait-Healthy
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 1
Wait-Task
$after = Wait-Healthy
if ($healthy.pid -ne $after.pid) { throw 'Healthy origin was unnecessarily restarted.' }
$info = Get-ScheduledTaskInfo -TaskName $taskName
$status = Get-Content -LiteralPath (Join-Path $installRoot 'run\status.json') -Raw | ConvertFrom-Json
$result = [ordered]@{
    checkedAtUtc=[DateTime]::UtcNow.ToString('o'); task=$taskName; principal=$task.Principal.UserId
    boot=$true; interval='PT1H'; lastTaskResult=$info.LastTaskResult; nextRun=$info.NextRunTime.ToString('o')
    localHealthy=$after.ok; publicHealthy=$status.publicHealthy; healthyPidPreserved=$true
    recoveryExercised=[bool]$ExerciseRecovery; beforePid=$before.pid; afterPid=$after.pid
}
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installRoot 'verification.json') -Encoding UTF8
$result | ConvertTo-Json
if ($info.LastTaskResult -ne 0 -or -not $status.publicHealthy) { exit 2 }
