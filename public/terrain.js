import * as THREE from './libs/three/three.module.js';
//import {openSimplexNoise} from './simplexNoise.js'

class Terrain {
    constructor(scene) {
        this.scene = scene
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
        this.backTile = this.groupA

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
        console.log(this.frequency)


        // setInterval(function() {
        //     self.frequency += 1
        //     console.log(self.frequency)
        //     self.scene.remove(self.plane)
        //     self.changeTerrain()
        //     self.BuildTerrain()
        // }, 1000)
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

            this.groupC.add(plane.clone())
            this.groupC.add(secondPlane.clone())
            this.groupC.position.x += this.width * 2

            this.groupD.add(plane.clone())
            this.groupD.add(secondPlane.clone())
            this.groupD.position.x += this.width * 3

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

    sat(x){
        return Math.min(Math.max(x, 0.0), 1.0);
    }

    changeTerrain(){
        this.width = 50
        this.height = 50

        var geometry = new THREE.PlaneGeometry( this.width, this.height, 150, 150 );
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
            if ((v.y >= 10 || v.y <= -10) && v.x <= (this.width / 2) - 1) {
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

    update(){
        // this.groupA.position.x -= 0.1
        // this.groupB.position.x -= 0.1
        // this.groupC.position.x -= 0.1
        // this.groupD.position.x -= 0.1
        if (this.groupA.position.x < -this.width / 2) {
            this.groupA.position.x += this.width * 4
        }
        if (this.groupB.position.x < -this.width / 2) {
            this.groupB.position.x += this.width * 4
        }
        if (this.groupC.position.x < -this.width / 2) {
            this.groupC.position.x += this.width * 4
        }
        if (this.groupD.position.x < -this.width / 2) {
            this.groupD.position.x += this.width * 4
        }
    }
    moveTiles(){
        console.log("fin")
        switch(this.backTile) {
            case this.groupA:
                this.groupA.position.x += this.width * 4
                this.backTile = this.groupB
                break;
            case this.groupB:
                this.groupB.position.x += this.width * 4
                this.backTile = this.groupC
                break;
            case this.groupC:
                this.groupC.position.x += this.width * 4
                this.backTile = this.groupD
                break;
            case this.groupD:
                this.groupD.position.x += this.width * 4
                this.backTile = this.groupA
                break;
        }
    }
}

export { Terrain };