import type {Architect} from '../../architect/Architect';
import {Engine} from '../Engine/';
import {layers} from './layers';
import * as layerNames from '../../constants/layerNames';
import {PointerPointer} from '../../pointers/index';
import {ScijsPointer} from './pointer';

export class ScijsEngine extends Engine {
	init(): Promise<void> { return Promise.resolve() }

	async compile(architecture: Architect): Promise<Architect> {
		for (const node of architecture.nodes) if (node.pointers)
			node.pointers = node.pointers.map((pointer: PointerPointer) => pointer.switchToPointer(ScijsPointer))
		return new CompiledArchitecture(architecture);
	}
}

class CompiledArchitecture {
	architecture: Architect;
	constructor(architecture: Architect) {
		this.architecture = architecture;
	}

	async run() {

	}
}