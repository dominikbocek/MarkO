const data = await d3.dsv(";", "/kvcoco.csv")

export function vyhledat(text) {
    const vysledky = data.filter(function(element) {
        if(element["KODZASTUP"] == element["NADRZASTUP"] || element["NADRZASTUP"] == "") {
            return element["NAZEVZAST"].startsWith(text)
        }
    })
    let seznam_element = document.getElementById("seznamobci")
    seznam_element.style.display = "block"
    seznam_element.innerHTML = ""
    if(text == "") {return 0}
    for (let i = 0; i < 3; i++) {
        if(vysledky[i] == undefined) {break}
        let polozka = document.createElement("li")
        let znacka = document.createElement("label")
        let obec = document.createElement("input")
        znacka.htmlFor = vysledky[i]["KODZASTUP"]
        znacka.innerText = vysledky[i]["NAZEVZAST"]
        polozka.addEventListener("click", function() {
            seznam_element.style.display = "none";
            document.getElementById('hledatobec').value = this.querySelector('label').innerText
            document.getElementById('vytvorit_mapu_obce').querySelector(".obec").value = this.querySelector("input").value
            if(vysledky[i]["NADRZASTUP"] == "") {// statutární města
                document.getElementById("mistni_casti").style.display = "block"
                let celemesto = document.createElement("option")
                celemesto.innerHTML = vysledky[i]["NAZEVZAST"]
                celemesto.value = vysledky[i]["KODZASTUP"]
                document.getElementById("mistni_casti").innerHTML = ""
                document.getElementById("mistni_casti").append(celemesto)

                let mistni_casti = data.filter(function(element2) {
                    if(element2["NADRZASTUP"] == vysledky[i]["KODZASTUP"]) {
                        let cast = document.createElement("option")
                        cast.innerHTML = element2["NAZEVZAST"]
                        cast.value = element2["KODZASTUP"]
                        document.getElementById("mistni_casti").append(cast)
                    }
                })
            } else {
                document.getElementById("mistni_casti").style.display = "none"
            }
        })
        obec.type = "hidden"
        obec.value = vysledky[i]["KODZASTUP"]
        polozka.append(obec)
        polozka.append(znacka)
        seznam_element.append(polozka)
    };
}