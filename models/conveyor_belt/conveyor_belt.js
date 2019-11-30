function ConveyorBelt(){
    
    this.draw = function(){
        var groupConveyorBelt = new THREE.Group();
                
        var belt = drawCBBelt();
        groupConveyorBelt.add(belt);
        
        var sidePlate1 = drawCBSidePlate();
        sidePlate1.position.set(0, 0, 10.125);
        groupConveyorBelt.add(sidePlate1);
        
        var sidePlate2 = drawCBSidePlate();
        sidePlate2.position.set(0, 0, -10.125);
        groupConveyorBelt.add(sidePlate2);
        
        var support1 = new drawCBSupport();
        groupConveyorBelt.add(support1);
        
        var support2 = new drawCBSupport();
        support2.position.set(-20, 0, 0);
        groupConveyorBelt.add(support2);
        
        return groupConveyorBelt;
    }
            
    function drawCBSupport(){
        var groupSupport = new THREE.Group();
        
        /*Support legs*/
        var materialSupport = new THREE.MeshBasicMaterial({color: 0xF5F5DC});
        var geometrySupport = new THREE.BoxGeometry(1, 10, 0.5);
        
        /*Support leg 1*/
        var leg1 = new THREE.Mesh(geometrySupport, materialSupport);
        leg1.position.set(0, -5, 10.5);
        leg1.castShadow = true;
        groupSupport.add(leg1);
        
        /*Support leg 2*/
        var leg2 = new THREE.Mesh(geometrySupport, materialSupport);
        leg2.position.set(0, -5, -10.5);
        leg2.castShadow = true;
        groupSupport.add(leg2);
        
        /*Support middle bar*/
        var geometryMiddleBar = new THREE.BoxGeometry(1, 21, 0.5);
        var middleBar = new THREE.Mesh(geometryMiddleBar, materialSupport);
        middleBar.position.set(0, -5, 0);
        middleBar.rotation.set(THREE.Math.degToRad(90), 0, 0);
        middleBar.castShadow = true;
        groupSupport.add(middleBar);
        
        var materialSupportFeet = new THREE.MeshBasicMaterial({color: 0x3C6466, side: 2});
        var geometrySupportFeet = new THREE.CylinderGeometry( 0.25, 1.5, 0.5, 32 );
        var foot1 = new THREE.Mesh(geometrySupportFeet, materialSupportFeet);
        foot1.position.set(0, -10, -10.5);
        groupSupport.add(foot1);
        
        var foot2 = new THREE.Mesh(geometrySupportFeet, materialSupportFeet);
        foot2.position.set(0, -10, 10.5);
        groupSupport.add(foot2);

        return groupSupport;
    }
    
    function drawCBSidePlate() {
        var groupSidePlate = new THREE.Group();
        
        var materialSidePlate = new THREE.MeshBasicMaterial({color: 0x3C6466, side: 2});
        var geometrySidePlate = new THREE.CylinderGeometry(1.5, 1.5, 0.25, 15, 1, false, 0, 3.15);
        
        var part1 = new THREE.Mesh(geometrySidePlate, materialSidePlate);
        part1.rotation.set(THREE.Math.degToRad(90), 0, 0);
        
        var part2 = new THREE.Mesh(geometrySidePlate, materialSidePlate);
        part2.rotation.set(THREE.Math.degToRad(90), THREE.Math.degToRad(180), 0);
        part2.position.set(-20, 0, 0);
        
        var geometrySide = new THREE.BoxGeometry(20, 3, 0.25);
        var part3 = new THREE.Mesh(geometrySide, materialSidePlate);
        part3.position.set(-10, 0, 0);
        
        groupSidePlate.add(part1);
        groupSidePlate.add(part2);
        groupSidePlate.add(part3);
        return groupSidePlate;
    }
    
    function drawCBBelt(){
        var groupBelt = new THREE.Group();
        
        /*Belt curves*/
        var textureBelt = new THREE.TextureLoader().load('models/conveyor_belt/textures/green.jpeg');
        var materialBelt = new THREE.MeshBasicMaterial({map: textureBelt, side: 2});
        //var materialBelt = new THREE.MeshBasicMaterial({color: 0x3C6466, side: 2});
        var geometryBeltCurve = new THREE.CylinderGeometry(2, 2, 20, 15, 1, true, 0, 3.15);
        
        var beltCurve1 = new THREE.Mesh(geometryBeltCurve, materialBelt);
        beltCurve1.rotation.set(THREE.Math.degToRad(90), 0, 0);
        groupBelt.add(beltCurve1);
        
        var beltCurve2 = new THREE.Mesh(geometryBeltCurve, materialBelt);
        beltCurve2.position.x = -20;
        beltCurve2.rotation.set(THREE.Math.degToRad(90),THREE.Math.degToRad(180), 0);
        groupBelt.add(beltCurve2);
        
        /*Belt top and bottom planes*/
        var geometryPlane = new THREE.PlaneGeometry( 20, 20, 32 )
        
        var topPlane = new THREE.Mesh(geometryPlane, materialBelt);
        topPlane.rotation.set(THREE.Math.degToRad(90), 0, 0);
        topPlane.position.set(-10, 2, 0);
        topPlane.castShadow = true;
        groupBelt.add(topPlane);
        
        var bottomPlane = new THREE.Mesh(geometryPlane, materialBelt);
        bottomPlane.rotation.set(THREE.Math.degToRad(90), 0, 0);
        bottomPlane.position.set(-10, -2, 0);
        bottomPlane.castShadow = true;
        groupBelt.add(bottomPlane);
        
        /*Belt cylinders*/
        var textureCylinder = new THREE.TextureLoader().load('models/conveyor_belt/textures/reflection.jpeg');
        
        var materialCylinders = new THREE.MeshBasicMaterial({map: textureCylinder});
        //var materialCylinders = new THREE.MeshBasicMaterial({color: 0x596E78});
        var geometryCylinders = new THREE.CylinderGeometry(1.8, 1.8, 20, 15);
        
        var cylinder1 = new THREE.Mesh(geometryCylinders, materialCylinders);
        cylinder1.rotation.set(THREE.Math.degToRad(90), 0, 0);
        groupBelt.add(cylinder1);
        
        var cylinder2 = new THREE.Mesh(geometryCylinders, materialCylinders);
        cylinder2.rotation.set(THREE.Math.degToRad(90), 0, 0);
        cylinder2.position.set(-20, 0, 0);
        groupBelt.add(cylinder2);
        
        var cylinder3 = new THREE.Mesh(geometryCylinders, materialCylinders);
        cylinder3.rotation.set(THREE.Math.degToRad(90), 0, 0);
        cylinder3.position.set(-15, 0, 0);
        groupBelt.add(cylinder3);
        
        var cylinder4 = new THREE.Mesh(geometryCylinders, materialCylinders);
        cylinder4.rotation.set(THREE.Math.degToRad(90), 0, 0);
        cylinder4.position.set(-10, 0, 0);
        groupBelt.add(cylinder4);
        
        var cylinder5 = new THREE.Mesh(geometryCylinders, materialCylinders);
        cylinder5.rotation.set(THREE.Math.degToRad(90), 0, 0);
        cylinder5.position.set(-5, 0, 0);
        groupBelt.add(cylinder5);
        
        return groupBelt;
    }

    this.scaleConveyorBelt = function(size) {
        let group = new THREE.Group();

        for (let i = 0; i < size * 2; i++) {
            let belt = this.draw();
            belt.position.set(i * 24, 0, 0);

            group.add(belt);
        }

        return group;
    }
}
