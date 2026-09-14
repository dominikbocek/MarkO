otevrit_prohlizec() {
   local volby="$1"
   local pripona="$2"
   python3 -m webbrowser "http://127.0.0.1/volby/$(urlencode "$volby")/$pripona"
}