class Player {
    constructor(scene, camera, dolly, terrain, text) {
        this.scene = scene
        this.camera = camera
        this.dolly = dolly
        this.terrain = terrain
        this.text = text
        this.pos = 0
        this.zPos = 0
        this.yPos = 3
        this.jump = false
        this.floor = true
        this.acceleration = 0
        this.gravity = 0.01
        this.playerSpeed = 2.8
        this.spot = 5
        this.initScene()
        this.camera.fov = 10
        this.score = 0
        this.length = 0
    }

    initScene() {
        this.dolly.rotation.y = -Math.PI / 2
        this.dolly.position.x += (this.terrain.width * 2) - this.terrain.width / 2
        this.dolly.position.z = 0
        this.pos = this.dolly.position.x
        //console.log("setup camera position")
        setInterval(() =>{
            this.playerSpeed += 0.2
            
            //console.log("increase speed")
        }, 8350)

        setInterval (() => {
            this.score += 10
            //this.length = this.score.toString().length
            if(this.text) {
                //console.log(this.score)
                this.text.loadFont(this.score.toString().padStart(5, '0'))
            }
        }, 100)
    }

    update(){
        this.dolly.position.x += 0.1 * this.playerSpeed
        if (this.text.mesh) {
            // if (this.text.first) {
            //     this.text.first = false
            //     this.text.mesh.position.x += this.dolly.position.x + ((this.terrain.width * 2) - this.terrain.width / 2)
            // }
            //console.log("mesh is real")
            this.text.mesh.position.x = this.dolly.position.x + ((this.terrain.width * 2) - this.terrain.width / 2)
            //console.log(this.text.mesh.position.x)
        }

        if (this.dolly.position.x > (this.terrain.width / 2) + this.pos) {
            this.terrain.moveTiles()
            this.pos += this.terrain.width
        }
        //console.log(this.dolly.position.z)
        this.dolly.position.z = this.zPos

        if(this.floor && this.jump) {
            this.acceleration = 0.4
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

        if(this.zPos > 0) {
            this.spot = 6
        } else if(this.zPos < 0) {
            this.spot = 4
        } else {
            this.spot = 5
        }
        if(this.jump && this.spot > 3) {
            this.spot -= 3
        }
        console.log(`${this.spot} from zPos: ${this.zPos}`)
    }
}

export { Player }