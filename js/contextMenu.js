export class ContextMenu {
    constructor() {
        this.machineTypes = ['M1', 'M2', 'M3']
        this.currentMachineType = 2 // index from the array

        this.isOpened = false
        this.menu = document.getElementById('context-menu')
        // this.newMachineButton = document.getElementById('new-machine')
        this.removeMachineButton = document.getElementById('remove-machine')
        this.MachineTypeSelect = document.getElementById('select-machine')

        this.MachineTypeSelect.options.length = 0
        for (let i = 0; i < this.machineTypes.length; i++) {
            this.MachineTypeSelect.options[i] = new Option(this.machineTypes[i], this.machineTypes[i])
        }

        this.selectFunction = null
        this.removeFunction = null

        document.addEventListener('dblclick', this.hide)
        // newMachineButton.addEventListener('click', addNewMachine)
        this.removeMachineButton.addEventListener('click', this.removeMachine)
        this.MachineTypeSelect.addEventListener('click', this.selectMachineType)
    }

    show = (e) => {
        e.preventDefault()
        if (!this.isOpened) {
            console.log(this)
            this.menu.style.top = `${e.clientY}px`
            this.menu.style.left = `${e.clientX}px`
            this.menu.style.display = "block"
            this.isOpened = true
        }
        else {
            this.hide()
        }
    }

    hide = () => {
        this.menu.style.display = "none"
        this.isOpened = false
    }

    setRemoveFunction = (func) => {
        this.removeFunction = func
    }

    setSelectFunction = (func) => {
        this.selectFunction = func
    }

    currentSelectedMachineType = () => this.machineTypes[this.currentMachineType]
    
    selectMachineType = () => {
        this.MachineTypeSelect.addEventListener('change', () => {
            this.hide()
            this.currentMachineType = this.MachineTypeSelect.selectedIndex

            this.selectFunction()
            // console.log('machine type changed to ' + this.machineTypes[this.currentMachineType])
        })
    }

    removeMachine = () => {
        this.hide()
        this.removeFunction()
    }
}