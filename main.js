import { machines } from './models/machines/machines.js'
import { setMachineProperties } from './models/machines/machines.js'
import { ContextMenu } from './js/contextMenu.js'
import { manufacturingPlan, drawCube } from './products.js'

var gltfLoader = new THREE.GLTFLoader();

let renderer, camera, scene, orbitControls, dragControls;

var mouse = new THREE.Vector2()
var raycaster = new THREE.Raycaster()

var contextMenu = new ContextMenu()

var factoryBuilding;

var factoryDisposition = [];
var machinesOnScene = [];
var tablesOnScene = [];
var productsOnScene = [];

var products = [];

var selectedMachineUUID;
var selectedMachine;

window.addEventListener('resize', onWindowResize);
window.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('contextmenu', onContextMenu, false);
//document.addEventListener("keydown", onDocumentKeyDown, false);
//document.addEventListener('mousedown', onDocumentMouseDown, false);

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

                // if the position changed
                if (factoryDisposition[indices.i][indices.j].position.x !== newPosition.x || 
                    factoryDisposition[indices.i][indices.j].position.z !== newPosition.z) {
                    // update the machine's position in the matrix
                    factoryDisposition[indices.i][indices.j].position.copy(newPosition);
                    factoryDisposition[indices.i][indices.j].traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            node.position.set(0, 0, 0);
                        }
                    });

                    let previousMachine = factoryDisposition[indices.i][indices.j-1];
                    let nextMachine = factoryDisposition[indices.i][indices.j+1];
                    let j = indices.j-1;

                    while (previousMachine === 0 && j > 0) {
                        j -= 1;
                        previousMachine = factoryDisposition[indices.i][j];
                    } 

                    j = indices.j+1;

                    while (nextMachine === 0 && j < factoryDisposition[indices.i].length) {
                        j += 1;
                        nextMachine = factoryDisposition[indices.i][j];
                    }

                    // dragged machine has another machine connected to it ([i][j-1])
                    if (previousMachine) {
                        moveTable(previousMachine, factoryDisposition[indices.i][indices.j]);
                    }

                    // dragged machine connects to another machine ([i][j+1])
                    if (nextMachine) {
                        moveTable(factoryDisposition[indices.i][indices.j], nextMachine);
                    }

                    // first machine of the line
                    if (!previousMachine) {
                        moveTable(getConnectingTable(factoryDisposition[indices.i][indices.j]), factoryDisposition[indices.i][indices.j]);
                    }
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

                if (machineNumber === 0) {
                    drawTable2(lineNumber, machine);
                }

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
    table.isFree = true;

    scene.add(table);
    tablesOnScene.push(table);
}

function drawTable2(lineNumber, machine) {
    let cb = new ConveyorBelt();
    let table = cb.drawBelt(machine.position, 48, THREE.Math.degToRad(180));

    table.from = lineNumber;
    table.to = machine;
    table.isFree = true;

    scene.add(table);
    tablesOnScene.push(table);
}

/* moves the table connecting 2 machines after dragging one of them */
function moveTable(from, to) {
    let direction = from.position.clone().sub(to.position);
    let length = direction.length();
    let scale = length / 24;

    // determine the rotation angle
    let angle = Math.atan2(direction.z, direction.x);

    let table;
    
    // check if the table is the start of a production line
    if (!Number.isInteger(from.from)) {
        for (table of tablesOnScene) {
            if (table.from.uuid === from.uuid && table.to.uuid === to.uuid) {
                break;
            }
        }
    } else {
        table = from;
    }
    
    // update the table's position, rotation and scale
    table.position.set(to.position.x-10, 11, to.position.z);
    table.rotation.set(0, THREE.Math.degToRad(180) - angle, 0);
    table.scale.set(scale, 1, 1);
}

function startProduction() {
    // clone the manufacturing plan to a new array
    products = manufacturingPlan.slice(0);

    // main loop that runs until all products are manufactured
    while (products.length > 0) {
        nextMove(products);
    }
}

/* determines which product should move next and moves it */
function nextMove(products) {
    for (let product of products) {
        // if the product has gone through all the machines in its manufacturing plan, remove it from the array
        if (product.machines.length === 0) {
            let index = products.indexOf(product);

            if (index !== -1) {
                products.splice(index, 1);
                return;
            }
        }

        let machineNumber = product.machines[0].number;
        let machine = factoryDisposition[product.line-1][machineNumber-1];
        let table = getConnectingTable(machine);

        // the product isn't on the scene yet
        if (!productsOnScene.find(p => p.name === product.name)) {
            // the table leading to the next machine is free
            if (table.isFree) {
                // place the product on the table
                let cube = drawCube(product.name, table.position);
                scene.add(cube);
                productsOnScene.push(cube);

                table.isFree = false;
            }
        // the product is already on the scene
        } else {
            let cube = productsOnScene.find(p => p.name === product.name);

            // move the product from the table to the machine
            if (machine.isFree) {
                let tween = new TWEEN.Tween(cube.position)
                    .to({x: machine.position.x, z: machine.position.z}, 1000)
                    .start();

                // product reaches the machine
                //tween.onComplete(function() {
                    //let duration = product.machines[0].duration*1000;

                    table.isFree = true;
                    machine.isFree = false;

                    // simulate the time needed to complete the operation
                    //simulateWorkingTime(machine, duration);
                    
                    product.machines.shift();
                    machine.isFree = true;
                //});
            }

            // move the product from the machine to the table
            if (table.isFree) {
                let tween = new TWEEN.Tween(cube.position)
                    .to({x: table.position.x, z: table.position.z}, 1000)
                    .start();

                tween.onComplete(function() {
                    table.isFree = false;
                });
            }
        }
    }
}  

