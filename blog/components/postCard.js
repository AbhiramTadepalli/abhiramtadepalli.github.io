class PostCard extends HTMLElement {

    connectedCallback() {
        // attributes
        const key = this.getAttribute('key');
        const title = this.getAttribute('title');
        const affiliation = this.getAttribute('org');
        //categories, like frontend, but also hackathons vs personal (can use org affiliation)
        const snippet = this.getAttribute('snippet');
        const tags = this.getAttribute('tags');
        const date = this.getAttribute('date');
        this.render(key, title, affiliation, snippet, tags, date);
    }

    render(key, title, affiliation, snippet, tags, date) {
      this.innerHTML = `
        <link rel="stylesheet" href="styles/components/postCard.css">
        <div class="post-card" onclick="window.location.href='/blog/post/${key}'">
          <div class="post-header flex-container-row">
            <div class="post-affiliation">${affiliation}</div>
            <div class="post-date">${date}</div>
          </div>
          <h3 class="post-title">${title}</h3>
          <p class="post-snippet">${snippet}</p>
          <!-- <div class="flex-container-row post-tags">${getTagsFromList(tags)}</div> -->
        </div>
      `;
    }
  }

  function getTagsFromList(tags)
  {
    return tags != '' ? tags.split(", ").map((value) => `<li class="tag">` + (getTagIcon(value) || value) + `</li>`).join("\n") : ``;
  }

  function getTagIcon(tag)
  {
    switch (tag) {
      case "C++" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "CSS" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "HTML" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "Java" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "JavaScript" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "NextJS" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "Python" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "ReactJS" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "UIKit" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "Tailwind CSS" : return `<img class="icon" src="/assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      default : return ``;
    }
  }

  function getTagIconAddress(tag)
  {
    switch (tag) {
      case "C++" : return `c++-icon.svg`;
      case "CSS" : return `css-icon.svg`;
      case "HTML" : return `html-icon.svg`;
      case "Java" : return `java-icon.svg`;
      case "JavaScript" : return `javascript-icon.svg`;
      case "NextJS" : return `nextjs-icon.svg`;
      case "Python" : return `python-icon.svg`;
      case "ReactJS" : return `reactjs-icon.svg`;
      case "UIKit" : return `swift-icon.svg`;
      case "Tailwind CSS" : return `tailwindcss-icon.svg`;
      default : return ``;
    }
  }

  customElements.define('post-card', PostCard);