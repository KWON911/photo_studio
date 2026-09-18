param(
  [string]$Source = (Join-Path $PSScriptRoot '..\icon.png'),
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public\icons')
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$outputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($outputPath) | Out-Null
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
$background = [System.Drawing.ColorTranslator]::FromHtml('#f5f3ef')

function Export-PwaIcon {
  param(
    [string]$FileName,
    [int]$Size,
    [double]$ContentScale = 1.0
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear($background)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $available = $Size * $ContentScale
  $scale = [Math]::Min($available / $sourceImage.Width, $available / $sourceImage.Height)
  $width = [Math]::Round($sourceImage.Width * $scale)
  $height = [Math]::Round($sourceImage.Height * $scale)
  $left = [Math]::Round(($Size - $width) / 2)
  $top = [Math]::Round(($Size - $height) / 2)
  $graphics.DrawImage($sourceImage, $left, $top, $width, $height)

  $target = Join-Path $outputPath $FileName
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

try {
  Export-PwaIcon 'icon-192.png' 192
  Export-PwaIcon 'icon-512.png' 512
  Export-PwaIcon 'icon-maskable-512.png' 512 0.76
  Export-PwaIcon 'apple-touch-icon.png' 180
  Export-PwaIcon 'favicon-32.png' 32
} finally {
  $sourceImage.Dispose()
}
