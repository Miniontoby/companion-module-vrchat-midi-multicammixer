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
					id: 'actions',
					type: 'simple',
					name: 'Actions',
					presets: ['cut', 'auto', 'reset'],
				},
				{
					id: 'cameras',
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
			size: '24',
			color: 0xffffff,
			bgcolor: 0xb40000,
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'connected',
				options: {},
				style: {
					text: 'VRC\\nLIVE',
					color: 0x000000,
					bgcolor: 0x00ff00,
				},
			},
		],
	}

	presets['cut'] = {
		type: 'simple',
		name: 'Cut',
		style: {
			text: 'CUT',
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'cut',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'connected',
				options: {},
				style: {
					color: 0x000000,
					bgcolor: 0xff0000,
				},
			},
		],
	}

	presets['auto'] = {
		type: 'simple',
		name: 'Auto',
		style: {
			text: 'AUTO',
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'auto',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'connected',
				options: {},
				style: {
					color: 0x000000,
					bgcolor: 0xb40000,
				},
			},
		],
	}

	presets['reset'] = {
		type: 'simple',
		name: 'Reset',
		style: {
			text: 'Reset',
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'reset',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'connected',
				options: {},
				style: {
					color: 0x000000,
					bgcolor: 0xb8b8b8,
				},
			},
		],
	}

	for (let i = 1; i <= 8; i++) {
		presets[`camera_${i}`] = {
			type: 'simple',
			name: `Camera ${i}`,
			style: {
				text: `Cam ${i}`,
				size: '18',
				color: 0xffffff,
				bgcolor: 0x000000,
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
					feedbackId: 'connected',
					options: {},
					style: {
						color: 0x000000,
						bgcolor: 0xb8b8b8,
					},
				},
				{
					feedbackId: 'preview_active',
					options: {
						value: i,
					},
					style: {
						color: 0x000000,
						bgcolor: 0x00ff00,
					},
				},
				{
					feedbackId: 'program_active',
					options: {
						value: i,
					},
					style: {
						color: 0xffffff,
						bgcolor: 0xff0000,
					},
				},
			],
		}
	}

	self.setPresetDefinitions(structure, presets)
}
