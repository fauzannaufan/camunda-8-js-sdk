import { debug } from 'debug'

import {
	CamundaEnvironmentConfigurator,
	CamundaPlatform8Configuration,
	DeepPartial,
	RequireConfiguration,
} from '../../lib'
import { IOAuthProvider } from '../index'

import { TokenGrantAudienceType } from './IOAuthProvider'

export class BearerAuthProvider implements IOAuthProvider {
	private bearerToken: string

	constructor(options?: {
		config?: DeepPartial<CamundaPlatform8Configuration>
	}) {
		const config = CamundaEnvironmentConfigurator.mergeConfigWithEnvironment(
			options?.config ?? {}
		)

		this.bearerToken = RequireConfiguration(
			config.CAMUNDA_OAUTH_TOKEN,
			'CAMUNDA_OAUTH_TOKEN'
		)
	}

	public async getToken(audienceType: TokenGrantAudienceType): Promise<string> {
		debug(`Token request for ${audienceType}`)

		return Promise.resolve(`Bearer ${this.bearerToken}`)
	}
}
