class Player {
    constructor(scene, camera, dolly, terrain) {
        this.scene = scene
        this.camera = camera
        this.dolly = dolly
        this.terrain = terrain
        this.pos = 0
        this.initScene()
        this.camera.fov = 10
    }

    initScene() {
        this.dolly.rotation.y = -Math.PI / 2
        this.dolly.position.x += (this.terrain.width * 2) - this.terrain.width / 2
        this.pos = this.dolly.position.x
        console.log("first move")
    }

    update(){
        this.dolly.position.x += 0.1
        if (this.dolly.position.x > (this.terrain.width / 2) + this.pos) {
            this.terrain.moveTiles()
            this.pos += this.terrain.width
        }
    }

}

export { Player }