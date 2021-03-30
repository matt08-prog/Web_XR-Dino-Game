import * as THREE from './libs/three/three.module.js';
//import {openSimplexNoise} from './simplexNoise.js'

class Terrain {
    constructor(scene, cactus, pterodactyl, clock) {
        this.scene = scene
        this.cactus = cactus
        this.pterodactyl = pterodactyl
        this.clock = clock
        this.initScene()
    }

    initScene() {
        this.bWireframe = false
        this.background = false
        this.geometry
        this.backgroundGeometry
        this.color = 0x6e6e6e
        this.groupA = new THREE.Group();
        this.groupB = new THREE.Group();
        this.groupC = new THREE.Group();
        this.groupD = new THREE.Group();
        this.groups = []
        this.mixers = []

        this.groups.push(this.groupA)
        this.groups.push(this.groupB)
        this.groups.push(this.groupC)
        this.groups.push(this.groupD)

        this.backTile = this.groupA
        this.spawnerPositions = [-5,0,5]

        const seed = Date.now()
        this.openSimplex = openSimplexNoise(seed);
        this.frequency = 0.15
        this.newFrequency = 0.15
        this.redistribution = 5.1
        this.wait = 10
        this.changeTerrain()
        this.changeTerrain()
        this.background = true
        this.BuildFloor()
        self = this
        this.index = 0
    }

    BuildTerrain(geometry){
        //var color = 0xffffff * Math.random()
        if(this.bWireframe == true) {
            const wireframe = new THREE.WireframeGeometry( geometry );
            var plane = new THREE.LineSegments( wireframe );
            plane.material.depthTest = false;
            plane.material.opacity = 0.25;
            plane.material.transparent = true;

            this.scene.add(plane)
            plane.rotation.x = -Math.PI / 2
        } else {
            const material = new THREE.MeshPhongMaterial( {color: this.color, side: THREE.DoubleSide} );
            plane = new THREE.Mesh( geometry, material );

            this.scene.add(plane)
            plane.rotation.x = -Math.PI / 2
        }
        if(this.background) {
            let secondPlane = plane.clone()
            plane.position.z -= this.width
            plane.position.y -= 1
            plane.rotation.x = -70 * (Math.PI / 180)
            secondPlane.position.z += this.width
            secondPlane.position.y += 1
            secondPlane.rotation.x = -110 * (Math.PI / 180)

            this.groupA.add(plane)
            this.groupA.add(secondPlane)

            this.groupB.add(plane.clone())
            this.groupB.add(secondPlane.clone())
            this.groupB.position.x += this.width * 1
            this.groupB.scale.x *= -1

            this.groupC.add(plane.clone())
            this.groupC.add(secondPlane.clone())
            this.groupC.position.x += this.width * 2

            this.groupD.add(plane.clone())
            this.groupD.add(secondPlane.clone())
            this.groupD.position.x += this.width * 3
            this.groupD.scale.x *= -1

            this.scene.add(this.groupA)
            this.scene.add(this.groupB)
            this.scene.add(this.groupC)
            this.scene.add(this.groupD)

            
        } else {
            this.background = true
            this.groupA.add(plane)

            this.groupB.add(plane.clone())

            this.groupC.add(plane.clone())

            this.groupD.add(plane.clone())
        }
        
    }

    changeTerrain(){
        this.width = 50
        this.height = 50

        var geometry = new THREE.PlaneGeometry( this.width, this.height, 200, 200 );
        for (var i = 0; i < geometry.vertices.length; i++) {
            var v = geometry.vertices[i]
            let xf = (v.x) / this.width
            let yf = (v.z) / this.height

            if(this.frequency > 0) {
                let e = 1 * (this.openSimplex.noise2D(v.x * (this.frequency), v.y * (this.frequency)) + 1) +
                0.5 * (this.openSimplex.noise2D(v.x * (this.frequency *2), v.y * (this.frequency *2)) + 1) +
                0.25 * (this.openSimplex.noise2D(v.x * (this.frequency *4), v.y * (this.frequency *4)) + 1)
                e = e / (1 + 0.5 + 0.25)
                v.z = Math.pow(e, this.redistribution)
            }
            if (v.y >= 10 || v.y <= -10) {
                this.frequency = this.newFrequency
            } else if (this.background == false){
                this.frequency = 0
            }    
        }
        geometry.computeVertexNormals();
        this.BuildTerrain(geometry)
    }

