document.documentElement.classList.add("js-enhanced");

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle("revealed", entry.isIntersecting);
    }
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll("section:not(.hero), .steps article, .feature-grid article")
  .forEach((element) => observer.observe(element));

const copyrightYear = document.querySelector("#copyright-year");
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

const sceneScript = document.createElement("script");
sceneScript.src = new URL("./scene/scene.js", document.baseURI).href;
document.body.append(sceneScript);
