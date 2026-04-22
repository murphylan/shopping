#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Shopping 一键部署脚本（C 机器）
#
#  用法:
#    curl -fsSL https://github.com/murphylan/shopping/releases/download/stable/install.sh | bash
#
#  或带参数:
#    curl -fsSL ... | bash -s -- --port 3005 --db-mode shared --domain shopping.murphylan.cloud
#
#  支持参数:
#    --port <PORT>         宿主机映射端口（默认 3005）
#    --domain <DOMAIN>     公网域名，如 shopping.murphylan.cloud
#    --db-mode <MODE>      数据库模式: standalone（自带 PG）| shared（共享宿主机 PG）
#    --db-port <PORT>      共享模式下宿主机 PG 端口（默认 5433）
#    --db-name <NAME>      数据库名（默认 shopping）
#    --install-dir <DIR>   安装目录（默认 /home/$USER/work/shopping）
#    --skip-db-init        跳过共享 PG 容器创建（已存在时使用）
#    --seed-only           仅重跑 seed（需已完成首次部署）
#    --yes                 跳过确认提示，全自动
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── 颜色 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
info() { echo -e "${BLUE}[i]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*" >&2; }
banner() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $*${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo ""
}

# ── 常量 ──
REGISTRY="zot.murphylan.cloud"

ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ARCH_TAG="amd64" ;;
  aarch64) ARCH_TAG="arm64" ;;
  arm64)   ARCH_TAG="arm64" ;;
  *)       err "不支持的架构: $ARCH"; exit 1 ;;
esac

IMAGE="${REGISTRY}/murphy/shopping:latest"
PG_IMAGE="${REGISTRY}/library/postgres:17-alpine-${ARCH_TAG}"

# ── 默认值 ──
APP_PORT=3005
DOMAIN=""
DB_MODE="standalone"
DB_PORT=5433
DB_NAME="shopping"
INSTALL_DIR=""
SKIP_DB_INIT=false
SEED_ONLY=false
AUTO_YES=false

# ── 解析参数 ──
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)        APP_PORT="$2";      shift 2 ;;
    --domain)      DOMAIN="$2";        shift 2 ;;
    --db-mode)     DB_MODE="$2";       shift 2 ;;
    --db-port)     DB_PORT="$2";       shift 2 ;;
    --db-name)     DB_NAME="$2";       shift 2 ;;
    --install-dir) INSTALL_DIR="$2";   shift 2 ;;
    --skip-db-init) SKIP_DB_INIT=true; shift ;;
    --seed-only)   SEED_ONLY=true;     shift ;;
    --yes|-y)      AUTO_YES=true;      shift ;;
    *)             warn "未知参数: $1"; shift ;;
  esac
done

INSTALL_DIR="${INSTALL_DIR:-/home/$USER/work/shopping}"

# ── seed-only 模式：仅重跑初始数据导入 ──
if [ "$SEED_ONLY" = true ]; then
  banner "Shopping — 重跑 Seed"
  cd "$INSTALL_DIR"

  if [ ! -f .env ]; then
    err "未找到 $INSTALL_DIR/.env，请先完成首次部署"
    exit 1
  fi

  source .env 2>/dev/null || true

  if [ -n "${DATABASE_URL:-}" ]; then
    MIGRATE_DB_URL="${DATABASE_URL//host.containers.internal/localhost}"
  elif [ -n "${POSTGRES_PASSWORD:-}" ]; then
    MIGRATE_DB_URL="postgresql://${POSTGRES_USER:-shopping}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB:-shopping}"
  else
    err ".env 中未找到数据库连接信息"
    exit 1
  fi

  GITHUB_RAW="https://raw.githubusercontent.com/murphylan/shopping/main"
  SEED_FILES=(
    "scripts/seed.ts"
    "src/server/db/index.ts"
    "src/server/db/schema/index.ts"
    "src/server/db/schema/users.ts"
    "src/server/db/schema/products.ts"
    "src/server/db/schema/home-settings.ts"
    "src/server/db/schema/cart.ts"
    "src/lib/home-config-defaults.ts"
    "src/lib/seed-data.ts"
    "src/lib/quick-entry-icons.ts"
    "src/types/product-types.ts"
    "src/types/home-config-types.ts"
    "tsconfig.json"
  )

  info "从 GitHub 下载 seed 文件..."
  for f in "${SEED_FILES[@]}"; do
    mkdir -p "$(dirname "$f")"
    if ! curl -fsSL "$GITHUB_RAW/$f" -o "$f"; then
      err "下载失败: $f"
      exit 1
    fi
  done

  npm init -y >/dev/null 2>&1
  npm install --silent drizzle-orm postgres bcryptjs tsx >/dev/null 2>&1

  if DATABASE_URL="$MIGRATE_DB_URL" npx tsx scripts/seed.ts; then
    log "初始数据导入完成"
  else
    err "初始数据导入失败"
  fi

  rm -f package.json package-lock.json tsconfig.json
  rm -rf src scripts node_modules
  exit 0
