// Make it harder for scrapers to get my email
document.addEventListener('DOMContentLoaded', function () {
  // obfuscate the email address
  var user = 'abhiram.tadepalli.7+portfolio'.split('').reverse().join('');
  var domain = 'gmail.com'.split('').reverse().join('');
  var element = document.getElementById('email-address');
  element.addEventListener('click', function(e) { // don't add the email to the href attr, launch it onClick
      e.preventDefault();
      var email = user.split('').reverse().join('') + '@' + domain.split('').reverse().join(''); // reassemble the email address
      window.open('mailto:' + email, '_blank'); // open the mailto link in a new tab
    });

  const sections = document.querySelectorAll('section');
  const nav_section_titles = document.querySelectorAll('.nav-sidebar-item');

  nav_section_titles.forEach((navItem, index) => {
    navItem.addEventListener('click', () => {
      sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  
  function updateSidebarPosition() {
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      // console.log(rect);
      // console.log(window.innerHeight);
      if (rect.bottom < window.innerHeight / 3 || rect.top > window.innerHeight / 3) {
        nav_section_titles[index].classList.remove('active');
      }
      else {
        nav_section_titles[index].classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateSidebarPosition);
  window.addEventListener('resize', updateSidebarPosition);
  updateSidebarPosition(); // first time

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const sidebars = document.querySelectorAll('.sidebar-container');
  function updateStickySidebar() {
    sidebars.forEach((sidebar, index) => {
      const rect = sections[index].getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const idealTop = window.innerHeight / 2 - sidebar.offsetHeight / 2;
      const idealBottom = window.innerHeight / 2 + sidebar.offsetHeight / 2

      if (rect.top >= idealTop && rect.top <= window.innerHeight) {
        //move sidebar up/down with rect (pinned to top)
        sidebar.style.top = '0vh';
      }
      else if (rect.top <= idealTop && rect.bottom >= idealBottom) {
        //sticky sidebar in ideal position
        sidebar.style.top = `${idealTop}px`;
      }
      else if (rect.bottom <= idealBottom && rect.bottom >= 0) { // I don't think this case is needed actually. Because of the `else` after case 1 covers it?
        //move sidebar up/down with rect (pinned to bottom)
        sidebar.style.top = '100vh'
      }
      else {
        //stay in current state
      }
    });
  }

  window.addEventListener('scroll', updateStickySidebar);
  window.addEventListener('resize', updateStickySidebar);
  updateStickySidebar(); // first time
});