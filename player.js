class Player {
    constructor(scene, camera, dolly, terrain) {
        this.scene = scene
        this.camera = camera
        this.dolly = dolly
        this.terrain = terrain
        this.pos = 0
        this.zPos = 0
        this.yPos = 3
        this.jump = false
        this.floor = true
        this.acceleration = 0
        this.gravity = 0.01
        this.playerSpeed = 2.8
        this.initScene()
        this.camera.fov = 10
        
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
        //console.log(this.dolly.position.z)
        this.dolly.position.z = this.zPos

        if(this.floor && this.jump) {
            this.acceleration = 0.65
            this.floor = false
            this.yPos += this.acceleration
            this.acceleration -= this.gravity
            this.dolly.position.y = this.yPos
        }

        if(this.dolly.position.y < 3) {
            this.speed = 0
            this.floor = true
            this.dolly.position.y = 3
        } else if(this.dolly.position.y > 3){
            console.log(this.acceleration)
            this.floor = false
            this.acceleration -= this.gravity
            this.yPos += this.acceleration
            this.dolly.position.y = this.yPos
        }
    }
}

export { Player }