fi

# ── 确认函数（兼容 curl | bash，从 /dev/tty 读取） ──
confirm() {
  if [ "$AUTO_YES" = true ]; then return 0; fi
  echo -en "${YELLOW}$1 [y/N]: ${NC}"
  read -r answer < /dev/tty
  [[ "$answer" =~ ^[Yy]$ ]]
}

# ─────────────────────────────────────────────────────────────
DEPLOY_START=$(date +%s)

banner "Shopping 一键部署（镜像模式）"

info "部署配置:"
echo "  安装目录:     $INSTALL_DIR"
echo "  应用端口:     $APP_PORT"
echo "  数据库模式:   $DB_MODE"
echo "  数据库名:     $DB_NAME"
echo "  系统架构:     $ARCH ($ARCH_TAG)"
echo "  镜像:         $IMAGE"
[ -n "$DOMAIN" ] && echo "  公网域名:     $DOMAIN"
echo ""

if ! confirm "确认以上配置并开始部署？"; then
  info "已取消"
  exit 0
fi

# ─────────────────────────────────────────────────────────────
# Step 1: 检查系统依赖
# ─────────────────────────────────────────────────────────────
banner "Step 1/6 — 检查系统依赖"

MISSING=()

if ! command -v podman &>/dev/null; then MISSING+=("podman"); fi
if ! command -v podman-compose &>/dev/null; then MISSING+=("podman-compose"); fi

if [ ${#MISSING[@]} -gt 0 ]; then
  warn "缺少依赖: ${MISSING[*]}"
  if command -v apt-get &>/dev/null; then
    info "尝试自动安装 (apt)..."
    sudo apt-get update -qq
    for pkg in "${MISSING[@]}"; do
      sudo apt-get install -y -qq "$pkg"
    done
  else
    err "请手动安装: ${MISSING[*]}"
    exit 1
  fi
fi

log "podman $(podman --version | awk '{print $3}')"
log "podman-compose 已就绪"

# ─────────────────────────────────────────────────────────────
# Step 2: 拉取镜像 + 生成 compose.yml
# ─────────────────────────────────────────────────────────────
banner "Step 2/6 — 拉取镜像"

info "拉取镜像..."
podman pull --tls-verify=false "$IMAGE"
podman pull --tls-verify=false "$PG_IMAGE"
log "镜像拉取完成"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if [ "$DB_MODE" = "shared" ]; then
  info "shared 模式 — 生成 compose.yml（仅 app 服务）"
  cat > compose.yml <<EOF
services:
  app:
    image: ${IMAGE}
    restart: unless-stopped
    ports:
      - "\${APP_PORT:-3005}:3000"
    environment:
      DATABASE_URL: \${DATABASE_URL}
      AUTH_SECRET: \${AUTH_SECRET:?AUTH_SECRET is required}
      AUTH_TRUST_HOST: \${AUTH_TRUST_HOST:-true}
      AUTH_URL: \${AUTH_URL:-}
    extra_hosts:
      - "host.containers.internal:host-gateway"
EOF
else
  info "standalone 模式 — 生成 compose.yml（app + db）"
  cat > compose.yml <<EOF
services:
  db:
    image: ${PG_IMAGE}
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-shopping}
      POSTGRES_USER: \${POSTGRES_USER:-shopping}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-shopping} -d \${POSTGRES_DB:-shopping}"]
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    image: ${IMAGE}
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "\${APP_PORT:-3005}:3000"
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER:-shopping}:\${POSTGRES_PASSWORD:?err}@db:5432/\${POSTGRES_DB:-shopping}
      AUTH_SECRET: \${AUTH_SECRET:?AUTH_SECRET is required}
      AUTH_TRUST_HOST: \${AUTH_TRUST_HOST:-true}
      AUTH_URL: \${AUTH_URL:-}

