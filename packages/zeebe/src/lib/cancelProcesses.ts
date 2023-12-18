import { OperateApiClient } from '@jwulf/operate'

const operate = createClient()

export async function cancelProcesses(processDefinitionKey: string) {
	if (!operate) {
		return
	}
	const processes = await operate.searchProcessInstances({
		filter: {
			processDefinitionKey: +processDefinitionKey,
		},
	})
	await Promise.all(
		processes.items.map((item) =>
			operate.deleteProcessInstance(+item.bpmnProcessId)
		)
	)
}

function createClient() {
	try {
		return new OperateApiClient()
	} catch (e: unknown) {
		// console.log(e.message)
		// console.log(`Running without access to Operate`)
		return null
	}
}
