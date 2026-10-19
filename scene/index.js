import * as THREE from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/addons/renderers/CSS3DRenderer.js";

const stage = document.querySelector(".world-stage");
const portals = [...document.querySelectorAll("#portal-content .portal")];
const dots = [...document.querySelectorAll("#world-dots button")];
const positions = [
  [0, 0, 0],
  [900, 210, -950],
  [-960, 260, -1850],
  [790, -180, -2800],
  [-820, -80, -3750],
  [0, 140, -4700],
];
const rotations = [
  [-0.03, -0.05, 0],
  [0.03, -0.38, -0.03],
  [-0.04, 0.4, 0.02],
  [0.05, -0.34, 0.03],
  [0.02, 0.34, -0.02],
  [-0.02, 0.03, 0],
];

if (
  stage &&
  portals.length === positions.length &&
  dots.length === portals.length
) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    const cssRenderer = new CSS3DRenderer();
    const glRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    glRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    glRenderer.setClearColor(0x000000, 0);

    const glScene = new THREE.Scene();
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(420 * 3);
    for (let i = 0; i < starPositions.length; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 5000;
      starPositions[i + 1] = (Math.random() - 0.5) * 2600;
      starPositions[i + 2] = -Math.random() * 6500 + 900;
    }
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0x87a7bb,
        size: 4,
        transparent: true,
        opacity: 0.45,
      }),
    );
    glScene.add(stars);

    portals.forEach((portal, index) => {
      const iframe = portal.querySelector("iframe");
      iframe.addEventListener("load", () => portal.classList.add("is-loaded"));
      if (iframe.contentDocument?.readyState === "complete")
        portal.classList.add("is-loaded");

      const object = new CSS3DObject(portal);
      object.position.set(...positions[index]);
      object.rotation.set(...rotations[index]);
      object.scale.setScalar(0.86);
      scene.add(object);
    });

    stage.querySelector("#css3d").append(cssRenderer.domElement);
    stage.querySelector("#webgl").append(glRenderer.domElement);
    stage.classList.add("has-3d-scene");

    let activeIndex = 0;
    const targetCamera = new THREE.Vector3(0, 0, 1180);
    const targetLook = new THREE.Vector3(0, 0, 0);
    camera.position.copy(targetCamera);

    function selectWorld(index) {
      activeIndex = (index + portals.length) % portals.length;
      const portal = portals[activeIndex];
      targetCamera.set(
        ...positions[activeIndex].slice(0, 2),
        positions[activeIndex][2] + 1180,
      );
      targetLook.set(...positions[activeIndex]);

      stage.querySelector("#world-index").textContent =
        `${String(activeIndex + 1).padStart(2, "0")} / ${String(portals.length).padStart(2, "0")}`;
      stage.querySelector("#world-title").textContent =
        portal.querySelector("h3").textContent;
      stage.querySelector("#world-desc").textContent =
        portal.querySelector(".portal-caption p").textContent;

      portals.forEach((item, i) => {
        item.classList.toggle("is-active", i === activeIndex);
        item.querySelector("iframe").tabIndex = i === activeIndex ? 0 : -1;
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === activeIndex);
        dot.setAttribute("aria-pressed", String(i === activeIndex));
      });
    }

    dots.forEach((dot, index) =>
      dot.addEventListener("click", () => selectWorld(index)),
    );
    stage
      .querySelector("#prev")
      .addEventListener("click", () => selectWorld(activeIndex - 1));
    stage
      .querySelector("#next")
      .addEventListener("click", () => selectWorld(activeIndex + 1));
    window.addEventListener("keydown", (event) => {
      if (document.activeElement?.tagName === "IFRAME") return;
      if (event.key === "ArrowRight") selectWorld(activeIndex + 1);
      if (event.key === "ArrowLeft") selectWorld(activeIndex - 1);
    });

    let pointerX = 0;
    let pointerY = 0;
    stage.addEventListener("pointermove", (event) => {
      pointerX = event.clientX / innerWidth - 0.5;
      pointerY = event.clientY / innerHeight - 0.5;
    });

    function resize() {
      const rect = stage.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      cssRenderer.setSize(rect.width, rect.height);
      glRenderer.setSize(rect.width, rect.height);
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    function render() {
      camera.position.lerp(targetCamera, 0.055);
      const look = targetLook.clone();
      if (matchMedia("(pointer:fine)").matches) {
        look.x += pointerX * 35;
        look.y -= pointerY * 24;
      }
      camera.lookAt(look);
      stars.rotation.y += 0.00008;
      cssRenderer.render(scene, camera);
      glRenderer.render(glScene, camera);
      requestAnimationFrame(render);
    }
    render();
  } catch (error) {
    console.error("Не удалось запустить 3D-галерею:", error);
  }
}
