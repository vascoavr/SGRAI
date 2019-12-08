import { machines } from './models/machines/machines.js';
import { setMachineProperties } from './models/machines/machines.js';

var gltfLoader = new THREE.GLTFLoader();

let renderer, camera, scene, orbitControls, dragControls;

var mouse = new THREE.Vector2(); // create once
var raycaster = new THREE.Raycaster(); // create once

var factoryBuilding;

var factoryDisposition = [];
var machinesOnScene = [];
var tablesOnScene = [];

var selectedMachineUUID;

window.addEventListener('resize', onWindowResize);
window.addEventListener( 'mousemove', onMouseMove, false );        
document.addEventListener('mousedown', onDocumentMouseDown, false);
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

            dragControls.addEventListener('dragstart', function (event) {
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

            dragControls.addEventListener('drag', function (event) {
                orbitControls.enabled = false;
                event.object.position.z = 0;
            });

            dragControls.addEventListener('dragend', function (event) {
                let indices = findPosition(selectedMachineUUID);

                // get the dragged machine's new position
                let newPosition = new THREE.Vector3();
                event.object.getWorldPosition(newPosition);
                newPosition.y = 0;

                // update the machine's position in the matrix
                factoryDisposition[indices.i][indices.j].position.copy(newPosition);
                factoryDisposition[indices.i][indices.j].traverse(function (node) {
                    if (node instanceof THREE.Mesh) {
                        node.position.set(0, 0, 0);
                    }
                });

                // dragged machine has another machine connected to it ([i][j-1])
                if (factoryDisposition[indices.i][indices.j - 1]) {
                    moveTable(factoryDisposition[indices.i][indices.j - 1], factoryDisposition[indices.i][indices.j]);
                }

                // dragged machine connects to another machine ([i][j+1])
                if (factoryDisposition[indices.i][indices.j + 1]) {
                    moveTable(factoryDisposition[indices.i][indices.j], factoryDisposition[indices.i][indices.j + 1]);
                }

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

                // draw the tables connecting the machines
                if (factoryDisposition[lineNumber][machineNumber - 1]) {
                    drawTable(factoryDisposition[lineNumber][machineNumber - 1], machine);
                }

                if (factoryDisposition[lineNumber][machineNumber + 1]) {
                    drawTable(machine, factoryDisposition[lineNumber][machineNumber + 1]);
                }
            }
        );
    } else {
        factoryDisposition[lineNumber][machineNumber] = 0;
    }
}

function drawTable(machine1, machine2) {
    let direction = machine1.position.clone().sub(machine2.position);
    let length = direction.length();

    // determine the rotation angle
    let angle = Math.atan2(direction.z, direction.x);

    let cb = new ConveyorBelt();
    let table = cb.drawBelt(machine2.position, length, angle);

    table.from = machine1;
    table.to = machine2;

    scene.add(table);
    tablesOnScene.push(table);
}

/* moves the table connecting 2 machines after dragging one of them */
function moveTable(from, to) {
    let direction = from.position.clone().sub(to.position);
    let length = direction.length();
    let scale = length / 26;

    // determine the rotation angle
    let angle = Math.atan2(direction.z, direction.x);

    // update the table's position, rotation and scale
    for (let table of tablesOnScene) {
        if (table.from.uuid === from.uuid && table.to.uuid === to.uuid) {
            table.position.set(to.position.x - (scale / 10), 11, to.position.z);
            table.rotation.set(0, THREE.Math.degToRad(180) - angle, 0);
            table.scale.set(scale, 1, 1);

            break;
        }
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

function onMouseMove(event) {
    // calculate mouse position in normalized device coordinates 
    // (-1 to +1) for both components 
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}


function onDocumentMouseDown(event) {
    raycaster.setFromCamera(mouse, camera)
        
    // maybe the problem is in this, or how it's detecting the objects
    var intersects = raycaster.intersectObjects(scene.children)

    // only this working
    console.log('this is for every click')

    if (intersects.length > 0) {
        // this is never working
        console.log('this is for only the machines')
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