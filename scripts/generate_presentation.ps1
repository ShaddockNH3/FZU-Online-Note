$ErrorActionPreference = "Stop"

# 计算项目根目录，读取 PPT 内容配置，并拼出最终输出路径。
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$jsonPath = Join-Path $root "scripts\presentation_content.json"
$content = Get-Content -Raw -Encoding UTF8 -LiteralPath $jsonPath | ConvertFrom-Json
$outDir = Join-Path $root $content.outputDir
$outPath = Join-Path $outDir $content.outputFile
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# 如果目标文件已经存在，先删除旧文件，避免 PowerPoint 保存时被占用或弹窗确认。
if (Test-Path -LiteralPath $outPath) {
  Remove-Item -LiteralPath $outPath -Force
}

$powerPoint = $null
$presentation = $null
try {
  # 启动 PowerPoint COM 对象，新建一个宽屏演示文稿。
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Add()
  $presentation.PageSetup.SlideSize = 13

  # 遍历 JSON 中的每一页内容，逐页添加背景、顶部色条、标题、正文和页脚。
  foreach ($slideData in $content.slides) {
    $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
    $background = $slide.Background.Fill
    $background.ForeColor.RGB = 0xF4F7FF

    $bar = $slide.Shapes.AddShape(1, 0, 0, 960, 22)
    $bar.Fill.ForeColor.RGB = 0x8C6FE9
    $bar.Line.Visible = 0

    $title = $slide.Shapes.AddTextbox(1, 54, 54, 850, 72)
    $title.TextFrame.TextRange.Text = $slideData.title
    $title.TextFrame.TextRange.Font.NameFarEast = "Microsoft YaHei"
    $title.TextFrame.TextRange.Font.Name = "Microsoft YaHei"
    $title.TextFrame.TextRange.Font.Size = 32
    $title.TextFrame.TextRange.Font.Bold = -1
    $title.TextFrame.TextRange.Font.Color.RGB = 0x333D5A
    $title.Line.Visible = 0

    $body = $slide.Shapes.AddTextbox(1, 86, 155, 790, 330)
    $body.TextFrame.TextRange.Text = (($slideData.bullets | ForEach-Object { "$($content.bulletPrefix) $_" }) -join "`r")
    $body.TextFrame.TextRange.Font.NameFarEast = "Microsoft YaHei"
    $body.TextFrame.TextRange.Font.Name = "Microsoft YaHei"
    $body.TextFrame.TextRange.Font.Size = 21
    $body.TextFrame.TextRange.Font.Color.RGB = 0x33241D
    $body.TextFrame.MarginLeft = 8
    $body.TextFrame.MarginRight = 8
    $body.TextFrame.MarginTop = 8
    $body.TextFrame.MarginBottom = 8
    $body.Line.Visible = 0

    $footer = $slide.Shapes.AddTextbox(1, 54, 512, 850, 24)
    $footer.TextFrame.TextRange.Text = "$($content.footerPrefix) - $($slide.SlideIndex)/$($content.slides.Count)"
    $footer.TextFrame.TextRange.Font.NameFarEast = "Microsoft YaHei"
    $footer.TextFrame.TextRange.Font.Name = "Microsoft YaHei"
    $footer.TextFrame.TextRange.Font.Size = 10
    $footer.TextFrame.TextRange.Font.Color.RGB = 0x857066
    $footer.Line.Visible = 0
  }

  # 以 pptx 格式保存生成结果。
  $presentation.SaveAs($outPath, 24)
  Write-Output "generated: $outPath"
} finally {
  # 无论生成成功还是报错，都关闭演示文稿并退出 PowerPoint，避免残留后台进程。
  if ($presentation) {
    $presentation.Close()
  }
  if ($powerPoint) {
    $powerPoint.Quit()
  }
}
