Add-Type -AssemblyName 'System.IO.Compression.FileSystem'

$soubor = $args[0]
$cil = $args[1]

function Unzip {
    param([string]$zipfile, [string]$out)

    $ArchiveName = [io.path]::GetFileNameWithoutExtension($zipfile)+"/"

    $Archive = [System.IO.Compression.ZipFile]::OpenRead($zipfile)
    Foreach ($entry in $Archive.Entries.Where( { $_.Name.length -gt 0 })) {
        $novapolozka = "$($entry.FullName.replace($ArchiveName, ''))"
        Write-Output $novapolozka
        $chybejicislozka = Split-Path -Parent $novapolozka
        New-Item -ItemType Directory -Force -Path "$cil/$chybejicislozka"
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, "$cil\$novapolozka")
    }
    $Archive.Dispose()
}

Unzip -zipfile "$soubor" -out "$cil"