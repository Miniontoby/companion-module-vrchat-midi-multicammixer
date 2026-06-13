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
				{
					id: 'camera',
					type: 'simple',
					name: 'Cameras',
					presets: ['camera_1', 'camera_2', 'camera_3', 'camera_4', 'camera_5', 'camera_6', 'camera_7', 'camera_8'],
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
			show_topbar: false,
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

	for (let i = 1; i <= 8; i++) {
		presets['camera_' + String(i)] = {
			type: 'simple',
			name: 'VRChat Camera' + String(i),
			style: {
				text: 'Cam ' + String(i),
				size: '18',
				color: 0xffffff,
				bgcolor: 0x000000,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_preview',
							options: {
								value: i,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'preview_active',
					options: {
						value: i,
					},
					style: {
						bgcolor: 0x00ff00,
						color: 0x000000,
					},
				},
				{
					feedbackId: 'program_active',
					options: {
						value: i,
					},
					style: {
						bgcolor: 0xff0000,
						color: 0xffffff,
					},
				},
			],
		}
	}

	self.setPresetDefinitions(structure, presets)
}
