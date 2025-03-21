import { ZeebeGrpcClient } from '../../../zeebe'

jest.setTimeout(16000)
process.env.ZEEBE_NODE_LOG_LEVEL = process.env.ZEEBE_NODE_LOG_LEVEL || 'NONE'

xtest('Calls the onConnectionError handler if there is no broker and eagerConnection:true', () =>
	new Promise((done) => {
		let calledA = 0
		const zbc2 = new ZeebeGrpcClient({
			config: {
				ZEEBE_ADDRESS: 'localtoast: 267890',
				zeebeGrpcSettings: { ZEEBE_GRPC_CLIENT_EAGER_CONNECT: true },
			},
		})

		zbc2.on('connectionError', () => {
			calledA++
		})

		setTimeout(async () => {
			expect(calledA).toBe(1)
			await zbc2.close()
			done(null)
		}, 5000)
	}))

xtest('Does not call the onConnectionError handler if there is a broker', () =>
	new Promise((done) => {
		let calledB = 0
		const zbc2 = new ZeebeGrpcClient()
		zbc2.on('connectionError', () => {
			calledB++
			console.log('onConnection Error was called when there *is* a broker')
		})
		setTimeout(async () => {
			expect(calledB).toBe(0)
			await zbc2.close()
			done(null)
		}, 5000)
	}))

xtest('Calls ZBClient onConnectionError once when there is no broker, eagerConnection:true, and workers with no handler', () =>
	new Promise((done) => {
		let calledC = 0
		const zbc2 = new ZeebeGrpcClient({
			config: {
				ZEEBE_ADDRESS: 'localtoast:234532534',
				zeebeGrpcSettings: { ZEEBE_GRPC_CLIENT_EAGER_CONNECT: true },
			},
		})
		zbc2.on('connectionError', () => {
			calledC++
		})
		zbc2.createWorker({
			taskType: 'whatever',
			taskHandler: (job) => job.complete(),
		})
		zbc2.createWorker({
			taskType: 'whatever',
			taskHandler: (job) => job.complete(),
		})
		setTimeout(() => {
			zbc2.close()
			expect(calledC).toBe(1)
			done(null)
		}, 10000)
	}))

xtest('Calls ZBClient onConnectionError when there no broker, for the client and each worker with a handler', () =>
	new Promise((done) => {
		let calledD = 0
		const zbc2 = new ZeebeGrpcClient({
			config: { ZEEBE_ADDRESS: 'localtoast:234532534' },
		})
		zbc2.on('connectionError', () => {
			calledD++
		})
		zbc2.createWorker({
			taskType: 'whatever',
			taskHandler: (job) => job.complete(),
			onConnectionError: () => calledD++,
		})
		setTimeout(() => {
			zbc2.close()
			expect(calledD).toBe(2)
			done(null)
		}, 10000)
	}))

xtest('Debounces onConnectionError', () =>
	new Promise((done) => {
		let called = 0
		const zbc2 = new ZeebeGrpcClient({
			config: { ZEEBE_ADDRESS: 'localtoast:234532534' },
		})
		zbc2.on('connectionError', () => {
			called++
		})
		zbc2.createWorker({
			taskType: 'whatever',
			taskHandler: (job) => job.complete(),
			onConnectionError: () => called++,
		})
		setTimeout(() => {
			zbc2.close()
			expect(called).toBe(2) // toBeLessThanOrEqual(1)
			done(null)
		}, 15000)
	}))

xtest('Trailing parameter worker onConnectionError handler API works', () =>
	new Promise((done) => {
		let calledE = 0
		const zbc2 = new ZeebeGrpcClient({
			config: { ZEEBE_ADDRESS: 'localtoast:234532534' },
		})
		zbc2.createWorker({
			taskType: 'whatever',
			taskHandler: (job) => job.complete(),
			onConnectionError: () => calledE++,
		})
		setTimeout(async () => {
			await zbc2.close()
			expect(calledE).toBe(1)
			done(null)
		}, 10000)
	}))

xtest('Does not call the onConnectionError handler if there is a business error', () =>
	new Promise((done) => {
		let calledF = 0
		let wf = 'arstsrasrateiuhrastulyharsntharsie'
		const zbc2 = new ZeebeGrpcClient()
		zbc2.on('connectionError', () => {
			calledF++
		})

		zbc2
			.createProcessInstance({
				bpmnProcessId: wf,
				variables: {},
			})
			.catch(() => {
				wf = 'throw error away'
			})
		setTimeout(async () => {
			expect(zbc2.connected).toBe(true)
			expect(calledF).toBe(0)
			await zbc2.close()
			done(null)
		}, 10000)
	}))
