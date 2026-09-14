function svgToPng(svgElement, width, height, callback) {
  // SVG data
  svgData = new XMLSerializer().serializeToString(svgElement);

  // vytvoření canvasu
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // nastavení velikosti
  canvas.width = width;
  canvas.height = height;

  // vytvoření obrázku z SVG
  const img = new Image();

  img.onload = function() {
    // vyčištění canvasu a vykreslení
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // převedení na PNG
    const pngDataUrl = canvas.toDataURL('image/png');
    callback(pngDataUrl);
  };

  // vytvoření blob a URL
  const svgBlob = new Blob([svgData], {
    type: 'image/svg+xml;charset=utf-8'
  });

  const url = URL.createObjectURL(svgBlob);
  img.src = url;

  // je vždy k zastižení hasič Sam a stroj máme čištěný
  img.onload = function() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const pngDataUrl = canvas.toDataURL('image/png');
    URL.revokeObjectURL(url);
    callback(pngDataUrl);
    // odstranit klon
    document.getElementById("mapa-klon").style.display = "none"
    document.getElementById("mapa-klon").remove();
    if(document.getElementById("sudety-klon") !== null)
    document.getElementById.display = "none";
    document.getElementById("sudety-klon").remove();
  };
}


document.querySelector("button").onclick = function() {
  // klonování základní mapy

  const puvodni_mapa = document.getElementById("mapa");
  const klon = puvodni_mapa.cloneNode(true);
  klon.id = "mapa-klon"
  document.body.appendChild(klon)

  // sloučení základní mapy a mapy Sudet
  if(document.getElementById("zobrazit-sudety").checked) {
  var svg1 = document.getElementById('mapa-klon');
  const sudety = document.getElementById('sudety');
  const klon_sudety = sudety.cloneNode(true);
  klon_sudety.id = "sudety-klon"
  document.body.appendChild(klon_sudety)
  

  // souřadnice z mapy Sudet
  var children = Array.from(klon_sudety.childNodes);

  // vložení do základní mapy
  children.forEach(child => {
      svg1.appendChild(child);
  });}
  svgToPng(document.getElementById('mapa-klon'), 1450, 750, function(pngDataUrl) {
  const downloadLink = document.createElement('a');
  downloadLink.href = pngDataUrl;
  downloadLink.download = `${nazev}.png`;
  downloadLink.click();
});}