document.querySelectorAll('input[type="checkbox"]').forEach( el => {
  el.addEventListener( 'click', () => document.body.classList.toggle( el.name, el.checked ) );
});