/** Make it harder for scrapers to get my email */
document.addEventListener('DOMContentLoaded', function () {
  // obfuscate the email address
  // var user = 'abhiram.tadepalli.7+portfolio'.split('').reverse().join('');
  // var domain = 'gmail.com'.split('').reverse().join('');
  // var element = document.getElementById('email-address');
  // element.addEventListener('click', function(e) { // don't add the email to the href attr, launch it onClick
  //     e.preventDefault();
  //     var email = user.split('').reverse().join('') + '@' + domain.split('').reverse().join(''); // reassemble the email address
  //     window.open('mailto:' + email, '_blank'); // open the mailto link in a new tab
  //   });

  /** Left Sidebar Dynamic Highlighting */
  const sections = document.querySelectorAll('section');
  const nav_section_titles = document.querySelectorAll('.nav-sidebar-item');
  const home_section_ids = ["../../#intro-section", "../../#experience-section", "/blog"];

  nav_section_titles.forEach((navItem, index) => {
      navItem.addEventListener('click', () => {
        window.location.href = home_section_ids[index];
      });
  });
  
function updateSidebarPosition(isBlog = false) {
    nav_section_titles.forEach((section, index) => {
      if (index != nav_section_titles.length - 1)
      {
        nav_section_titles[index].classList.remove('active');
      }
      else {
        nav_section_titles[index].classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => updateSidebarPosition(true));
  window.addEventListener('resize', () => updateSidebarPosition(true));
  updateSidebarPosition(true); // first time

  /** Mobile Navbar */
  const hamburger = document.getElementById('mobile-nav-button');
  const navMenu = document.getElementById('mobile-nav-menu');

  hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Update aria-expanded for accessibility
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
  });
});