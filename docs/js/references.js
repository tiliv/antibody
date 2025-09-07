document.addEventListener('DOMContentLoaded', () => {
  const art = document.querySelector('article');
  if (!art) return;

  // 1) Load git map (paragraph index -> commit hash)
  let blame = {};
  try { blame = JSON.parse(document.getElementById('blame')?.textContent || "{}"); } catch {}

  // 2) Number paragraphs, attach ids + commit data + quote button
  const paras = [...art.querySelectorAll('p:has(~ hr)')].filter(p => p.textContent.trim().length);
  paras.forEach((p, i) => {
    const idx = i + 1;
    p.id = p.id || `p-${idx}`;
    p.dataset.paragraph = idx;
    const commit = blame.refdex[blame.paragraphs[i].ref];
    if (commit) p.dataset.commit = commit;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'qbtn';
    btn.title = 'Copy quote link';
    btn.textContent = '¶';
    btn.dataset.paragraph = idx;
    btn.addEventListener('click', () => copyQuoteLink(p, idx, commit));
    p.appendChild(btn);
    p.addEventListener('click', (e) => {
      p.classList.remove('is-quoted');
      e.stopPropagation(); // prevent article-level handlers
    });
  });

  // 3) Apply quoting UI via URL fragment or ?quote=
  const url = new URL(location.href);
  const targetHash = url.hash.replace('#','');
  const quoteParam = url.searchParams.get('quote');
  const targetId = quoteParam || targetHash;
  if (targetId && document.getElementById(targetId)) {
    markQuoted(document.getElementById(targetId));
    // ensure it’s scrolled into view only on hard loads
    if (!history.state?.softNav) document.getElementById(targetId).scrollIntoView({block:'center'});
  }

  // 4) Copy link builder
  async function copyQuoteLink(p, idx, commit) {
    const base = new URL(location.href);
    base.hash = `p-${idx}`;
    // preserve HEAD ref for historical stability
    if (commit) base.searchParams.set('ref', commit);
    base.searchParams.set('quote', `p-${idx}`);
    const permalink = base.toString();

    try {
      await navigator.clipboard.writeText(permalink);
      showTip('Quote link copied.');
      // reflect in URL without reload
      history.replaceState({softNav:true}, '', permalink);
      markQuoted(p);
    } catch {
      showTip('Copy failed—press ⌘/Ctrl+C.', 2400);
    }
  }

  function markQuoted(p){
    art.querySelectorAll('p.is-quoted').forEach(x => x.classList.remove('is-quoted'));
    p.classList.add('is-quoted');
    announce(`Paragraph ${p.dataset.paragraph} highlighted for quoting`);
  }

  // 5) Tooltip + live region
  let tipTimer;
  function showTip(msg, ms=1400){
    const tip = document.getElementById('quote-tip');
    if (!tip) return;
    tip.textContent = msg;
    tip.classList.add('show');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(()=> tip.classList.remove('show'), ms);
  }
  function announce(msg){
    const live = document.getElementById('quote-live');
    if (live){ live.textContent=''; setTimeout(()=> live.textContent = msg, 10); }
  }
});
