import * as THREE from "three";

export default class BubbleAnimation {
    constructor(scene,frustumSize,width,height) {


        this.frustumSize = 100;
        this.aspect = window.innerWidth / window.innerHeight;
        this.maxParticles = 60;
        this.particles = [];
        this.mouse = new THREE.Vector2(0, 0);

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.OrthographicCamera(
            this.frustumSize * this.aspect / -2, this.frustumSize * this.aspect / 2,
            this.frustumSize / 2, this.frustumSize / -2, 1, 1000
        );
        this.camera.position.z = 1;

        this.geometry = new THREE.CircleGeometry(0.5, 32);
        this.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`),
            transparent: true,
            opacity: 0.8,
        });
        this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxParticles);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.instancedMesh);

        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }

        this.addEventListeners();
        this.animate();
    }

    addEventListeners() {
        window.addEventListener("mousemove", (e) => this.onMouseMove(e));
        window.addEventListener("resize", () => this.onResize());
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.aspect = width / height;
        this.renderer.setSize(width, height);

        this.camera.left = this.frustumSize * this.aspect / -2;
        this.camera.right = this.frustumSize * this.aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = this.frustumSize / -2;
        this.camera.updateProjectionMatrix();
    }

    createParticle() {
        const particle = {
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            size: 0,
            maxLife: 0,
            life: 0,
            init: (mouseX, mouseY, frustumSize, aspect) => {
                particle.position.set(
                    mouseX * frustumSize * aspect,
                    mouseY * frustumSize,
                    0
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3,
                    0
                );
                particle.size = Math.random() * 5 + 5;
                particle.maxLife = Math.random() * 50 + 100;
                particle.life = 0;
            },
            update: () => {
                particle.position.add(particle.velocity);
                particle.velocity.multiplyScalar(0.99);
                particle.size *= 0.99;
                particle.life++;
                return particle.life <= particle.maxLife && particle.size > 0.1;
            }
        };
        return particle;
    }

    updateParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = this.particles[i];
            if (!particle.update()) {
                particle.init(this.mouse.x, this.mouse.y, this.frustumSize, this.aspect);
            }

            const dummy = new THREE.Object3D();
            dummy.position.copy(particle.position);
            dummy.scale.set(particle.size, particle.size, particle.size);
            dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateParticles();
        this.renderer.render(this.scene, this.camera);
    }
}

new BubbleAnimation();
