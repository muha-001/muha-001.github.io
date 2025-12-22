/**
 * CipherVault 3D Pro - Three.js Scene Manager
 * Version: 4.1.0
 * 
 * Manages the 3D visualization using Three.js
 */

// ============================================================================
// THREE.JS SCENE CONFIGURATION
// ============================================================================

const THREE_SCENE_CONFIG = {
    // Scene settings
    scene: {
        background: 0x050510,
        fog: {
            color: 0x050510,
            near: 1,
            far: 1000
        }
    },
    
    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 10000,
        position: { x: 0, y: 0, z: 20 }
    },
    
    // Renderer settings
    renderer: {
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap
        }
    },
    
    // Lighting settings
    lighting: {
        ambient: {
            color: 0x00aaff,
            intensity: 0.2
        },
        directional: {
            color: 0x00d4ff,
            intensity: 0.8,
            position: { x: 10, y: 10, z: 5 }
        },
        pointLights: [
            {
                color: 0xff0080,
                intensity: 0.5,
                distance: 100,
                position: { x: -20, y: 10, z: 10 }
            },
            {
                color: 0x00ff88,
                intensity: 0.5,
                distance: 100,
                position: { x: 20, y: -10, z: -10 }
            }
        ]
    },
    
    // Particle system
    particles: {
        count: 2000,
        size: 0.1,
        opacity: 0.8,
        colors: {
            min: 0x0088ff,
            max: 0x00ffff
        },
        speed: 0.001,
        spread: 200
    },
    
    // Floating cubes
    cubes: {
        count: 25,
        size: 1,
        colors: [
            0x00d4ff, // Cyan
            0xff0080, // Pink
            0x00ff88, // Green
            0xffaa00, // Orange
            0xaa00ff  // Purple
        ],
        opacity: 0.6,
        rotationSpeed: { min: 0.01, max: 0.03 },
        floatSpeed: { min: 0.002, max: 0.01 },
        spread: 50
    },
    
    // Animation settings
    animation: {
        enabled: true,
        frameRate: 60,
        motionBlur: false,
        bloomEffect: true,
        bloom: {
            strength: 0.5,
            radius: 0.4,
            threshold: 0.85
        }
    },
    
    // Performance settings
    performance: {
        maxFPS: 60,
        adaptiveQuality: true,
        dynamicScaling: true,
        lowPowerMode: false
    }
};

// ============================================================================
// THREE.JS SCENE MANAGER
// ============================================================================

class ThreeSceneManager {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        
        // Scene objects
        this.particles = [];
        this.cubes = [];
        this.lights = [];
        this.effects = {};
        
