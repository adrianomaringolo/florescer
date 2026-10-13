#!/usr/bin/env bash
# Postgres local para desenvolvimento (em produção o banco é o Neon).
# Uso: scripts/db-local.sh up | down | reset
set -euo pipefail

NOME=florescer-db
VOLUME=florescer-db

subir() {
  if docker ps -a --format '{{.Names}}' | grep -qx "$NOME"; then
    docker start "$NOME" >/dev/null
  else
    docker run -d --name "$NOME" \
      -e POSTGRES_USER=florescer -e POSTGRES_PASSWORD=florescer -e POSTGRES_DB=florescer \
      -p 5433:5432 -v "$VOLUME":/var/lib/postgresql/data \
      postgres:17-alpine >/dev/null
  fi
  printf "Aguardando o Postgres"
  until docker exec "$NOME" pg_isready -U florescer -d florescer >/dev/null 2>&1; do printf "."; sleep 1; done
  echo " pronto em localhost:5433"
}

case "${1:-up}" in
  up) subir ;;
  down) docker stop "$NOME" >/dev/null && echo "Postgres parado." ;;
  reset)
    docker rm -f "$NOME" >/dev/null 2>&1 || true
    docker volume rm "$VOLUME" >/dev/null 2>&1 || true
    subir
    ;;
  *) echo "uso: $0 up|down|reset" >&2; exit 1 ;;
esac
