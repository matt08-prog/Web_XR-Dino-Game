import * as THREE from './libs/three/three.module.js';
import { VRButton } from './libs/VRButton.js';
import { BoxLineGeometry } from './libs/three/jsm/BoxLineGeometry.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { Stats } from './libs/stats.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { SpotLightVolumetricMaterial } from './libs/SpotLightVolumetricMaterial.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';
import {
	Constants as MotionControllerConstants,
	fetchProfile,
	MotionController
} from './libs/three/jsm/motion-controllers.module.js';

import { Terrain } from './terrain.js';
import { Player } from './player.js';

const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        this.clock = new THREE.Clock();
        this.orbitOrigin = new THREE.Object3D()
        this.dolly = new THREE.Object3D()
        this.dolly.position.set(0,1.0,0)
        this.orbitOrigin.position.set(0,0,0)
        this.FOV = 50
		this.camera = new THREE.PerspectiveCamera( this.FOV, window.innerWidth / window.innerHeight, 0.01, 10000 );
        this.camera.updateProjectionMatrix()
		this.camera.position.set( 0, 50, 0);
        //this.camera.rotation.y = Math.PI / 2
        this.dolly.add( this.camera )
		this.scene = new THREE.Scene();
        this.orbitOrigin.add(this.dolly)
        this.scene.add(this.orbitOrigin)
        this.scene.background = new THREE.Color(  0xffffff );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;

        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();
        
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );

        this.raycaster = new THREE.Raycaster();
        this.workingMatrix = new THREE.Matrix4();
        this.workingVector = new THREE.Vector3();
        
        this.setupXR();
        this.getInputSources = true;

        window.addEventListener('resize', this.resize.bind(this) );
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
        // this.initScene();
        this.once = 0
	}	

    random( min, max ){
        return Math.random() * (max-min) + min;
    }
    
    initScene(){
        this.fog = true

        this.loadCactus().then(this.loadPterodactyl())
            .then((status) => {
                console.log(status)

                this.cactus.name = "cactus"
                this.Pterodactyl.name = "pterodactyl"
                this.terrain = new Terrain(this.scene, this.cactus, this.Pterodactyl, this.clock)
                this.player = new Player(this.scene, this.camera, this.dolly, this.terrain)
                if(this.fog) {
                    const color = 0xFFFFFF;  // white
                    const near = 10;
                    const far = 75;
                    this.scene.fog = new THREE.Fog(color, near, far);
                }
            }).catch(e => {
                console.log(e)
            })  
    }

    loadCactus(){
        return new Promise((resolve, reject) =>{
            const loader = new GLTFLoader()
            loader.setPath('./Assets/')
            loader.load('Cactus.gltf', (gltf) => {
                console.log("loaded")
                this.cactus = new THREE.Group();
                this.cactus.add(gltf.scene)
                this.cactus.position.y = 2.8
                resolve('success!')
            }, null, (error) => {
                reject('Failed')
            })
        })
    }

    loadPterodactyl(){
        return new Promise((resolve, reject) =>{
            const loader = new GLTFLoader()
            loader.setPath('./Assets/')
            loader.load('Pterodactyl.gltf', (gltf) => {
                console.log("loaded")
                this.Pterodactyl = gltf

                resolve('success!')
            }, null, (error) => {
                console.log(error)
                reject('Failed')
            })
        })
    }

    //{"trigger":{"button":0},"touchpad":{"button":2,"xAxis":0,"yAxis":1}},"squeeze":{"button":1},"thumbstick":{"button":3,"xAxis":2,"yAxis":3},"button":{"button":6}}}
    createButtonStates(components){

        const buttonStates = {};
        this.gamepadIndices = components;
        
        Object.keys( components ).forEach( (key) => {
            if ( key.indexOf('touchpad')!=-1 || key.indexOf('thumbstick')!=-1){
                buttonStates[key] = { button: 0, xAxis: 0, yAxis: 0 };
            }else{
                buttonStates[key] = 0; 
            }
        })
        
        this.buttonStates = buttonStates;
    }

    setupXR(){
        this.renderer.xr.enabled = true;
        
        const button = new VRButton( this.renderer );
        
        const self = this;
        
        function onConnected( event ){
            const info = {};
           
            fetchProfile( event.data, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {                
                info.name = profile.profileId;
                info.targetRayMode = event.data.targetRayMode;

                Object.entries( profile.layouts ).forEach( ( [key, layout] ) => {
                    const components = {};
                    Object.values( layout.components ).forEach( ( component ) => {
                        components[component.rootNodeName] = component.gamepadIndices;
                    });
                    info[key] = components;
                });

                self.createButtonStates( info.right );
                
                self.updateControllers( info );

            } );
        }
         
        const controller = this.renderer.xr.getController( 0 );
        
        controller.addEventListener( 'connected', onConnected );
        
        const modelFactory = new XRControllerModelFactory();
        
        const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0,0,0 ), new THREE.Vector3( 0,0,-1 ) ] );

        const line = new THREE.Line( geometry );
        line.scale.z = 0;
        
        this.controllers = {};
        this.dolly.position.set(0,-1.5,1.0)
        this.controllers.right = this.buildController( 0, line, modelFactory );
        this.controllers.left = this.buildController( 1, line, modelFactory );
    }
    
    buildController( index, line, modelFactory ){
        const controller = this.renderer.xr.getController( index );
        
        controller.userData.selectPressed = false;
        controller.userData.index = index;
        
        if (line) controller.add( line.clone() );
        
        this.dolly.add( controller );
        
        let grip;
        
        if ( modelFactory ){
            grip = this.renderer.xr.getControllerGrip( index );
            grip.add( modelFactory.createControllerModel( grip ));
            this.dolly.add( grip );
        }
        
        return { controller, grip };
    }
    
    updateControllers(info){
        const self = this;
        
        function onSelectStart( ){
            if (self.nodeSelected == false) {
                this.userData.selectPressed = true;
            }
        }

        function onSelectEnd( ){
            this.children[0].scale.z = 0;
            this.userData.selectPressed = false;
            this.userData.selected = undefined;
        }

        function onSqueezeStart( ){
            this.userData.squeezePressed = true;
            if (this.userData.selected !== undefined ){
                this.attach( this.userData.selected );
                this.userData.attachedObject = this.userData.selected;
            }
        }

        function onSqueezeEnd( ){
            this.userData.squeezePressed = false;
            if (this.userData.attachedObject !== undefined){
                self.room.attach( this.userData.attachedObject );
                this.userData.attachedObject = undefined;
            }
        }
        
        function onDisconnected(){
            const index = this.userData.index;
            console.log(`Disconnected controller ${index}`);
            
            if ( self.controllers ){
                const obj = (index==0) ? self.controllers.right : self.controllers.left;
                
                if (obj){
                    if (obj.controller){
                        const controller = obj.controller;
                        while( controller.children.length > 0 ) controller.remove( controller.children[0] );
                        self.scene.remove( controller );
                    }
                    if (obj.grip) self.scene.remove( obj.grip );
                }
            }
        }
        
        if (info.right !== undefined){
            const right = this.renderer.xr.getController(0);
            
            let trigger = false, squeeze = false;
            
            Object.keys( info.right ).forEach( (key) => {
                if (key.indexOf('trigger')!=-1) trigger = true;                   
                if (key.indexOf('squeeze')!=-1) squeeze = true;      
            });
            
            if (trigger){
                right.addEventListener( 'selectstart', onSelectStart );
                right.addEventListener( 'selectend', onSelectEnd );
            }

            if (squeeze){
                right.addEventListener( 'squeezestart', onSqueezeStart );
                right.addEventListener( 'squeezeend', onSqueezeEnd );
            }
            
            right.addEventListener( 'disconnected', onDisconnected );
        }
        
        if (info.left !== undefined){
            const left = this.renderer.xr.getController(1);
            
            let trigger = false, squeeze = false;
            
            Object.keys( info.left ).forEach( (key) => {
                if (key.indexOf('trigger')!=-1) trigger = true; 
                if (key.indexOf('squeeze')!=-1) squeeze = true;      
            });
            
            if (trigger){
                left.addEventListener( 'selectstart', onSelectStart );
                left.addEventListener( 'selectend', onSelectEnd );
            }

            if (squeeze){
                left.addEventListener( 'squeezestart', onSqueezeStart );
                left.addEventListener( 'squeezeend', onSqueezeEnd );
            }
            
            left.addEventListener( 'disconnected', onDisconnected );
        }
    }

    handleInput(controller){
        console.log(this.nodeSelected)
        if (this.wasPressed){
            this.workingMatrix.identity().extractRotation( controller.matrixWorld );

            this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
            this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.workingMatrix );

            const intersects = this.raycaster.intersectObjects( this.earth.children, true );

            if (intersects.length>0){
            }
        }
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        if(this.terrain) {
            this.terrain.update()
        }
        if(this.player && this.renderer.xr.isPresenting){
            this.player.update()
        }
        
        const dt = this.clock.getDelta();
        if(this.Pterodactyl){
            // console.log("update")
            // this.mixer.update(dt)
        }
        
        if (this.renderer.xr.isPresenting){
            if(this.once >= 1000){
                this.once = -1
                this.initScene();
            } else if(this.once >= 0) {
                this.once++
            }
            const session = this.renderer.xr.getSession();
            const inputSources = session.inputSources;
            const self = this; 
            if ( this.getInputSources ){    
                const info = [];

                inputSources.forEach( inputSource => {
                    const gp = inputSource.gamepad;
                    const axes = gp.axes;
                    const buttons = gp.buttons;
                    const mapping = gp.mapping;
                    this.useStandard = (mapping == 'xr-standard');
                    const gamepad = { axes, buttons, mapping };
                    const handedness = inputSource.handedness;
                    const profiles = inputSource.profiles;
                    this.type = "";
                    profiles.forEach( profile => {
                        if (profile.indexOf('touchpad')!=-1) this.type = 'touchpad';
                        if (profile.indexOf('thumbstick')!=-1) this.type = 'thumbstick';
                    });
                    const targetRayMode = inputSource.targetRayMode;
                    info.push({ gamepad, handedness, profiles, targetRayMode });
                });
                                    
                this.getInputSources = false;
            }else if (this.useStandard && this.type!=""){
                inputSources.forEach( inputSource => {
                    if (this.both == 0) {
                        const gp = inputSource.gamepad;
                        const thumbstick = (this.type=='thumbstick');
                        const offset = (thumbstick) ? 2 : 0;
                        const btnIndex = (thumbstick) ? 3 : 2;
                        const btnPressed = gp.buttons[btnIndex].pressed;
                        
                        if ( inputSource.handedness == 'right'){
                            if(gp.axes[offset] > 0) {
                               this.player.zPos = 1
                            } else if (gp.axes[offset] < 0) {
                                this.player.zPos = -1
                            } else {
                                this.player.zPos = 0
                            }
                            this.handleInput(this.controllers.right.controller)
                        }else if ( inputSource.handedness == 'left'){
                            if(gp.axes[offset] > 0) {
                                this.player.zPos = 5
                             } else if (gp.axes[offset] < 0) {
                                 this.player.zPos = -5
                             } else {
                                 this.player.zPos = 0
                             }
                        }
                    }
                })
            }
            if (this.elapsedTime===undefined) this.elapsedTime = 0;
            this.elapsedTime += dt;
        }else{
            this.stats.update();
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };