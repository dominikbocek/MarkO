const data = await d3.dsv(";", "/kvcoco.csv")

export function vyhledat(text, odkazy = false) {
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
        polozka.innerText = vysledky[i]["NAZEVZAST"]
        polozka.setAttribute("data-kod", vysledky[i]["KODZASTUP"])

        function seznam(polozka) {
            polozka.addEventListener("click", function() {
                seznam_element.style.display = "none";
                document.getElementById('hledatobec').value = this.innerText
                document.getElementById('vytvorit_mapu_obce').querySelector(".obec").value = this.getAttribute("data-kod")
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
        }

        if(odkazy) {
            polozka.addEventListener("click", function() {
                location.href = polozka.getAttribute("data-kod")
            })
        } else {
            seznam(polozka)
        }

        seznam_element.append(polozka)
    };
}