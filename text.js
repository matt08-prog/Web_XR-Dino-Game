import { TTFLoader } from './libs/three/js/TTFLoader.js'

class Text {
    constructor(scene, camera, THREE) {
        this.THREE = THREE
        this.scene = scene
        this.first = true
        this.font
        this.initScene()
    }

    initScene() {

        // Load Font
        console.log("loading font currently")
        const self = this

        this.loader = new TTFLoader()
        this.fontLoader = new this.THREE.FontLoader()
        this.loader.load('./libs/fonts/PressStart2P-Regular.ttf', fnt => {
            this.font = this.fontLoader.parse(fnt)
            this.loadFont("0000")
        })
    }

    loadFont(text) {

        if(this.mesh) {
            this.scene.remove(this.mesh)
        }

        try {
            console.log("loaded font")
            
            const geometry = new this.THREE.TextGeometry( "score:" + text, {
                font: this.font,
                size: 5,
                height: 5,
            } );

            geometry.computeBoundingBox()
            const material = new this.THREE.MeshPhongMaterial( { color: 0x6e6e6e, fog: false} ) // front

            const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

            this.mesh = new this.THREE.Mesh(geometry, material)
            this.mesh.name = "text"
            
            this.mesh.position.z = centerOffset
            this.mesh.position.y = 16
            this.mesh.rotation.y = -Math.PI / 2
            this.scene.add(this.mesh)
        } catch (e) {
            console.error(e)
        }
    }

    update(){

    }
}

export { Text }