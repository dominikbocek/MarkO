function stahnout(subunits) {

      return $.ajax({
            type: "POST",
            url: "/stahnout",
            data: {
                  volby: parametry.volby,
                  data: JSON.stringify(subunits),
                  druh: parametry.druh,
                  typzobrazeni: parametry.typzobrazeni,
                  rozsah: parametry.rozsah,
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