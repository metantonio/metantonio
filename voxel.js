import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Scene setup
const container = document.getElementById('voxel-container');
const scene = new THREE.Scene();
// Transparent background to blend with the site
scene.background = null; 

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 40);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x58a6ff, 2, 50);
pointLight.position.set(-10, 10, 10);
scene.add(pointLight);

// Voxel setup
const voxelSize = 1;
const gap = 0.1;
const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
const material = new THREE.MeshStandardMaterial({ 
    color: 0x58a6ff,
    roughness: 0.4,
    metalness: 0.7
});

// Letter definitions (5x7 grid approx)
const letters = {
    M: [
        "10001",
        "11011",
        "10101",
        "10001",
        "10001",
        "10001",
        "10001"
    ],
    E: [
        "11111",
        "10000",
        "10000",
        "11110",
        "10000",
        "10000",
        "11111"
    ],
    T: [
        "11111",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100"
    ],
    A: [
        "01110",
        "10001",
        "10001",
        "11111",
        "10001",
        "10001",
        "10001"
    ],
    N: [
        "10001",
        "11001",
        "10101",
        "10011",
        "10001",
        "10001",
        "10001"
    ],
    O: [
        "01110",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110"
    ],
    I: [
        "111",
        "010",
        "010",
        "010",
        "010",
        "010",
        "111"
    ]
};

const word = "METANTONIO";
const group = new THREE.Group();

let currentX = 0;

// Build the word
for (const char of word) {
    const pattern = letters[char];
    if (!pattern) continue;

    const letterGroup = new THREE.Group();
    const height = pattern.length;
    const width = pattern[0].length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (pattern[y][x] === '1') {
                const mesh = new THREE.Mesh(geometry, material);
                // Invert Y so top row is at top
                mesh.position.set(
                    x * (voxelSize + gap), 
                    (height - y - 1) * (voxelSize + gap), 
                    0
                );
                letterGroup.add(mesh);
            }
        }
    }

    letterGroup.position.x = currentX;
    group.add(letterGroup);
    
    // Advance X position for next letter
    currentX += (width * (voxelSize + gap)) + 1.5; // 1.5 is spacing between letters
}

// Center the group
const box = new THREE.Box3().setFromObject(group);
const center = box.getCenter(new THREE.Vector3());
group.position.sub(center);

scene.add(group);

// Animation variables
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

// Mouse interaction
document.addEventListener('mousemove', (event) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    targetRotationY = mouseX;
    targetRotationX = mouseY;

    // Smooth rotation
    group.rotation.y += 0.05 * (targetRotationY - group.rotation.y);
    group.rotation.x += 0.05 * (targetRotationX - group.rotation.x);
    
    // Idle animation
    group.rotation.y += 0.002;
    
    // Float effect
    group.position.y = Math.sin(Date.now() * 0.001) * 0.5;

    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
