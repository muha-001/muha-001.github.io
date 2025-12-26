/*!
 * CipherVault 3D Secure Scene Manager (ES6 Module Version - Updated for window.THREE)
 * Version: 5.2.3 - Security Enhanced & ES6 Compatible
 *
 * This file manages the 3D scene using Three.js.
 * It is now compatible with ES6 Modules and uses window.THREE.
 * Updated to use post-processing wrappers for ES6 compatibility.
 */

// ⛔ حذف هذا السطر:
// import * as THREE from './three.module.js';

// ⭐ استخدام window.THREE (مُعرف من index.html)
const THREE = window.THREE;

// ⭐ استيراد مكونات Three.js الأخرى (يجب أن تكون متوفرة كـ ES6 Modules أيضًا)
// نحتاج إلى ملفات وهمية (Wrappers) لجعل OrbitControls و PostProcessing تعمل
import { OrbitControls } from './orbit-controls-wrapper.js';

// ⭐ استيراد Post-Processing من ملفات Wrapper جديدة (مُنشأة حديثًا)
import { EffectComposer, RenderPass, ShaderPass } from './postprocessing-wrapper.js';

// ⭐ استيراد Shaders من ملف Wrapper جديد (مُنشأ حديثًا)
import { CopyShader } from './shader-wrapper.js';

// ⭐ (اختياري) استيراد Bloom من ملف Wrapper جديد (مُنشأ حديثًا)
// import { UnrealBloomPass } from './bloom-wrapper.js'; // قم بإزالة التعليق إذا كنت تستخدم bloom

// ============================================================================
// THREE.JS SECURE SCENE CONFIGURATION - ENHANCED FOR SECURITY APPLICATIONS
// ============================================================================
const THREE_SCENE_CONFIG = {
// Scene settings - optimized for dark security theme
scene: {
background: 0x050510,
fog: {
color: 0x050510,
near: 1,
far: 1000
}
},
// Camera settings - optimized for surveillance view
camera: {
fov: 75,
near: 0.1,
far: 10000,
position: { x: 0, y: 0, z: 25 }
},
// Renderer settings - optimized for performance and compatibility
renderer: {
antialias: true,
alpha: true,
powerPreference: 'high-performance',
preserveDrawingBuffer: true,
shadowMap: {
enabled: false, // Disabled for better performance
type: THREE ? (THREE.PCFSoftShadowMap || 2) : 2
},
precision: 'highp',
failIfMajorPerformanceCaveat: false // Allow on lower-end devices
},
// Lighting settings - optimized for security monitoring
lighting: {
ambient: {
color: 0x00aaff,
intensity: 0.15
},
directional: {
color: 0x00d4ff,
intensity: 0.6,
position: { x: 10, y: 10, z: 5 }
},
pointLights: [
{
color: 0xff0080,
intensity: 0.3,
distance: 100,
position: { x: -20, y: 10, z: 10 }
},
{
color: 0x00ff88,
intensity: 0.3,
distance: 100,
position: { x: 20, y: -10, z: -10 }
}
]
},
// Particle system - OPTIMIZED for memory management
particles: {
count: 800, // Reduced for better performance
size: 0.08,
opacity: 0.7,
colors: {
min: 0x0088ff,
max: 0x00ffff
},
speed: 0.0008,
spread: 120
},
// Floating cubes - OPTIMIZED for memory management
cubes: {
count: 12, // Reduced for better performance
size: 0.8,
colors: [
0x00d4ff,
0xff0080,
0x00ff88,
0xffaa00,
0xaa00ff
],
opacity: 0.5,
rotationSpeed: { min: 0.008, max: 0.02 },
floatSpeed: { min: 0.001, max: 0.008 },
spread: 40
},
// Animation settings - with fallback support
animation: {
enabled: true,
frameRate: 60,
motionBlur: false,
bloomEffect: false, // Disabled by default for compatibility
bloom: {
strength: 0.4,
radius: 0.3,
threshold: 0.9
}
},
// Performance settings - ENHANCED for large files (10GB)
performance: {
maxFPS: 60,
adaptiveQuality: true,
dynamicScaling: true,
lowPowerMode: false,
memoryThreshold: 0.75, // Lowered for large file handling
fpsThreshold: 25,
autoCleanup: true,
cleanupInterval: 45000, // Increased for 10GB file operations
memoryCheckInterval: 10000, // Check memory more frequently
gcPressure: 0.8 // Trigger GC at 80% memory usage
},
// Security settings
security: {
tamperDetection: true,
encryptionVisualization: true,
gpuIsolation: false,
memoryEncryption: false
},
// Cross-browser compatibility
compatibility: {
useLegacyWebGL: true, // Fallback for older browsers
disableAdvancedEffects: false, // Auto-detect
canvasFallback: true, // Use 2D canvas if WebGL fails
mobileOptimizations: true
}
}
;
// ============================================================================
// THREE.JS COMPATIBILITY LAYER - FIXED FOR MISSING CLASSES (Updated to remove fallbacks for imported classes)
// ============================================================================
// Create safe reference to THREE
const SecureTHREE = (function() {
// If THREE is not available, create minimal stub
if (typeof THREE === 'undefined') {
console.warn('THREE.js not loaded. Creating minimal compatibility layer.');
return {
WebGLRenderer: function() {
console.warn('Using THREE.js compatibility layer');
return {
setSize: function() {},
setPixelRatio: function() {},
setClearColor: function() {},
render: function() {},
dispose: function() {},
domElement: document.createElement('canvas')
};
},
Scene: function() { return { add: function() {}, remove: function() {}, traverse: function() {} }; },
PerspectiveCamera: function() { return { position: { set: function() {} }, lookAt: function() {} }; },
Color: function() { return {}; },
REVISION: 'compatibility-layer'
};
}
// Check for required post-processing classes
const missingClasses = [];
// Define CopyShader if missing (ERROR 15 FIX - REMOVED as it's now imported)
// Define UnrealBloomPass placeholder if missing (ERROR 16 FIX - REMOVED as it's now imported)
// Define EffectComposer if missing (REMOVED as it's now imported)
// Define RenderPass if missing (REMOVED as it's now imported)
// Define ShaderPass if missing (REMOVED as it's now imported)
// If any classes were missing, log them
if (missingClasses.length > 0) {
console.log('Missing Three.js classes auto-created:', missingClasses);
}
return THREE;
})();
// ============================================================================
// THREE.JS SECURE SCENE MANAGER - FIXED VERSION (ES6 Compatible - Updated for window.THREE)
// ============================================================================

