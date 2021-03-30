class Player {
    constructor(scene, camera, dolly, terrain) {
        this.scene = scene
        this.camera = camera
        this.dolly = dolly
        this.terrain = terrain
        this.pos = 0
        this.zPos = 0
        this.initScene()
        this.camera.fov = 10
        this.playerSpeed = 3
    }

    initScene() {
        this.dolly.rotation.y = -Math.PI / 2
        this.dolly.position.x += (this.terrain.width * 2) - this.terrain.width / 2
        this.dolly.position.z = 0
        this.pos = this.dolly.position.x
        console.log("setup camera position")
        setInterval(() =>{
            this.playerSpeed += 0.1
            console.log("increase speed")
        }, 8350)
    }

    update(){
        this.dolly.position.x += 0.1 * this.playerSpeed
        if (this.dolly.position.x > (this.terrain.width / 2) + this.pos) {
            this.terrain.moveTiles()
            this.pos += this.terrain.width
        }
        console.log(this.dolly.position.z)
        this.dolly.position.z = this.zPos
        this.dolly.position.y = 1.0
    }

}

export { Player }