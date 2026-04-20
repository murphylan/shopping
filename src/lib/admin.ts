/**
 * 管理员邮箱白名单，逗号分隔；未配置时默认与 seed 中的管理员一致。
 * 例: ADMIN_EMAILS=admin@example.com,ops@company.com
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "admin@example.com";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