// ⭐ تعديل لجعله كلاس قابل للتصدير
export class ThreeSceneManager {
constructor(threeLib) {
// ⭐ استخدام THREE من المعلمة أو من window
this.THREE = threeLib || window.THREE || SecureTHREE;
// Three.js components
this.scene = null;
this.camera = null;
this.renderer = null;
this.controls = null;
this.composer = null; // Will now be initialized using imported EffectComposer
// Scene objects
this.particles = [];
this.cubes = [];
this.lights = [];
this.effects = {};
// Animation state
this.animationId = null;
this.lastFrameTime = 0;
this.frameCount = 0;
this.fps = 60;
// Performance monitoring - ENHANCED
this.performance = {
frameTimes: [],
memoryUsage: [],
lastMemoryCheck: 0,
lastCleanup: 0,
cleanupCount: 0,
monitorInterval: null,
cleanupInterval: null,
isLowEndDevice: this.detectLowEndDevice()
};
// Mouse interaction
this.mouse = {
x: 0,
y: 0,
normalizedX: 0,
normalizedY: 0,
isMoving: false,
lastMoveTime: 0
};
// Configuration
this.config = JSON.parse(JSON.stringify(THREE_SCENE_CONFIG));
// Error tracking
this.errors = [];
// Initialize
this.init();
}
// ============================================================================
// INITIALIZATION - WITH ENHANCED ERROR HANDLING (Updated for window.THREE)
// ============================================================================
/**
* Initialize Three.js scene with enhanced error handling
*/
init() {
console.log('🚀 Initializing Secure Three.js Scene Manager (ES6 Module - Updated for window.THREE)...');
try {
// Check if Three.js is available
if (typeof this.THREE === 'undefined' || this.THREE.REVISION === 'compatibility-layer') {
console.warn('Three.js not properly loaded. Using minimal mode.');
this.createCanvasFallback();
return;
}
// Check WebGL support
if (!this.checkWebGLSupport()) {
console.warn('WebGL not supported. Using canvas fallback.');
this.createCanvasFallback();
return;
}
// Check browser capabilities
const capabilities = this.getBrowserCapabilities();
console.log('📊 Browser Capabilities:', capabilities);
// Adjust config based on capabilities
this.adaptConfigForBrowser(capabilities);
// Create scene components
this.createScene();
this.createCamera();
this.createRenderer();
// Create scene elements
this.createLighting();
this.createParticles();
this.createFloatingCubes();
// Create effects (with fallback) - FIXED ERROR 14, 16 (Updated)
// ⭐ التحقق من دعم Post-Processing باستخدام الملفات المُستوردة
if (this.config.animation.bloomEffect && this.checkPostProcessingSupport()) {
this.createEffects();
} else {
console.log('Post-processing effects disabled for compatibility');
this.config.animation.bloomEffect = false;
}
// Setup controls
this.setupControls();
// Setup event listeners
this.setupEventListeners();
// Start animation loop
this.startAnimation();
// Start performance monitoring
this.startPerformanceMonitoring();
// Start auto cleanup if enabled
if (this.config.performance.autoCleanup) {
this.startAutoCleanup();
}
console.log('✅ Three.js scene initialized successfully (ES6 Module - Updated for window.THREE)');
console.log(` - Particles: ${this.config.particles.count}`);
console.log(` - Cubes: ${this.config.cubes.count}`);
console.log(` - Effects: ${this.config.animation.bloomEffect ? 'Enabled' : 'Disabled'}`);
// Dispatch initialization event
this.dispatchEvent('threejs:initialized', {
timestamp: Date.now(),
version: '5.2.3',
capabilities: capabilities
});
} catch (error) {
console.error('❌ Failed to initialize Three.js scene (ES6 Module - Updated for window.THREE):', error);
this.errors.push(error);
this.handleInitError(error);
this.createCanvasFallback();
}
}
/**
* Detect low-end device
*/
detectLowEndDevice() {
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const cores = navigator.hardwareConcurrency || 2;
const memory = performance.memory ? performance.memory.jsHeapSizeLimit : 1073741824; // Default 1GB
return isMobile || cores <= 2 || memory < 1073741824; // < 1GB
}
/**
* Get browser capabilities
*/
getBrowserCapabilities() {
const isChrome = /Chrome/.test(navigator.userAgent);
const isFirefox = typeof InstallTrigger !== 'undefined';
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isEdge = /Edg/.test(navigator.userAgent);
const isIE = /*@cc_on!@*/false || !!document.documentMode;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
return {
browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : isIE ? 'IE' : 'Unknown',
isMobile: isMobile,
cores: navigator.hardwareConcurrency || 'unknown',
webgl: this.checkWebGLSupport(),
webgl2: this.checkWebGL2Support(),
lowEndDevice: this.performance.isLowEndDevice
};
}
/**
* Adapt configuration for browser capabilities
*/
adaptConfigForBrowser(capabilities) {
// Reduce particles on mobile/low-end
if (capabilities.lowEndDevice || capabilities.isMobile) {
this.config.particles.count = Math.floor(this.config.particles.count * 0.5);
this.config.cubes.count = Math.floor(this.config.cubes.count * 0.6);
this.config.animation.bloomEffect = false;
this.config.renderer.antialias = false;
}
// Disable effects on Safari (common WebGL issues)
if (capabilities.browser === 'Safari') {
this.config.animation.bloomEffect = false;
}
// Reduce for IE/Edge Legacy
if (capabilities.browser === 'IE' || (capabilities.browser === 'Edge' && !capabilities.webgl2)) {
this.config.particles.count = 300;
this.config.cubes.count = 6;
this.config.animation.bloomEffect = false;
}
}
/**
* Check WebGL support
*/
checkWebGLSupport() {
try {
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
return gl instanceof WebGLRenderingContext;
} catch (e) {
return false;
}
}
/**
* Check WebGL2 support
*/
checkWebGL2Support() {
try {
const canvas = document.createElement('canvas');
return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
} catch (e) {
return false;
}
}
/**
* Check post-processing support - FIXED ERROR 14 (Updated for window.THREE)
* Now checks for imported classes instead of THREE global ones
*/
checkPostProcessingSupport() {
// ⭐ استخدام الفئات المُستوردة مباشرة
const requiredClasses = [EffectComposer, RenderPass, CopyShader]; // ShaderPass is also imported
const missingClasses = [];
requiredClasses.forEach(cls => {
if (typeof cls === 'undefined') {
missingClasses.push(cls.name || 'UnknownClass');
}
});
// ⭐ (اختياري) التحقق من UnrealBloomPass إذا كنت تستخدمه
/*
if (this.config.animation.bloomEffect) {
if (typeof UnrealBloomPass === 'undefined') {
missingClasses.push('UnrealBloomPass');
}
}
*/
if (missingClasses.length > 0) {
console.warn('Some post-processing classes not available:', missingClasses);
return false;
}
return true;
}
/**
* Create Three.js scene
*/
createScene() {
this.scene = new this.THREE.Scene();
this.scene.background = new this.THREE.Color(this.config.scene.background);
// Add fog for depth (security theme)
this.scene.fog = new this.THREE.Fog(
this.config.scene.fog.color,
this.config.scene.fog.near,
this.config.scene.fog.far
);
}
/**
* Create camera
*/
createCamera() {
const aspectRatio = window.innerWidth / window.innerHeight;
this.camera = new this.THREE.PerspectiveCamera(
this.config.camera.fov,
aspectRatio,
this.config.camera.near,
this.config.camera.far
);
this.camera.position.set(
this.config.camera.position.x,
this.config.camera.position.y,
this.config.camera.position.z
);
this.camera.lookAt(0, 0, 0);
// Store original position for reset
this.camera.userData = {
originalPosition: this.camera.position.clone(),
originalRotation: this.camera.rotation.clone()
};
}
/**
* Create renderer with security optimizations - MODIFIED FOR SAFARI & TOUCH INTERACTION
*/
createRenderer() {
try {
// Create WebGL renderer with security settings
const rendererOptions = {
antialias: this.config.renderer.antialias,
alpha: this.config.renderer.alpha,
powerPreference: this.config.renderer.powerPreference,
preserveDrawingBuffer: this.config.renderer.preserveDrawingBuffer,
precision: this.config.renderer.precision,
failIfMajorPerformanceCaveat: this.config.renderer.failIfMajorPerformanceCaveat,
stencil: false,
depth: true
};
// Use WebGL 1.0 for compatibility
this.renderer = new this.THREE.WebGLRenderer(rendererOptions);
// Configure renderer
this.renderer.setSize(window.innerWidth, window.innerHeight);
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
this.renderer.shadowMap.enabled = this.config.renderer.shadowMap.enabled;
// Use available shadow map type
if (this.THREE.PCFSoftShadowMap) {
this.renderer.shadowMap.type = this.THREE.PCFSoftShadowMap;
}
// Encoding and tone mapping (if available)
if (this.THREE.sRGBEncoding) {
this.renderer.outputEncoding = this.THREE.sRGBEncoding;
}
if (this.THREE.ACESFilmicToneMapping) {
this.renderer.toneMapping = this.THREE.ACESFilmicToneMapping;
this.renderer.toneMappingExposure = 0.9;
}
// Add renderer to DOM
const container = document.getElementById('threejs-container');
if (container) {
// Clear any existing canvas
while (container.firstChild) {
container.removeChild(container.firstChild);
}
container.appendChild(this.renderer.domElement);
} else {
console.warn('Three.js container not found, creating fallback container');
this.createFallbackContainer();
}

// ⭐ تحسينات لـ Safari وتعطيل التفاعل مع اللمس
if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
this.renderer.context = this.renderer.getContext();
this.renderer.context.getExtension('WEBGL_lose_context');
}

// ⭐ منع التفاعل مع اللمس على عنصر العارض
this.renderer.domElement.style.touchAction = 'none';
this.renderer.domElement.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
this.renderer.domElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
this.renderer.domElement.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });

