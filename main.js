import { machines } from './models/machines/machines.js';
import { setMachineProperties } from './models/machines/machines.js';

var gltfLoader = new THREE.GLTFLoader();

let renderer, camera, scene, orbitControls, dragControls;

var factoryBuilding;

var factoryDisposition = [];
var machinesOnScene = [];

var selectedMachineUUID;

window.addEventListener('resize', onWindowResize);
//document.addEventListener('mousedown', onDocumentMouseDown, false);
//document.addEventListener("keydown", onDocumentKeyDown, false);

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    // shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 350, 120);

    scene = new THREE.Scene();

    // lights
    var ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    let pointLights = new Array(4);
    let pointLightHelpers = new Array(4);

    // point lights
    for (let i = 0; i < pointLights.length; i++) {
        pointLights[i] = new THREE.PointLight(0xf8f8ff, 0.3, 0);
        pointLights[i].castShadow = true;
    }

    pointLights[0].position.set(-75, 200, 40);
    pointLights[1].position.set(-75, 200, -40);
    pointLights[2].position.set(75, 200, 40);
    pointLights[3].position.set(75, 200, -40);

    for (let light of pointLights) {
        scene.add(light);
    }

    // point light helpers
    for (let i = 0; i < pointLightHelpers.length; i++) {
        pointLightHelpers[i] = new THREE.PointLightHelper(pointLights[i], 3);
        scene.add(pointLightHelpers[i]);
    }

    //orbit controls
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    //drag controls
    dragControls = new THREE.DragControls(machinesOnScene, camera, renderer.domElement);

    /*Widgets*/
    createGUI();

    /*Factory Building*/
    factoryBuilding = new FactoryBuilding();
    scene.add(factoryBuilding.draw());

    // loads the factory from the text file
    loadFactory();
}

function loadFactory() {
    let loader = new THREE.FileLoader();
    loader.load(
        'factory2.txt',
        function (data) {
            drawProductionLines(data.split('\n'));

            dragControls.addEventListener('dragstart', function(event) {
                orbitControls.enabled = false;
                
                // get the object's UUID
                let object = event.object;
                let hasReachedUUID = false;

                while (!hasReachedUUID) {
                    if (object.type === "Scene") {
                        hasReachedUUID = true;
                        selectedMachineUUID = object.uuid;
                    } else {
                        object = object.parent;
                    }
                }
            });

            dragControls.addEventListener('drag', function(event) {
                orbitControls.enabled = false;
                event.object.position.z = 0;
            });

            dragControls.addEventListener('dragend', function(event) {
                let indices = findPosition(selectedMachineUUID);

                // get the dragged machine's new position
                let newPosition = new THREE.Vector3();
                event.object.getWorldPosition(newPosition);

                // update the machine's position in the matrix
                factoryDisposition[indices.i][indices.j].position.copy(newPosition);
                factoryDisposition[indices.i][indices.j].traverse(function (node) {
                    if (node instanceof THREE.Mesh) {
                        node.position.set(0, 0, 0);
                    }
                });
    
                let direction = newPosition.clone().sub(factoryDisposition[indices.i][indices.j-1].position);
                let length = direction.length();
                let arrowHelper = new THREE.ArrowHelper(direction.normalize(), factoryDisposition[indices.i][indices.j-1].position, length, 0xff0000);
                scene.add(arrowHelper);

                orbitControls.enabled = true;
            });
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.error('An error happened');
        }
    );

    // factoryLayout.forEach(l => {
    //     let cb = new ConveyorBelt();
    //     let line = cb.scaleConveyorBelt(l.machines.length);

    //     line.position.set(-100, 11, 50 * i - 75);
    //     scene.add(line);

    //     factoryDisposition[i] = new Array(l.machines.length);

    //     for (let j = 0; j < machines.length; j++) {
    //         drawMachine(machines[j].trim(), i, j);
    //     }
    // })
}

function drawProductionLines(productionLines) {
    for (let i = 0; i < productionLines.length; i++) {
        let lineName = productionLines[i].substr(0, productionLines[i].indexOf(':'));
        let machines = productionLines[i].trim().substr(productionLines[i].indexOf(':') + 1).split(',');

        let cb = new ConveyorBelt();
        let line = cb.scaleConveyorBelt(machines.length);

        line.position.set(-100, 11, 50 * i - 75);
        scene.add(line);

        // matrix with the disposition of all the machines
        factoryDisposition[i] = new Array(machines.length);

        for (let j = 0; j < machines.length; j++) {
            drawMachine(machines[j].trim(), i, j);
        }
    }
}

