/**
 * RIBEIRO TEAM - DEADLIFT 3D BIOMECHANICS ENGINE
 * Interactive Three.js WebGL anatomical deadlift simulation with kinetic vectors & GSAP sync
 * Coach Samuel Ribeiro (@treinador_samuelribeiro)
 */

class DeadliftBiomechanics3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animFrameId = null;
    this.isVisible = false;
    
    // Kinematic model pieces
    this.lifterGroup = null;
    this.barbellGroup = null;
    this.vectorGroup = null;
    this.muscleMeshes = [];

    // Joint references for inverse kinematics & articulation
    this.joints = {};
    
    // Lift State
    this.currentProgress = 0.0; // 0.0 (Setup), 0.5 (Pull), 1.0 (Lockout)
    this.targetProgress = 0.0;
    this.isAutoPlaying = false;
    this.autoPlayDir = 1;
    this.autoPlaySpeed = 0.006;
    this.showVectors = true;

    // Technical Phase Data & Coaching Cues
    this.phaseData = {
      0.0: {
        title: "Fase 1: Setup & Saída",
        badge: "Fundação Biomecânica",
        cues: [
          { label: "Barra colada na tíbia", desc: "Braço de momento do joelho minimizado para eficiência máxima de torque." },
          { label: "Escápulas sobre a barra", desc: "Depressão e adução das escápulas; grande dorsal em pré-tensão isométrica." },
          { label: "Pressão Intra-Abdominal (Core)", desc: "Manobra de Valsalva estabilizando a coluna lombar em posição neutra." }
        ],
        muscles: ["Isquiotibiais", "Grande Dorsal", "Eretores da Espinha", "Core"]
      },
      0.5: {
        title: "Fase 2: Tração & Transição do Joelho",
        badge: "Transferência de Força",
        cues: [
          { label: "Leg Drive (Empurrar o Chão)", desc: "Predomínio de extensão de joelhos sem elevar o quadril prematuramente." },
          { label: "Trajetória Rígida Vertical", desc: "A barra sobe em linha perfeitamente perpendicular ao ponto médio dos pés." },
          { label: "Tensão de Cadeia Posterior", desc: "Quadríceps e glúteos dividem a carga com estabilização torácica contínua." }
        ],
        muscles: ["Quadríceps", "Glúteo Máximo", "Eretores da Espinha", "Antebraços"]
      },
      1.0: {
        title: "Fase 3: Lockout & Bloqueio",
        badge: "Pico de Tensão & Extensão",
        cues: [
          { label: "Extensão Total de Quadril", desc: "Glúteos em contração concêntrica máxima sem hiperextensão lombar." },
          { label: "Caixa Torácica Alta & Ombros", desc: "Ombros neutralizados para trás e para baixo, peitoral aberto e firme." },
          { label: "Estabilidade Articular Completa", desc: "Joelhos e quadris travados em harmonia com base plantar sólida." }
        ],
        muscles: ["Glúteos", "Trapézio", "Romboide", "Core / Oblíquos"]
      }
    };

    this.init();
  }

  init() {
    try {
      this.setupScene();
      this.setupLighting();
      this.createEnvironment();
      this.createBarbell();
      this.createKinematicLifter();
      this.createForceVectors();
      this.setupControls();
      this.setupEventListeners();
      this.setupVisibilityObserver();
      this.updateKinematics(0);
      this.render();
      this.updateFloatingCard(0.0);
    } catch (err) {
      console.warn("WebGL initialization note:", err);
      this.renderFallback();
    }
  }

  setupScene() {
    const isMobile = window.innerWidth < 640;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || (isMobile ? 380 : 560);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070709, 0.045);

    this.camera = new THREE.PerspectiveCamera(isMobile ? 50 : 45, width / height, 0.1, 100);
    // Positioned at an athletic 3/4 angle
    if (isMobile) {
      this.camera.position.set(3.8, 1.9, 4.3);
    } else {
      this.camera.position.set(3.4, 1.8, 3.8);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Key directional light with shadow
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    // Dramatic Ribeiro Team Scarlet Red Rim Light from behind
    const redRimLight = new THREE.DirectionalLight(0xE50914, 2.5);
    redRimLight.position.set(-3, 3, -3);
    this.scene.add(redRimLight);

    // Subtle Cyan/Cold Accent Light from ground/side
    const cyanPoint = new THREE.PointLight(0x00d2ff, 0.8, 8);
    cyanPoint.position.set(0, 0.3, 2.5);
    this.scene.add(cyanPoint);
  }

  createEnvironment() {
    // Olympic Deadlift Platform (Rubber & Hardwood Center)
    const platformGeo = new THREE.BoxGeometry(3.6, 0.08, 2.8);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.8,
      metalness: 0.2
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.04;
    platform.receiveShadow = true;
    this.scene.add(platform);

    // Wooden Lifting Center Inset
    const woodCenterGeo = new THREE.BoxGeometry(1.4, 0.085, 2.78);
    const woodCenterMat = new THREE.MeshStandardMaterial({
      color: 0x1d1d24,
      roughness: 0.6,
      metalness: 0.1
    });
    const woodCenter = new THREE.Mesh(woodCenterGeo, woodCenterMat);
    woodCenter.position.y = -0.035;
    this.scene.add(woodCenter);

    // Subtle Technical Grid Lines on Floor
    const grid = new THREE.GridHelper(6, 12, 0xE50914, 0x22222a);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // Stance Foot Placement Indicators
    const footMat = new THREE.MeshBasicMaterial({ color: 0xE50914, transparent: true, opacity: 0.4 });
    const footGeo = new THREE.BoxGeometry(0.18, 0.01, 0.38);

    const leftStance = new THREE.Mesh(footGeo, footMat);
    leftStance.position.set(-0.24, 0.01, 0);
    this.scene.add(leftStance);

    const rightStance = new THREE.Mesh(footGeo, footMat);
    rightStance.position.set(0.24, 0.01, 0);
    this.scene.add(rightStance);
  }

  createBarbell() {
    this.barbellGroup = new THREE.Group();

    // Steel Shaft (220cm Olympic Bar)
    const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 24);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      metalness: 0.95,
      roughness: 0.15
    });
    const bar = new THREE.Mesh(barGeo, chromeMat);
    bar.rotation.z = Math.PI / 2;
    bar.castShadow = true;
    this.barbellGroup.add(bar);

    // Knurling center indicator
    const centerKnurlGeo = new THREE.CylinderGeometry(0.0152, 0.0152, 0.15, 16);
    const knurlMat = new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.8, roughness: 0.7 });
    const centerKnurl = new THREE.Mesh(centerKnurlGeo, knurlMat);
    centerKnurl.rotation.z = Math.PI / 2;
    this.barbellGroup.add(centerKnurl);

    // Left & Right Olympic Bumpers (Calibrated 450mm diameter Olympic Plates in Ribeiro Red)
    const plateGeo = new THREE.CylinderGeometry(0.225, 0.225, 0.05, 32);
    const redPlateMat = new THREE.MeshStandardMaterial({
      color: 0xE50914,
      metalness: 0.3,
      roughness: 0.4
    });
    const blackPlateMat = new THREE.MeshStandardMaterial({
      color: 0x16161a,
      metalness: 0.5,
      roughness: 0.5
    });

    // Inner Red Plates
    const leftPlate1 = new THREE.Mesh(plateGeo, redPlateMat);
    leftPlate1.rotation.z = Math.PI / 2;
    leftPlate1.position.x = -0.72;
    leftPlate1.castShadow = true;
    this.barbellGroup.add(leftPlate1);

    const rightPlate1 = new THREE.Mesh(plateGeo, redPlateMat);
    rightPlate1.rotation.z = Math.PI / 2;
    rightPlate1.position.x = 0.72;
    rightPlate1.castShadow = true;
    this.barbellGroup.add(rightPlate1);

    // Outer Heavy Black Plates
    const leftPlate2 = new THREE.Mesh(plateGeo, blackPlateMat);
    leftPlate2.rotation.z = Math.PI / 2;
    leftPlate2.position.x = -0.78;
    leftPlate2.castShadow = true;
    this.barbellGroup.add(leftPlate2);

    const rightPlate2 = new THREE.Mesh(plateGeo, blackPlateMat);
    rightPlate2.rotation.z = Math.PI / 2;
    rightPlate2.position.x = 0.78;
    rightPlate2.castShadow = true;
    this.barbellGroup.add(rightPlate2);

    // Olympic Collars (Chrome Silver)
    const collarGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.035, 16);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const leftCollar = new THREE.Mesh(collarGeo, collarMat);
    leftCollar.rotation.z = Math.PI / 2;
    leftCollar.position.x = -0.83;
    this.barbellGroup.add(leftCollar);

    const rightCollar = new THREE.Mesh(collarGeo, collarMat);
    rightCollar.rotation.z = Math.PI / 2;
    rightCollar.position.x = 0.83;
    this.barbellGroup.add(rightCollar);

    // Initial position on floor (Bumper radius = 0.225m)
    this.barbellGroup.position.set(0, 0.225, 0);
    this.scene.add(this.barbellGroup);
  }

  createKinematicLifter() {
    this.lifterGroup = new THREE.Group();

    // Sleek anatomical graphite / carbon material
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x222228,
      roughness: 0.45,
      metalness: 0.6
    });

    // Glowing Scarlet Red Active Muscle Material
    this.activeMuscleMat = new THREE.MeshStandardMaterial({
      color: 0xE50914,
      emissive: 0x990000,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.4
    });

    // 1. Pelvis / Hips (Root of body kinematics)
    const pelvisGeo = new THREE.BoxGeometry(0.32, 0.16, 0.22);
    const pelvis = new THREE.Mesh(pelvisGeo, this.activeMuscleMat);
    pelvis.castShadow = true;
    this.joints.pelvis = pelvis;
    this.lifterGroup.add(pelvis);
    this.muscleMeshes.push(pelvis);

    // 2. Spine / Torso (Lumbar + Thoracic)
    this.joints.torsoPivot = new THREE.Group();
    pelvis.add(this.joints.torsoPivot);

    const torsoGeo = new THREE.BoxGeometry(0.36, 0.48, 0.24);
    const torso = new THREE.Mesh(torsoGeo, carbonMat);
    torso.position.y = 0.32;
    torso.castShadow = true;
    this.joints.torsoPivot.add(torso);
    this.joints.torso = torso;

    // Latissimus Dorsi / Back muscle activation zone
    const latsGeo = new THREE.BoxGeometry(0.38, 0.35, 0.08);
    const lats = new THREE.Mesh(latsGeo, this.activeMuscleMat);
    lats.position.set(0, 0.32, -0.1);
    this.joints.torsoPivot.add(lats);
    this.joints.lats = lats;

    // 3. Head & Neck
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12);
    const neck = new THREE.Mesh(neckGeo, carbonMat);
    neck.position.y = 0.62;
    this.joints.torsoPivot.add(neck);

    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, carbonMat);
    head.position.y = 0.74;
    this.joints.torsoPivot.add(head);

    // 4. Arms (Hanging vertically down to grip bar)
    // Left Arm
    this.joints.leftShoulder = new THREE.Group();
    this.joints.leftShoulder.position.set(-0.26, 0.50, 0);
    this.joints.torsoPivot.add(this.joints.leftShoulder);

    const armGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.68, 12);
    const leftArm = new THREE.Mesh(armGeo, carbonMat);
    leftArm.position.y = -0.34;
    leftArm.castShadow = true;
    this.joints.leftShoulder.add(leftArm);

    // Right Arm
    this.joints.rightShoulder = new THREE.Group();
    this.joints.rightShoulder.position.set(0.26, 0.50, 0);
    this.joints.torsoPivot.add(this.joints.rightShoulder);

    const rightArm = new THREE.Mesh(armGeo, carbonMat);
    rightArm.position.y = -0.34;
    rightArm.castShadow = true;
    this.joints.rightShoulder.add(rightArm);

    // 5. Legs (Left & Right Femur and Tibia)
    // Feet
    const footGeo = new THREE.BoxGeometry(0.12, 0.08, 0.26);
    this.joints.leftFoot = new THREE.Mesh(footGeo, carbonMat);
    this.joints.leftFoot.position.set(-0.24, 0.04, 0);
    this.lifterGroup.add(this.joints.leftFoot);

    this.joints.rightFoot = new THREE.Mesh(footGeo, carbonMat);
    this.joints.rightFoot.position.set(0.24, 0.04, 0);
    this.lifterGroup.add(this.joints.rightFoot);

    // Thighs and Shins (Will be dynamically positioned in kinematics calculation)
    const thighGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.44, 12);
    this.joints.leftThigh = new THREE.Mesh(thighGeo, this.activeMuscleMat);
    this.joints.rightThigh = new THREE.Mesh(thighGeo, this.activeMuscleMat);
    this.lifterGroup.add(this.joints.leftThigh);
    this.lifterGroup.add(this.joints.rightThigh);

    const shinGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.42, 12);
    this.joints.leftShin = new THREE.Mesh(shinGeo, carbonMat);
    this.joints.rightShin = new THREE.Mesh(shinGeo, carbonMat);
    this.lifterGroup.add(this.joints.leftShin);
    this.lifterGroup.add(this.joints.rightShin);

    // Knees (Spheres)
    const kneeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    this.joints.leftKnee = new THREE.Mesh(kneeGeo, carbonMat);
    this.joints.rightKnee = new THREE.Mesh(kneeGeo, carbonMat);
    this.lifterGroup.add(this.joints.leftKnee);
    this.lifterGroup.add(this.joints.rightKnee);

    this.scene.add(this.lifterGroup);
  }

  createForceVectors() {
    this.vectorGroup = new THREE.Group();

    // 1. Vertical Ground Reaction Force Vectors (Left & Right Foot)
    const arrowDir = new THREE.Vector3(0, 1, 0);
    const arrowOriginL = new THREE.Vector3(-0.24, 0.08, 0);
    const arrowOriginR = new THREE.Vector3(0.24, 0.08, 0);
    
    this.arrowL = new THREE.ArrowHelper(arrowDir, arrowOriginL, 0.55, 0xE50914, 0.12, 0.06);
    this.arrowR = new THREE.ArrowHelper(arrowDir, arrowOriginR, 0.55, 0xE50914, 0.12, 0.06);
    this.vectorGroup.add(this.arrowL);
    this.vectorGroup.add(this.arrowR);

    // 2. Pure Vertical Bar Path Laser Guideline (Center)
    const laserMat = new THREE.LineDashedMaterial({
      color: 0x00FF88,
      dashSize: 0.05,
      gapSize: 0.03,
      linewidth: 2
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1.8, 0)
    ]);
    const laserLine = new THREE.Line(laserGeo, laserMat);
    laserLine.computeLineDistances();
    this.vectorGroup.add(laserLine);

    // 3. Dynamic Center of Gravity / Mid-Foot Indicator
    const cogGeo = new THREE.RingGeometry(0.08, 0.12, 32);
    const cogMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
    const cog = new THREE.Mesh(cogGeo, cogMat);
    cog.rotation.x = Math.PI / 2;
    cog.position.set(0, 0.015, 0);
    this.vectorGroup.add(cog);

    this.scene.add(this.vectorGroup);
  }

  setupControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 2.0;
      this.controls.maxDistance = 7.0;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't clip below floor
      this.controls.target.set(0, 0.75, 0);
      this.controls.enableZoom = false; // Prevent trapping vertical scroll on mobile
      this.controls.update();
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const isMobile = window.innerWidth < 640;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || (isMobile ? 380 : 560);

    this.camera.aspect = width / height;
    this.camera.fov = isMobile ? 50 : 45;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    if (this.controls) {
      this.controls.update();
    }
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());

    // Phase Buttons
    const phaseBtns = document.querySelectorAll("[data-phase-btn]");
    phaseBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const phaseVal = parseFloat(btn.getAttribute("data-phase-btn"));
        this.setPhase(phaseVal);
        
        phaseBtns.forEach(b => b.classList.remove("active-phase"));
        btn.classList.add("active-phase");
      });
    });

    // Scrubbing Range Slider
    const scrubber = document.getElementById("deadlift-scrubber");
    if (scrubber) {
      scrubber.addEventListener("input", (e) => {
        this.isAutoPlaying = false;
        this.updatePlayBtnState();
        this.setPhase(parseFloat(e.target.value));
      });
    }

    // Play/Pause Auto Demonstration
    const playBtn = document.getElementById("deadlift-play-toggle");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        this.isAutoPlaying = !this.isAutoPlaying;
        this.updatePlayBtnState();
      });
    }

    // Toggle Force Vectors
    const vectorToggle = document.getElementById("deadlift-vector-toggle");
    if (vectorToggle) {
      vectorToggle.addEventListener("click", () => {
        this.showVectors = !this.showVectors;
        this.vectorGroup.visible = this.showVectors;
        vectorToggle.classList.toggle("bg-red-600", this.showVectors);
        vectorToggle.classList.toggle("text-white", this.showVectors);
      });
    }

    // Camera Presets
    const camPresets = document.querySelectorAll("[data-cam-preset]");
    camPresets.forEach(presetBtn => {
      presetBtn.addEventListener("click", () => {
        const mode = presetBtn.getAttribute("data-cam-preset");
        this.setCameraPreset(mode);
        camPresets.forEach(p => p.classList.remove("active-cam"));
        presetBtn.classList.add("active-cam");
      });
    });
  }

  setCameraPreset(mode) {
    if (!this.controls) return;
    
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    let targetPos = { x: 3.4, y: 1.8, z: 3.8 };
    let lookTarget = { x: 0, y: 0.75, z: 0 };

    if (mode === "sagittal") {
      // Direct Side view for spinal neutrality and bar path
      targetPos = { x: 4.8, y: 0.85, z: 0.05 };
    } else if (mode === "front") {
      // Direct Frontal view for stance width & grip
      targetPos = { x: 0.05, y: 1.0, z: 4.6 };
    } else if (mode === "perspective") {
      // Dynamic 3/4 athletic view
      targetPos = { x: 3.2, y: 1.7, z: 3.5 };
    }

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => this.controls.update()
    });

    gsap.to(this.controls.target, {
      x: lookTarget.x,
      y: lookTarget.y,
      z: lookTarget.z,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => this.controls.update()
    });
  }

  updatePlayBtnState() {
    const playBtn = document.getElementById("deadlift-play-toggle");
    if (!playBtn) return;
    const icon = playBtn.querySelector("i, span");
    if (this.isAutoPlaying) {
      playBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Pausar</span>`;
      playBtn.classList.add("border-red-500", "text-red-400");
    } else {
      playBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Execução Contínua</span>`;
      playBtn.classList.remove("border-red-500", "text-red-400");
    }
  }

  setPhase(val) {
    this.targetProgress = Math.max(0, Math.min(1, val));
    
    // Update scrubber input value
    const scrubber = document.getElementById("deadlift-scrubber");
    if (scrubber && Math.abs(parseFloat(scrubber.value) - val) > 0.01) {
      scrubber.value = val;
    }

    // Determine nearest phase key for card updates
    let key = 0.0;
    if (val > 0.75) key = 1.0;
    else if (val > 0.25) key = 0.5;
    
    this.updateFloatingCard(key);
  }

  updateFloatingCard(phaseKey) {
    const data = this.phaseData[phaseKey];
    if (!data) return;

    const titleEl = document.getElementById("3d-card-title");
    const badgeEl = document.getElementById("3d-card-badge");
    const cuesContainer = document.getElementById("3d-card-cues");
    const musclesContainer = document.getElementById("3d-card-muscles");

    if (titleEl) titleEl.innerText = data.title;
    if (badgeEl) badgeEl.innerText = data.badge;

    if (cuesContainer) {
      cuesContainer.innerHTML = data.cues.map(c => `
        <div class="flex items-start gap-2 text-xs text-gray-300">
          <span class="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
          <div>
            <strong class="text-white block font-semibold">${c.label}</strong>
            <span class="text-gray-400">${c.desc}</span>
          </div>
        </div>
      `).join("");
    }

    if (musclesContainer) {
      musclesContainer.innerHTML = data.muscles.map(m => `
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-300">${m}</span>
      `).join("");
    }
  }

  updateKinematics(p) {
    // Inverse Kinematics calculations for human Deadlift
    // p = 0.0 (Setup / Floor), p = 0.5 (Passing Knee), p = 1.0 (Full Lockout)
    
    // Barbell height: Floor (0.225m) to mid-thigh lockout (0.88m)
    const barY = 0.225 + (0.88 - 0.225) * p;
    this.barbellGroup.position.y = barY;

    // Pelvis position: Hinged back in setup (Z = -0.32, Y = 0.52), standing upright in lockout (Z = 0, Y = 0.94)
    const pelvisY = 0.52 + (0.94 - 0.52) * p;
    const pelvisZ = -0.32 * (1 - p);
    this.joints.pelvis.position.set(0, pelvisY, pelvisZ);

    // Torso angle (hinge at pelvis):
    // Setup: ~45° incline forward (X rotation: 0.78 rad)
    // Lockout: 0° upright (X rotation: 0.0 rad)
    const torsoRotX = 0.78 * (1 - p);
    this.joints.torsoPivot.rotation.x = torsoRotX;

    // Shoulders & Arms:
    // Arms hang down and connect with the bar at (0, barY, 0)
    // Adjust shoulder pitch so arms stay anchored towards the bar
    const armAngle = -torsoRotX * 0.95;
    this.joints.leftShoulder.rotation.x = armAngle;
    this.joints.rightShoulder.rotation.x = armAngle;

    // Legs Geometry: Knee position moves forward in setup, extends in lockout
    const kneeY = 0.40 + (0.48 - 0.40) * p;
    const kneeZ = 0.08 * (1 - p);

    // Position left & right knees
    this.joints.leftKnee.position.set(-0.24, kneeY, kneeZ);
    this.joints.rightKnee.position.set(0.24, kneeY, kneeZ);

    // Connect Thighs between Pelvis and Knee
    this.orientSegment(this.joints.leftThigh, new THREE.Vector3(-0.24, pelvisY, pelvisZ), this.joints.leftKnee.position);
    this.orientSegment(this.joints.rightThigh, new THREE.Vector3(0.24, pelvisY, pelvisZ), this.joints.rightKnee.position);

    // Connect Shins between Knee and Ankle
    this.orientSegment(this.joints.leftShin, this.joints.leftKnee.position, new THREE.Vector3(-0.24, 0.08, 0));
    this.orientSegment(this.joints.rightShin, this.joints.rightKnee.position, new THREE.Vector3(0.24, 0.08, 0));

    // Dynamic Muscle Glowing Intensities based on mechanical load
    if (this.activeMuscleMat) {
      // Pulse emission based on lift phase
      const intensity = 0.6 + Math.sin(p * Math.PI) * 0.8;
      this.activeMuscleMat.emissiveIntensity = intensity;
    }

    // Dynamic ground reaction force vector heights
    if (this.arrowL && this.arrowR) {
      const forceScale = 0.45 + (1 - p * 0.5) * 0.35; // Maximum drive off the floor
      this.arrowL.setLength(forceScale, 0.12, 0.06);
      this.arrowR.setLength(forceScale, 0.12, 0.06);
    }
  }

  orientSegment(mesh, pointA, pointB) {
    const dir = new THREE.Vector3().subVectors(pointB, pointA);
    const len = dir.length();
    mesh.position.copy(pointA).addScaledVector(dir, 0.5);
    mesh.scale.set(1, len / 0.44, 1);
    
    // Align mesh orientation with the direction vector
    const up = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  }

  setupVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animFrameId) {
          this.render();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.container);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 560;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    if (!this.isVisible && this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
      return;
    }

    this.animFrameId = requestAnimationFrame(() => this.render());

    // Auto-play oscillation
    if (this.isAutoPlaying) {
      this.targetProgress += this.autoPlaySpeed * this.autoPlayDir;
      if (this.targetProgress >= 1.0) {
        this.targetProgress = 1.0;
        this.autoPlayDir = -1;
      } else if (this.targetProgress <= 0.0) {
        this.targetProgress = 0.0;
        this.autoPlayDir = 1;
      }
      this.setPhase(this.targetProgress);
    }

    // Smooth Lerp towards targetProgress
    const delta = (this.targetProgress - this.currentProgress) * 0.12;
    if (Math.abs(delta) > 0.0005) {
      this.currentProgress += delta;
      this.updateKinematics(this.currentProgress);
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  renderFallback() {
    this.container.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 rounded-2xl border border-red-900/40">
        <div class="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h4 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">Módulo Biomecânico Ativo</h4>
        <p class="text-sm text-gray-400 max-w-md mb-4">Análise cinética dos 3 momentos do Levantamento Terra: Saída com ativação de dorsais, tração com leg-drive e bloqueio de glúteos.</p>
        <div class="flex gap-2">
          <span class="px-3 py-1 bg-red-900/40 border border-red-600/30 rounded-full text-xs text-red-300 font-semibold">Setup</span>
          <span class="px-3 py-1 bg-red-900/40 border border-red-600/30 rounded-full text-xs text-red-300 font-semibold">Tração</span>
          <span class="px-3 py-1 bg-red-900/40 border border-red-600/30 rounded-full text-xs text-red-300 font-semibold">Lockout</span>
        </div>
      </div>
    `;
  }
}

// Global initialization hook
window.DeadliftBiomechanics3D = DeadliftBiomechanics3D;
