function FactoryBuilding(scene){
    this.scene = scene;
    this.FACTORY_WALL_HEIGHT = 10;
    this.groupFactoryBuilding;
    
    
    this.draw = function() {
        /*Factory Building*/
        this.groupFactoryBuilding = new THREE.Group();
        
        /*Ground*/
        var materialBeltGround = new THREE.MeshBasicMaterial({color: 0xD4C7C7});
        var geometryGround = new THREE.BoxGeometry(500, 1, 250);
        var factoryGround = new THREE.Mesh(geometryGround, materialBeltGround);
        this.groupFactoryBuilding.add(factoryGround);

        /*Walls*/
        var groupFactoryWalls = new THREE.Group();
        var materialBeltWall = new THREE.MeshBasicMaterial({color: 0xFFFFFF})
        var geometryLongWall = new THREE.BoxGeometry(500, this.FACTORY_WALL_HEIGHT, 1);
        var geometryShortWall = new THREE.BoxGeometry(1, this.FACTORY_WALL_HEIGHT, 250);

        /*Back Wall*/
        var factoryWall = new THREE.Mesh(geometryLongWall, materialBeltWall);
        factoryWall.position.set(0, 4, -125);
        groupFactoryWalls.add(factoryWall);

        /*Front Wall*/
        factoryWall = new THREE.Mesh(geometryLongWall, materialBeltWall);
        factoryWall.position.set(0, 4, 125);
        groupFactoryWalls.add(factoryWall);
        
        /*Left Wall*/
        factoryWall = new THREE.Mesh(geometryShortWall, materialBeltWall);
        factoryWall.position.set(-250, 4, 0);
        groupFactoryWalls.add(factoryWall);
        
        /*Right Wall*/
        factoryWall = new THREE.Mesh(geometryShortWall, materialBeltWall);
        factoryWall.position.set(250, 4, 0);
        groupFactoryWalls.add(factoryWall);
        
        this.groupFactoryBuilding.add(groupFactoryWalls);
        
        /*Roof*/
        // load a texture, set wrap mode to repeat
        var texture = new THREE.TextureLoader().load('models/factory_building/textures/roof.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 16, 16 );
        var materialBeltRoof = new THREE.MeshBasicMaterial({map: texture});
        
        var geometryRoof = new THREE.BoxGeometry(500, 1, 250);
        var factoryRoof = new THREE.Mesh(geometryRoof, materialBeltRoof);
        factoryRoof.position.set(0, 50, 0);
        factoryRoof.visible = false; //roof stars invisible
        this.groupFactoryBuilding.add(factoryRoof);
        
        this.scene.add(this.groupFactoryBuilding);
    }
    
    this.showRoof = function(){
        this.groupFactoryBuilding.children[1].scale.set(1, 5, 1);
        this.groupFactoryBuilding.children[1].position.set(0, 4, 0);
        this.groupFactoryBuilding.children[2].visible = true;
    }
    
    this.hideRoof = function(){
        this.groupFactoryBuilding.children[1].scale.set(1, 1, 1);
        this.groupFactoryBuilding.children[1].position.set(0, 0, 0);
        this.groupFactoryBuilding.children[2].visible = false;        
    }
}
