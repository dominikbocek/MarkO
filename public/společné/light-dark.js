let tmavyrezim = localStorage.getItem("darkMode")
if(tmavyrezim == null) {
    if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector("body").onload = function() {document.getElementById("rezim").querySelector("i").classList.add("bi-sun")}
        document.querySelector(':root').setAttribute("data-theme", "dark")
        localStorage.setItem("darkMode", "true")
    } else {
        document.querySelector("body").onload = function() {document.getElementById("rezim").querySelector("i").classList.add("bi-moon")}
        document.querySelector(':root').setAttribute("data-theme", "light")
        localStorage.setItem("darkMode", "false")
    }
} else if(tmavyrezim == "true") {
    document.querySelector("body").onload = function() {document.getElementById("rezim").querySelector("i").classList.add("bi-sun")}
    document.querySelector(':root').setAttribute("data-theme", "dark")
} else if(tmavyrezim == "false") {
    document.querySelector("body").onload = function() {document.getElementById("rezim").querySelector("i").classList.add("bi-moon")}
    document.querySelector(':root').setAttribute("data-theme", "light")
}

function prepnout_rezim() {
    let tmavyrezim = localStorage.getItem("darkMode")
    if(tmavyrezim == "false") {
        document.getElementById("rezim").querySelector("i").classList.replace("bi-moon", "bi-sun")
        document.querySelector(':root').setAttribute("data-theme", "dark")
        localStorage.setItem("darkMode", "true")
    } else if(tmavyrezim == "true") {
        document.getElementById("rezim").querySelector("i").classList.replace("bi-sun", "bi-moon")
        document.querySelector(':root').setAttribute("data-theme", "light")
        localStorage.setItem("darkMode", "false")
    }
}