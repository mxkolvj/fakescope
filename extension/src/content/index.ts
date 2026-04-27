import { Readability } from '@mozilla/readability';

function extract(): { title: string; text: string } {
  try {
    const doc = document.cloneNode(true) as Document;
    const reader = new Readability(doc);
    const article = reader.parse();
    if (article?.textContent) {
      return {
        title: article.title || document.title,
        text: article.textContent.trim().slice(0, 8000),
      };
    }
  } catch {
    // fall through to selector-based extraction
  }

  const candidate =
    document.querySelector('article') ||
    document.querySelector('main') ||
    document.querySelector('.post-content') ||
    document.body;
  return {
    title: document.title,
    text: (candidate?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 8000),
  };
}

(window as unknown as { __fakescope_extract: () => { title: string; text: string } }).__fakescope_extract = extract;
