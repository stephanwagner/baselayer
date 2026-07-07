#!/bin/bash

# Export or import the WordPress database for local development.
#
# Usage:
#   ./scripts/db.sh export
#   ./scripts/db.sh import db/export-2026-01-01_12-00-00.sql
#   ./scripts/db.sh import latest
#   ./scripts/db.sh import          # interactive picker from db/
#
# Database credentials are read from wordpress/wp-config.php.
# Exports are saved to db/ (gitignored).
# Before import, the current database is always backed up to db/bak/ (zipped when possible).

set -euo pipefail

GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

CHECK="✔"
CROSS="✖"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_FOLDER="$ROOT/db"
PRE_IMPORT_BACKUP_FOLDER="$ROOT/db/bak"
WP_CONFIG="$ROOT/wordpress/wp-config.php"

MYSQL="${MYSQL:-mysql}"
MYSQLDUMP="${MYSQLDUMP:-mysqldump}"

COMMAND="${1:-}"
FILE="${2:-}"

extract_define() {
  local key="$1"
  grep "define( '$key'" "$WP_CONFIG" | head -1 | sed -E "s/^define\( '$key', '([^']*)' \);/\1/"
}

if [ ! -f "$WP_CONFIG" ]; then
  echo -e "${RED}${CROSS} WordPress config not found: $WP_CONFIG${RESET}"
  exit 1
fi

DB_NAME="$(extract_define DB_NAME | tr -d '\r')"
DB_USER="$(extract_define DB_USER | tr -d '\r')"
DB_PASSWORD="$(extract_define DB_PASSWORD | tr -d '\r')"
DB_HOST="$(extract_define DB_HOST | tr -d '\r')"

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_HOST" ]; then
  echo -e "${RED}${CROSS} Could not read database settings from wp-config.php${RESET}"
  exit 1
fi

if [[ "$DB_HOST" == *:* ]]; then
  DB_HOSTNAME="${DB_HOST%%:*}"
  DB_PORT="${DB_HOST##*:}"
else
  DB_HOSTNAME="$DB_HOST"
  DB_PORT="3306"
fi

for bin in "$MYSQL" "$MYSQLDUMP"; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo -e "${RED}${CROSS} Command not found: $bin${RESET}"
    exit 1
  fi
done

mysql_args=(
  -h "$DB_HOSTNAME"
  -P "$DB_PORT"
  -u "$DB_USER"
)

mysqldump_args=(
  -h "$DB_HOSTNAME"
  -P "$DB_PORT"
  -u "$DB_USER"
  --single-transaction
  --default-character-set=utf8mb4
  --set-gtid-purged=OFF
)

if [ -n "$DB_PASSWORD" ]; then
  export MYSQL_PWD="$DB_PASSWORD"
fi

export_db() {
  mkdir -p "$BACKUP_FOLDER"

  read -r -p "Enter backup name (leave empty for timestamp): " NAME

  if [ -z "$NAME" ]; then
    BACKUP_FILE="$BACKUP_FOLDER/export-$(date +%Y-%m-%d_%H-%M-%S).sql"
  else
    BACKUP_FILE="$BACKUP_FOLDER/${NAME}.sql"
  fi

  echo -e "${YELLOW}Exporting ${DB_NAME}...${RESET}"

  if "$MYSQLDUMP" "${mysqldump_args[@]}" "$DB_NAME" > "$BACKUP_FILE"; then
    echo -e "${GREEN}${CHECK} Export successful: $BACKUP_FILE${RESET}"
  else
    echo -e "${RED}${CROSS} Export failed.${RESET}"
    exit 1
  fi
}

