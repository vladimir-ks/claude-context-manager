Feature: Monitor Agent State and Extract Responses
  As an orchestrator
  I want to monitor agent state and extract responses efficiently
  So that I can coordinate multi-agent workflows with minimal token usage

  Background:
    Given tmux is installed and running
    And an agent named "agent-1" exists with CLI "claude-code"
    And the agent is in "idle" state

  Scenario: Check agent state (lightweight)
    Given agent "agent-1" is idle
    When I run `tmux-agent-control.sh check --name agent-1`
    Then the command should succeed
    And the response should be JSON
    And the status field should be "success"
    And the state field should be "idle"
    And the token usage should be less than 200 tokens

  Scenario: Send message to agent
    Given agent "agent-1" is idle
    When I run `tmux-agent-control.sh send --name agent-1 --message "What is 2+2?"`
    Then the command should succeed
    And the message should appear in the tmux window
    And the agent state should transition to "busy"

  Scenario: Wait for agent to become idle
    Given agent "agent-1" is busy processing a request
    When I run `tmux-agent-control.sh wait-idle --name agent-1 --timeout 60`
    Then the command should succeed within 60 seconds
    And the agent state should be "idle"
    And the response should indicate wait time

  Scenario: Extract response from Claude Code agent
    Given agent "agent-1" has completed a request
    And the agent is in "idle" state
    When I run `tmux-agent-control.sh get-response --name agent-1`
    Then the command should succeed
    And the response should be JSON
    And the response field should contain clean text
    And system reminders should be filtered out
    And tool execution blocks should be filtered out
    And the token usage should be less than 1000 tokens

  Scenario: Extract response from Gemini agent
    Given an agent named "gemini-1" with CLI "gemini"
    And the agent has completed a request
    When I run `tmux-agent-control.sh get-response --name gemini-1`
    Then the command should succeed
    And the response should be JSON
    And the response should not contain box-drawing characters
    And the response should not contain the ✦ marker
    And the response should not contain status line

  Scenario: Monitor multiple agents in parallel
    Given 3 agents exist: "agent-1", "agent-2", "agent-3"
    And all agents have been sent requests
    When I check state of all 3 agents concurrently
    Then all state checks should complete within 5 seconds
    And each agent should report correct state
    And total token usage should be less than 500 tokens

  Scenario: Detect agent error state
    Given agent "agent-1" encounters an error
    And the error message is displayed in the tmux window
    When I run `tmux-agent-control.sh check --name agent-1`
    Then the command should succeed
    And the state should be "error"
    And the error message should be captured

  Scenario: Incremental response capture
    Given agent "agent-1" has generated multiple responses
    And I have previously captured response 1
    When I run `tmux-agent-control.sh get-response --name agent-1`
    Then only the new response (response 2) should be returned
    And the previous response should not be re-captured
    And token usage should reflect only new content

  Scenario: Handle agent with no response yet
    Given agent "agent-1" is busy generating a response
    And the response is not complete
    When I run `tmux-agent-control.sh get-response --name agent-1`
    Then the command should succeed
    And the response should indicate "no response available"
    Or the command should return partial response with "busy" state

  Scenario: Token-efficient polling loop
    Given agent "agent-1" is busy
    When I poll the agent state every 2 seconds for up to 30 seconds
    Then the total token usage should be less than 3000 tokens
    And the agent should eventually transition to "idle"
    And I should be able to extract the final response