import type ModuleInstance from './main.js'

export type ActionsSchema = {
	set_program: {
		options: {
			value: number
		}
	}
	set_preview: {
		options: {
			value: number
		}
	}
	cut: {
		options: {
			_: null
		}
	}
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		set_program: {
			name: 'Set CurrentProgram',
			options: [
				{
					type: 'number',
					id: 'value',
					label: 'Input Index (1-50)',
					default: 1,
					min: 1,
					max: 50,
				},
			],
			callback: async (action) => {
				self.SetCurrentProgram(action.options.value - 1) // convert 1-based to 0-based
			},
		},
		set_preview: {
			name: 'Set CurrentPreview',
			options: [
				{
					type: 'number',
					id: 'value',
					label: 'Input Index (1-50)',
					default: 1,
					min: 1,
					max: 50,
				},
			],
			callback: async (action) => {
				self.SetCurrentPreview(action.options.value - 1) // convert 1-based to 0-based
			},
		},
		cut: {
			name: 'Cut (swap Program and Preview)',
			options: [],
			callback: async () => {
				self.Cut()
			},
		},
	})
}
