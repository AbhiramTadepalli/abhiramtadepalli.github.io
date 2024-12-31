class ProjectCard extends HTMLElement {

    connectedCallback() {
        // attributes
        const previewLink = this.getAttribute('preview');
        const name = this.getAttribute('name');
        const affiliation = this.getAttribute('org');
        const role = this.getAttribute('role');
        //categories, like frontend, but also hackathons vs personal (can use org affiliation)
        const snippet = this.getAttribute('snippet');
        const description = this.getAttribute('description');
        const projectLink = this.getAttribute('link');
        const githubLink = this.getAttribute('github');
        const skillTags = this.getAttribute('tags');
        const startDate = this.getAttribute('start');
        const endDate = this.getAttribute('end');
        this.render(previewLink, name, affiliation, role, snippet, description, projectLink, githubLink, skillTags);
    }

    render(previewLink, name, affiliation, role, snippet, description, projectLink, githubLink, skillTags) {
      this.innerHTML = `
        <link rel="stylesheet" href="styles/components/projectCard.css">
        <div id="project-card">
          <div id="project-preview">${false ? previewLink : ''}</div>
          <h3 id="project-title">${name}</h3>
          <div id="project-affiliation">${affiliation} ${role != '' ? '– ' + role : ''}</div>
          <div class="flex-container-row" id="project-tags">${getTagsFromList(skillTags)}</div>
          <p id="project-description">${snippet}</p>
          <ul class="flex-container-row" id="project-links">
              ${projectLink != '' ? `<a href=${projectLink} target="_blank" rel="noopener"><i class="material-icons">link</i></a>` : ``}
              ${githubLink != '' ? `<a href=${githubLink} target="_blank" rel="noopener"><img class="icon-logo" src="assets/brand-icons/github-logo.svg" alt="Link to my Github"></a>` : ``}
          </ul>
        </div>
      `;
    }
  }

  function getTagsFromList(tags)
  {
    return tags != '' ? tags.split(",").map((value) => `<div class="tag">${value}</div>`).join("\n") : ``;
  }

  customElements.define('project-card', ProjectCard);