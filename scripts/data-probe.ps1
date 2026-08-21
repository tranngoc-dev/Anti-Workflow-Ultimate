[CmdletBinding()]
param()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pyScript = Join-Path $scriptDir "data-probe.py"
python $pyScript
exit $LASTEXITCODE
