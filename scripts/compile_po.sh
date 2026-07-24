#!/bin/bash

# Delete all .DS_Store files recursively
find . -name ".DS_Store" -exec rm -f {} \;

THEME_LANGUAGE_DIR="./themes/baselayer/languages"
FORMS_LANGUAGE_DIR="./themes/baselayer/packages/baselayer-forms/languages"

# Replicate a de_DE .po to all German variants (same translations, new header).
# $1 = path to the de_DE .po, $2 = file name prefix (e.g. baselayer, baselayer-icons, baselayer-forms)
replicate_de_variants() {
    local base="$1"
    local prefix="$2"
    local dir
    dir=$(dirname "$base")

    if [[ ! -f "$base" ]]; then
        echo -e "\033[33m⚠ Skipping German variants for missing file: $base\033[0m"
        return 0
    fi

    cp "$base" "$dir/${prefix}-de_DE_formal.po"
    cp "$base" "$dir/${prefix}-de_AT.po"
    cp "$base" "$dir/${prefix}-de_CH.po"
    cp "$base" "$dir/${prefix}-de_CH_informal.po"

    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_DE_formal\\n"/' "$dir/${prefix}-de_DE_formal.po"
    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_AT\\n"/' "$dir/${prefix}-de_AT.po"
    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_CH\\n"/' "$dir/${prefix}-de_CH.po"
    perl -pi -e 's/"Language: de_DE\\n"/"Language: de_CH_informal\\n"/' "$dir/${prefix}-de_CH_informal.po"
}

compile_po_dir() {
    local dir="$1"
    local failed=0
    if [[ ! -d "$dir" ]]; then
        return 0
    fi

    while read -r po; do
        filename=$(basename "$po" .po)
        dirpath=$(dirname "$po")
        if ! msgfmt -o "$dirpath/$filename.mo" "$po"; then
            echo -e "\033[31m✖ Failed to compile: $po\033[0m"
            failed=1
        fi
    done < <(find "$dir" -type f -name "*.po")

    return $failed
}

# All German variants use the same translations as de_DE
replicate_de_variants "$THEME_LANGUAGE_DIR/baselayer-de_DE.po" "baselayer"
replicate_de_variants "$THEME_LANGUAGE_DIR/icons/baselayer-icons-de_DE.po" "baselayer-icons"
replicate_de_variants "$FORMS_LANGUAGE_DIR/baselayer-forms-de_DE.po" "baselayer-forms"

# Compile every .po (theme + icons + forms + variants) into a .mo alongside it
failed=0
compile_po_dir "$THEME_LANGUAGE_DIR" || failed=1
compile_po_dir "$FORMS_LANGUAGE_DIR" || failed=1

if [[ "$failed" -ne 0 ]]; then
    echo -e "\033[31m✖ PO compilation finished with errors.\033[0m"
    exit 1
fi

echo -e "\033[32m✔ PO files compiled successfully.\033[0m"
