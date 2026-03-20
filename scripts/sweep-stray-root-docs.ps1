# 將根目錄誤置的 *.md 移到 docs/swept-from-root/（保留 README 與四份主文件）
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "package.json"))) {
    Write-Error "請在專案根目錄執行：scripts 資料夾應位於專案內。"
}
Set-Location $root
$keep = @(
    "README.md",
    "LEARNING-PORTFOLIO.md",
    "CAPABILITY-PERFORMANCE-REPORT.md",
    "SYSTEM-ARCHITECTURE-DIAGRAMS.md"
)
$dest = Join-Path $root "docs\swept-from-root"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Get-ChildItem -Path $root -Filter "*.md" -File | ForEach-Object {
    if ($keep -contains $_.Name) { return }
    Write-Host "Moving $($_.Name) -> docs\swept-from-root\"
    Move-Item -LiteralPath $_.FullName -Destination $dest -Force
}
Write-Host "Done. 請檢查 docs\swept-from-root 並更新內部連結。"
