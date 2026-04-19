#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "========================================="
echo "  Shopping 部署脚本"
echo "========================================="

# 1. Check podman
if ! command -v podman &>/dev/null; then
  echo "[ERROR] podman 未安装。请先运行: sudo apt install podman"
  exit 1
fi

if ! command -v podman-compose &>/dev/null; then
  echo "[ERROR] podman-compose 未安装。请先运行: sudo apt install podman-compose"
  exit 1
fi

echo "[OK] podman $(podman --version | head -1)"
echo "[OK] podman-compose 已安装"

# 2. Check .env
if [ ! -f .env ]; then
  echo ""
  echo "[INFO] 未找到 .env 文件，从模板创建..."
  cp .env.example .env
  echo "[ACTION] 请编辑 .env 文件，填写实际密码和密钥后重新运行此脚本："
  echo ""
  echo "  vim .env"
  echo "  ./scripts/deploy.sh"
  echo ""
  echo "  必须修改的项："
  echo "    POSTGRES_PASSWORD  - 数据库密码"
  echo "    AUTH_SECRET        - 运行 openssl rand -base64 32 生成"
  echo "  公网域名部署还须设置（与浏览器地址一致，含 https://）："
  echo "    AUTH_URL  例: https://shopping.example.com"
  exit 0
fi

# 3. Load COMPOSE_PROJECT_NAME for container naming
source .env 2>/dev/null || true
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-shopping}"

BUILD_START=$(date +%s)

echo ""
echo "[1/4] 构建镜像..."
podman-compose build

BUILD_END=$(date +%s)
echo "[OK] 镜像构建完成 ($(( BUILD_END - BUILD_START ))s)"

echo ""
echo "[2/4] 启动服务..."
podman-compose down
podman-compose up -d

echo ""
echo "[3/4] 等待数据库就绪..."
APP_CONTAINER="${PROJECT_NAME}_app_1"
DB_CONTAINER="${PROJECT_NAME}_db_1"

for i in $(seq 1 30); do
  if podman exec "$DB_CONTAINER" pg_isready -q 2>/dev/null; then
    echo "[OK] 数据库已就绪"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[ERROR] 数据库启动超时"
    exit 1
  fi
  sleep 2
done

echo ""
echo "[4/4] 同步数据库结构..."
podman exec "$APP_CONTAINER" npx drizzle-kit push --force 2>/dev/null && echo "[OK] 数据库结构已同步" || echo "[WARN] 数据库结构同步失败，请手动检查"

TOTAL_END=$(date +%s)

echo ""
echo "========================================="
echo "  部署完成！(总耗时 $(( TOTAL_END - BUILD_START ))s)"
echo "========================================="
echo ""
echo "  应用地址: http://localhost:${APP_PORT:-3000}"
echo "  查看日志: podman-compose logs -f app"
echo "  停止服务: podman-compose down"
echo ""
