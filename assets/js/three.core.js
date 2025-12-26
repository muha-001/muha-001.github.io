// three.core.js
// ⭐ ملف احترافي لدمج وتهيئة مكونات Three.js الأساسية في CipherVault 3D Pro
// ⭐ متوافق مع ES6 Modules وجميع التعديلات والملفات الجديدة

// ⭐ استيراد Three.js الأساسي
import * as THREE from './three.module.js';

// ⭐ استيراد المكونات المُدارة (الـ Wrappers التي أنشأناها)
import { OrbitControls } from './orbit-controls-wrapper.js';
import { EffectComposer, RenderPass, ShaderPass } from './postprocessing-wrapper.js';
import { CopyShader, FXAAShader } from './shader-wrapper.js';
import { UnrealBloomPass } from './bloom-wrapper.js'; // (إذا كنت تستخدمها)

// ⭐ استيراد مكونات إضافية (إن لزم)
// import { GLTFLoader } from './loaders/GLTFLoader.js'; // مثال
// import { DRACOLoader } from './loaders/DRACOLoader.js'; // مثال

// ⭐ تعريف ثابت لنسخة Three.js المستخدمة
const THREE_CORE_VERSION = '182.0.0-esm-wrapper-v1.0';

// ========================================================================
// ⭐ وظائف تهيئة موحدة
// ========================================================================

/**
 * ⭐ تهيئة Three.js مع المكونات الأساسية
 * @param {HTMLElement} container - عنصر DOM لعرض المشهد
 * @param {Object} options - خيارات التهيئة
 * @returns {Object} - كائن يحتوي على scene, camera, renderer, controls...
 */
function initializeThreeCore(container, options = {}) {
    console.log(`🚀 Initializing CipherVault Three.js Core v${THREE_CORE_VERSION}...`);

    // ⭐ خيارات افتراضية
    const defaultOptions = {
        camera: {
            fov: 75,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 0, z: 5 }
        },
        renderer: {
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        },
        controls: {
            enableRotate: false, // ⭐ تعطيل التفاعل مع الحركة/اللمس
            enablePan: false,
            enableZoom: false,
            enableDamping: true,
            dampingFactor: 0.05
        },
        postProcessing: {
            enabled: false, // ⭐ تعطيل الـ Post-Processing بشكل افتراضي
            effects: {
                bloom: false,
                fxaa: false
            }
        }
    };

    const config = { ...defaultOptions, ...options };

    // ⭐ التحقق من دعم WebGL
    if (!checkWebGLSupport()) {
        console.error('❌ WebGL not supported. Cannot initialize Three.js Core.');
        return null;
    }

    // ⭐ إنشاء المكونات الأساسية
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // لون خلفية أمان

    const camera = new THREE.PerspectiveCamera(
        config.camera.fov,
        container.clientWidth / container.clientHeight,
        config.camera.near,
        config.camera.far
    );
    camera.position.copy(config.camera.position);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer(config.renderer);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false; // ⭐ تعطيل الظلال لتحسين الأداء

    // ⭐ إضافة العارض إلى الحاوية
    container.appendChild(renderer.domElement);

    // ⭐ إنشاء وظائف التحكم (OrbitControls)
    let controls = null;
    if (OrbitControls) {
        controls = new OrbitControls(camera, renderer.domElement);
        // ⭐ تطبيق الإعدادات لتعطيل التفاعل
        controls.enableRotate = config.controls.enableRotate;
        controls.enablePan = config.controls.enablePan;
        controls.enableZoom = config.controls.enableZoom;
        controls.enableDamping = config.controls.enableDamping;
        controls.dampingFactor = config.controls.dampingFactor;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 100;
    } else {
        console.warn('⚠️ OrbitControls not available.');
    }

    // ⭐ إنشاء وظائف الـ Post-Processing (إن مطلوبة)
    let composer = null;
    if (config.postProcessing.enabled && EffectComposer) {
        composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        if (config.postProcessing.effects.bloom && UnrealBloomPass) {
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5, // strength
                0.4, // radius
                0.85 // threshold
            );
            composer.addPass(bloomPass);
        }

        if (config.postProcessing.effects.fxaa && ShaderPass && FXAAShader) {
            const fxaaPass = new ShaderPass(FXAAShader);
            fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
            composer.addPass(fxaaPass);
        }
    } else {
        console.log('⏭️ Post-processing disabled.');
    }

    // ⭐ إنشاء إضاءة افتراضية
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    console.log('✅ CipherVault Three.js Core initialized successfully.');

    return {
        scene,
        camera,
        renderer,
        controls,
        composer, // قد يكون null إذا لم يكن مفعلاً
        THREE, // للوصول إلى Three.js الأساسي
        version: THREE_CORE_VERSION
    };
}

/**
 * ⭐ التحقق من دعم WebGL
 * @returns {boolean}
 */
function checkWebGLSupport() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(gl && gl instanceof WebGLRenderingContext);
}

/**
 * ⭐ التحقق من دعم WebGL2
 * @returns {boolean}
 */
function checkWebGL2Support() {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
}

/**
 * ⭐ التحقق من دعم Post-Processing (يُستخدم هذا من قبل three-scene.js)
 * @returns {boolean}
 */
function checkPostProcessingSupport() {
    return !!(EffectComposer && RenderPass && CopyShader);
}

// ========================================================================
// ⭐ التصدير (Export)
// ========================================================================

// ⭐ تصدير الوظائف الأساسية
export {
    initializeThreeCore,
    checkWebGLSupport,
    checkWebGL2Support,
    checkPostProcessingSupport,
    THREE_CORE_VERSION
};

// ⭐ (اختياري) تصدير THREE و OrbitControls و Post-Processing مجمعة
// ⭐ هذا مفيد إذا أردت استيراد كل شيء من three.core.js فقط
export {
    THREE,
    OrbitControls,
    EffectComposer,
    RenderPass,
    ShaderPass,
    CopyShader,
    FXAAShader,
    UnrealBloomPass
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
