#!/bin/bash

# URL to fetch
url="https://closingdoors-nyc-git-allbikes-cedarbaum-s-team.vercel.app/api/citi_bike"

# Get the compressed size from the headers
compressed_size=$(curl -sI "$url" | grep -i Content-Length | awk '{print $2}' | tr -d '\r')

# Get the uncompressed size by downloading the content
uncompressed_size=$(curl -s -o /dev/null -w '%{size_download}\n' "$url")

# Output the sizes
echo "Compressed size: ${compressed_size} bytes"
echo "Uncompressed size: ${uncompressed_size} bytes"
