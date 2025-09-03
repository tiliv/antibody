(() => {
  document.addEventListener('DOMContentLoaded', () => {
    if (!!document.querySelector('#main')) {
      return;
    }
    const headers = document
      .querySelectorAll('h1, h2, h3, h4')
      ;

    for (const h of headers) {
      const top = parseInt(getComputedStyle(h).top, 0) || 0;
      const sentinel = document.createElement('span');
      sentinel.style.cssText = 'display:block; height:1px; margin-top:-1px;';
      h.parentNode.insertBefore(sentinel, h);

      new IntersectionObserver(([entry]) => {
        const r = h.getBoundingClientRect();
        h.classList.toggle('is-sticky', (
          r.top < window.innerHeight
          && !entry.isIntersecting
        ));
      }, {
        root: null, rootMargin: `-${top}px 0px 0px 0px`, threshold: 0,
      }).observe(sentinel);

      h.addEventListener('click', () => {
        if (location.hash !== `#${h.id}`) {
          history.pushState(null, '', `#${h.id}`);
        }
        // scroll to, but use previous element for position anchor
        const r = h.previousElementSibling.getBoundingClientRect();
        window.scrollBy({ top: r.top - top - 50, left: 0, behavior: 'smooth' });
      });
    }
  });

})();
