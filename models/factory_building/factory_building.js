function FactoryBuilding(){
    this.FACTORY_WALL_HEIGHT = 200;
    this.groupFactoryBuilding;
    
    this.draw = function() {
        let textureFloor = new THREE.TextureLoader().load('models/factory_building/textures/floor.jpg');
        let textureWall = new THREE.TextureLoader().load('models/factory_building/textures/wall.jpg');
        let textureRoof = new THREE.TextureLoader().load('models/factory_building/textures/roof.jpg');

        /*Factory Building*/
        this.groupFactoryBuilding = new THREE.Group();
        
        /*Ground*/ 
        textureFloor.wrapS = THREE.RepeatWrapping;
        textureFloor.wrapT = THREE.RepeatWrapping;
        textureFloor.repeat.set(4, 2);

        var materialsGround = [new THREE.MeshStandardMaterial({map: textureFloor, side: THREE.FrontSide}), 
                                new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide})];

        var geometryGround = new THREE.PlaneGeometry(500, 250, 0, 0);

        // double sided floor
        for (let i = 0, length = geometryGround.faces.length; i < length; i++) {
            let face = geometryGround.faces[i].clone();

            face.materialIndex = 1;
            geometryGround.faces.push(face);
            geometryGround.faceVertexUvs[0].push(geometryGround.faceVertexUvs[0][i].slice(0));
        }

        var factoryGround = new THREE.Mesh(geometryGround, materialsGround);

        factoryGround.position.set(0, 0, 0);
        factoryGround.rotation.set(rad(-90), 0, 0);
        factoryGround.visible = true;
        factoryGround.receiveShadow = true;
        
        this.groupFactoryBuilding.add(factoryGround);

        /*Walls*/
        textureWall.wrapS = THREE.RepeatWrapping;
        textureWall.wrapT = THREE.RepeatWrapping;
        textureWall.repeat.set(10, 2);

        var groupFactoryWalls = new THREE.Group();
        var materialWall = new THREE.MeshStandardMaterial({map: textureWall});
        var geometryLongWall = new THREE.BoxGeometry(500, this.FACTORY_WALL_HEIGHT, 1);
        var geometryShortWall = new THREE.BoxGeometry(1, this.FACTORY_WALL_HEIGHT, 250);

        /*Back Wall*/
        var factoryWall = new THREE.Mesh(geometryLongWall, materialWall);
        factoryWall.position.set(0, 0, -125);
        groupFactoryWalls.add(factoryWall);

        /*Front Wall*/
        factoryWall = new THREE.Mesh(geometryLongWall, materialWall);
        factoryWall.position.set(0, 0, 125);
        groupFactoryWalls.add(factoryWall);
        
        /*Left Wall*/
        factoryWall = new THREE.Mesh(geometryShortWall, materialWall);
        factoryWall.position.set(-250, 0, 0);
        groupFactoryWalls.add(factoryWall);
        
        /*Right Wall*/
        factoryWall = new THREE.Mesh(geometryShortWall, materialWall);
        factoryWall.position.set(250, 0, 0);
        groupFactoryWalls.add(factoryWall);
        
        groupFactoryWalls.position.set(0, 100, 0);
        this.groupFactoryBuilding.add(groupFactoryWalls);
        
        /*Roof*/
        textureRoof.wrapS = THREE.RepeatWrapping;
        textureRoof.wrapT = THREE.RepeatWrapping;
        textureRoof.repeat.set( 16, 16 );

        var materialsRoof = [new THREE.MeshStandardMaterial({map: textureRoof, side: THREE.FrontSide}), 
                            new THREE.MeshStandardMaterial({map: textureWall, side: THREE.BackSide})];

        var geometryRoof = new THREE.PlaneGeometry(500, 250, 0, 0);

        // double sided roof
        for (let i = 0, length = geometryRoof.faces.length; i < length; i++) {
            let face = geometryRoof.faces[i].clone();

            face.materialIndex = 1;
            geometryRoof.faces.push(face);
            geometryRoof.faceVertexUvs[0].push(geometryRoof.faceVertexUvs[0][i].slice(0));
        }

        var factoryRoof = new THREE.Mesh(geometryRoof, materialsRoof);

        factoryRoof.position.set(0, 200, 0);
        factoryRoof.rotation.set(rad(-90), 0, 0);
        factoryRoof.visible = false;
        factoryRoof.receiveShadow = true;

        this.groupFactoryBuilding.add(factoryRoof);
        
        return this.groupFactoryBuilding;
    }
    
    this.showWalls = function(){
        //this.groupFactoryBuilding.children[1].scale.set(1, 5, 1);
        //this.groupFactoryBuilding.children[1].position.set(0, 4, 0);
        this.groupFactoryBuilding.children[1].visible = true;
        this.groupFactoryBuilding.children[2].visible = true;
    }
    
    this.hideWalls = function(){
        //this.groupFactoryBuilding.children[1].scale.set(1, 1, 1);
        //this.groupFactoryBuilding.children[1].position.set(0, 0, 0);
        this.groupFactoryBuilding.children[1].visible = false;
        this.groupFactoryBuilding.children[2].visible = false;        
    }
}
