Add-Type -AssemblyName System.Drawing

$Root = Get-Location
$InputDir = Join-Path $Root "image_to_video_batch\input"
$ContactDir = Join-Path $Root "image_to_video_batch\contact_sheets"
New-Item -ItemType Directory -Force -Path $ContactDir | Out-Null

$Images = Get-ChildItem -LiteralPath $InputDir -File |
  Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp)$' } |
  Sort-Object Name

$Columns = 4
$Rows = 4
$CellW = 320
$CellH = 420
$LabelH = 42
$Margin = 18
$SheetW = ($Columns * $CellW) + (($Columns + 1) * $Margin)
$SheetH = ($Rows * ($CellH + $LabelH)) + (($Rows + 1) * $Margin)

for ($Start = 0; $Start -lt $Images.Count; $Start += ($Columns * $Rows)) {
  $Chunk = $Images[$Start..([Math]::Min($Start + ($Columns * $Rows) - 1, $Images.Count - 1))]
  $Bitmap = New-Object System.Drawing.Bitmap $SheetW, $SheetH
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $Graphics.Clear([System.Drawing.Color]::FromArgb(18, 18, 18))
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $Font = New-Object System.Drawing.Font "Arial", 22, ([System.Drawing.FontStyle]::Bold)
  $Brush = [System.Drawing.Brushes]::White

  for ($i = 0; $i -lt $Chunk.Count; $i++) {
    $ImageFile = $Chunk[$i]
    $Col = $i % $Columns
    $Row = [Math]::Floor($i / $Columns)
    $X = $Margin + ($Col * ($CellW + $Margin))
    $Y = $Margin + ($Row * ($CellH + $LabelH + $Margin))
    $Label = [System.IO.Path]::GetFileNameWithoutExtension($ImageFile.Name)

    $Graphics.DrawString($Label, $Font, $Brush, $X, $Y)
    $Img = [System.Drawing.Image]::FromFile($ImageFile.FullName)
    $Scale = [Math]::Min($CellW / $Img.Width, $CellH / $Img.Height)
    $DrawW = [int]($Img.Width * $Scale)
    $DrawH = [int]($Img.Height * $Scale)
    $DrawX = $X + [int](($CellW - $DrawW) / 2)
    $DrawY = $Y + $LabelH + [int](($CellH - $DrawH) / 2)
    $Graphics.DrawImage($Img, $DrawX, $DrawY, $DrawW, $DrawH)
    $Img.Dispose()
  }

  $SheetNum = "{0:D2}" -f (($Start / ($Columns * $Rows)) + 1)
  $First = [System.IO.Path]::GetFileNameWithoutExtension($Chunk[0].Name)
  $Last = [System.IO.Path]::GetFileNameWithoutExtension($Chunk[$Chunk.Count - 1].Name)
  $Out = Join-Path $ContactDir "sheet_$SheetNum`_$First-$Last.jpg"
  $Bitmap.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $Graphics.Dispose()
  $Bitmap.Dispose()
}

Write-Host "Created contact sheets in $ContactDir"
