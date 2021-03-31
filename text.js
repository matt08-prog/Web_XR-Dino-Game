class Text {
    constructor(scene, camera, THREE) {
        this.THREE = THREE
        this.initScene()
    }

    initScene() {
        // Load Font
        const loader = new this.THREE.FontLoader();

        loader.load( 'libs/fonts/PressStart2P-Regular.ttf', function ( font ) {

            const geometry = new this.THREE.TextGeometry( 'Hello three.js!', {
                font: font,
                size: 80,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5
            } );
        } );
    }

    update(){

    }
}

export { Text }