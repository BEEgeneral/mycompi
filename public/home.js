// Home page interactions
document.addEventListener('DOMContentLoaded', function() {
  // FAQ Accordion
  document.querySelectorAll('.faq-q').forEach(function(q) {
    q.addEventListener('click', function() {
      q.parentElement.classList.toggle('open');
    });
  });
});
