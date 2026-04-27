export async function fetchPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Fakescope-Bot/1.0 (Educational Fact-Checking)",
      },
    });

    if (!response.ok) return "";

    const html = await response.text();

    const cleanText = html
      .replace(/<(script|style|noscript|nav|header|footer|aside)[^>]*>[\s\S]*?<\/\1>/gim, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleanText;
  } catch (error) {
    console.error(`Failed to fetch content for ${url}:`, error);
    return "";
  }
}
