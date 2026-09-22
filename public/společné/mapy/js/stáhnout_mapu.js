function stahnout(subunits) {

      return $.ajax({
            type: "POST",
            url: "/stahnout",
            data: {
                  svg: document.getElementById("mapa").outerHTML,
                  legenda: document.getElementById("legenda").innerHTML // není potřeba tag svg, jenom jeho vnitřek
                  },
            xhrFields: {
                  responseType: "blob"
                  },
            success: function(data) {
                  var soubor = new Blob([data], {type: "image/png"})
                  var downloadUrl = URL.createObjectURL(soubor);
                  var odkaz = document.createElement("a")
                  odkaz.href = downloadUrl
                  odkaz.download = `${parametry.popisek}.png`
                  odkaz.click()
            },
            error: function(xhr, status, error) {
                  console.error("neok")
            }
      });
}