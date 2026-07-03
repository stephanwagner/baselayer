#!/bin/bash

# Export or import the WordPress database for local development.
#
# Usage:
#   ./scripts/db.sh export
#   ./scripts/db.sh import db/export-2026-01-01_12-00-00.sql
#   ./scripts/db.sh import latest
#
# Database credentials are read from wordpress/wp-config.php.
# Exports are saved to db/ (gitignored).

set -euo pipefail

GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

CHECK="✔"
CROSS="✖"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_FOLDER="$ROOT/db"
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

import_db() {
  if [ -z "$FILE" ]; then
    echo -e "${RED}Please provide a backup file.${RESET}"
    echo "Usage: ./scripts/db.sh import backup.sql"
    exit 1
  fi

  FILE="$(resolve_import_file "$FILE")"

  if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
    echo -e "${RED}${CROSS} Backup file not found.${RESET}"
    exit 1
  fi

  echo -e "${YELLOW}This will OVERWRITE database: $DB_NAME${RESET}"
  read -r -p "Type 'yes' to continue: " confirm

  if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
  fi

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
    exit 1
    ;;
esac
