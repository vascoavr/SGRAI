const machineTypes = ['M1', 'M2', 'M3']
let currentMachineType = 2 // index from the array

let isOpened = false
let menu;
let newMachineButton
let removeMachineButton
let MachineTypeSelect


document.addEventListener('DOMContentLoaded', () => {
    menu = document.getElementById('context-menu')
    newMachineButton = document.getElementById('new-machine')
    removeMachineButton = document.getElementById('remove-machine')
    MachineTypeSelect = document.getElementById('select-machine')

    MachineTypeSelect.options.length = 0
    for (let i = 0; i < machineTypes.length; i++) {
        const type = machineTypes[i];
        MachineTypeSelect.options[i] = new Option(machineTypes[i], machineTypes[i])
    }

    let range = document.body
    // now it's only working on the machines
    // range.addEventListener('contextmenu', showContextMenu)
    range.addEventListener('dblclick', hideContextMenu)

    // newMachineButton.addEventListener('click', addNewMachine)
    removeMachineButton.addEventListener('click', removeMachine)
    MachineTypeSelect.addEventListener('click', selectMachineType)

})

const showContextMenu = (e) => {
    e.preventDefault()
    if (!isOpened) {
        menu.style.top = `${e.clientY}px`
        menu.style.left = `${e.clientX}px`
        menu.style.display = "block"
        isOpened = true
    }
    else {
        hideContextMenu()
    }
}

const hideContextMenu = (e) => {
    menu.style.display = "none"
    isOpened = false
}


const removeMachine = () => {
    hideContextMenu()
    console.log('machine removed')
}

// const addNewMachine = () => {
//     hideContextMenu()

//     // add machine
//     console.log('machine added')
// }


const setMachineType = (type) => {
    currentMachineType = type
    // console.log(currentMachineType)
}


const selectMachineType = () => {
    MachineTypeSelect.addEventListener('change', () => {
        hideContextMenu()
        currentMachineType = MachineTypeSelect.selectedIndex

        // let selectedMachine = factoryDisposition[position.i][position.j]

        // selectMachine.machineType = currentMachineType
        // select machine type
        console.log('machine type changed to ' + machineTypes[currentMachineType])
    })
    return currentMachineType
}
