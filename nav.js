/* AXIS — site navigation. External (no inline handlers) so a strict CSP can be applied. */
(function () {
  var btn = document.querySelector('.hamburger');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
      setOpen(false);
    }
  });

  // Close on Escape, return focus to the toggle
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && nav.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });

  // Close after choosing a destination
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  // Reset state when returning to desktop widths
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      if (window.innerWidth > 768) setOpen(false);
    }, 120);
  });
})();
