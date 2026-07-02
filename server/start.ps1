$env:KATAGO_PATH = Join-Path $PSScriptRoot "katago.exe"
$env:KATAGO_CONFIG = Join-Path $PSScriptRoot "default_gtp.cfg"
$env:KATAGO_MODEL = Join-Path $PSScriptRoot "kata1-b28c512nbt-s12163512064-d5648012427.bin.gz"
npx tsx src/index.ts