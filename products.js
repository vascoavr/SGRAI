export var manufacturingPlan = [
    {
        "name": "OF-20",
        "line": 1,
        "machines": [
            {
                "number": 1,
                "start": 1,
                "duration": 2
            },
            {
                "number": 2,
                "start": 3,
                "duration": 2
            },
            {
                "number": 4,
                "start": 7,
                "duration": 2
            },
            {
                "number": 5,
                "start": 9,
                "duration": 2
            }
        ]
    },
    {
        "name": "OF-32",
        "line": 1,
        "machines": [
            {
                "number": 1,
                "start": 3,
                "duration": 2
            },
            {
                "number": 2,
                "start": 5,
                "duration": 2
            },
            {
                "number": 3,
                "start": 7,
                "duration": 2
            }
        ]
    },
    {
        "name": "OF-40",
        "line": 2,
        "machines": [
            {
                "number": 1,
                "start": 1,
                "duration": 2
            },
            {
                "number": 2,
                "start": 3,
                "duration": 3
            }
        ]
    },
    {
        "name": "OF-33",
        "line": 2,
        "machines": [
            {
                "number": 1,
                "start": 3,
                "duration": 2
            },
            {
                "number": 2,
                "start": 6,
                "duration": 4
            },
            {
                "number": 3,
                "start": 10,
                "duration": 2
            }
        ]
    }
]

export function drawCube(position) {
    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    let cube = new THREE.Mesh( geometry, material );

    cube.position.copy(position);
    
    return cube;
}