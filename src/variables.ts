import type ModuleInstance from './main.js'

export type VariablesSchema = {
	current_program: number
	current_preview: number
	connected: boolean
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({
		current_program: { name: 'Current Program' },
		current_preview: { name: 'Current Preview' },
		connected: { name: 'Connected to VRChat World' },
	})
	self.setVariableValues({
		current_program: 0,
		current_preview: 0,
		connected: false,
	})
}