    BuildFloor(){
        const geometry = new THREE.PlaneGeometry( 10000, 10000, 32 );
        const material = new THREE.MeshPhongMaterial( {color: this.color, side: THREE.DoubleSide} );
        const plane = new THREE.Mesh( geometry, material );
        this.scene.add( plane );
        plane.position.y = -1.0
        plane.rotation.x = -Math.PI / 2
    }

    moveTiles(){
        switch(this.backTile) {
            case this.groupA:
                this.groupA.position.x += this.width * 4
                this.backTile = this.groupB
                this.spawnCacti(this.groupA)
                this.spawnPterodactyl(this.groupA)
                break;
            case this.groupB:
                this.groupB.position.x += this.width * 4
                this.backTile = this.groupC
                this.spawnPterodactyl(this.groupB)
                break;
            case this.groupC:
                this.groupC.position.x += this.width * 4
                this.backTile = this.groupD
                this.spawnPterodactyl(this.groupC)
                break;
            case this.groupD:
                this.groupD.position.x += this.width * 4
                this.backTile = this.groupA
                this.spawnPterodactyl(this.groupD)
                break;
        }
    }

    spawnCacti(group) {
        this.index++
        let positions = [...this.spawnerPositions]
        let cacti = []

        group.traverse((child) => {
            if(child.name == "cactus"){
               cacti.push(child)
            }
        });

        cacti.forEach( (cactus) => {
            group.remove(cactus);
        })

        for(let i = 0; i < 3; i++) {
            if(Math.random() > 0.25 || i > 1) {
                let cactus = this.cactus.clone()
                let rand = Math.floor(Math.random() * positions.length)
                positions.splice(rand, 1)
                group.add(cactus)
                cactus.position.z = this.spawnerPositions[rand]
            }
        }
    }

    spawnPterodactyl(group) {
        this.index++
        let positions = [...this.spawnerPositions]
        let cacti = []

        group.traverse((child) => {
            if(child.name == "pterodactyl"){
               cacti.push(child)
               console.log("removed pterodactyl")
            }
        });

        cacti.forEach( (pterodactyl) => {
            group.remove(pterodactyl);
        })

        for(let i = 0; i < 3; i++) {
            if(Math.random() > 0.25 || i > 1) {
                let pterodactyl = this.pterodactyl.scene.clone()
                pterodactyl.name = "pterodactyl"
                this.mixer = new THREE.AnimationMixer(pterodactyl);
                this.mixers.push(this.mixer);

                this.pterodactyl.animations.forEach(( clip ) => {
                    this.mixer.clipAction(clip).play();
                });
                
                pterodactyl.position.y = 10
                pterodactyl.scale.x = 8
                pterodactyl.scale.y = 8
                pterodactyl.scale.z = 8
                pterodactyl.rotation.z = Math.PI / 2

                if(group == this.groupB || group == this.groupD) {
                    pterodactyl.scale.y *= -1
                }

                this.scene.add(pterodactyl)

                console.log(pterodactyl.name)

                let rand = Math.floor(Math.random() * positions.length)
                positions.splice(rand, 1)
                group.add(pterodactyl)
                pterodactyl.position.z = this.spawnerPositions[rand]
            }
        }
    }

    update() {
        const dt = this.clock.getDelta();
        console.log(this.mixers.length)
        this.mixers.forEach((mixer) => {
            //console.log("mixer updating")
            try {
                mixer.update(dt)
            } catch (e) {
                console.error(e)
            }
            
        })
    }
}

export { Terrain };