import apiClient from './apiClient'

enum TargetingStatus {
    active = 'active',
    inactive = 'inactive',
    archived = 'archived'
}

enum RolloutType {
    schedule = 'schedule',
    gradual = 'gradual',
    stepped = 'stepped'
}

enum RolloutStageType {
    linear = 'linear',
    discrete = 'discrete'
}

class Distribution {
    _variation: string
    percentage: number
}

class RolloutStage {
    type: RolloutStageType
    date: Date
    percentage: number
}

class Rollout {
    type: RolloutType
    startPercentage?: number
    startDate?: Date
    stages?: RolloutStage[]
}

export class TargetingRules {
    _id: string
    _feature: string
    _environment: string
    _createdBy: string
    status: TargetingStatus
    name?: string
    _audience: string
    rollout?: Rollout
    distribution: Distribution[]
    createdAt: Date
    updatedAt: Date
}

export const fetchTargetingForFeature = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key?: string
): Promise<TargetingRules[]> => {
    const url = `/v1/projects/${project_id}/features/${feature_key}/configurations` +
        `${environment_key ? `?environment=${environment_key}` : ''}`
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const enableTargeting = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string
): Promise<TargetingRules> => {
    const targetingEnabledResponse = await updateTargetingStatusForFeatureAndEnvironment(
        token,
        project_id,
        feature_key,
        environment_key,
        TargetingStatus.active
    )
    return targetingEnabledResponse.data
}

export const disableTargeting = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string
): Promise<TargetingRules> => {
    const targetingDisabledResponse = await updateTargetingStatusForFeatureAndEnvironment(
        token,
        project_id,
        feature_key,
        environment_key,
        TargetingStatus.inactive
    )
    return targetingDisabledResponse.data
}

const updateTargetingStatusForFeatureAndEnvironment = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string,
    status: TargetingStatus
) => {
    const url = `/v1/projects/${project_id}/features/${feature_key}/configurations` +
        `?environment=${environment_key}`
    return apiClient.patch(url, { status }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })
}