// Set renderer ID for debugging
this.renderer.domElement.id = 'ciphervault-3d-renderer';
// Security: Disable context menu
this.renderer.domElement.oncontextmenu = (e) => e.preventDefault();
} catch (error) {
console.error('Failed to create WebGL renderer:', error);
this.createCanvasFallback();
}
}
/**
* Create fallback container
*/
createFallbackContainer() {
const container = document.createElement('div');
container.id = 'threejs-container';
container.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
z-index: -1;
pointer-events: none;
opacity: 0.15;
`;
document.body.appendChild(container);
if (this.renderer && this.renderer.domElement) {
container.appendChild(this.renderer.domElement);
}
}
/**
* Create canvas fallback - FIXED for when WebGL fails
*/
createCanvasFallback() {
console.log('🔄 Creating canvas fallback for 3D visualization');
const container = document.getElementById('threejs-container') || this.createFallbackContainer();
// Clear container
while (container.firstChild) {
container.removeChild(container.firstChild);
}
// Create 2D canvas with security visualization
const canvas = document.createElement('canvas');
canvas.id = 'ciphervault-canvas-fallback';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.cssText = `
width: 100%;
height: 100%;
background: transparent;
`;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');
// Create simple animated encryption visualization
let animationFrame = null;
let time = 0;
const animate2D = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height);
// Draw encryption patterns
ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
ctx.lineWidth = 1;
for (let i = 0; i < 50; i++) {
const x = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * canvas.width;
const y = (Math.cos(time * 0.001 + i * 0.5) * 0.5 + 0.5) * canvas.height;
ctx.beginPath();
ctx.moveTo(x, 0);
ctx.lineTo(x, canvas.height);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(0, y);
ctx.lineTo(canvas.width, y);
ctx.stroke();
}
// Draw floating particles
ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
for (let i = 0; i < 20; i++) {
const size = Math.sin(time * 0.001 + i) * 5 + 10;
const x = (Math.sin(time * 0.0005 + i) * 0.5 + 0.5) * canvas.width;
const y = (Math.cos(time * 0.0007 + i * 0.7) * 0.5 + 0.5) * canvas.height;
ctx.beginPath();
ctx.arc(x, y, size, 0, Math.PI * 2);
ctx.fill();
}
time += 16; // ~60fps
animationFrame = requestAnimationFrame(animate2D);
};
animate2D();
// Store for cleanup
this.canvasFallback = {
canvas: canvas,
animationFrame: animationFrame,
ctx: ctx
};
// Dispatch event for fallback mode
this.dispatchEvent('threejs:fallback', {
reason: 'WebGL not available',
timestamp: Date.now()
});
}
/**
* Create lighting
*/
createLighting() {
// Ambient light
const ambientLight = new this.THREE.AmbientLight(
this.config.lighting.ambient.color,
this.config.lighting.ambient.intensity
);
this.scene.add(ambientLight);
this.lights.push(ambientLight);
// Directional light (main light)
const directionalLight = new this.THREE.DirectionalLight(
this.config.lighting.directional.color,
this.config.lighting.directional.intensity
);
directionalLight.position.set(
this.config.lighting.directional.position.x,
this.config.lighting.directional.position.y,
this.config.lighting.directional.position.z
);
this.scene.add(directionalLight);
this.lights.push(directionalLight);
// Point lights
this.config.lighting.pointLights.forEach((lightConfig, index) => {
const pointLight = new this.THREE.PointLight(
lightConfig.color,
lightConfig.intensity,
lightConfig.distance
);
pointLight.position.set(
lightConfig.position.x,
lightConfig.position.y,
lightConfig.position.z
);
pointLight.userData = { originalIntensity: lightConfig.intensity };
this.scene.add(pointLight);
this.lights.push(pointLight);
});
}
/**
* Create particle system with memory optimization
*/
createParticles() {
const particleCount = this.config.particles.count;
// Use BufferGeometry for better performance
const geometry = new this.THREE.BufferGeometry();
// Create positions
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
// Color helper
const colorMin = new this.THREE.Color(this.config.particles.colors.min);
const colorMax = new this.THREE.Color(this.config.particles.colors.max);
for (let i = 0; i < particleCount; i++) {
// Position in a sphere
const radius = Math.random() * this.config.particles.spread;
const theta = Math.random() * Math.PI * 2;
const phi = Math.acos((Math.random() * 2) - 1);
positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
positions[i * 3 + 2] = radius * Math.cos(phi);
// Interpolate color
const t = Math.random();
const color = new this.THREE.Color();
color.r = colorMin.r + (colorMax.r - colorMin.r) * t;
color.g = colorMin.g + (colorMax.g - colorMin.g) * t;
color.b = colorMin.b + (colorMax.b - colorMin.b) * t;
colors[i * 3] = color.r;
colors[i * 3 + 1] = color.g;
colors[i * 3 + 2] = color.b;
// Random size
sizes[i] = Math.random() * 0.04 + this.config.particles.size;
}
// Set attributes
geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new this.THREE.BufferAttribute(sizes, 1));
// Material with performance optimizations
const material = new this.THREE.PointsMaterial({
size: this.config.particles.size,
vertexColors: true,
transparent: true,
opacity: this.config.particles.opacity,
blending: this.THREE.AdditiveBlending,
depthWrite: false,
sizeAttenuation: true
});
// Create particle system
const particleSystem = new this.THREE.Points(geometry, material);
particleSystem.frustumCulled = false;
// Store animation data
particleSystem.userData = {
originalPositions: positions.slice(),
speeds: Array.from({ length: particleCount }, () => ({
x: (Math.random() - 0.5) * this.config.particles.speed,
y: (Math.random() - 0.5) * this.config.particles.speed,
z: (Math.random() - 0.5) * this.config.particles.speed
})),
timeOffset: Math.random() * Math.PI * 2
};
this.scene.add(particleSystem);
this.particles.push(particleSystem);
}
/**
* Create floating cubes with performance optimization
*/
createFloatingCubes() {
const geometry = new this.THREE.BoxGeometry(
this.config.cubes.size,
this.config.cubes.size,
this.config.cubes.size
);
for (let i = 0; i < this.config.cubes.count; i++) {
const colorIndex = i % this.config.cubes.colors.length;
const color = this.config.cubes.colors[colorIndex];
const material = new this.THREE.MeshPhongMaterial({
color: color,
transparent: true,
opacity: this.config.cubes.opacity,
shininess: 80,
specular: 0x111111
});
const cube = new this.THREE.Mesh(geometry, material);
// Position
cube.position.set(
(Math.random() - 0.5) * this.config.cubes.spread * 2,
(Math.random() - 0.5) * this.config.cubes.spread * 2,
(Math.random() - 0.5) * this.config.cubes.spread * 2
);
// Random rotation
cube.rotation.set(
Math.random() * Math.PI,
Math.random() * Math.PI,
Math.random() * Math.PI
);
// Animation data
cube.userData = {
originalPosition: cube.position.clone(),
rotationSpeed: {
x: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) +
this.config.cubes.rotationSpeed.min,
y: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) +
this.config.cubes.rotationSpeed.min,
z: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) +
this.config.cubes.rotationSpeed.min
},
floatSpeed: Math.random() * (this.config.cubes.floatSpeed.max - this.config.cubes.floatSpeed.min) +
this.config.cubes.floatSpeed.min,
floatOffset: Math.random() * Math.PI * 2,
pulseSpeed: Math.random() * 0.008 + 0.004,
pulseOffset: Math.random() * Math.PI * 2
};
this.scene.add(cube);
this.cubes.push(cube);
}
}
/**
* Create post-processing effects with fallback - FIXED ERROR 14, 15, 16 (Updated for window.THREE)
*/
async createEffects() {
// Skip if not supported
if (!this.checkPostProcessingSupport()) {
console.warn('Post-processing not supported, using basic rendering');
this.config.animation.bloomEffect = false;
return;
}
try {
// ⭐ استخدام EffectComposer المُستورد
this.composer = new EffectComposer(this.renderer); // ⭐ تم التغيير هنا
// ⭐ استخدام RenderPass المُستورد
const renderPass = new RenderPass(this.scene, this.camera); // ⭐ تم التغيير هنا
this.composer.addPass(renderPass);
// ⭐ (اختياري) استخدام UnrealBloomPass المُستورد إذا كنت تستخدم bloom
/*
if (this.config.animation.bloomEffect) {
const bloomPass = new UnrealBloomPass(
new this.THREE.Vector2(window.innerWidth, window.innerHeight),
this.config.animation.bloom.strength,
this.config.animation.bloom.radius,
this.config.animation.bloom.threshold
);
this.composer.addPass(bloomPass);
this.effects.bloom = bloomPass;
console.log('Bloom effect initialized');
}
*/
// ⭐ استخدام ShaderPass المُستورد (مثال)
// const shaderPass = new ShaderPass(CopyShader); // يمكنك استخدامه لاحقًا
// this.composer.addPass(shaderPass);

this.effects.composer = this.composer;
} catch (error) {
console.warn('Failed to create post-processing effects:', error);
this.composer = null;
this.effects = {};
this.config.animation.bloomEffect = false;
}
}
/**
* Setup orbit controls with fallback - MODIFIED TO DISABLE INTERACTION WITH MOVEMENT/TOUCH
*/
setupControls() {
if (typeof OrbitControls === 'undefined') { // ⭐ استخدام OrbitControls من الاستيراد
console.warn('OrbitControls not available, using basic interaction');
return;
}
try {
this.controls = new OrbitControls(this.camera, this.renderer.domElement); // ⭐ استخدام OrbitControls من الاستيراد

// ⭐ تعطيل التفاعل مع الحركة الجسدية أو اللمس (كما طلبت)
this.controls.enableDamping = true;
this.controls.dampingFactor = 0.05;
this.controls.rotateSpeed = 0.5;
this.controls.zoomSpeed = 0.8;
this.controls.panSpeed = 0.8;
this.controls.maxDistance = 100;
this.controls.minDistance = 5;

// ⭐ منع التفاعل مع الحركة الجسدية أو اللمس (كما طلبت)
this.controls.enableRotate = false; // تعطيل التدوير باللمس
this.controls.enablePan = false;    // تعطيل التحريك
this.controls.enableZoom = false;   // تعطيل التكبير (يمكنك تفعيله إذا أردت)

} catch (error) {
console.warn('Failed to setup OrbitControls:', error);
this.controls = null;
}
}
/**
* Setup event listeners - MODIFIED TO DISABLE DEVICE ORIENTATION INTERACTION
*/
setupEventListeners() {
// ⭐ منع التفاعل مع حركة الهاتف
this.deviceOrientationHandler = (e) => {
e.preventDefault();
};
window.addEventListener('deviceorientation', this.deviceOrientationHandler, { passive: false });

// Window resize with debouncing
this.resizeHandler = () => {
clearTimeout(this.resizeTimeout);
this.resizeTimeout = setTimeout(() => this.onWindowResize(), 250);
};
window.addEventListener('resize', this.resizeHandler);

// Mouse movement (normal interaction allowed)
this.mouseMoveHandler = (e) => this.onMouseMove(e);
window.addEventListener('mousemove', this.mouseMoveHandler);

this.mouseLeaveHandler = () => this.onMouseLeave();
window.addEventListener('mouseleave', this.mouseLeaveHandler);

// Visibility change
this.visibilityChangeHandler = () => this.onVisibilityChange();
document.addEventListener('visibilitychange', this.visibilityChangeHandler);
}
// ============================================================================
// ANIMATION LOOP - WITH PERFORMANCE OPTIMIZATIONS
// ============================================================================
/**
* Start animation loop
*/
startAnimation() {
if (!this.config.animation.enabled || this.canvasFallback) {
console.log('Animation disabled or fallback active');
return;
}
console.log('Starting optimized animation loop...');
this.lastFrameTime = performance.now();
this.animationId = requestAnimationFrame((time) => this.animate(time));
}
/**
* Animation loop with performance optimizations
*/
animate(currentTime) {
// Calculate delta time with clamping
let deltaTime = currentTime - this.lastFrameTime;
deltaTime = Math.min(deltaTime, 100);
this.lastFrameTime = currentTime;
// Update FPS calculation
this.updateFPS(currentTime);
// Update controls
if (this.controls) {
this.controls.update();
}
// Update mouse state
this.updateMouseState();
// Update scene elements
this.updateParticles(deltaTime);
this.updateCubes(deltaTime);
this.updateLighting(deltaTime);
// Update camera
if (!this.controls) {
this.updateCamera(deltaTime);
}
// Render
this.render();
// Performance monitoring
this.monitorPerformance(deltaTime);
// Continue animation
this.animationId = requestAnimationFrame((time) => this.animate(time));
}
/**
* Update FPS calculation
*/
updateFPS(currentTime) {
this.frameCount++;
if (currentTime > 1000) {
this.fps = Math.round((this.frameCount * 1000) / currentTime);
this.frameCount = 0;
// Store for performance monitoring
this.performance.frameTimes.push(1000 / this.fps);
if (this.performance.frameTimes.length > 60) {
this.performance.frameTimes.shift();
}
}
}
/**
* Update particles animation
*/
updateParticles(deltaTime) {
if (!this.particles.length) return;
const time = performance.now() * 0.001;
this.particles.forEach(particleSystem => {
const positions = particleSystem.geometry.attributes.position.array;
const originalPositions = particleSystem.userData.originalPositions;
const speeds = particleSystem.userData.speeds;
const timeOffset = particleSystem.userData.timeOffset;
for (let i = 0; i < positions.length; i += 3) {
const idx = i / 3;
const speed = speeds[idx];
const t = time + timeOffset + idx * 0.005;
positions[i] = originalPositions[i] +
Math.sin(t * 0.5) * 0.3 +
speed.x * t * 8;
positions[i + 1] = originalPositions[i + 1] +
Math.cos(t * 0.3) * 0.3 +
speed.y * t * 8;
positions[i + 2] = originalPositions[i + 2] +
Math.sin(t * 0.7) * 0.3 +
speed.z * t * 8;
}
particleSystem.geometry.attributes.position.needsUpdate = true;
});
}
/**
* Update cubes animation
*/
updateCubes(deltaTime) {
const time = performance.now() * 0.001;
const deltaFactor = deltaTime / 16;
this.cubes.forEach(cube => {
const data = cube.userData;
// Rotation
cube.rotation.x += data.rotationSpeed.x * deltaFactor;
cube.rotation.y += data.rotationSpeed.y * deltaFactor;
cube.rotation.z += data.rotationSpeed.z * deltaFactor;
// Floating motion
const floatT = time * data.floatSpeed + data.floatOffset;
cube.position.y = data.originalPosition.y + Math.sin(floatT) * 1.5;
// Pulsing scale
const pulse = Math.sin(time * data.pulseSpeed + data.pulseOffset) * 0.08 + 0.92;
cube.scale.setScalar(pulse);
// Update material
if (cube.material) {
cube.material.opacity = this.config.cubes.opacity * (0.9 + pulse * 0.1);
}
});
}
/**
* Update lighting
*/
updateLighting(deltaTime) {
const time = performance.now() * 0.001;
this.lights.forEach((light, index) => {
if (light.isPointLight && light.userData.originalIntensity) {
const intensity = light.userData.originalIntensity;
const pulse = Math.sin(time * 0.3 + index) * 0.15 + 0.85;
light.intensity = intensity * pulse;
}
});
}
/**
* Update camera based on mouse
*/
updateCamera(deltaTime) {
if (this.controls || !this.mouse.isMoving) return;
const targetX = this.mouse.normalizedX * 3;
const targetY = this.mouse.normalizedY * 2;
this.camera.position.x += (targetX - this.camera.position.x) * 0.03;
this.camera.position.y += (-targetY - this.camera.position.y) * 0.03;
this.camera.lookAt(0, 0, 0);
}
/**
* Update mouse state
*/
updateMouseState() {
const currentTime = performance.now();
const timeSinceMove = currentTime - this.mouse.lastMoveTime;
this.mouse.isMoving = timeSinceMove < 150;
this.mouse.normalizedX = (this.mouse.x / window.innerWidth) * 2 - 1;
this.mouse.normalizedY = (this.mouse.y / window.innerHeight) * 2 - 1;
}
/**
* Render scene
*/
render() {
try {
if (this.canvasFallback) return;
// ⭐ استخدام this.composer المُهيأ باستخدام ES6 imports
if (this.composer && this.config.animation.bloomEffect) {
this.composer.render();
} else {
this.renderer.render(this.scene, this.camera);
}
} catch (error) {
console.error('Render error:', error);
this.handleRenderError(error);
}
}
// ============================================================================
// EVENT HANDLERS
// ============================================================================
/**
* Handle window resize
*/
onWindowResize() {
// Update camera
if (this.camera) {
this.camera.aspect = window.innerWidth / window.innerHeight;
this.camera.updateProjectionMatrix();
}
// Update renderer
if (this.renderer) {
this.renderer.setSize(window.innerWidth, window.innerHeight);
}
// Update composer
if (this.composer) {
this.composer.setSize(window.innerWidth, window.innerHeight);
}
// Update canvas fallback
if (this.canvasFallback) {
this.canvasFallback.canvas.width = window.innerWidth;
this.canvasFallback.canvas.height = window.innerHeight;
}
this.dispatchEvent('threejs:resize', {
width: window.innerWidth,
height: window.innerHeight
});
}
/**
* Handle mouse movement
*/
onMouseMove(event) {
this.mouse.x = event.clientX;
this.mouse.y = event.clientY;
this.mouse.lastMoveTime = performance.now();
this.mouse.isMoving = true;
}
/**
* Handle mouse leave
*/
onMouseLeave() {
this.mouse.isMoving = false;
}
/**
* Handle visibility change
*/
onVisibilityChange() {
if (document.hidden) {
this.pauseAnimation();
} else {
this.resumeAnimation();
}
}
// ============================================================================
// PERFORMANCE MANAGEMENT - ENHANCED FOR 10GB FILES
// ============================================================================
/**
* Start performance monitoring
*/
startPerformanceMonitoring() {
// Memory monitoring
this.performance.monitorInterval = setInterval(() => {
this.checkMemoryUsage();
this.checkPerformance();
}, this.config.performance.memoryCheckInterval);
}
/**
* Start auto cleanup
*/
startAutoCleanup() {
this.performance.cleanupInterval = setInterval(() => {
if (this.config.performance.autoCleanup) {
this.autoCleanup();
}
}, this.config.performance.cleanupInterval);
}
/**
* Monitor performance
*/
monitorPerformance(deltaTime) {
// Track frame time
this.performance.frameTimes.push(deltaTime);
if (this.performance.frameTimes.length > 120) {
this.performance.frameTimes.shift();
}
// Adaptive quality adjustment
if (this.config.performance.adaptiveQuality && this.performance.frameTimes.length >= 30) {
this.adjustQualityBasedOnPerformance();
}
}
/**
* Check memory usage - OPTIMIZED FOR 10GB FILES
*/
checkMemoryUsage() {
if (!performance.memory) return;
const memory = performance.memory;
const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
const usedMB = memory.usedJSHeapSize / (1024 * 1024);
const totalMB = memory.totalJSHeapSize / (1024 * 1024);
this.performance.memoryUsage.push({
used: memory.usedJSHeapSize,
total: memory.totalJSHeapSize,
usage: usage,
usedMB: usedMB,
totalMB: totalMB,
timestamp: Date.now()
});
// Keep last 20 measurements
if (this.performance.memoryUsage.length > 20) {
this.performance.memoryUsage.shift();
}
// Check threshold - alert if memory usage is high
if (usage > this.config.performance.memoryThreshold) {
console.warn(`⚠️ High memory usage: ${Math.round(usage * 100)}% (${usedMB.toFixed(1)}MB/${totalMB.toFixed(1)}MB)`);
if (usage > this.config.performance.gcPressure) {
this.forceGarbageCollection();
}
this.reduceMemoryUsage();
}
}
/**
* Check performance and adjust
*/
checkPerformance() {
if (this.performance.frameTimes.length === 0) return;
const avgFrameTime = this.performance.frameTimes.reduce((a, b) => a + b, 0) /
this.performance.frameTimes.length;
const currentFPS = 1000 / avgFrameTime;
// Log performance every minute
if (Date.now() - this.performance.lastMemoryCheck > 60000) {
console.log(`📊 Performance - FPS: ${Math.round(currentFPS)}, Frame: ${avgFrameTime.toFixed(2)}ms`);
this.performance.lastMemoryCheck = Date.now();
}
// Auto-adjust for low FPS
if (currentFPS < this.config.performance.fpsThreshold) {
this.autoReduceQuality();
}
}
/**
* Adjust quality based on performance
*/
adjustQualityBasedOnPerformance() {
const avgFrameTime = this.performance.frameTimes.reduce((a, b) => a + b, 0) /
this.performance.frameTimes.length;
const currentFPS = 1000 / avgFrameTime;
if (currentFPS < 20) {
// Extreme reduction
this.emergencyReduction();
} else if (currentFPS < this.config.performance.fpsThreshold) {
// Moderate reduction
this.reduceQuality();
} else if (currentFPS > 50 && !this.performance.isLowEndDevice) {
// Increase quality if possible
this.increaseQuality();
}
}
/**
* Emergency reduction for very low FPS
*/
emergencyReduction() {
console.log('🚨 Emergency performance reduction');
// Stop animation
this.pauseAnimation();
// Remove all cubes
this.cubes.forEach(cube => {
this.scene.remove(cube);
this.disposeObject(cube);
});
this.cubes = [];
// Reduce particles to minimum
if (this.particles.length > 0) {
this.adjustParticleCount(100);
}
// Disable all effects
this.config.animation.bloomEffect = false;
if (this.composer) {
this.composer = null;
this.effects = {};
}
// Resume after reduction
setTimeout(() => this.resumeAnimation(), 100);
}
/**
* Reduce quality
*/
reduceQuality() {
// Reduce particle count
if (this.particles.length > 0) {
const particleSystem = this.particles[0];
const currentCount = particleSystem.geometry.attributes.position.count;
const targetCount = Math.max(200, Math.floor(currentCount * 0.7));
if (targetCount < currentCount) {
this.adjustParticleCount(targetCount);
}
}
// Remove some cubes
if (this.cubes.length > 6) {
const cubesToRemove = this.cubes.splice(6);
cubesToRemove.forEach(cube => {
this.scene.remove(cube);
this.disposeObject(cube);
});
}
}
/**
* Auto reduce quality
*/
autoReduceQuality() {
console.log('🔧 Auto-reducing quality for better performance');
// Reduce particles
if (this.particles.length > 0) {
const particleSystem = this.particles[0];
const currentCount = particleSystem.geometry.attributes.position.count;
const targetCount = Math.max(300, Math.floor(currentCount * 0.6));
if (targetCount < currentCount) {
this.adjustParticleCount(targetCount);
console.log(`Reduced particles to ${targetCount}`);
}
}
// Reduce cubes
if (this.cubes.length > 4) {
const cubesToRemove = this.cubes.splice(4);
cubesToRemove.forEach(cube => {
this.scene.remove(cube);
this.disposeObject(cube);
});
console.log(`Reduced cubes to ${this.cubes.length}`);
}
// Disable bloom
if (this.config.animation.bloomEffect) {
this.config.animation.bloomEffect = false;
if (this.composer) {
this.composer = null;
this.effects = {};
}
console.log('Disabled bloom effect');
}
}
/**
* Increase quality
*/
increaseQuality() {
// Increase particle count
if (this.particles.length > 0) {
const particleSystem = this.particles[0];
const currentCount = particleSystem.geometry.attributes.position.count;
const targetCount = Math.min(
THREE_SCENE_CONFIG.particles.count,
Math.floor(currentCount * 1.2)
);
if (targetCount > currentCount) {
this.adjustParticleCount(targetCount);
}
}
// Add cubes if needed
if (this.cubes.length < THREE_SCENE_CONFIG.cubes.count) {
const cubesToAdd = THREE_SCENE_CONFIG.cubes.count - this.cubes.length;
this.addCubes(cubesToAdd);
}
}
/**
* Adjust particle count
*/
adjustParticleCount(targetCount) {
if (!this.particles.length) return;
const particleSystem = this.particles[0];
const currentCount = particleSystem.geometry.attributes.position.count;
if (targetCount === currentCount) return;
// Create new arrays
const newPositions = new Float32Array(targetCount * 3);
const newColors = new Float32Array(targetCount * 3);
const newSizes = new Float32Array(targetCount);
// Copy existing particles
const copyCount = Math.min(currentCount, targetCount);
const oldPositions = particleSystem.geometry.attributes.position.array;
const oldColors = particleSystem.geometry.attributes.color.array;
for (let i = 0; i < copyCount; i++) {
newPositions[i * 3] = oldPositions[i * 3];
newPositions[i * 3 + 1] = oldPositions[i * 3 + 1];
newPositions[i * 3 + 2] = oldPositions[i * 3 + 2];
newColors[i * 3] = oldColors[i * 3];
newColors[i * 3 + 1] = oldColors[i * 3 + 1];
newColors[i * 3 + 2] = oldColors[i * 3 + 2];
newSizes[i] = particleSystem.geometry.attributes.size?.array[i] || this.config.particles.size;
}
// Add new particles if needed
for (let i = copyCount; i < targetCount; i++) {
const radius = Math.random() * this.config.particles.spread;
const theta = Math.random() * Math.PI * 2;
const phi = Math.acos((Math.random() * 2) - 1);
newPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
newPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
newPositions[i * 3 + 2] = radius * Math.cos(phi);
const color = new this.THREE.Color(
Math.random() * (this.config.particles.colors.max - this.config.particles.colors.min) +
this.config.particles.colors.min
);
newColors[i * 3] = color.r;
newColors[i * 3 + 1] = color.g;
newColors[i * 3 + 2] = color.b;
newSizes[i] = Math.random() * 0.04 + this.config.particles.size;
}
// Update geometry
particleSystem.geometry.setAttribute('position', new this.THREE.BufferAttribute(newPositions, 3));
particleSystem.geometry.setAttribute('color', new this.THREE.BufferAttribute(newColors, 3));
particleSystem.geometry.setAttribute('size', new this.THREE.BufferAttribute(newSizes, 1));
// Update user data
particleSystem.userData.originalPositions = newPositions.slice();
particleSystem.userData.speeds = Array.from({ length: targetCount }, () => ({
x: (Math.random() - 0.5) * this.config.particles.speed,
y: (Math.random() - 0.5) * this.config.particles.speed,
z: (Math.random() - 0.5) * this.config.particles.speed
}));
}
/**
* Add cubes
*/
addCubes(count) {
const geometry = new this.THREE.BoxGeometry(
this.config.cubes.size,
this.config.cubes.size,
this.config.cubes.size
);
for (let i = 0; i < count; i++) {
const colorIndex = (this.cubes.length + i) % this.config.cubes.colors.length;
const color = this.config.cubes.colors[colorIndex];
const material = new this.THREE.MeshPhongMaterial({
color: color,
transparent: true,
opacity: this.config.cubes.opacity,
shininess: 80,
specular: 0x111111
});
const cube = new this.THREE.Mesh(geometry, material);
cube.position.set(
(Math.random() - 0.5) * this.config.cubes.spread * 2,
(Math.random() - 0.5) * this.config.cubes.spread * 2,
(Math.random() - 0.5) * this.config.cubes.spread * 2
);
cube.rotation.set(
Math.random() * Math.PI,
Math.random() * Math.PI,
Math.random() * Math.PI
);
cube.userData = {
originalPosition: cube.position.clone(),
rotationSpeed: {
x: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) +
this.config.cubes.rotationSpeed.min,
y: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) +
this.config.cubes.rotationSpeed.min,
z: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) +
this.config.cubes.rotationSpeed.min
},
floatSpeed: Math.random() * (this.config.cubes.floatSpeed.max - this.config.cubes.floatSpeed.min) +
this.config.cubes.floatSpeed.min,
floatOffset: Math.random() * Math.PI * 2,
pulseSpeed: Math.random() * 0.008 + 0.004,
pulseOffset: Math.random() * Math.PI * 2
};
this.scene.add(cube);
this.cubes.push(cube);
}
}
/**
* Reduce memory usage - OPTIMIZED FOR 10GB FILE OPERATIONS
*/
reduceMemoryUsage() {
console.log('🧹 Applying memory optimization for large file operations...');
// Reduce particles aggressively
if (this.particles.length > 0) {
const particleSystem = this.particles[0];
const currentCount = particleSystem.geometry.attributes.position.count;
const targetCount = Math.max(150, Math.floor(currentCount * 0.4));
if (targetCount < currentCount) {
this.adjustParticleCount(targetCount);
}
}
// Remove most cubes
if (this.cubes.length > 2) {
const cubesToKeep = this.cubes.slice(0, 2);
const cubesToRemove = this.cubes.slice(2);
cubesToRemove.forEach(cube => {
this.scene.remove(cube);
this.disposeObject(cube);
});
this.cubes = cubesToKeep;
}
// Dispose of unused resources
this.cleanupUnusedResources();
// Force garbage collection if available
this.forceGarbageCollection();
console.log('✅ Memory optimization completed');
this.dispatchEvent('threejs:memory:optimized', {
timestamp: Date.now(),
particles: this.particles.length > 0 ? this.particles[0].geometry.attributes.position.count : 0,
cubes: this.cubes.length
});
}
/**
* Force garbage collection
*/
forceGarbageCollection() {
if (window.gc) {
try {
window.gc();
console.log('🗑️  Forced garbage collection');
} catch (e) {
// Ignore
}
} else if (window.GCController) {
window.GCController.collect();
console.log('🗑️  GCController collection triggered');
}
}
/**
* Auto cleanup of unused resources
*/
autoCleanup() {
this.performance.cleanupCount++;
this.performance.lastCleanup = Date.now();
// Clean up unused geometries and materials
this.cleanupUnusedResources();
// Clear Three.js internal caches
if (this.THREE.Cache) {
this.THREE.Cache.clear();
}
// Clear WebGL context caches to prevent memory leaks on long-running sessions
if (this.renderer) {
const gl = this.renderer.getContext();
if (gl && gl.flush) {
gl.flush();
}
}
console.log(`🧼 Auto cleanup #${this.performance.cleanupCount} completed`);
}
/**
* Cleanup unused resources
*/
cleanupUnusedResources() {
let geometriesCleaned = 0;
let materialsCleaned = 0;
// Clean up geometries that are no longer in use
this.scene.traverse((object) => {
if (object.geometry && !object.visible) {
object.geometry.dispose();
geometriesCleaned++;
}
if (object.material) {
if (Array.isArray(object.material)) {
object.material.forEach(material => {
if (material.map) material.map.dispose();
material.dispose();
materialsCleaned++;
});
} else {
if (object.material.map) object.material.map.dispose();
object.material.dispose();
}
}
});
if (geometriesCleaned > 0 || materialsCleaned > 0) {
console.log(`🧽 Cleanup - Geometries: ${geometriesCleaned}, Materials: ${materialsCleaned}`);
}
}
/**
* Dispose of an object and its resources
*/
disposeObject(object) {
if (object.geometry) {
object.geometry.dispose();
}
if (object.material) {
if (Array.isArray(object.material)) {
object.material.forEach(material => material.dispose());
} else {
object.material.dispose();
}
}
if (object.texture) {
object.texture.dispose();
}
}
// ============================================================================
// PUBLIC METHODS - ENHANCED
// ============================================================================
/**
* Pause animation
*/
pauseAnimation() {
if (this.animationId) {
cancelAnimationFrame(this.animationId);
this.animationId = null;
}
if (this.canvasFallback && this.canvasFallback.animationFrame) {
cancelAnimationFrame(this.canvasFallback.animationFrame);
this.canvasFallback.animationFrame = null;
}
this.dispatchEvent('threejs:animation:paused');
}
/**
* Resume animation
*/
resumeAnimation() {
if (!this.animationId && this.config.animation.enabled && !this.canvasFallback) {
this.lastFrameTime = performance.now();
this.animationId = requestAnimationFrame((time) => this.animate(time));
}
if (this.canvasFallback && !this.canvasFallback.animationFrame) {
const animate2D = () => {
if (!this.canvasFallback) return;
const ctx = this.canvasFallback.ctx;
const canvas = this.canvasFallback.canvas;
const time = performance.now();
ctx.clearRect(0, 0, canvas.width, canvas.height);
// Draw encryption patterns
ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
ctx.lineWidth = 1;
for (let i = 0; i < 50; i++) {
const x = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * canvas.width;
const y = (Math.cos(time * 0.001 + i * 0.5) * 0.5 + 0.5) * canvas.height;
ctx.beginPath();
ctx.moveTo(x, 0);
ctx.lineTo(x, canvas.height);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(0, y);
ctx.lineTo(canvas.width, y);
ctx.stroke();
}
this.canvasFallback.animationFrame = requestAnimationFrame(animate2D);
};
this.canvasFallback.animationFrame = requestAnimationFrame(animate2D);
}
this.dispatchEvent('threejs:animation:resumed');
}
}
/**
* Toggle performance mode
*/
togglePerformanceMode() {
this.config.performance.lowPowerMode = !this.config.performance.lowPowerMode;
if (this.config.performance.lowPowerMode) {
this.enableLowPowerMode();
} else {
this.disableLowPowerMode();
}
}
/**
* Enable low power mode
*/
enableLowPowerMode() {
console.log('🔋 Enabling low power mode...');
this.renderer.setPixelRatio(1);
this.config.particles.count = 300;
this.config.cubes.count = 6;
this.config.animation.bloomEffect = false;
this.config.renderer.shadowMap.enabled = false;
this.renderer.shadowMap.enabled = false;
this.recreateSceneWithCurrentConfig();
this.dispatchEvent('threejs:mode:lowpower');
}
/**
* Disable low power mode
*/
disableLowPowerMode() {
console.log('⚡ Disabling low power mode...');
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
this.config.particles.count = THREE_SCENE_CONFIG.particles.count;
this.config.cubes.count = THREE_SCENE_CONFIG.cubes.count;
this.config.animation.bloomEffect = THREE_SCENE_CONFIG.animation.bloomEffect;
this.config.renderer.shadowMap.enabled = true;
this.renderer.shadowMap.enabled = true;
this.recreateSceneWithCurrentConfig();
this.dispatchEvent('threejs:mode:normal');
}
/**
* Toggle bloom effect
*/
toggleBloomEffect() {
if (!this.checkPostProcessingSupport()) {
console.warn('Post-processing not supported, cannot enable bloom');
return;
}
this.config.animation.bloomEffect = !this.config.animation.bloomEffect;
if (this.config.animation.bloomEffect) {
this.createEffects();
console.log('🌟 Bloom effect enabled');
} else {
if (this.composer) {
this.composer.dispose();
this.composer = null;
this.effects = {};
}
console.log('🌟 Bloom effect disabled');
}
}
/**
* Reset scene to initial state
*/
resetScene() {
console.log('🔄 Resetting scene...');
this.cleanup();
// Reset configuration
this.config = JSON.parse(JSON.stringify(THREE_SCENE_CONFIG));
// Reinitialize
this.init();
this.dispatchEvent('threejs:scene:reset');
}
/**
* Recreate scene with current configuration
*/
recreateSceneWithCurrentConfig() {
this.cleanupSceneObjects();
this.createLighting();
this.createParticles();
this.createFloatingCubes();
if (this.config.animation.bloomEffect && this.checkPostProcessingSupport()) {
this.createEffects();
}
console.log('🔄 Scene recreated with current configuration');
}
/**
* Cleanup scene objects
*/
cleanupSceneObjects() {
while (this.scene.children.length > 0) {
const object = this.scene.children[0];
this.scene.remove(object);
this.disposeObject(object);
}
this.particles = [];
this.cubes = [];
this.lights = [];
this.effects = {};
}
/**
* Handle initialization error
*/
handleInitError(error) {
console.error('❌ Three.js initialization error (ES6 Module - Updated for window.THREE):', error);
this.errors.push(error);
const errorDisplay = this.createErrorDisplay(error);
this.dispatchEvent('threejs:error', {
error: error.message,
timestamp: Date.now()
});
return errorDisplay;
}
/**
* Handle render error
*/
handleRenderError(error) {
console.error('🎨 Render error (ES6 Module - Updated for window.THREE):', error);
try {
if (this.renderer) {
this.renderer.forceContextLoss();
this.renderer.dispose();
}
// Fall back to canvas
this.createCanvasFallback();
} catch (recoveryError) {
console.error('🔄 Failed to recover from render error (ES6 Module - Updated for window.THREE):', recoveryError);
this.createCanvasFallback();
}
}
/**
* Create error display
*/
createErrorDisplay(error) {
const container = document.getElementById('threejs-container');
if (!container) return null;
const errorDiv = document.createElement('div');
errorDiv.className = 'threejs-error-display';
errorDiv.style.cssText = `
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
text-align: center;
color: #ff4757;
padding: 20px;
background: rgba(5, 5, 16, 0.95);
border-radius: 10px;
border: 2px solid #ff4757;
max-width: 400px;
z-index: 1000;
font-family: system-ui, -apple-system, sans-serif;
`;
errorDiv.innerHTML = `
<div style="margin-bottom: 15px; font-size: 40px;">⚠️</div>
<h3 style="margin: 0 0 10px 0; color: #ff4757;">3D Visualization Error</h3>
<p style="margin: 0 0 15px 0; font-size: 14px; color: #8a8aa3;">
${error.message || 'Unknown error occurred'}
</p>
<p style="font-size: 12px; color: #4a4a6a; margin: 0;">
Note: Encryption and file operations continue to work normally.
</p>
`;
container.appendChild(errorDiv);
return errorDiv;
}
/**
* Dispatch custom event
*/
dispatchEvent(name, detail = {}) {
if (typeof window === 'undefined') return;
const event = new CustomEvent(name, {
detail: { ...detail, timestamp: Date.now() }
});
window.dispatchEvent(event);
}
/**
* Get scene statistics
*/
getStatistics() {
return {
fps: this.fps,
objects: {
particles: this.particles.reduce((sum, ps) => sum + ps.geometry.attributes.position.count, 0),
cubes: this.cubes.length,
lights: this.lights.length,
total: this.scene ? this.scene.children.length : 0
},
performance: {
avgFrameTime: this.performance.frameTimes.length > 0 ?
this.performance.frameTimes.reduce((a, b) => a + b, 0) / this.performance.frameTimes.length : 0,
memoryUsage: this.performance.memoryUsage.length > 0 ?
this.performance.memoryUsage[this.performance.memoryUsage.length - 1] : null,
errors: this.errors.length,
cleanupCount: this.performance.cleanupCount,
isLowEndDevice: this.performance.isLowEndDevice
},
config: {
particleCount: this.config.particles.count,
cubeCount: this.config.cubes.count,
bloomEnabled: this.config.animation.bloomEffect,
lowPowerMode: this.config.performance.lowPowerMode,
adaptiveQuality: this.config.performance.adaptiveQuality
},
capabilities: this.getBrowserCapabilities()
};
}
/**
* Log statistics
*/
logStatistics() {
const stats = this.getStatistics();
console.group('📊 Three.js Scene Statistics');
console.log('FPS:', stats.fps);
console.log('Objects:', stats.objects);
console.log('Performance:', stats.performance);
console.log('Configuration:', stats.config);
console.log('Capabilities:', stats.capabilities);
console.groupEnd();
}
/**
* Cleanup all resources - MODIFIED TO REMOVE DEVICE ORIENTATION LISTENER
*/
cleanup() {
console.log('🧹 Cleaning up Three.js scene (ES6 Module - Updated for window.THREE)...');
// Stop animation
this.pauseAnimation();
// Clear intervals
if (this.performance.monitorInterval) {
clearInterval(this.performance.monitorInterval);
}
if (this.performance.cleanupInterval) {
clearInterval(this.performance.cleanupInterval);
}
// Remove event listeners
if (this.deviceOrientationHandler) { // ⭐ إضافة هذا السطر
window.removeEventListener('deviceorientation', this.deviceOrientationHandler);
}
if (this.resizeHandler) {
window.removeEventListener('resize', this.resizeHandler);
}
if (this.mouseMoveHandler) {
window.removeEventListener('mousemove', this.mouseMoveHandler);
}
if (this.mouseLeaveHandler) {
window.removeEventListener('mouseleave', this.mouseLeaveHandler);
}
if (this.visibilityChangeHandler) {
document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
}
// Cleanup scene objects
this.cleanupSceneObjects();
// Dispose Three.js resources
if (this.renderer) {
this.renderer.dispose();
this.renderer.forceContextLoss();
if (this.renderer.domElement && this.renderer.domElement.parentNode) {
this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
}
}
// Dispose controls
if (this.controls) {
this.controls.dispose();
}
// Dispose effects
if (this.composer) {
this.composer.dispose();
}
// Cleanup canvas fallback
if (this.canvasFallback) {
if (this.canvasFallback.animationFrame) {
cancelAnimationFrame(this.canvasFallback.animationFrame);
}
if (this.canvasFallback.canvas && this.canvasFallback.canvas.parentNode) {
this.canvasFallback.canvas.parentNode.removeChild(this.canvasFallback.canvas);
}
this.canvasFallback = null;
}
// Clear references
this.scene = null;
this.camera = null;
this.renderer = null;
this.controls = null;
this.composer = null;
console.log('✅ Three.js scene cleanup complete (ES6 Module - Updated for window.THREE)');
this.dispatchEvent('threejs:cleanup:complete');
}
}

