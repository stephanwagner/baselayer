#!/bin/bash

# Delete all .DS_Store files recursively
find . -name ".DS_Store" -exec rm -f {} \;

LANGUAGE_DIR="./themes/fromscratch/languages"

# Replicate a de_DE .po to all German variants (same translations, new header).
# $1 = path to the de_DE .po, $2 = file name prefix (e.g. fromscratch, fromscratch-icons)
replicate_de_variants() {
    local base="$1"
    local prefix="$2"
    local dir
    dir=$(dirname "$base")

    cp "$base" "$dir/${prefix}-de_DE_formal.po"
    cp "$base" "$dir/${prefix}-de_AT.po"
    cp "$base" "$dir/${prefix}-de_CH.po"
    cp "$base" "$dir/${prefix}-de_CH_informal.po"

    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_DE_formal\\n"/' "$dir/${prefix}-de_DE_formal.po"
    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_AT\\n"/' "$dir/${prefix}-de_AT.po"
    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_CH\\n"/' "$dir/${prefix}-de_CH.po"
    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_CH_informal\\n"/' "$dir/${prefix}-de_CH_informal.po"
}

# All German variants use the same translations as de_DE
replicate_de_variants "$LANGUAGE_DIR/fromscratch-de_DE.po" "fromscratch"
replicate_de_variants "$LANGUAGE_DIR/icons/fromscratch-icons-de_DE.po" "fromscratch-icons"

# Compile every .po (main + icons + variants) into a .mo alongside it
find "$LANGUAGE_DIR" -type f -name "*.po" | while read -r po; do
    # Get the filename without the path and extension
    filename=$(basename "$po" .po)
    # Get the directory path of the .po file
    dirpath=$(dirname "$po")
    # Compile the .po file into a .mo file in the same directory
    msgfmt -o "$dirpath/$filename.mo" "$po"
done

echo -e "\033[32m✔ PO files compiled successfully.\033[0m"
