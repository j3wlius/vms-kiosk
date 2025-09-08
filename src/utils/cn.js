/**
 * Utility function to merge class names
 * Similar to clsx but simpler for our needs
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

