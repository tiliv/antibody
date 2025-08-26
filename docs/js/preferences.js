const PREFERENCES = (() => {
  const use = {};
  const cache = {};
  const key = (scope, name) => `${scope}/${name}`;

  function retain(scope, name, value, { force=true }={}) {
    const k = key(scope, name);
    if (force || !(localStorage[k] ?? null)) {
      localStorage[k] = JSON.stringify(value)
    }
    document.documentElement.dataset[name] = localStorage[k];

    // Publish an accessor for static access
    use[k] ?? (use[k] = (on) => {
      cache[k] = retain(scope, name, on);
      document.documentElement.dataset[name] = `${on}`;
      return on;
    });

    return JSON.parse(localStorage[k]);
  }

  function retrieve(scope, name, defaultValue) {
    const k = key(scope, name);
    try {
      return JSON.parse(localStorage[k] ?? JSON.stringify(defaultValue));
    } catch (e) {
      localStorage[k] = JSON.stringify(defaultValue);
      return defaultValue;
    }
  }

  return (scope) => ({
    key,
    retain: (k, v, opts) => retain(scope, k, v, opts),
    retrieve: (k, v, opts) => retrieve(scope, k, v, opts),
    use: name => use[key(scope, name)],
    get: name => cache[key(scope, name)],
  })
})();

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById("preferences-toggle");
  const form = document.getElementById("preferences");
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    form.hidden = expanded;
  });

  for (const input of form.elements) {
    input.checked = PREFERENCES(form.dataset.scope).retrieve(input.name);
  }
});
