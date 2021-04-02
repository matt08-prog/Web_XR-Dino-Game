import { TTFLoader } from './libs/three/js/TTFLoader.js'

class Text {
    constructor(scene, camera, THREE) {
        this.THREE = THREE
        this.scene = scene
        this.first = true
        this.initScene()
    }

    initScene() {

        // Load Font
        console.log("loading font currently")
        const self = this
        let font;
        const loader = new TTFLoader()
        const fontLoader = new this.THREE.FontLoader()
        loader.load('./libs/fonts/PressStart2P-Regular.ttf', fnt => {
            font = fontLoader.parse(fnt)
            try {
                console.log("loaded font")
                
                const geometry = new self.THREE.TextGeometry( "Hello three.js!", {
                    font: font,
                    size: 6,
                    height: 5,
                } );

                geometry.computeBoundingBox()
                const material = new self.THREE.MeshPhongMaterial( { color: 0xff38b9, fog: false} ) // front

                const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

                self.mesh = new self.THREE.Mesh(geometry, material)
                
                self.mesh.position.x = centerOffset / 2
                self.mesh.rotation.y = -Math.PI / 2
                self.mesh.position.y = 8
                self.scene.add(self.mesh)
            } catch (e) {
                console.error(e)
            }
        })
    }

    update(){

    }
}

export { Text }