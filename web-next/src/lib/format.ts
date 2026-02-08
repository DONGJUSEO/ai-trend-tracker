export type TimeAgoStyle = "calendar" | "elapsed";

export function formatNumber(
  value: number,
  options: { trimTrailingZero?: boolean } = {}
): string {
  const { trimTrailingZero = true } = options;

  const withSuffix = (num: number, suffix: "K" | "M"): string => {
    const fixed = (num).toFixed(1);
    if (trimTrailingZero) {
      return `${fixed.replace(/\.0$/, "")}${suffix}`;
    }
    return `${fixed}${suffix}`;
  };

  if (value >= 1_000_000) return withSuffix(value / 1_000_000, "M");
  if (value >= 1_000) return withSuffix(value / 1_000, "K");
  return value.toLocaleString();
}

export function timeAgo(
  dateStr: string,
  style: TimeAgoStyle = "calendar"
): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (style === "elapsed") {
    if (diffMin <= 0) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`;
    return `${Math.floor(diffDay / 365)}년 전`;
  }

  if (diffDay <= 0) return "오늘";
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`;
  return `${Math.floor(diffDay / 365)}년 전`;
}
