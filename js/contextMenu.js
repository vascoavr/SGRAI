const contextMenuNode = `
<div id="context-menu">
	<ul class="menu-items">
		<li class="menu-item">
			<select class="machine-select" id="select-machine">
				<option value="ER">No machine types</option>
			</select>
		</li>
		<!-- <li class="divider"></li>
		<li class="menu-item" id="new-machine">
			<span>New</span>
		</li> -->
		<li class="divider"></li>
		<li class="menu-item" id="remove-machine">
			<span>Remove</span>
		</li>
	</ul>
</div>
`

export class ContextMenu {

    constructor() {
        // for managing show & hide
        this.isOpened = false
        
        // adding context menu to the DOM
        document.body.innerHTML += contextMenuNode
        
        // get elements
        this.menu = document.getElementById('context-menu')
        // this.newMachineButton = document.getElementById('new-machine')
        this.removeMachineButton = document.getElementById('remove-machine')
        this.MachineTypeSelect = document.getElementById('select-machine')
        
        // for saving selected type
        this.currentMachineType = 2 // index from the array

        // fill up select box with options
        this.machineTypes = ['M1', 'M2', 'M3']
        this.MachineTypeSelect.options.length = 0
        for (let i = 0; i < this.machineTypes.length; i++) {
            this.MachineTypeSelect.options[i] = new Option(this.machineTypes[i], this.machineTypes[i])
        }

        // callback functions, have to set these for actual functionality
        this.selectFunction = () => null
        this.removeFunction = () => null

        //adding event listeners
        document.addEventListener('dblclick', this.hide)
        // newMachineButton.addEventListener('click', addNewMachine)
        this.removeMachineButton.addEventListener('click', this.removeMachine)
        this.MachineTypeSelect.addEventListener('click', this.selectMachineType)
    }

    show = (e) => {
        e.preventDefault()
        if (!this.isOpened) {
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

    setRemoveCallback = (func) => {
        this.removeFunction = func
    }

    setSelectCallback = (func) => {
        this.selectFunction = func
    }

    currentSelectedMachineType = () => this.machineTypes[this.currentMachineType]

    defaultMachineType = (type) =>  {
        let index = this.machineTypes.indexOf(type)
        this.currentMachineType = index
        this.MachineTypeSelect.selectedIndex = index
    }

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