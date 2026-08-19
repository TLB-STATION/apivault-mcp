import { describe, expect, it } from "vitest";
import { getMcpServerIcons } from "./mcp-icons";

describe("mcp-icons", () => {
  it("includes public HTTPS PNG icons with embedded data URI fallbacks", () => {
    const icons = getMcpServerIcons();
    expect(icons.length).toBeGreaterThanOrEqual(4);
    expect(icons[0]?.mimeType).toBe("image/png");
    expect(icons[0]?.src).toContain("/mcp-icon-48.png");
    expect(icons.some((icon) => icon.src.startsWith("data:image/png;base64,"))).toBe(true);
  });

  it("includes themed SVG fallbacks", () => {
    const icons = getMcpServerIcons();
    expect(icons.some((icon) => icon.theme === "light")).toBe(true);
    expect(icons.some((icon) => icon.theme === "dark")).toBe(true);
  });
});