volumes:
  pgdata:
EOF
fi

log "compose.yml 已生成"

# ─────────────────────────────────────────────────────────────
# Step 3: 配置环境变量
# ─────────────────────────────────────────────────────────────
banner "Step 3/6 — 配置环境变量"

AUTH_SECRET=$(openssl rand -base64 32)
PG_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 20)

if [ -f .env ]; then
  warn ".env 已存在，备份为 .env.bak"
  cp .env ".env.bak.$(date +%Y%m%d%H%M%S)"
fi

if [ "$DB_MODE" = "shared" ]; then
  DATABASE_URL="postgresql://postgres:postgres@host.containers.internal:${DB_PORT}/${DB_NAME}"

  cat > .env <<EOF
COMPOSE_PROJECT_NAME=shopping
APP_PORT=${APP_PORT}

DATABASE_URL=${DATABASE_URL}

AUTH_SECRET=${AUTH_SECRET}
ADMIN_EMAILS=admin@example.com
AUTH_URL=${DOMAIN:+https://$DOMAIN}
AUTH_TRUST_HOST=true
EOF
else
  cat > .env <<EOF
COMPOSE_PROJECT_NAME=shopping
APP_PORT=${APP_PORT}

POSTGRES_DB=${DB_NAME}
POSTGRES_USER=shopping
POSTGRES_PASSWORD=${PG_PASSWORD}

AUTH_SECRET=${AUTH_SECRET}
ADMIN_EMAILS=admin@example.com
AUTH_URL=${DOMAIN:+https://$DOMAIN}
AUTH_TRUST_HOST=true
EOF
fi

log ".env 已生成"

# ─────────────────────────────────────────────────────────────
# Step 4: 数据库准备（仅 shared 模式）
# ─────────────────────────────────────────────────────────────
banner "Step 4/6 — 数据库准备"

if [ "$DB_MODE" = "shared" ]; then
  if [ "$SKIP_DB_INIT" = false ]; then
    if podman ps -a --format '{{.Names}}' | grep -q "^murphy-shared-pg$"; then
      if podman ps --format '{{.Names}}' | grep -q "^murphy-shared-pg$"; then
        log "共享 PostgreSQL 容器已在运行"
      else
        info "启动已有的共享 PostgreSQL 容器..."
        podman start murphy-shared-pg
        log "共享 PostgreSQL 已启动"
      fi
    else
      info "创建共享 PostgreSQL 容器..."
      podman run -d \
        --name murphy-shared-pg \
        --restart unless-stopped \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -p "${DB_PORT}:5432" \
        -v murphy-shared-pgdata:/var/lib/postgresql/data \
        "$PG_IMAGE"
      log "共享 PostgreSQL 容器已创建"

      info "等待 PostgreSQL 就绪..."
      for i in $(seq 1 30); do
        if podman exec murphy-shared-pg pg_isready -q 2>/dev/null; then
          break
        fi
        if [ "$i" -eq 30 ]; then
          err "PostgreSQL 启动超时"
          exit 1
        fi
        sleep 2
      done
      log "PostgreSQL 已就绪"
    fi

    if podman exec murphy-shared-pg psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
      log "数据库 '$DB_NAME' 已存在"
    else
      podman exec murphy-shared-pg psql -U postgres -c "CREATE DATABASE $DB_NAME;"
      log "数据库 '$DB_NAME' 已创建"
    fi
  else
    info "跳过共享 PostgreSQL 初始化（--skip-db-init）"
  fi
else
  info "standalone 模式 — 数据库由 compose 管理"
fi

# ─────────────────────────────────────────────────────────────
# Step 5: 启动服务 + 同步数据库结构
# ─────────────────────────────────────────────────────────────
banner "Step 5/6 — 启动服务"

info "启动服务..."
podman-compose down 2>/dev/null || true
podman-compose up -d

info "等待应用启动..."
for i in $(seq 1 60); do
  if curl -sf "http://localhost:${APP_PORT}" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    warn "应用启动超时，请检查日志: cd $INSTALL_DIR && podman-compose logs -f app"
    break
  fi
  sleep 2
done

source .env 2>/dev/null || true
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-shopping}"
APP_CONTAINER="${PROJECT_NAME}_app_1"

if [ "$DB_MODE" = "shared" ]; then
  MIGRATE_DB_URL="postgresql://postgres:postgres@localhost:${DB_PORT}/${DB_NAME}"
else
  MIGRATE_DB_URL="postgresql://${POSTGRES_USER:-shopping}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB:-shopping}"
fi

info "同步数据库结构 (drizzle-kit push)..."
podman cp "$APP_CONTAINER":/app/drizzle.config.ts ./drizzle.config.ts 2>/dev/null
mkdir -p src/server/db/schema
podman cp "$APP_CONTAINER":/app/src/server/db/. ./src/server/db/ 2>/dev/null
npm init -y >/dev/null 2>&1
npm install --silent drizzle-kit drizzle-orm postgres >/dev/null 2>&1

if DATABASE_URL="$MIGRATE_DB_URL" npx drizzle-kit push --force; then
  log "数据库结构同步完成"
else
  warn "数据库结构同步失败，可稍后手动执行:"
  echo "  cd $INSTALL_DIR && DATABASE_URL=\"$MIGRATE_DB_URL\" npx drizzle-kit push --force"
fi

# ─────────────────────────────────────────────────────────────
# Step 6: 导入初始数据 (seed)
# ─────────────────────────────────────────────────────────────
banner "Step 6/6 — 导入初始数据"

GITHUB_RAW="https://raw.githubusercontent.com/murphylan/shopping/main"
SEED_FILES=(
  "scripts/seed.ts"
  "src/lib/home-config-defaults.ts"
  "src/lib/seed-data.ts"
  "src/lib/quick-entry-icons.ts"
  "src/types/product-types.ts"
  "src/types/home-config-types.ts"
  "tsconfig.json"
)

info "从 GitHub 下载 seed 文件..."
SEED_DOWNLOAD_OK=true
for f in "${SEED_FILES[@]}"; do
  mkdir -p "$(dirname "$f")"
  if ! curl -fsSL "$GITHUB_RAW/$f" -o "$f"; then
    warn "下载失败: $f"
    SEED_DOWNLOAD_OK=false
  fi
done

if [ "$SEED_DOWNLOAD_OK" = true ]; then
  npm install --silent bcryptjs tsx >/dev/null 2>&1

  if DATABASE_URL="$MIGRATE_DB_URL" npx tsx scripts/seed.ts; then
    log "初始数据导入完成"
  else
    warn "初始数据导入失败，可稍后手动执行:"
    echo "  cd $INSTALL_DIR && DATABASE_URL=\"$MIGRATE_DB_URL\" npx tsx scripts/seed.ts"
  fi
else
  warn "seed 文件下载不完整，跳过导入。可稍后手动执行:"
  echo "  cd $INSTALL_DIR && DATABASE_URL=\"$MIGRATE_DB_URL\" npx tsx scripts/seed.ts"
fi

rm -f drizzle.config.ts package.json package-lock.json tsconfig.json
rm -rf src scripts node_modules

# ─────────────────────────────────────────────────────────────
# 完成
# ─────────────────────────────────────────────────────────────
DEPLOY_END=$(date +%s)

banner "部署完成！(总耗时 $((DEPLOY_END - DEPLOY_START))s)"

echo -e "  ${GREEN}应用地址:${NC}  http://localhost:${APP_PORT}"
[ -n "$DOMAIN" ] && echo -e "  ${GREEN}公网域名:${NC}  https://${DOMAIN}"
echo ""
echo -e "  ${CYAN}常用命令:${NC}"
echo "    cd $INSTALL_DIR"
echo "    podman-compose logs -f app    # 查看日志"
echo "    podman-compose restart app    # 重启应用"
echo "    podman-compose down           # 停止服务"
echo ""
echo -e "  ${YELLOW}更新部署:${NC}"
echo "    podman pull --tls-verify=false $IMAGE && podman-compose down && podman-compose up -d"
echo ""
echo -e "  ${YELLOW}重跑 seed（初始化数据）:${NC}"
echo "    curl -fsSL https://github.com/murphylan/shopping/releases/download/stable/install.sh | bash -s -- --seed-only"
echo ""
