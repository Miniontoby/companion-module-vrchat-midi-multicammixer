import * as node_midi from '@julusian/midi'

export class Output {
	private _output
	public name: string

	constructor(name: string, virtual?: boolean) {
		this._output = new node_midi.Output()
		this.name = name
		const outputPortNumberedNames: string[] = getOutputs()

		if (virtual) {
			this._output.openVirtualPort(name)
		} else {
			const numOutputs = this._output.getPortCount()
			for (let i = 0; i < numOutputs; i++) {
				if (name === outputPortNumberedNames[i]) {
					try {
						this._output.openPort(i)
					} catch (err) {
						console.log(`Error opening port ${name}.\nError: ${err}`)
					}
				}
			}
		}
	}

	close(): void {
		this._output.closePort()
		this._output.destroy()
	}

	isPortOpen(): boolean {
		return this._output.isPortOpen()
	}

	sendMessage(bytes: node_midi.MidiMessage): void {
		this._output.sendMessage(bytes)
	}
}

export function getOutputs(): string[] {
	const output = new node_midi.Output()
	const outputs: string[] = []
	for (let i = 0; i < output.getPortCount(); i++) {
		let counter = 0
		const portName = output.getPortName(i)
		let numberedPortName = portName
		while (outputs.includes(numberedPortName)) {
			counter++
			numberedPortName += ` ${counter}`
		}
		outputs.push(numberedPortName)
	}
	output.closePort()
	return outputs
}
