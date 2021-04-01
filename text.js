class Text {
    constructor(scene, camera, THREE) {
        this.THREE = THREE
        this.scene = scene
        this.initScene()
    }

    initScene() {
        // Load Font
        console.log("loading font currently")
        const loader = new this.THREE.FontLoader();
        const self = this
        loader.load( 'libs/fonts/PressStart2P-Regular.json', function ( font ) {
            try {
                console.log("loaded font")
                const geometry = new self.THREE.TextGeometry( "Hello three.js!", {
                    font: font,
                    size: 80,
                    height: 5,
                } );

                geometry.computeBoundingBox()
                const material = new self.THREE.MeshPhongMaterial( { color: 0xff38b9, fog: false} ) // front

                const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

                const mesh = new self.THREE.Mesh(geometry, material)
                
                mesh.position.x = centerOffset

                self.scene.add(mesh)
            } catch (e) {
                console.error(e)
            }
        } );
    }

    update(){

    }
}

export { Text }