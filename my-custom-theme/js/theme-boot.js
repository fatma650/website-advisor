/**
 * WordPress theme bootstrap: prefix relative asset paths with the theme URI.
 */
(() => {
  const uri = (window.ADVISOR_THEME && window.ADVISOR_THEME.uri) || '';
  if (!uri) {
    return;
  }

  const imageKeys = new Set(['src', 'heroImage', 'boardImage', 'logo']);

  const prefix = (src) => {
    if (!src || typeof src !== 'string') {
      return src;
    }
    if (/^(https?:|data:|blob:)/i.test(src)) {
      return src;
    }
    if (src.indexOf(uri) === 0) {
      return src;
    }
    if (src.indexOf('/assets/') === 0) {
      return uri + src;
    }
    if (src.indexOf('assets/') === 0) {
      return uri + '/' + src;
    }
    return src;
  };

  const walk = (value) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    Object.keys(value).forEach((key) => {
      if (imageKeys.has(key) && typeof value[key] === 'string') {
        value[key] = prefix(value[key]);
      } else if (typeof value[key] === 'object') {
        walk(value[key]);
      }
    });
  };

  if (Array.isArray(window.ADVISOR_PROJECTS)) {
    walk(window.ADVISOR_PROJECTS);
  }
  if (Array.isArray(window.ADVISOR_CLIENTS)) {
    walk(window.ADVISOR_CLIENTS);
  }
})();
