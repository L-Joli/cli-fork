import { DataKeyType, filterTypes, userSubTypes } from '../../api/targeting'
import { variationChoices } from './variationPrompts'
import { namePrompt } from './commonPrompts'

export const audienceNamePrompt = {
    ...namePrompt,
    validate: (value: string) => {
        if (value.length === 0) {
            return 'Name cannot be empty'
        }
        return true
    }
}

export const comparatorChoices = (input: Record<string, any>) => {
    if (input.subType === 'appVersion') {
        return ['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist']
    } else if (input.subType === 'audienceMatch') {
        return ['=', '!=']
    }
    return ['=', '!=', 'exist', '!exist', 'contain', '!contain']
}

export const servePrompt = {
    name: 'serve',
    message: 'Variation to serve',
    type: 'list',
    choices: variationChoices
}

export const filterTypePrompt = {
    name: 'type',
    message: 'Type for definition',
    type: 'list',
    choices: filterTypes
}

export const  filterSubTypePrompt = {
    name: 'subType',
    message: 'Subtype for definition',
    type: 'list',
    choices: userSubTypes
}

export const filterComparatorPrompt = {
    name: 'comparator',
    message: 'Comparator for definition',
    type: 'list',
    choices: comparatorChoices
}

export const filterValuesPrompt = {
    name: 'values',
    message: 'List of comma separated values for definition',
    suffix: ':',
    type: 'input'
}

export const filterAudiencesPrompt = {
    name: 'audiences',
    message: 'List of comma separated audience IDs for definition',
    suffix: ':',
    type: 'input'
}

export const filterDataKeyPrompt = {
    name: 'dataKey',
    message: 'Data key for definition',
    suffix: ':',
    type: 'input'
}

export const filterDataKeyTypePrompt = {
    name: 'dataKeyType',
    message: 'Data key type for definition',
    type: 'list',
    choices: Object.values(DataKeyType)
}