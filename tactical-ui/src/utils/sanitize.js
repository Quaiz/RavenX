import DOMPurify from 'dompurify';

/**
 * Sanitize inline HTML generated from markdown-lite formatters before rendering.
 * Strips scripts, event handlers, and unsafe tags/attributes to prevent XSS.
 */
export const sanitizeHtml = (dirtyHtml) => {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'code', 'br', 'span'],
    ALLOWED_ATTR: ['class'],
  });
};