function drawMachine(machineType, lineNumber, machineNumber) {
    let found = machines.find(m => m.type === machineType);
    let machine;

    if (found) {
        const path = found.model + '/scene.gltf';

        gltfLoader.load(
            path,
            function (gltf) {
                machine = gltf.scene;

                machine.machineType = machineType;
                machine = setMachineProperties(machine, machineNumber, lineNumber);

                // set castShadow on each child mesh
                machine.traverse(function (node) {
                    if (node instanceof THREE.Mesh) {
                        node.castShadow = true;
                    }
                });

                scene.add(machine);
                machinesOnScene.push(machine);

                // store the machine in the matrix
                factoryDisposition[lineNumber][machineNumber] = machine;
            }
        );
    } else {
        factoryDisposition[lineNumber][machineNumber] = 0;
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

/*Widget*/
function createGUI() {
    var settings = {
        'show walls': false
    };

    var gui = new dat.GUI();

    var folder1 = gui.addFolder("Visibility");
    folder1.add(settings, 'show walls').onChange(showWalls);
    folder1.open();
}

/*Show and hide walls*/
function showWalls(showWalls) {
    if (showWalls) {
        factoryBuilding.showWalls();
    } else {
        factoryBuilding.hideWalls();
    }
}

/*Event Listeners*/
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
    // mouse position
    let mouse = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // create an array containing all machines in the scene with which the ray intersects
    let intersects = raycaster.intersectObjects(machinesOnScene, true);

    // if there is one (or more) intersections
    if (intersects.length > 0) {
        let selectedObject = intersects[0].object;
        let object = selectedObject;

        // get the object's UUID
        let hasReachedUUID = false;

        while (!hasReachedUUID) {
            if (object.type === "Scene") {
                hasReachedUUID = true;
                selectedMachineUUID = object.uuid;
            } else {
                object = object.parent;
            }
        }

        /* let material = intersects[0].object.material.clone();

        // if there's another machine selected, remove its highlight
        if (selectedMachine && selectedObject !== selectedMachine) {
            selectedMachine.material.emissive.setHex(0);
            selectedMachine = 0;
        }

        // highlights the selected machine
        if (material.emissive.getHex() === 0) {
            material.emissive.setHex(0xff0000);
            selectedMachine = intersects[0].object;
        } else {
            material.emissive.setHex(0);
            selectedMachineUUID = 0;
        }

        intersects[0].object.material = material; */
    }
}

function onDocumentKeyDown(event) {
    let keyCode = event.which;

    // A or D key
    if (keyCode === 65 || keyCode === 68) {
        if (selectedMachineUUID) {
            var position = findPosition(selectedMachineUUID);

            // D key
            if (keyCode === 68) {
                if ((position.j + 1) < factoryDisposition[position.i].length) {
                    // stores the machine
                    let machine = factoryDisposition[position.i][position.j];

                    // position is free
                    if (!factoryDisposition[position.i][position.j + 1]) {
                        // stores the machine's new position
                        factoryDisposition[position.i][position.j + 1] = machine;
                        // clears the machine's previous position
                        factoryDisposition[position.i][position.j] = 0;

                        // moves the machine to the right
                        machine.translateZ(-48);
                    }
                    // position already has another machine
                    else {
                        // stores the second machine
                        let machine2 = factoryDisposition[position.i][position.j + 1];

                        // swaps the machines' positions
                        factoryDisposition[position.i][position.j] = machine2;
                        factoryDisposition[position.i][position.j + 1] = machine;

                        // swaps the machines
                        machine.translateZ(-48);
                        machine2.translateZ(48);
                    }
                }
            }
            // A key
            else {
                if ((position.j - 1) >= 0) {
                    // stores the machine
                    let machine = factoryDisposition[position.i][position.j];

                    // position is free
                    if (!factoryDisposition[position.i][position.j - 1]) {
                        // stores the machine's new position
                        factoryDisposition[position.i][position.j - 1] = machine;
                        // clears the machine's previous position
                        factoryDisposition[position.i][position.j] = 0;

                        // moves the machine to the left
                        machine.translateZ(48);
                    }
                    // position already has another machine
                    else {
                        // stores the second machine
                        let machine2 = factoryDisposition[position.i][position.j - 1];

                        // swaps the machines' positions
                        factoryDisposition[position.i][position.j] = machine2;
                        factoryDisposition[position.i][position.j - 1] = machine;

                        // swaps the machines
                        machine.translateZ(48);
                        machine2.translateZ(-48);
                    }
                }
            }
        }
    }
}

/* return the position of the machine in the matrix */
function findPosition(machineUUID) {
    let i;
    let j;

    for (i = 0; i < factoryDisposition.length; i++) {
        for (j = 0; j < factoryDisposition[i].length; j++) {
            if (factoryDisposition[i][j].uuid === machineUUID) {
                return {
                    i: i,
                    j: j
                };
            }
        }
    }

    return;
}