export type AgentStatus = 'running' | 'done' | 'failed'

export type AgentRun = {
  id: string
  agentId?: string
  type: string
  description: string
  model: string
  effort?: string
  status: AgentStatus
  startedAt: number
  endedAt?: number
  contextTokens: number
  contextMax: number
  tokens: number
  costUsd: number
  steps: number
}

export type View = {
  isCompact: boolean
  isDoneCollapsed: boolean
  isBandHidden: boolean
  didAutoOpen: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'pulse-progress': {
      agents: AgentRun[]
      view: View
      now: number
    }
  }
}
