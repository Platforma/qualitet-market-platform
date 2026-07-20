Write-Host "Wymuszam domenę qualitet-market.com w całym projekcie..."

$target = "qualitet-market.com"
$pattern = "([a-z0-9-]+\.)*qualitet-market\.com"

Get-ChildItem -Recurse -File | ForEach-Object {
    $content = Get-Content -LiteralPath $_.FullName
    $content = $content -replace $pattern, $target
    Set-Content -LiteralPath $_.FullName -Value $content
}

Write-Host "Gotowe! Domena została ujednolicona do qualitet-market.com."
