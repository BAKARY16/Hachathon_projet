$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$ffmpeg=Join-Path $root 'node_modules\ffmpeg-static\ffmpeg.exe'
$video=Join-Path $root 'Waste2Cash_Demo_2min.mp4'
$output=Join-Path $root 'Waste2Cash_Demo_2min_Voix_Feminine.mp4'
$voice=Join-Path $root 'video-assets\voice'
$ffargs=@('-y','-i',$video)
1..9|ForEach-Object{$ffargs+=@('-i',(Join-Path $voice ('{0:D2}.mp3' -f $_)))}
$filters=@();for($i=1;$i -le 9;$i++){$filters+="[${i}:a]apad,atrim=0:11,asetpts=PTS-STARTPTS[a$i]"}
$labels=(1..9|ForEach-Object{"[a$_]"})-join ''
$filters+="$labels`concat=n=9:v=0:a=1[narration]"
$ffargs+=@('-filter_complex',($filters-join ';'),'-map','0:v:0','-map','[narration]','-c:v','copy','-c:a','aac','-b:a','160k','-t','99','-movflags','+faststart',$output)
& $ffmpeg @ffargs
if($LASTEXITCODE -ne 0){throw "FFmpeg a échoué avec le code $LASTEXITCODE"}
Write-Output $output
