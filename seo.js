(function() {
  function upsertMeta(name, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }
  function upsertOg(prop, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", prop);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }
  function upsertCanonical(href) {
    if (!href) return;
    let el = document.head.querySelector("link[rel='canonical']");
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }
  function set({ title, description, canonical, robots, ogImage }) {
    if (title) {
      document.title = title;
      upsertOg("og:title", title);
      upsertMeta("twitter:title", title);
    }
    if (description) {
      upsertMeta("description", description);
      upsertOg("og:description", description);
      upsertMeta("twitter:description", description);
    }
    if (robots) upsertMeta("robots", robots);
    if (canonical) {
      upsertCanonical(canonical);
      upsertOg("og:url", canonical);
    }
    if (ogImage) {
      upsertOg("og:image", ogImage);
      upsertMeta("twitter:image", ogImage);
    }
  }
  window.LP_SEO = { set };
})();
