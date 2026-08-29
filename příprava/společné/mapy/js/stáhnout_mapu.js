function stahnout(soubor) {
      $.ajax({
            type: "POST",
            url: "/stahnout",
            data: {
                  soubor: decodeURI(location.pathname)+parametry.data,
                  barvy: decodeURI(location.pathname)+parametry.strany,
                  legenda: decodeURI(location.pathname)+parametry.legendazdroj,
                  druh: parametry.druh,
                  popisek: parametry.popisek
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