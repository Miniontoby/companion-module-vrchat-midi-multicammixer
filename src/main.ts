import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { Output, getOutputs } from './midi/midi.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

const CONTROL_CHANNEL = 15
const CONTROL_NOTE = 126

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	midiOutput: Output | null
	logStream: { path: string; bytesRead: number } | null
	lastUpdate: number
	watchdogInterval: NodeJS.Timeout | number | null
	CurrentProgram: number
	CurrentPreview: number

	constructor(internal: unknown) {
		super(internal)
		this.midiOutput = null
		this.logStream = null
		this.lastUpdate = 0
		this.watchdogInterval = null

		this.CurrentProgram = 0
		this.CurrentPreview = 0
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions

		await this.configUpdated(config)
	}

	async destroy(): Promise<void> {
		if (this.watchdogInterval) clearInterval(this.watchdogInterval)
		if (this.midiOutput) this.midiOutput.close()
		this.log('debug', `${this.id} destroyed`)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		this.log(
			'debug',
			`Available MIDI Outputs: ${JSON.stringify(getOutputs())}\n\tSelected MIDI Output: ${config.outPortName}`,
		)

		if (this.watchdogInterval) clearInterval(this.watchdogInterval)
		if (this.midiOutput) this.midiOutput.close()

		this.midiOutput = new Output(config.outPortName)

		const midiOutStatus = this.midiOutput.isPortOpen()
		this.log('info', `Selected Out Port "${this.midiOutput.name}" is ${midiOutStatus ? '' : 'NOT '}Open.`)

		if (!midiOutStatus) {
			this.updateStatus(InstanceStatus.BadConfig, 'MIDI Out Port not open')
			return
		}

		this.updateStatus(InstanceStatus.Ok)
		this.start()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	start(): void {
		this.log('debug', '\nEntering *main*\n')
		this._findVRCLog()
		this._Reset()
		this.watchdogInterval = setInterval(() => this._Tick(), 100)
	}

	SetCurrentProgram(index: number): void {
		this.CurrentProgram = Math.min(index, 50)
		this._SendChannelValue(0, this.CurrentProgram)
		this.setVariableValues({ current_program: this.CurrentProgram })
		this.checkFeedbacks('program_active')
	}

	SetCurrentPreview(index: number): void {
		this.CurrentPreview = Math.min(index, 50)
		this._SendChannelValue(1, this.CurrentPreview)
		this.setVariableValues({ current_preview: this.CurrentPreview })
		this.checkFeedbacks('preview_active')
	}

	Cut(): void {
		const oldProgram = this.CurrentProgram
		const oldPreview = this.CurrentPreview
		this.SetCurrentPreview(0)
		this.SetCurrentProgram(oldPreview)
		this.SetCurrentPreview(oldProgram)
	}

	_Tick(): void {
		if (this._isMidiReady()) {
			this._midiWatchdog()
			this.lastUpdate = Date.now()

			if (!this.getVariableValue('connected')) {
				this.setVariableValues({ connected: true })
				this.checkFeedbacks('connected')
			}
		} else {
			const elapsed = (Date.now() - this.lastUpdate) / 1000
			if (elapsed > 1) {
				this.lastUpdate = Date.now()
				this._Reset()

				if (this.getVariableValue('connected')) {
					this.setVariableValues({ connected: false })
					this.checkFeedbacks('connected')
				}
			}
		}
	}

	_Reset(): void {
		this._findVRCLog()
		this._midiKnock()
		this._midiWatchdog()
	}

	_SendChannelValue(isPreview: number, index: number): void {
		const value = (Math.min(index, 50) << 1) | (isPreview & 0x1)
		this._SendMidiControl(value)
	}

	_SendMidiControl(code: number): void {
		if (!this.midiOutput?.isPortOpen()) return
		this.log('debug', `Sending CC ch${CONTROL_CHANNEL} note${CONTROL_NOTE} val${code}`)
		this.midiOutput.sendMessage([0xb0 | (CONTROL_CHANNEL & 0xf), CONTROL_NOTE, code & 0x7f])
	}

	_midiKnock(): void {
		this._SendMidiControl(102) // KnockStart
		this._SendMidiControl(119) // KnockMiddle
		this._SendMidiControl(108) // KnockFinish
	}

	_midiWatchdog(): void {
		this._SendMidiControl(127) // Watchdog
	}

	_isMidiReady(): boolean {
		if (!this.logStream || !this.midiOutput?.isPortOpen()) return false
		try {
			const stat = fs.statSync(this.logStream.path)
			const newBytes = stat.size - this.logStream.bytesRead
			if (newBytes <= 0) return false

			const buf = Buffer.alloc(newBytes)
			const fd = fs.openSync(this.logStream.path, 'r')
			fs.readSync(fd, buf, 0, newBytes, this.logStream.bytesRead)
			fs.closeSync(fd)
			this.logStream.bytesRead += newBytes

			return buf.includes('MIDIMIXERREADY')
		} catch {
			return false
		}
	}

	_findVRCLog(): void {
		this.logStream = null
		const vrcPath = path.join(os.homedir(), 'AppData', 'LocalLow', 'VRChat', 'VRChat')
		let logs: string[] = []
		try {
			logs = fs
				.readdirSync(vrcPath)
				.filter((f) => f.match(/^output_log_.*\.txt$/))
				.map((f) => path.join(vrcPath, f))
				.sort()
		} catch {
			/* empty */
		}

		if (logs.length === 0) return
		if (this.config.useEditorLog) {
			logs[logs.length - 1] = path.join(os.homedir(), 'AppData', 'Local', 'Unity', 'Editor', 'Editor.log')
		}

		const latest = logs[logs.length - 1]
		const size = fs.statSync(latest).size
		this.logStream = { path: latest, bytesRead: size > 0 ? size - 1 : 0 }
		this.log('debug', `Watching log: ${latest}`)
	}
}
