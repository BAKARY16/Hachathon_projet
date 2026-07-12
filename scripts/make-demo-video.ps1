$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$assets=Join-Path $root 'video-assets'
$out=Join-Path $root 'Waste2Cash_Demo_2min.mp4'
$ffmpeg=Join-Path $root 'node_modules\ffmpeg-static\ffmpeg.exe'
$narration=Join-Path $assets 'narration.wav'
$text=@"
Bienvenue sur Waste2Cash, la plateforme intelligente de valorisation des invendus en Côte d’Ivoire. En moins de deux minutes, découvrons son fonctionnement. Le tableau de bord consolide les volumes collectés, le taux de valorisation, le temps moyen de traitement et l’impact carbone. Ces indicateurs ne sont pas saisis manuellement : ils sont calculés à partir de quinze mille observations du jeu de données Waste2Cash. La section méthodologie rend chaque formule explicable, notamment la moyenne des invendus et la fenêtre optimale de rotation par catégorie. Dans Stock et Matching, chaque lot est classé selon sa date d’expiration, sa quantité, sa localisation et sa probabilité d’écoulement. Les filtres permettent d’isoler une catégorie, un niveau d’urgence, une commune ou une enseigne. L’administrateur peut confirmer le meilleur match proposé par l’intelligence artificielle. Le panneau de prévision anticipe les volumes des six prochains mois afin de préparer les capacités logistiques. La page Partenaires présente les principales enseignes d’Abidjan. En ouvrant Socofrais, on retrouve ses indicateurs, son historique et ses lots en cours. L’espace Client permet à une enseigne de déclarer ses invendus, d’indiquer la quantité, la date d’expiration et le lieu de collecte, puis de suivre le statut de chaque déclaration. L’espace Administrateur centralise ensuite les demandes et valide le plan de routage proposé. Enfin, la page Impact traduit les résultats en repas sauvés, émissions évitées et familles touchées. Waste2Cash relie ainsi prédiction, collecte, matching et impact dans une seule plateforme prête à accompagner la distribution ivoirienne.
"@
$hasNarration=$false
try {
  Add-Type -AssemblyName System.Speech
  $voice=New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.Rate=1
  $voice.SetOutputToWaveFile($narration)
  $voice.Speak($text)
  $voice.Dispose()
  $hasNarration=$true
} catch {
  Write-Warning 'Aucune voix Windows disponible : création de la version visuelle silencieuse.'
}
$images=1..9|ForEach-Object{Join-Path $assets ('{0:D2}-' -f $_)}
$list=Join-Path $assets 'slides.txt'
$names=@('01-dashboard.png','02-modele.png','03-stock.png','04-match.png','05-forecast.png','06-partenaires.png','07-socofrais.png','08-client.png','09-impact.png')
$content=@();foreach($name in $names){$p=(Join-Path $assets $name).Replace('\','/');$content+="file '$p'";$content+='duration 11'};$content+="file '$((Join-Path $assets $names[-1]).Replace('\','/'))'"
[System.IO.File]::WriteAllLines($list,$content,[System.Text.UTF8Encoding]::new($false))
if($hasNarration){
  & $ffmpeg -y -f concat -safe 0 -i $list -i $narration -vf "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fade=t=in:st=0:d=0.5" -c:v libx264 -preset medium -crf 21 -c:a aac -b:a 160k -shortest -movflags +faststart $out
} else {
  & $ffmpeg -y -f concat -safe 0 -i $list -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" -t 99 -vf "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fade=t=in:st=0:d=0.5" -c:v libx264 -preset medium -crf 21 -c:a aac -b:a 96k -shortest -movflags +faststart $out
}
Write-Output $out