backup_current_db() {
  local timestamp sql_file zip_file

  mkdir -p "$PRE_IMPORT_BACKUP_FOLDER"
  timestamp="$(date +%Y-%m-%d_%H-%M-%S)"
  sql_file="$PRE_IMPORT_BACKUP_FOLDER/${timestamp}.sql"
  zip_file="$PRE_IMPORT_BACKUP_FOLDER/${timestamp}.zip"

  echo -e "${YELLOW}Backing up current ${DB_NAME} to db/bak/...${RESET}"

  if ! "$MYSQLDUMP" "${mysqldump_args[@]}" "$DB_NAME" > "$sql_file"; then
    echo -e "${RED}${CROSS} Pre-import backup failed. Import cancelled.${RESET}"
    rm -f "$sql_file"
    exit 1
  fi

  if command -v zip >/dev/null 2>&1; then
    if (cd "$PRE_IMPORT_BACKUP_FOLDER" && zip -q -9 "${timestamp}.zip" "${timestamp}.sql"); then
      rm -f "$sql_file"
      echo -e "${GREEN}${CHECK} Pre-import backup saved: $zip_file${RESET}"
    else
      echo -e "${YELLOW}Could not create zip; kept SQL backup: $sql_file${RESET}"
    fi
  else
    echo -e "${YELLOW}zip not found; kept SQL backup: $sql_file${RESET}"
  fi
}

resolve_import_file() {
  local input="$1"

  if [ "$input" = "latest" ]; then
    input="$(ls -t "$BACKUP_FOLDER"/export-*.sql 2>/dev/null | head -n 1 || true)"
  elif [[ "$input" != /* ]]; then
    if [ -f "$ROOT/$input" ]; then
      input="$ROOT/$input"
    elif [ -f "$BACKUP_FOLDER/$input" ]; then
      input="$BACKUP_FOLDER/$input"
    fi
  fi

  printf '%s' "$input"
}

choose_import_file() {
  local -a files=()
  local file

  while IFS= read -r file; do
    [ -n "$file" ] && files+=("$file")
  done < <(ls -t "$BACKUP_FOLDER"/*.sql 2>/dev/null || true)

  if [ ${#files[@]} -eq 0 ]; then
    echo -e "${RED}${CROSS} No backup files found in $BACKUP_FOLDER${RESET}" >&2
    return 1
  fi

  echo -e "${YELLOW}Available backups in db/:${RESET}" >&2
  echo >&2

  local i choice name size modified
  for i in "${!files[@]}"; do
    file="${files[$i]}"
    name="$(basename "$file")"
    size="$(du -h "$file" | awk '{print $1}')"
    modified="$(date -r "$file" '+%Y-%m-%d %H:%M')"
    printf '  %2d) %-40s %6s  %s\n' "$((i + 1))" "$name" "$size" "$modified" >&2
  done
  echo "   0) Cancel" >&2
  echo >&2

  while true; do
    read -r -p "Enter number [1-${#files[@]}]: " choice

    if [ "$choice" = "0" ] || [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
      echo "Cancelled." >&2
      return 2
    fi

    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#files[@]} ]; then
      FILE="${files[$((choice - 1))]}"
      return 0
    fi

    echo -e "${RED}Invalid choice. Enter a number between 1 and ${#files[@]}, or 0 to cancel.${RESET}" >&2
  done
}

import_db() {
  if [ -z "$FILE" ]; then
    if choose_import_file; then
      :
    else
      case $? in
        2) exit 0 ;;
        *) exit 1 ;;
      esac
    fi
  else
    FILE="$(resolve_import_file "$FILE")"
  fi

  if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
    echo -e "${RED}${CROSS} Backup file not found.${RESET}"
    exit 1
  fi

  echo -e "${YELLOW}This will OVERWRITE database: $DB_NAME${RESET}"
  echo -e "${YELLOW}A backup of the current database will be saved to db/bak/ first.${RESET}"
  read -r -p "Type 'yes' to continue: " confirm

  if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
  fi

  backup_current_db

  echo -e "${YELLOW}Importing $FILE...${RESET}"

  # Strip GTID metadata from dumps created on servers with GTID enabled.
  if sed '/^SET @@GLOBAL.GTID_PURGED=/d' "$FILE" | "$MYSQL" "${mysql_args[@]}" "$DB_NAME"; then
    echo -e "${GREEN}${CHECK} Import successful.${RESET}"
  else
    echo -e "${RED}${CROSS} Import failed.${RESET}"
    exit 1
  fi
}

case "$COMMAND" in
  export)
    export_db
    ;;
  import)
    import_db
    ;;
  *)
    echo "Usage:"
    echo "  ./scripts/db.sh export"
    echo "  ./scripts/db.sh import backup.sql"
    echo "  ./scripts/db.sh import latest"
    echo "  ./scripts/db.sh import"
    exit 1
    ;;
esac
