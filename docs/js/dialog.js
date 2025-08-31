const DIALOG = {
  id: 'full-image',
  dlg: null,
  figure: null,
  bind(figure) {
    const { dlg, open } = DIALOG;
    figure
      .querySelector('img')
      .addEventListener('click', () => open(dlg, figure))
      ;
  },
  open(dlg, figure) {
    const img = figure.querySelector('img');

    dlg.querySelector('nav h1').textContent = img.src.split('/').pop();
    dlg.querySelector('form').append(
      Object.assign(document.createElement('p'), {
        innerHTML: figure.querySelector('figcaption').innerHTML,
      }),
      Object.assign(document.createElement('img'), {
        src: img.dataset.full || img.src,
        alt: img.alt,
      }),
    );

    dlg.showModal();
    document.body.setAttribute('inert', '');
  },
  close(dlg) {
    document.body.removeAttribute('inert');
    dlg.close();
    dlg.querySelectorAll('img, p').forEach((el) => el.remove());
    DIALOG.figure = null;
  },
};

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    init_dialogs();
    document.querySelectorAll('figure img').forEach(init_hovers);
  });

  function init_dialogs() {
    DIALOG.dlg = document.getElementById(DIALOG.id);
    const { dlg, bind, close } = DIALOG;
    document.querySelectorAll('figure').forEach(bind);
    dlg.addEventListener('close', () => close(dlg));
    dlg.addEventListener('click', (e) => (
      !dlg.querySelector('form').contains(e.target)
    ) && close(dlg));
  }

  function init_hovers(img) {
    img.addEventListener('mousemove', e => {
      const {
        left, top, width, height
      } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    });
    img.addEventListener('mouseenter', () => {
      const w = img.naturalWidth / img.clientWidth;
      const h = img.naturalHeight / img.clientHeight;
      const scale = Math.min(2, Math.max(w, h));
      img.style.transform = `scale(${scale})`;
    });
    img.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  }
})();
