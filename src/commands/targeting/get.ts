import { Args } from '@oclif/core'
import inquirer from 'inquirer'
import { fetchTargetingForFeature } from '../../api/targeting'
import { featurePrompt } from '../../ui/prompts'
import Base from '../base'

export default class DetailedTargeting extends Base {
    static hidden = false
    static description = 'Retrieve Targeting for a Feature from the Management API'
    static examples = [
        '<%= config.bin %> <%= command.id %> feature-one',
        '<%= config.bin %> <%= command.id %> feature-one environment-one',
    ]
    static flags = Base.flags
    static args = {
        feature: Args.string({ description: 'The Feature to get the Targeting Rules' }),
        environment: Args.string({ description: 'The Environment to get the Targeting Rules', required: false })
    }

    authRequired = true

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(DetailedTargeting)

        await this.requireProject()

        let responses

        const feature = args['feature']
        const environment = args['environment']

        if (flags.headless && !feature) {
            this.writer.showError('In headless mode, the feature is required')
        }

        if (feature) {
            responses = { feature }
        } else {
            responses = await inquirer.prompt(
                [featurePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
        }

        if (environment) {
            const targetingForFeatureAndEnv = await fetchTargetingForFeature(
                this.authToken,
                this.projectKey,
                responses.feature,
                environment
            )
            return this.writer.showResults(targetingForFeatureAndEnv)
        }
        const targetingForFeature = await fetchTargetingForFeature(this.authToken, this.projectKey, responses.feature)
        return this.writer.showResults(targetingForFeature)
    }
}