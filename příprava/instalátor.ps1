Add-Type -AssemblyName System.Windows.Forms
$FormObject = [System.Windows.Forms.Form]
$LabelObject = [System.Windows.Forms.Label]

$Instalator = New-Object $FormObject
$Instalator.ClientSize = '500,300'
$Instalator.Text = 'MarkO - instalátor'
$Instalator.BackColor = "white"

$text = New-Object $LabelObject
$text.Text = "Instalátor"
$text.AutoSize = $true
$text.Location = New-Object System.Drawing.Point(20,20)
$Instalator.Controls.AddRange(@($text))


$Instalator.ShowDialog()
$Instalator.Dispose()