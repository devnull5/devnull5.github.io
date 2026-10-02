// Stillstack Labs — shared site behaviour
(() => {
  document.documentElement.classList.add('js');

  // ── mobile nav ────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    const setOpen = open => {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  // ── reveal on scroll ──────────────────────────────────────
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('in'));
  }

  // ── footer year ───────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // ── AJAX forms (Formspree) ────────────────────────────────
  // Falls back to a normal POST if JS is off.
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    const status = form.querySelector('.form-status');
    const button = form.querySelector('[type="submit"]');
    const label  = button ? button.innerHTML : '';

    const show = (kind, html) => {
      status.className = 'form-status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
      status.innerHTML = html;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // custom check: at least one box ticked in a required checkbox group
      const group = form.querySelector('[data-require-one]');
      if (group && !group.querySelector('input:checked')) {
        show('err', 'Pick at least one app to hear about.');
        return;
      }

      form.classList.add('is-sending');
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }
      status.className = 'form-status';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.querySelectorAll('input:not([type=hidden]):not([type=checkbox]), textarea').forEach(i => { i.value = ''; });
        form.querySelectorAll('input[type=checkbox]').forEach(i => { i.checked = false; });
        show('ok', form.dataset.success || '✓ Sent — thanks!');
      } catch (err) {
        show('err', 'Something went wrong sending that. Please try again in a moment.');
      } finally {
        form.classList.remove('is-sending');
        if (button) { button.disabled = false; button.innerHTML = label; }
      }
    });
  });
})();
