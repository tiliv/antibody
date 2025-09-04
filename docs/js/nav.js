(() => {
  document.addEventListener('DOMContentLoaded', () => {
    if (!!document.querySelector('#main')) {
      return;
    }
    const headers = document.querySelectorAll('h1, h2, h3, h4');

    for (const h of headers) {
      const top = parseInt(getComputedStyle(h).top, 0) || 0;
      const sentinel = document.createElement('span');
      sentinel.className = `sticky-sentinel ${h.tagName.toLowerCase()}`;
      h.parentNode.insertBefore(sentinel, h);

      new IntersectionObserver(([entry]) => {
        const r = h.getBoundingClientRect();
        h.classList.toggle('is-sticky', (
          r.top < window.innerHeight // don't analyze lower headers
          && !entry.isIntersecting
        ));
      }, {
        // Keep top-margin off of exact value, to avoid frequent toggling
        root: null, rootMargin: `-${top + 10}px 0px 0px 0px`, threshold: 0,
      }).observe(sentinel);

      h.addEventListener('click', () => {
        goSmooth(h);
      });

      document.querySelectorAll(`a[href="#${h.id}"]`).forEach((a) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          goSmooth(h);
        });
      });

      function goSmooth(h) {
        if (location.hash !== `#${h.id}`) {
          history.pushState(null, '', `#${h.id}`);
        }

        // scroll to, but use the sticky-sentinel we seeded for position
        const r = h.previousElementSibling.getBoundingClientRect();
        window.scrollBy({
          top: r.top - top - 150, left: 0, behavior: 'smooth'
        });
      }
    }
  });

})();
