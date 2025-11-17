Feature: Spawn Agents in Tmux Windows
  As an orchestrator
  I want to spawn multiple AI agents in isolated tmux windows
  So that I can execute tasks in parallel

  Background:
    Given tmux is installed and running
    And I have access to multiple AI CLIs
    And the tmux-agent-control script is available

  Scenario: Spawn single Claude Code agent
    Given no existing agent named "agent-1"
    When I run `tmux-agent-control.sh spawn --name agent-1 --cli claude-code`
    Then the command should succeed
    And a tmux window named "agent-1" should exist
    And Claude Code CLI should be running in that window
    And the agent status should be "initializing" or "idle"
    And a state file should exist at ".tmux-orchestration/agents/agent-1/status.json"

  Scenario: Spawn multiple agents in parallel
    Given no existing agents
    When I spawn 3 agents concurrently:
      | Agent Name | CLI Type    |
      | agent-1    | claude-code |
      | agent-2    | gemini      |
      | agent-3    | bash        |
    Then all 3 commands should succeed
    And 3 tmux windows should exist
    And each window should run its respective CLI
    And 3 state directories should exist under ".tmux-orchestration/agents/"

  Scenario: Spawn agent with custom working directory
    Given no existing agent named "agent-test"
    And a directory exists at "/tmp/test-project"
    When I run `tmux-agent-control.sh spawn --name agent-test --cli bash --working-dir /tmp/test-project`
    Then the command should succeed
    And the agent should be in working directory "/tmp/test-project"
    And running `pwd` in the agent window should output "/tmp/test-project"

  Scenario: Attempt to spawn agent with duplicate name
    Given an agent named "agent-1" already exists
    When I run `tmux-agent-control.sh spawn --name agent-1 --cli claude-code`
    Then the command should fail
    And the error message should contain "already exists"
    And the existing agent should remain unaffected

  Scenario: Spawn agent with unsupported CLI type
    Given no existing agent named "agent-bad"
    When I run `tmux-agent-control.sh spawn --name agent-bad --cli unsupported-cli`
    Then the command should fail
    And the error message should contain "unsupported CLI type"
    And no tmux window should be created

  Scenario: Verify agent initialization
    Given I have spawned an agent named "agent-1" with CLI "claude-code"
    When I wait for 5 seconds
    And I check the agent status
    Then the status should be "idle"
    And the tmux window should show a prompt
    And capturing the pane should return output without errors
