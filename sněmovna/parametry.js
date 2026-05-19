//základní parametry
      var urlParams = new URLSearchParams(window.location.search);
      var koalice = urlParams.get('koalice');
      if (koalice !== null) {koalice = true} else {koalice = false}
      var data = koalice ? "volebni_okrsky-simple-data-topo2.json" : "volebni_okrsky-simple-data-topo.json"
      var strany = koalice ? "parties2.json" : "parties.json"
      var legenda = koalice ? "vysledky_cr2.json" : "vysledky_cr.json"