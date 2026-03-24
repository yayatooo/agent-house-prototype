type LogLevel = "info" | "success" | "warn" | "error" | "step";

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  info: "\x1b[36m",    // cyan
  success: "\x1b[32m", // green
  warn: "\x1b[33m",    // yellow
  error: "\x1b[31m",   // red
  step: "\x1b[35m",    // magenta
};

const ICONS: Record<LogLevel, string> = {
  info: "ℹ",
  success: "✔",
  warn: "⚠",
  error: "✖",
  step: "→",
};

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function log(level: LogLevel, message: string, detail?: string): void {
  const color = COLORS[level];
  const icon = ICONS[level];
  const ts = `${COLORS.dim}[${timestamp()}]${COLORS.reset}`;
  const prefix = `${color}${COLORS.bold}${icon} ${level.toUpperCase()}${COLORS.reset}`;

  console.log(`${ts} ${prefix} ${message}`);
  if (detail) {
    console.log(`${COLORS.dim}         ${detail}${COLORS.reset}`);
  }
}

export const logger = {
  info: (message: string, detail?: string) => log("info", message, detail),
  success: (message: string, detail?: string) => log("success", message, detail),
  warn: (message: string, detail?: string) => log("warn", message, detail),
  error: (message: string, detail?: string) => log("error", message, detail),
  step: (message: string, detail?: string) => log("step", message, detail),
  divider: () => console.log(`${COLORS.dim}${"─".repeat(60)}${COLORS.reset}`),
};
