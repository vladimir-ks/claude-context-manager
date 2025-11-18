Feature: Cleanup Agents and Handle Errors
  As an orchestrator
  I want to cleanup agents and recover from errors gracefully
  So that resources are not leaked and failures are handled properly

  Background:
    Given tmux is installed and running
    And the tmux-agent-control script is available

  Scenario: Cleanup single agent
    Given an agent named "agent-1" exists
    When I run `tmux-agent-control.sh cleanup --name agent-1`
    Then the command should succeed
    And the tmux window "agent-1" should no longer exist
    And the state directory ".tmux-orchestration/agents/agent-1/" should be removed
    And all agent-1 log files should be archived or removed

  Scenario: Cleanup all agents
    Given 3 agents exist: "agent-1", "agent-2", "agent-3"
    When I run `tmux-agent-control.sh cleanup --all`
    Then the command should succeed
    And all 3 tmux windows should be removed
    And the ".tmux-orchestration/agents/" directory should be empty
    And orchestrator state should be reset

  Scenario: Cleanup non-existent agent
    Given no agent named "agent-missing" exists
    When I run `tmux-agent-control.sh cleanup --name agent-missing`
    Then the command should succeed with a warning
    And the warning should indicate agent not found
    And no errors should occur

  Scenario: Handle tmux window termination
    Given an agent named "agent-1" exists
    When the tmux window "agent-1" is manually killed
    And I run `tmux-agent-control.sh check --name agent-1`
    Then the command should detect the window is missing
    And the state should be "error" or "terminated"
    And cleanup should be triggered automatically

  Scenario: Handle agent crash
    Given an agent named "agent-1" is running
    When the CLI process inside agent-1 crashes
    And I run `tmux-agent-control.sh check --name agent-1`
    Then the state should be "error"
    And the error message should indicate process terminated
    And I should be able to cleanup the agent

  Scenario: Recover from parser failure
    Given an agent named "agent-1" has unusual output
    And the CLI-specific parser fails to parse the output
    When I run `tmux-agent-control.sh get-response --name agent-1`
    Then the command should fallback to generic parsing
    Or the command should return raw output
    And the response should indicate parsing difficulty
    And the agent should remain functional for future requests

  Scenario: Handle timeout waiting for agent
    Given an agent named "agent-1" is hung or unresponsive
    When I run `tmux-agent-control.sh wait-idle --name agent-1 --timeout 10`
    Then the command should timeout after 10 seconds
    And the response should indicate timeout occurred
    And I should be able to force-stop the agent
    And cleanup should be possible

  Scenario: Cleanup after orchestration session
    Given an orchestration session has completed
    And multiple agents exist in various states
    When I run orchestration cleanup
    Then all idle agents should be cleaned up
    Then all busy agents should be stopped gracefully
    Then all error agents should be cleaned up
    And final summary should be provided
    And all resources should be released