import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	program_active: {
		type: 'boolean'
		options: {
			value: number
		}
	}
	preview_active: {
		type: 'boolean'
		options: {
			value: number
		}
	}
	connected: {
		type: 'boolean'
		options: Record<string, never>
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		program_active: {
			name: 'Input is on Program',
			description: 'Active when the given input is the current Program output',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0xff0000,
				color: 0xffffff,
			},
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
			callback: (feedback) => {
				return self.CurrentProgram === feedback.options.value
			},
		},
		preview_active: {
			name: 'Input is on Preview',
			description: 'Active when the given input is the current Preview output',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00ff00,
				color: 0x000000,
			},
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
			callback: (feedback) => {
				return self.CurrentPreview === feedback.options.value
			},
		},
		connected: {
			name: 'Connected to VRChat World',
			description: 'Active when the module is connected and sending data to a VRChat world',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00ff00,
				color: 0x000000,
			},
			options: [],
			callback: () => {
				return !!self.getVariableValue('connected')
			},
		},
	})
}