        // Animation state
        this.animationId = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // Performance monitoring
        this.performance = {
            frameTimes: [],
            memoryUsage: [],
            lastMemoryCheck: 0
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
        this.config = THREE_SCENE_CONFIG;
        
        // Initialize
        this.init();
    }
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    /**
     * Initialize Three.js scene
     */
    init() {
        console.log('Initializing Three.js scene...');
        
        try {
            // Check if Three.js is available
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js library not loaded');
            }
            
            // Create scene
            this.createScene();
            
            // Create camera
            this.createCamera();
            
            // Create renderer
            this.createRenderer();
            
            // Create lighting
            this.createLighting();
            
            // Create particles
            this.createParticles();
            
            // Create floating cubes
            this.createFloatingCubes();
            
            // Create effects (if enabled)
            if (this.config.animation.bloomEffect) {
                this.createEffects();
            }
            
            // Setup controls
            this.setupControls();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.startAnimation();
            
            // Update performance monitoring
            this.startPerformanceMonitoring();
            
            console.log('Three.js scene initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Three.js scene:', error);
            this.handleInitError(error);
        }
    }
    
    /**
     * Create Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.scene.background);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(
            this.config.scene.fog.color,
            this.config.scene.fog.near,
            this.config.scene.fog.far
        );
        
        // Add scene helper (for debugging)
        if (window.location.hash === '#debug') {
            const axesHelper = new THREE.AxesHelper(20);
            this.scene.add(axesHelper);
            
            const gridHelper = new THREE.GridHelper(100, 20);
            this.scene.add(gridHelper);
        }
    }
    
    /**
     * Create camera
     */
    createCamera() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
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
    }
    
    /**
     * Create renderer
     */
    createRenderer() {
        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.config.renderer.antialias,
            alpha: this.config.renderer.alpha,
            powerPreference: this.config.renderer.powerPreference
        });
        
        // Configure renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        this.renderer.shadowMap.enabled = this.config.renderer.shadowMap.enabled;
        this.renderer.shadowMap.type = this.config.renderer.shadowMap.type;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Add renderer to DOM
        const container = document.getElementById('threejs-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        } else {
            document.body.appendChild(this.renderer.domElement);
            console.warn('Three.js container not found, added to body directly');
        }
    }
    
    /**
     * Create lighting
     */
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            this.config.lighting.ambient.color,
            this.config.lighting.ambient.intensity
        );
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Directional light (main light)
        const directionalLight = new THREE.DirectionalLight(
            this.config.lighting.directional.color,
            this.config.lighting.directional.intensity
        );
        directionalLight.position.set(
            this.config.lighting.directional.position.x,
            this.config.lighting.directional.position.y,
            this.config.lighting.directional.position.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Point lights
        this.config.lighting.pointLights.forEach(lightConfig => {
            const pointLight = new THREE.PointLight(
                lightConfig.color,
                lightConfig.intensity,
                lightConfig.distance
            );
            pointLight.position.set(
                lightConfig.position.x,
                lightConfig.position.y,
                lightConfig.position.z
            );
            pointLight.castShadow = true;
            pointLight.shadow.mapSize.width = 512;
            pointLight.shadow.mapSize.height = 512;
            this.scene.add(pointLight);
            this.lights.push(pointLight);
            
            // Add light helper for debugging
            if (window.location.hash === '#debug') {
                const lightHelper = new THREE.PointLightHelper(pointLight, 1);
                this.scene.add(lightHelper);
            }
        });
    }
    
    /**
     * Create particle system
     */
    createParticles() {
        const particleCount = this.config.particles.count;
        const particles = new THREE.BufferGeometry();
        
        // Create positions and colors arrays
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Fill arrays with random values
        for (let i = 0; i < particleCount; i++) {
            // Position (spread in a sphere)
            const radius = Math.random() * this.config.particles.spread;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Color (gradient between min and max)
            const color = new THREE.Color(
                Math.random() * (this.config.particles.colors.max - this.config.particles.colors.min) + 
                this.config.particles.colors.min
            );
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Size (slightly random)
            sizes[i] = Math.random() * 0.05 + this.config.particles.size;
        }
        
        // Set geometry attributes
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create material
        const particleMaterial = new THREE.PointsMaterial({
            size: this.config.particles.size,
            vertexColors: true,
            transparent: true,
            opacity: this.config.particles.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create particle system
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
        
        // Store particle data for animation
        particleSystem.userData = {
            originalPositions: positions.slice(),
            speeds: Array.from({ length: particleCount }, () => ({
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.002
            })),
            timeOffset: Math.random() * Math.PI * 2
        };
    }
    
    /**
     * Create floating cubes
     */
    createFloatingCubes() {
        const cubeCount = this.config.cubes.count;
        
        for (let i = 0; i < cubeCount; i++) {
            // Choose random color
            const colorIndex = Math.floor(Math.random() * this.config.cubes.colors.length);
            const color = this.config.cubes.colors[colorIndex];
            
            // Create cube geometry
            const geometry = new THREE.BoxGeometry(
                this.config.cubes.size,
                this.config.cubes.size,
                this.config.cubes.size
            );
            
            // Create material with random properties
            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: this.config.cubes.opacity,
                shininess: 100,
                specular: 0x222222,
                emissive: 0x000000,
                emissiveIntensity: 0.1
            });
            
            // Create cube mesh
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            // Random position within spread
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
            
            // Store animation properties
            cube.userData = {
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
                originalPosition: cube.position.clone(),
                pulseSpeed: Math.random() * 0.01 + 0.005,
                pulseOffset: Math.random() * Math.PI * 2,
                scaleFactor: 1
            };
            
            // Add cube to scene and tracking array
            this.scene.add(cube);
            this.cubes.push(cube);
            
            // Add wireframe for debugging
            if (window.location.hash === '#debug') {
                const wireframe = new THREE.LineSegments(
                    new THREE.EdgesGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
                );
                cube.add(wireframe);
            }
        }
    }
    
    /**
     * Create post-processing effects
     */
    createEffects() {
        // Only create effects if WebGL 2 is available
        if (!this.renderer.capabilities.isWebGL2) {
            console.warn('WebGL 2 not available, skipping effects');
            return;
        }
        
        try {
            // Create effect composer
            this.composer = new THREE.EffectComposer(this.renderer);
            
            // Add render pass
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Add bloom effect
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                this.config.animation.bloom.strength,
                this.config.animation.bloom.radius,
                this.config.animation.bloom.threshold
            );
            this.composer.addPass(bloomPass);
            
            // Store effects
            this.effects.bloom = bloomPass;
            this.effects.composer = this.composer;
            
            console.log('Post-processing effects initialized');
        } catch (error) {
            console.warn('Failed to create effects:', error);
            this.composer = null;
        }
    }
    
    /**
     * Setup orbit controls
     */
    setupControls() {
        if (typeof THREE.OrbitControls === 'undefined') {
            console.warn('OrbitControls not available, using basic mouse tracking');
            return;
        }
        
        try {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.rotateSpeed = 0.5;
            this.controls.zoomSpeed = 0.8;
            this.controls.panSpeed = 0.8;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.enableRotate = true;
            this.controls.maxDistance = 100;
            this.controls.minDistance = 5;
            this.controls.maxPolarAngle = Math.PI;
            this.controls.minPolarAngle = 0;
            
            console.log('OrbitControls initialized');
        } catch (error) {
            console.warn('Failed to setup OrbitControls:', error);
            this.controls = null;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse movement for interactive effects
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Mouse leave
        window.addEventListener('mouseleave', () => this.onMouseLeave());
        
        // Visibility change (for performance)
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Performance mode toggle (for debugging)
        if (window.location.hash === '#debug') {
            window.addEventListener('keydown', (e) => {
                if (e.key === 'p' || e.key === 'P') {
                    this.togglePerformanceMode();
                }
                if (e.key === 'b' || e.key === 'B') {
                    this.toggleBloomEffect();
                }
            });
        }
    }
    
    // ============================================================================
    // ANIMATION LOOP
    // ============================================================================
    
    /**
     * Start animation loop
     */
    startAnimation() {
        if (!this.config.animation.enabled) {
            console.log('Animation disabled, rendering static scene');
            this.render();
            return;
        }
        
        console.log('Starting animation loop...');
        this.animationId = requestAnimationFrame((time) => this.animate(time));
        this.lastFrameTime = performance.now();
    }
    
    /**
     * Animation loop
     */
    animate(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Calculate FPS
        this.frameCount++;
        if (currentTime > 1000) {
            this.fps = Math.round((this.frameCount * 1000) / currentTime);
            this.frameCount = 0;
        }
        
        // Update performance monitoring
        this.updatePerformanceMonitoring(deltaTime);
        
        // Update controls if enabled
        if (this.controls) {
            this.controls.update();
        }
        
        // Update mouse interaction
        this.updateMouseInteraction(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update cubes
        this.updateCubes(deltaTime);
        
        // Update lighting (subtle changes)
        this.updateLighting(deltaTime);
        
        // Update camera based on mouse position
        this.updateCamera(deltaTime);
        
        // Render scene
        this.render();
        
        // Continue animation loop
        this.animationId = requestAnimationFrame((time) => this.animate(time));
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
            
            // Animate each particle
            for (let i = 0; i < positions.length; i += 3) {
                const particleIndex = i / 3;
                const speed = speeds[particleIndex];
                
                // Calculate new position with subtle movement
                positions[i] = originalPositions[i] + 
                    Math.sin(time * 0.5 + timeOffset + particleIndex * 0.01) * 0.5 +
                    speed.x * time * 10;
                
                positions[i + 1] = originalPositions[i + 1] + 
                    Math.cos(time * 0.3 + timeOffset + particleIndex * 0.01) * 0.5 +
                    speed.y * time * 10;
                
                positions[i + 2] = originalPositions[i + 2] + 
                    Math.sin(time * 0.7 + timeOffset + particleIndex * 0.01) * 0.5 +
                    speed.z * time * 10;
            }
            
            // Update geometry
            particleSystem.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    /**
     * Update cubes animation
     */
    updateCubes(deltaTime) {
        const time = performance.now() * 0.001;
        
        this.cubes.forEach(cube => {
            const userData = cube.userData;
            
            // Rotation
            cube.rotation.x += userData.rotationSpeed.x * (deltaTime / 16);
            cube.rotation.y += userData.rotationSpeed.y * (deltaTime / 16);
            cube.rotation.z += userData.rotationSpeed.z * (deltaTime / 16);
            
            // Floating motion
            const floatTime = time + userData.floatOffset;
            cube.position.y = userData.originalPosition.y + 
                Math.sin(floatTime * userData.floatSpeed) * 2;
            
            // Pulsing scale
            const pulse = Math.sin(time * userData.pulseSpeed + userData.pulseOffset) * 0.1 + 1;
            cube.scale.setScalar(pulse);
            userData.scaleFactor = pulse;
            
            // Subtle position drift based on mouse
            if (this.mouse.isMoving) {
                cube.position.x += this.mouse.normalizedX * 0.01;
                cube.position.z += this.mouse.normalizedY * 0.01;
                
                // Return to original position gradually
                cube.position.x += (userData.originalPosition.x - cube.position.x) * 0.01;
                cube.position.z += (userData.originalPosition.z - cube.position.z) * 0.01;
            }
            
            // Update material based on scale
            if (cube.material) {
                cube.material.opacity = this.config.cubes.opacity * pulse;
                cube.material.emissiveIntensity = 0.1 * pulse;
            }
        });
    }
    
    /**
     * Update lighting effects
     */
    updateLighting(deltaTime) {
        const time = performance.now() * 0.001;
        
        // Animate point lights
        this.lights.forEach((light, index) => {
            if (light.isPointLight) {
                // Subtle pulsing effect
                const intensityFactor = Math.sin(time * 0.5 + index) * 0.2 + 0.8;
                light.intensity = light.userData?.originalIntensity || 0.5 * intensityFactor;
                
                // Store original intensity if not already stored
                if (!light.userData?.originalIntensity) {
                    light.userData = { originalIntensity: light.intensity };
                }
            }
        });
    }
    
    /**
     * Update camera based on mouse interaction
     */
    updateCamera(deltaTime) {
        if (this.controls || !this.mouse.isMoving) return;
        
        // Subtle camera movement based on mouse position
        const targetX = this.mouse.normalizedX * 5;
        const targetY = this.mouse.normalizedY * 5;
        
        // Smooth interpolation
        this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-targetY - this.camera.position.y) * 0.05;
        
        // Make camera look at center
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Update mouse interaction state
     */
    updateMouseInteraction(deltaTime) {
        const currentTime = performance.now();
        const timeSinceLastMove = currentTime - this.mouse.lastMoveTime;
        
        // Check if mouse is still moving
        if (timeSinceLastMove > 100) { // 100ms threshold
            this.mouse.isMoving = false;
        }
        
        // Update normalized mouse coordinates
        this.mouse.normalizedX = (this.mouse.x / window.innerWidth) * 2 - 1;
        this.mouse.normalizedY = (this.mouse.y / window.innerHeight) * 2 - 1;
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.composer && this.config.animation.bloomEffect) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer if exists
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
        
        console.log(`Scene resized to: ${window.innerWidth}x${window.innerHeight}`);
    }
    
    /**
     * Handle mouse movement
     */
    onMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        this.mouse.isMoving = true;
        this.mouse.lastMoveTime = performance.now();
        
        // Update cubes based on mouse position
        this.cubes.forEach(cube => {
            const userData = cube.userData;
            const distanceX = Math.abs(this.mouse.normalizedX);
            const distanceY = Math.abs(this.mouse.normalizedY);
            
            // Increase rotation speed based on mouse movement
            const speedMultiplier = 1 + (distanceX + distanceY) * 0.5;
            userData.rotationSpeed.x = 
                (userData.originalRotationSpeed?.x || 0.01) * speedMultiplier;
            userData.rotationSpeed.y = 
                (userData.originalRotationSpeed?.y || 0.01) * speedMultiplier;
        });
    }
    
    /**
     * Handle mouse leave
     */
    onMouseLeave() {
        this.mouse.isMoving = false;
        
        // Reset cube rotation speeds
        this.cubes.forEach(cube => {
            const userData = cube.userData;
            if (userData.originalRotationSpeed) {
                userData.rotationSpeed.x = userData.originalRotationSpeed.x;
                userData.rotationSpeed.y = userData.originalRotationSpeed.y;
                userData.rotationSpeed.z = userData.originalRotationSpeed.z;
            }
        });
    }
    
    /**
     * Handle visibility change
     */
    onVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, reduce animation
            this.pauseAnimation();
        } else {
            // Page is visible, resume animation
            this.resumeAnimation();
        }
    }
    
    // ============================================================================
    // PERFORMANCE MANAGEMENT
    // ============================================================================
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        // Check memory usage periodically
        setInterval(() => this.checkMemoryUsage(), 10000);
        
        // Monitor frame times
        setInterval(() => this.logPerformanceStats(), 30000);
    }
    
    /**
     * Update performance monitoring
     */
    updatePerformanceMonitoring(deltaTime) {
        // Track frame times
        this.performance.frameTimes.push(deltaTime);
        
        // Keep only last 100 frames
        if (this.performance.frameTimes.length > 100) {
            this.performance.frameTimes.shift();
        }
        
        // Adaptive quality based on performance
        if (this.config.performance.adaptiveQuality) {
            this.adjustQualityBasedOnPerformance();
        }
    }
    
    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            this.performance.memoryUsage.push({
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                timestamp: Date.now()
            });
            
            // Keep only last 50 measurements
            if (this.performance.memoryUsage.length > 50) {
                this.performance.memoryUsage.shift();
            }
            
            // Check for memory issues
            const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
            if (memoryUsage > 0.9) {
                console.warn('High memory usage detected:', Math.round(memoryUsage * 100) + '%');
                this.reduceMemoryUsage();
            }
        }
    }
    
    /**
     * Log performance statistics
     */
    logPerformanceStats() {
        if (this.performance.frameTimes.length === 0) return;
        
        const avgFrameTime = this.performance.frameTimes.reduce((a, b) => a + b) / this.performance.frameTimes.length;
        const avgFPS = 1000 / avgFrameTime;
        
        console.log(`Performance Stats - FPS: ${Math.round(avgFPS)}, Frame Time: ${avgFrameTime.toFixed(2)}ms`);
        
        if (performance.memory && this.performance.memoryUsage.length > 0) {
            const latestMemory = this.performance.memoryUsage[this.performance.memoryUsage.length - 1];
            const memoryMB = latestMemory.usedJSHeapSize / (1024 * 1024);
            console.log(`Memory Usage: ${memoryMB.toFixed(2)} MB`);
        }
    }
    
    /**
     * Adjust quality based on performance
     */
    adjustQualityBasedOnPerformance() {
        if (this.performance.frameTimes.length < 30) return;
        
        const avgFrameTime = this.performance.frameTimes.reduce((a, b) => a + b) / this.performance.frameTimes.length;
        const currentFPS = 1000 / avgFrameTime;
        
        // Adjust particle count based on FPS
        if (currentFPS < 30 && this.particles.length > 0) {
            // Reduce particles
            const particleSystem = this.particles[0];
            const currentCount = particleSystem.geometry.attributes.position.count;
            const targetCount = Math.max(500, Math.floor(currentCount * 0.7));
            
            if (targetCount < currentCount) {
                this.adjustParticleCount(targetCount);
                console.log(`Reduced particles from ${currentCount} to ${targetCount} due to low FPS`);
            }
        } else if (currentFPS > 50 && this.particles.length > 0) {
            // Increase particles
            const particleSystem = this.particles[0];
            const currentCount = particleSystem.geometry.attributes.position.count;
            const targetCount = Math.min(this.config.particles.count, Math.floor(currentCount * 1.3));
            
            if (targetCount > currentCount) {
                this.adjustParticleCount(targetCount);
                console.log(`Increased particles from ${currentCount} to ${targetCount}`);
            }
        }
    }
    
    /**
     * Adjust particle count
     */
    adjustParticleCount(targetCount) {
        if (!this.particles.length) return;
        
        const particleSystem = this.particles[0];
        const geometry = particleSystem.geometry;
        const currentCount = geometry.attributes.position.count;
        
        if (targetCount === currentCount) return;
        
        // Create new arrays
        const newPositions = new Float32Array(targetCount * 3);
        const newColors = new Float32Array(targetCount * 3);
        const newSizes = new Float32Array(targetCount);
        
        // Copy existing data or create new
        const copyCount = Math.min(currentCount, targetCount);
        for (let i = 0; i < copyCount; i++) {
            newPositions[i * 3] = geometry.attributes.position.array[i * 3];
            newPositions[i * 3 + 1] = geometry.attributes.position.array[i * 3 + 1];
            newPositions[i * 3 + 2] = geometry.attributes.position.array[i * 3 + 2];
            
            newColors[i * 3] = geometry.attributes.color.array[i * 3];
            newColors[i * 3 + 1] = geometry.attributes.color.array[i * 3 + 1];
            newColors[i * 3 + 2] = geometry.attributes.color.array[i * 3 + 2];
            
            newSizes[i] = geometry.attributes.size?.array[i] || this.config.particles.size;
        }
        
        // Add new particles if needed
        for (let i = copyCount; i < targetCount; i++) {
            const radius = Math.random() * this.config.particles.spread;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            newPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            newPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            newPositions[i * 3 + 2] = radius * Math.cos(phi);
            
            const color = new THREE.Color(
                Math.random() * (this.config.particles.colors.max - this.config.particles.colors.min) + 
                this.config.particles.colors.min
            );
            newColors[i * 3] = color.r;
            newColors[i * 3 + 1] = color.g;
            newColors[i * 3 + 2] = color.b;
            
            newSizes[i] = Math.random() * 0.05 + this.config.particles.size;
        }
        
        // Update geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(newSizes, 1));
        
        // Update user data
        particleSystem.userData.originalPositions = newPositions.slice();
        particleSystem.userData.speeds = Array.from({ length: targetCount }, () => ({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            z: (Math.random() - 0.5) * 0.002
        }));
    }
    
    /**
     * Reduce memory usage
     */
    reduceMemoryUsage() {
        // Reduce particle count
        if (this.particles.length > 0) {
            this.adjustParticleCount(Math.floor(this.config.particles.count * 0.5));
        }
        
        // Remove some cubes
        if (this.cubes.length > 10) {
            const cubesToRemove = this.cubes.splice(10);
            cubesToRemove.forEach(cube => this.scene.remove(cube));
        }
        
        // Clear geometry caches
        this.renderer.dispose();
        
        console.log('Memory reduction measures applied');
    }
    
    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================
    
    /**
     * Pause animation
     */
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('Animation paused');
        }
    }
    
    /**
     * Resume animation
     */
    resumeAnimation() {
        if (!this.animationId && this.config.animation.enabled) {
            this.lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame((time) => this.animate(time));
            console.log('Animation resumed');
        }
    }
    
    /**
     * Toggle performance mode
     */
    togglePerformanceMode() {
        this.config.performance.lowPowerMode = !this.config.performance.lowPowerMode;
        
        if (this.config.performance.lowPowerMode) {
            // Reduce quality
            this.renderer.setPixelRatio(1);
            this.config.particles.count = 500;
            this.config.cubes.count = 10;
            this.config.animation.bloomEffect = false;
            
            // Recreate scene with lower quality
            this.recreateSceneWithCurrentConfig();
            
            console.log('Low power mode enabled');
        } else {
            // Restore quality
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.config.particles.count = THREE_SCENE_CONFIG.particles.count;
            this.config.cubes.count = THREE_SCENE_CONFIG.cubes.count;
            this.config.animation.bloomEffect = THREE_SCENE_CONFIG.animation.bloomEffect;
            
            // Recreate scene with normal quality
            this.recreateSceneWithCurrentConfig();
            
            console.log('Low power mode disabled');
        }
    }
    
    /**
     * Toggle bloom effect
     */
    toggleBloomEffect() {
        this.config.animation.bloomEffect = !this.config.animation.bloomEffect;
        
        if (this.config.animation.bloomEffect) {
            this.createEffects();
            console.log('Bloom effect enabled');
        } else {
            if (this.composer) {
                this.composer = null;
                this.effects = {};
            }
            console.log('Bloom effect disabled');
        }
    }
    
    /**
     * Recreate scene with current configuration
     */
    recreateSceneWithCurrentConfig() {
        // Clear existing scene
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        
        // Clear arrays
        this.particles = [];
        this.cubes = [];
        this.lights = [];
        
        // Recreate scene elements
        this.createLighting();
        this.createParticles();
        this.createFloatingCubes();
        
        console.log('Scene recreated with new configuration');
    }
    
    /**
     * Handle initialization error
     */
    handleInitError(error) {
        console.error('Three.js initialization error:', error);
        
        // Show error message in container
        const container = document.getElementById('threejs-container');
        if (container) {
            container.innerHTML = `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: #ff4757;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 10px;
                    border: 2px solid #ff4757;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <h3>3D Visualization Error</h3>
                    <p>${error.message}</p>
                    <p style="font-size: 12px; color: #8a8aa3; margin-top: 10px;">
                        Encryption/Decryption will continue to work normally.
                    </p>
                </div>
            `;
        }
        
        // Dispatch error event
        const event = new CustomEvent('threejs:error', { detail: error });
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
                total: this.scene.children.length
            },
            performance: {
                avgFrameTime: this.performance.frameTimes.length > 0 ? 
                    this.performance.frameTimes.reduce((a, b) => a + b) / this.performance.frameTimes.length : 0,
                memoryUsage: this.performance.memoryUsage.length > 0 ? 
                    this.performance.memoryUsage[this.performance.memoryUsage.length - 1] : null
            },
            config: {
                particleCount: this.config.particles.count,
                cubeCount: this.config.cubes.count,
                bloomEnabled: this.config.animation.bloomEffect,
                lowPowerMode: this.config.performance.lowPowerMode
            }
        };
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        // Stop animation
        this.pauseAnimation();
        
        // Remove event listeners
        window.removeEventListener('resize', () => this.onWindowResize());
        window.removeEventListener('mousemove', (e) => this.onMouseMove(e));
        window.removeEventListener('mouseleave', () => this.onMouseLeave());
        document.removeEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Dispose Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        this.particles = [];
        this.cubes = [];
        this.lights = [];
        this.effects = {};
        
        console.log('Three.js scene cleaned up');
    }
}

// ============================================================================
// GLOBAL INITIALIZATION
// ============================================================================

// Create global instance
let ThreeScene = null;

/**
 * Initialize Three.js scene (called from main.js)
 */
function initThreeJS() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, skipping 3D scene initialization');
        return;
    }
    
    try {
        ThreeScene = new ThreeSceneManager();
        console.log('Three.js scene initialized globally');
    } catch (error) {
        console.error('Failed to initialize Three.js scene:', error);
    }
}

/**
 * Get Three.js scene instance
 */
function getThreeScene() {
    return ThreeScene;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.initThreeJS = initThreeJS;
    window.getThreeScene = getThreeScene;
    window.ThreeSceneManager = ThreeSceneManager;
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThreeSceneManager,
        initThreeJS,
        getThreeScene,
        THREE_SCENE_CONFIG
    };
}
