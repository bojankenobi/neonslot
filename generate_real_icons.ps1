Add-Type -AssemblyName System.Drawing

function Generate-PwaIcon($size, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Pozadina (duboka crna sa blagim tamno-ljubicastim gradijentom)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(15, 0, 25), [System.Drawing.Color]::FromArgb(0, 0, 5), 45)
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Neonski okvir spolja (Cyan)
    $outerPad = [int]($size * 0.06)
    $outerSize = $size - (2 * $outerPad)
    $cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 255, 255), [float]($size * 0.035))
    $g.DrawEllipse($cyanPen, $outerPad, $outerPad, $outerSize, $outerSize)
    $cyanPen.Dispose()

    # Neonski okvir unutra (Magenta / Pink)
    $innerPad = [int]($size * 0.12)
    $innerSize = $size - (2 * $innerPad)
    $pinkPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 222), [float]($size * 0.025))
    $g.DrawEllipse($pinkPen, $innerPad, $innerPad, $innerSize, $innerSize)
    $pinkPen.Dispose()

    # Zlatna zvezda / sjaj u centru iza brojeva
    $glowPad = [int]($size * 0.22)
    $glowSize = $size - (2 * $glowPad)
    $goldGlowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 255, 215, 0))
    $g.FillEllipse($goldGlowBrush, $glowPad, $glowPad, $glowSize, $glowSize)
    $goldGlowBrush.Dispose()

    # Tekst "777" u centru
    $fontSize = [float]($size * 0.32)
    $font = New-Object System.Drawing.Font("Arial Black", $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Senka teksta
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 85))
    $g.DrawString("777", $font, $shadowBrush, [float]($size / 2 + [int]($size * 0.015)), [float]($size / 2 - [int]($size * 0.04) + [int]($size * 0.015)), $sf)
    $shadowBrush.Dispose()

    # Glavni tekst 777
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))
    $g.DrawString("777", $font, $textBrush, [float]($size / 2), [float]($size / 2 - [int]($size * 0.04)), $sf)
    $textBrush.Dispose()
    $font.Dispose()

    # Donji natpis "SLOTS"
    $slotsFontSize = [float]($size * 0.11)
    $slotsFont = New-Object System.Drawing.Font("Arial Black", $slotsFontSize, [System.Drawing.FontStyle]::Bold)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 215, 0))
    $g.DrawString("SLOTS", $slotsFont, $goldBrush, [float]($size / 2), [float]($size * 0.72), $sf)
    $goldBrush.Dispose()
    $slotsFont.Dispose()

    $sf.Dispose()
    $g.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Kreirana ikona $outputPath ($size x $size)"
}

Generate-PwaIcon 192 "c:\Users\marko\Downloads\slot neon\assets\icons\icon-192.png"
Generate-PwaIcon 512 "c:\Users\marko\Downloads\slot neon\assets\icons\icon-512.png"
