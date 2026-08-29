#!/bin/bash
soubor="$1"
kod="$2"
cat "$soubor" | ndjson-filter "d.id.startsWith('$kod')" | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}'