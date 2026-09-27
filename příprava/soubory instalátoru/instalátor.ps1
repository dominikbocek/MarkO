[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Windows.Forms
$FormObject = [System.Windows.Forms.Form]
$LabelObject = [System.Windows.Forms.Label]
$RichTextBox = [System.Windows.Forms.RichTextBox]
$TextBox = [System.Windows.Forms.TextBox]
$Button = [System.Windows.Forms.Button]
$PanelObject = [System.Windows.Forms.Panel]

$Instalator = New-Object $FormObject
$Instalator.ClientSize = '700,400'
$Instalator.Text = 'MarkO - instalátor'
$Instalator.BackColor = "white"
$Instalator.MaximizeBox = $false
$Instalator.FormBorderStyle = "FixedDialog"

$Global:InstalaceBezi = $false

# úvodní obrazovka

$UvitaciPanel = New-Object $PanelObject
$UvitaciPanel.ClientSize = '700,400'

$nadpis = New-Object $LabelObject
$nadpis.Text = "Instalátor"
$nadpis.AutoSize = $true
$nadpis.Location = New-Object System.Drawing.Point(20,20)
$nadpis.Font = "Verdana,20px,style=Bold"

$verze = New-Object $LabelObject
$verze.Text = Get-Content "../.verze.txt"
$verze.AutoSize = $true
$verze.Location = New-Object System.Drawing.Point(0,0)

$text = New-Object $RichTextBox
$text.Location = New-Object System.Drawing.Point(20,60)
$text.ReadOnly = $true
$text.BorderStyle = "None"
$text.Size = "660,300"
$text.BackColor = "white"
$text.LoadFile("$PSScriptRoot\uvítací obrazovka.rtf")

$Tlacitko = New-Object $Button
$Tlacitko.Location = New-Object System.Drawing.Point(600, 360)
$Tlacitko.Text = "Další"
$Tlacitko.FlatStyle = 3
$Tlacitko.AutoSize = $true

$UvitaciPanel.Visible = $true

$UvitaciPanel.Controls.AddRange(@($nadpis, $verze, $text, $Tlacitko))

# obrazovka s informacemi o licenci

$PanelInfoLicence = New-Object $PanelObject
$PanelInfoLicence.ClientSize = "700,400"

$nadpis = New-Object $LabelObject
$nadpis.Text = "Licenční podmínky"
$nadpis.AutoSize = $true
$nadpis.Location = New-Object System.Drawing.Point(20,20)
$nadpis.Font = "Verdana,20px,style=Bold"

$text = New-Object $RichTextBox
$text.Location = New-Object System.Drawing.Point(20,60)
$text.ReadOnly = $true
$text.BorderStyle = "None"
$text.Size = "660,200"
$text.BackColor = "white"
$text.LoadFile("$PSScriptRoot\info licence.rtf")

$TlacitkoDalsi = New-Object $Button
$TlacitkoDalsi.Location = New-Object System.Drawing.Point(600, 360)
$TlacitkoDalsi.Text = "Další"
$TlacitkoDalsi.FlatStyle = 3
$TlacitkoDalsi.AutoSize = $true

$PanelInfoLicence.Visible = $false
$PanelInfoLicence.Controls.AddRange(@($nadpis, $text, $TlacitkoDalsi))

# obrazovka s licencí

$PanelLicence = New-Object $PanelObject
$PanelLicence.ClientSize = "700,400"

$nadpis = New-Object $LabelObject
$nadpis.Text = "Licenční podmínky"
$nadpis.AutoSize = $true
$nadpis.Location = New-Object System.Drawing.Point(20,20)
$nadpis.Font = "Verdana,20px,style=Bold"

$licence = New-Object $TextBox
$licence.Location = New-Object System.Drawing.Point(20,60)
$licence.ReadOnly = $true
$licence.Multiline = $true
$licence.WordWrap = $false
$licence.BorderStyle = "None"
$licence.Size = "630,300"
$licence.ScrollBars = 2
$licence.Font = "Consolas,14px"
$licence.Text = [System.IO.File]::ReadAllText(
    (Join-Path $PSScriptRoot "..\..\LICENSE")
)

$TlacitkoNainstalovat = New-Object $Button
$TlacitkoNainstalovat.Location = New-Object System.Drawing.Point(600, 360)
$TlacitkoNainstalovat.Text = "Nainstalovat"
$TlacitkoNainstalovat.FlatStyle = 3
$TlacitkoNainstalovat.AutoSize = $true

$TlacitkoNainstalovat.Add_Click({spustitInstalaci})

$PanelLicence.Visible = $false
$PanelLicence.Controls.AddRange(@($nadpis, $licence, $TlacitkoNainstalovat))

# závěrečná obrazovka

$ZaverecnaObrazovka = New-Object $PanelObject
$ZaverecnaObrazovka.ClientSize = "700,400"

$Rozlouceni = New-Object $LabelObject
$Rozlouceni.Text = "Díky za vyzkoušení programu! Instalace započne za 5 sekund."
$Rozlouceni.AutoSize = $true
$Rozlouceni.Location = New-Object System.Drawing.Point(20,20)
$Rozlouceni.Font = "Verdana,20px,style=Bold"

$ZaverecnaObrazovka.Controls.AddRange(@($Rozlouceni))

$Instalator.Controls.AddRange(@($UvitaciPanel, $PanelInfoLicence, $PanelLicence, $ZaverecnaObrazovka))

# ovládací prvky

function zobrazitInfoOLicenci{
    $UvitaciPanel.Visible = $false
    $PanelInfoLicence.Visible = $true
}

function zobrazitLicenci{
    $PanelInfoLicence.Visible = $false
    $PanelLicence.Visible = $true
}

function spustitInstalaci{
    $PanelLicence.Visible = $false
    $ZaverecnaObrazovka.Visible = $true
    $Global:InstalaceBezi = $true
    Start-Sleep -Seconds 5 # odpočet
    $Instalator.Close()
}

$Global:exit = 0

$Instalator.Add_FormClosing({ # ptáme se, zda uživatel chce opravdu ukončit instalaci
    param($sender, $udalost)

    if($Global:InstalaceBezi) {
        $Instalator.Dispose()
        return
    }
    
    $odpoved = [System.Windows.Forms.MessageBox]::Show(
        "Opravdu chcete ukončit instalátor?",
        "Ukončit instalátor",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )

    if ($odpoved -eq [System.Windows.Forms.DialogResult]::No) {
        $udalost.Cancel = $true
    } else {
        $Global:exit = 1
    }
})

$Tlacitko.Add_Click({zobrazitInfoOLicenci})
$TlacitkoDalsi.Add_Click({zobrazitLicenci})


[void] $Instalator.ShowDialog()

exit $exit
$Instalator.Dispose()