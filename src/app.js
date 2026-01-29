function handleSubmit(event) {
  event.preventDefault();
  alert('문의가 접수되었습니다. 감사합니다!');
  event.target.reset();
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
