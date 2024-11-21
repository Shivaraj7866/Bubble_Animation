import * as THREE from "three";

export default class BubbleAnimation {
    constructor(scene, frustumSize, width, height,texture) {
        this.scene = scene;
        this.frustumSize = frustumSize;
        this.aspect = width / height;

        this.maxParticles = 60;
        this.particles = [];
        this.mouse = new THREE.Vector2(0, 0);
        this.hue = 0.1;

        this.geometry = new THREE.CircleGeometry(0.5, 32);
        this.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xffffff * Math.random()),
            transparent: true,
            opacity: 0.8,
            // alphaMap:texture,
        });
        this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxParticles);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.instancedMesh);

        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }

        window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    }

    onMouseMove = (event) => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.hue += 0.01;
        if (this.hue > 0.99) this.hue = 0;
        this.instancedMesh.material.color.setHSL(this.hue, 1, 0.5);
        
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
                    mouseX * frustumSize * aspect * 0.5,
                    mouseY * frustumSize * 0.5,
                    0
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * frustumSize * 0.015,
                    (Math.random() - 0.5) * frustumSize * 0.015,
                    0
                );
                particle.size = Math.random() * frustumSize * 0.05 + frustumSize * 0.04;
                particle.maxLife = Math.random() * frustumSize * 0.5 + frustumSize;
                particle.life = 0;
     
            },
            update: () => {
                particle.position.add(particle.velocity);

                // Check for bounds and make particles bounce back
                if (
                    (particle.position.x + particle.size) > this.frustumSize * this.aspect * 0.5 ||
                    (particle.position.x - particle.size) < -this.frustumSize * this.aspect * 0.5) 
                    {
                    particle.velocity.x *= -1;
                }
                if ((particle.position.y + particle.size) > this.frustumSize * 0.5 ||
                     (particle.position.y - particle.size) < -this.frustumSize * 0.5)
                    {
                    particle.velocity.y *= -1;
                }

                particle.velocity.multiplyScalar(0.99);
                particle.size *= 0.99;
                particle.life += this.frustumSize * 0.01;
                return particle.life <= particle.maxLife && particle.size > this.frustumSize * 0.001;
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

            // Update instance matrix
            const dummy = new THREE.Object3D();
            dummy.position.copy(particle.position);
            dummy.scale.set(particle.size, particle.size, particle.size);
            dummy.opacity = particle.customOpacity;
            dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, dummy.matrix);
        }

        // Update instance matrix and colors
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
}
