// Doc : http://www.karlsims.com/rd.html

class Game {
    constructor() {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.scene = new THREE.Scene()
        this.bufferScene = new THREE.Scene()
        this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height /- 2, 1, 1000)
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.stats = new Stats()
        this.shaders = []
        this.textures = {}
        this.selectTypeBox = null
        this.resetBt = null
        this.simulationSpeed = 20
        this.simulationVariables = {
            f: 0,
            k: 0,
            DA: 1.0,
            DB: 0.5
        }
        this.initialSimulationType = "Waves"
        this.simulationTypes = {
            "Dots": {
                f: 0.0367,
                k: 0.0649
            },
            "Maze 1": {
                f: 0.0545,
                k: 0.062
            },
            "Maze 2": {
                f: 0.035,
                k: 0.06
            },
            "Waves": {
                f: 0.0118,
                k: 0.0475
            }
        }

        this.planeMesh = null
        this.bufferPlaneMesh = null

        this.renderer.setSize(this.width, this.height)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setClearColor(0x000000, 1)

        this.renderer.domElement.width = this.width // hummm... threejs why
        this.renderer.domElement.height = this.height // hummm... threejs why

        document.body.appendChild(this.renderer.domElement)
        document.body.appendChild(this.stats.dom)

        window.addEventListener('resize', () => this.windowResize(), false)

        this.camera.position.z = 2

        this.initGui()

        this.initShaders(['shader.frag', 'shaderRender.frag'], () => {
            this.setSimulationType(this.initialSimulationType)
            this.initGeometry()
            this.render()
        })
    }

    initGui() {
        this.selectTypeBox = document.createElement("select")

        let i = 0
        for (var key in this.simulationTypes) {
            let option = document.createElement("option")
            option.value = key
            option.text = key
            this.selectTypeBox.append(option)

            if (key == this.initialSimulationType) {
                this.selectTypeBox.selectedIndex = i
            }
            i++
        }

        this.selectTypeBox.onchange = () => {
            let choice = this.selectTypeBox.options[this.selectTypeBox.selectedIndex].value
            this.setSimulationType(choice)
            this.initGeometry()
        }

        // -----------

        this.resetBt = document.createElement('button')
        this.resetBt.innerHTML = "Reset"
        this.resetBt.onclick = () => {
            this.initGeometry()
        }

        document.body.append(this.selectTypeBox)
        document.body.append(this.resetBt)
    }

    windowResize() {
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.width, this.height)
        this.renderer.domElement.width = this.width // hummm... threejs why
        this.renderer.domElement.height = this.height // hummm... threejs why
    }

    initShaders(fileList, callback) {
        var leftToFetch = fileList.length

        this.shaders = {}

        for (var i = 0; i < fileList.length; i++) {
            ajax.get(fileList[i], null, (data, file) => {
                this.shaders[file] = data
                leftToFetch -= 1
                if (leftToFetch === 0) callback()
            })
        }
    }

    setSimulationType(name) {
        for (var key in this.simulationTypes[name]) {
            this.simulationVariables[key] = this.simulationTypes[name][key]
        }
    }

    initGeometry() {
        this.textures.textureA = (new THREE.WebGLRenderTarget(this.width, this.height, { type: THREE.FloatType, minFilter: THREE.LinearFilter}))
        this.textures.textureB = (new THREE.WebGLRenderTarget(this.width, this.height, { type: THREE.FloatType, minFilter: THREE.LinearFilter}))

        let planeGeometry = new THREE.PlaneBufferGeometry(this.width, this.height)

        let bufferMaterial = new THREE.ShaderMaterial({
            uniforms: {
                bufferTexture: { type: "t", value: this.textures.textureA.texture },
                res : { type: 'v2', value: new THREE.Vector2(this.width, this.height) },
                initState: { type: 'f', value: 1.0 },
                f: { type: 'f', value: this.simulationVariables.f },
                k: { type: 'f', value: this.simulationVariables.k },
                DA: { type: 'DA', value: this.simulationVariables.DA },
                DB: { type: 'DB', value: this.simulationVariables.DB }
            },
        	fragmentShader: this.shaders['shader.frag']
        })

        this.bufferPlaneMesh = new THREE.Mesh(planeGeometry, bufferMaterial)
        this.bufferScene.add(this.bufferPlaneMesh)

        let planeMaterial =  new THREE.ShaderMaterial({
            uniforms: {
                bufferTexture: { type: "t", value: this.textures.textureB.texture },
                res : { type: 'v2', value: new THREE.Vector2(this.width, this.height) }
            },
        	fragmentShader: this.shaders['shaderRender.frag']
        })
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        this.scene.add(this.planeMesh)
    }

    update() {
        this.renderer.render(this.bufferScene, this.camera, this.textures.textureB, true)

        // Swap textureA and B
        let tmp = this.textures.textureA
        this.textures.textureA = this.textures.textureB
        this.textures.textureB = tmp

        this.planeMesh.material.uniforms.bufferTexture.value = this.textures.textureB.texture
        this.bufferPlaneMesh.material.uniforms.bufferTexture.value = this.textures.textureA.texture

        this.bufferPlaneMesh.material.uniforms.initState.value -= 1.0
    }

    render() {
    	requestAnimationFrame(() => this.render())

        for (var i = 0; i < this.simulationSpeed; i++) {
            this.update()
        }

    	this.renderer.render(this.scene, this.camera)
        this.stats.update()

        this.bufferPlaneMesh.material.needsUpdate = true
        this.planeMesh.material.needsUpdate = true
    }
}