// ⭐ تصدير ThreeSceneManager
// export { ThreeSceneManager };

// ============================================================================
// GLOBAL INITIALIZATION WITH ERROR HANDLING (Maintained for compatibility)
// ============================================================================

// Global instance
let ThreeScene = null;

/**
* Initialize Three.js scene with security optimizations
*/
function initThreeJS() {
if (typeof SecureTHREE === 'undefined' || SecureTHREE.REVISION === 'compatibility-layer') {
console.warn('Three.js library not properly loaded. 3D visualization disabled.');
return null;
}
try {
// Check if already initialized
if (ThreeScene) {
console.warn('Three.js scene already initialized');
return ThreeScene;
}
// Check WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
console.warn('WebGL not supported. 3D visualization disabled.');
return null;
}
// Create scene manager
ThreeScene = new ThreeSceneManager(window.THREE); // ⭐ تمرير window.THREE
console.log('✅ Three.js scene initialized for CipherVault Security (ES6 Module - Updated for window.THREE)');
// Dispatch initialization event
if (typeof window !== 'undefined') {
const event = new CustomEvent('threejs:initialized', {
detail: { timestamp: Date.now(), version: '5.2.3' }
});
window.dispatchEvent(event);
}
return ThreeScene;
} catch (error) {
console.error('❌ Failed to initialize Three.js scene (ES6 Module - Updated for window.THREE):', error);
// Create fallback visualization
createThreeJSFallback();
return null;
}
}

