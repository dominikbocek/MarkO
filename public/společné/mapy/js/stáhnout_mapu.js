function stahnout() {
      console.log("stahování začalo")

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/stahnout");
      xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
      const body = JSON.stringify({
            svg: document.getElementById("mapa").outerHTML,
            legenda: document.getElementById("legenda").innerHTML // není potřeba tag svg, jenom jeho vnitřek
      });
      xhr.responseType = "blob"
      xhr.onload = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                  var soubor = new Blob([xhr.response], {type: "image/png"})
                  var downloadUrl = URL.createObjectURL(soubor);
                  var odkaz = document.createElement("a")
                  odkaz.href = downloadUrl
                  odkaz.download = `${parametry.popisek}.png`
                  odkaz.click()
            } else {
                  console.log(`Error: ${xhr.status}`);
            }
      };
      
      xhr.send(body);
}