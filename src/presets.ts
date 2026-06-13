import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'controls',
			name: 'Controls',
			definitions: [
				{
					id: 'connection',
					type: 'simple',
					name: 'Connection',
					presets: ['connected'],
				},
				{
					id: 'cut',
					type: 'simple',
					name: 'Cut',
					presets: ['cut'],
				},
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {}
	presets['connected'] = {
		type: 'simple',
		name: 'VRChat Connection Indicator',
		style: {
			text: 'VRC\\nDISC',
			size: 'auto',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'connected',
				options: {
					_: null,
				},
				style: {
					text: 'VRC\\nLIVE',
					color: 0xffffff,
					bgcolor: 0x00b400,
				},
			},
		],
	}
	presets['cut'] = {
		type: 'simple',
		name: 'Cut',
		style: {
			text: 'CUT',
			size: 'auto',
			color: 0xffffff,
			bgcolor: 0xb40000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'cut',
						options: {
							_: null,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	self.setPresetDefinitions(structure, presets)
}
