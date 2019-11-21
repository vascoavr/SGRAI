export const machines = [
    {
        type: 'M1',
        model: './models/machines/factory_robot_arm'
    },
    {
        type: 'M2',
        model: './models/machines/factory_robot_arm_2'
    },
    {
        type: 'M3',
        model: './models/machines/factory_robot_arm_3'
    }
]

export function setMachineProperties(machine, x, z) {
    switch (machine.machineType) {
        case 'M1':
            machine.scale.set(10, 15, 10);
            machine.position.set(48 * x - 110, 0, 50 * z - 102);
            machine.rotation.set(0, rad(-90), 0);

            break;
        case 'M2':
            machine.scale.set(10, 15, 10);
            machine.position.set(48 * x - 110, 0, 50 * z - 102);
            machine.rotation.set(0, rad(-90), 0);

            break;
        case 'M3':
            machine.scale.set(10, 15, 10);
            machine.position.set(48 * x - 110, 0, 50 * z - 102);
            machine.rotation.set(0, rad(-90), 0);

            break;
        default:
            break;
    }

    return machine;
}