/**
* Create Three.js fallback visualization
*/
function createThreeJSFallback() {
const container = document.getElementById('threejs-container');
if (!container) return;
// Create simple CSS-based visualization
container.innerHTML = `
<div style="
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: linear-gradient(135deg, #050510 0%, #0a1a2a 50%, #050510 100%);
overflow: hidden;
">
<div style="
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 200px;
height: 200px;
border-radius: 50%;
background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
animation: pulse 4s ease-in-out infinite;
"></div>
</div>
`;
// Add CSS animation
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
}
`;
document.head.appendChild(style);
console.log('🔄 Created Three.js fallback visualization');
}

/**
* Get Three.js scene instance
*/
function getThreeScene() {
return ThreeScene;
}

/**
* Cleanup Three.js scene
*/
function cleanupThreeJS() {
if (ThreeScene) {
ThreeScene.cleanup();
ThreeScene = null;
}
}

/**
* Check if Three.js is available
*/
function isThreeJSAvailable() {
return typeof SecureTHREE !== 'undefined' && SecureTHREE.REVISION !== 'compatibility-layer';
}

// Global exposure with security
if (typeof window !== 'undefined') {
// Prevent multiple initializations
if (!window.initThreeJS) {
window.initThreeJS = initThreeJS;
window.getThreeScene = getThreeScene;
window.cleanupThreeJS = cleanupThreeJS;
window.isThreeJSAvailable = isThreeJSAvailable;
window.ThreeSceneManager = ThreeSceneManager;
// Auto-initialize after a delay
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
setTimeout(() => {
if (!window.THREE_SCENE_INITIALIZED) {
initThreeJS();
window.THREE_SCENE_INITIALIZED = true;
}
}, 2000); // Delay for page load
});
} else {
setTimeout(() => {
if (!window.THREE_SCENE_INITIALIZED) {
initThreeJS();
window.THREE_SCENE_INITIALIZED = true;
}
}, 2000);
}
}
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
ThreeSceneManager,
initThreeJS,
getThreeScene,
cleanupThreeJS,
isThreeJSAvailable,
THREE_SCENE_CONFIG
};
}

console.log('🔧 ThreeSceneManager v5.2.3 (ES6 Module - Updated for window.THREE) loaded - All fixes applied');