/* given a machine's UUID, returns the table that connects another machine to it */ 
function getConnectingTable(machine) {
    for (let table of tablesOnScene) {
        if (table.to.uuid === machine.uuid) {
            return table;
        }
    }

    return;
}

/* given a machine's UUID, returns the table that connects it to another machine*/ 
function getNextTable(machine) {
    for (let table of tablesOnScene) {
        if (table.from.uuid === machine.uuid) {
            return table;
        }
    }

    return;
}

function simulateWorkingTime(machine, duration) {
    setTimeout(function() {
        machine.isFree = true;
    }, duration);
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
}

/*Widget*/
function createGUI() {
    var Settings = function() {
        this.showWalls = false,
        this.start = function() {
            startProduction();
        }
    };

    var settings = new Settings();
    var gui = new dat.GUI();

    var folder1 = gui.addFolder("Visibility");
    folder1.add(settings, 'showWalls').onChange(showWalls);
    folder1.open();

    let folder2 = gui.addFolder("Controls");
    folder2.add(settings, 'start');
    folder2.open();
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


contextMenu.setRemoveCallback(() => {
    // console.log('when clicks on remove this function called')
    let position = findPosition(selectedMachineUUID)
    let machine = factoryDisposition[position.i][position.j];
    scene.remove(machine)

    machinesOnScene = machinesOnScene.filter(function(m) {
        return m.uuid !== machine.uuid;
    });

    factoryDisposition[position.i][position.j] = 0;

    let table1 = getConnectingTable(machine);
    let table2 = getNextTable(machine);
    scene.remove(table1);
    scene.remove(table2);

    tablesOnScene = tablesOnScene.filter(function(t) {
        return t.from !== table1.from && t.to !== table1.to;
    });

    tablesOnScene = tablesOnScene.filter(function(t) {
        return t.from !== table2.from && t.to !== table2.to;
    });

    let previousMachine = factoryDisposition[position.i][position.j-1];
    let nextMachine = factoryDisposition[position.i][position.j+1];
    let j = position.j-1;

    while (previousMachine === 0 && j > 0) {
        j -= 1;
        previousMachine = factoryDisposition[position.i][j];
    } 

    j = position.j+1;

    while (nextMachine === 0 && j < factoryDisposition[position.i].length) {
        j += 1;
        nextMachine = factoryDisposition[position.i][j];
    }

    if (previousMachine && nextMachine) {
        drawTable(previousMachine, nextMachine);
    }
})

contextMenu.setSelectCallback(() => {
    // console.log('when selects machine type, this function called')
    let { i, j } = findPosition(selectedMachineUUID)
    let machine = factoryDisposition[i][j]

    const basePath = machines.find(m => m.type === contextMenu.currentSelectedMachineType()).model
    var loader = new THREE.TextureLoader()

    loader.load(basePath + '/textures/Material_baseColor.png', (updatedTexture) => {
        updatedTexture.encoding = THREE.sRGBEncoding
        updatedTexture.flipY = false
  
        machine.traverse((mesh) => {
            if (mesh instanceof THREE.Mesh) {
                mesh.material.map = updatedTexture
                mesh.material.needsUpdate = true
            }
        })
    })

    factoryDisposition[i][j].machineType = contextMenu.currentSelectedMachineType()
    // replaceMachine(contextMenu.currentSelectedMachineType(), i, j, pos)
    console.log('changed to ' + contextMenu.currentSelectedMachineType())
})

function onContextMenu(event) {
    raycaster.setFromCamera(mouse, camera)
    var intersects = raycaster.intersectObjects(machinesOnScene, true)
    dragControls.enabled = false
    
    if (intersects.length > 0) {
        // console.log('this is for only the machines')
                
        let position = findPosition(selectedMachineUUID)
        // console.log(factoryDisposition[position.i][position.j])
        contextMenu.defaultMachineType(factoryDisposition[position.i][position.j].machineType)
        
        contextMenu.show(event)

        // get the object's UUID
        let object = intersects[0].object;
        let hasReachedUUID = false;
        while (!hasReachedUUID) {
            if (object.type === "Scene") {
                hasReachedUUID = true;
                selectedMachineUUID = object.uuid;
            } else {
                object = object.parent;
            }
        }
    }
    else {
        contextMenu.hide()
    }
    dragControls.enabled = true;
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

function onDocumentMouseDown(event) {
    // mouse position
    let mouse = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
                                -( event.clientY / window.innerHeight ) * 2 + 1,
                                0.5);
    let raycaster =  new THREE.Raycaster();                                        
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

        let material = intersects[0].object.material.clone();

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
        }

        intersects[0].object.material = material;
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

// mouse functions