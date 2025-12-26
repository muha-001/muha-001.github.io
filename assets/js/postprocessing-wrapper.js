// postprocessing-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل PostProcessing JS Files متوافق مع ES6 Modules
// ⭐ يستخدمه three-scene.js (الملف المُعدّل) للحصول على EffectComposer, RenderPass, ShaderPass...

// ⛔ لا يمكن استيراد EffectComposer.js, RenderPass.js, ShaderPass.js مباشرة لأنها تعتمد على window.THREE
// ⭐ لذا نستخدم window.THREE لجلبها

// ⭐ التصدير الموحّد
export {
  window.EffectComposer,
  window.RenderPass,
  window.ShaderPass
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
