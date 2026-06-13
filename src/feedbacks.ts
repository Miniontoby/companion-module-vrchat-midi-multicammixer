import { combineRgb } from '@companion-module/base'
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
		options: {
			_: null
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		program_active: {
			name: 'Input is on Program',
			description: 'Active when the given input is the current Program output',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
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
				return self.CurrentProgram === feedback.options.value - 1
			},
		},
		preview_active: {
			name: 'Input is on Preview',
			description: 'Active when the given input is the current Preview output',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
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
				return self.CurrentPreview === feedback.options.value - 1
			},
		},
		connected: {
			name: 'Connected to VRChat World',
			description: 'Active when the module is connected and sending data to a VRChat world',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return !!self.getVariableValue('connected')
			},
		},
	})
}
