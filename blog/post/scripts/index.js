/** Make it harder for scrapers to get my email */
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

  /** Left Sidebar Dynamic Highlighting */
  const sections = document.querySelectorAll('section');
  const nav_section_titles = document.querySelectorAll('.nav-sidebar-item');
  const home_section_ids = ["../../#intro-section", "../../#experience-section", "/blog"];

  nav_section_titles.forEach((navItem, index) => {
    if (index == nav_section_titles.length - 1) { // blog
      navItem.addEventListener('click', () => {
        sections[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    else {
      navItem.addEventListener('click', () => {
        window.location.href = home_section_ids[index];
      });
    }
  });
  
function updateSidebarPosition(isBlog = false) {
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      // console.log(rect);
      // console.log(window.innerHeight);
      if (
        (!isBlog && (rect.bottom < window.innerHeight / 3 || rect.top > window.innerHeight / 3)) // check if section is out of focus
        || (isBlog && index != nav_section_titles.length - 1) // but if blog is clicked, deactivate all others
      ) {
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
});