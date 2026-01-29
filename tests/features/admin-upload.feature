# Feature: System Admin - Database Upload
# Tests for the system admin's ability to upload meal databases.

@admin
Feature: Admin Database Upload
  As a system admin
  I want to upload a meal database
  So that the restaurant can select weekly options

  Background:
    Given I am on the home page

  # ====================
  # Happy Path Scenarios
  # ====================

  @happy-path
  Scenario: Admin uploads a valid meal database
    When I go to the "System Admin" tab
    And I upload the meal database
    Then the database should be uploaded successfully
    And the database status should show "Loaded"

  @happy-path
  Scenario: System status updates after database upload
    Given I am on the admin tab
    When I reset the system
    And I upload the test meal database
    Then the system status should show database as "Loaded"
    And the system status should show options as "Not set"
    And the system status should show votes as "No votes"

  # ====================
  # State Verification
  # ====================

  # @state
  # Scenario: Initial system state before any uploads
  #   When I go to the "System Admin" tab
  #   # BUG: If there is a my-meal.db file in the database folder, it will show as loaded instead of not loaded.
  #   # So, an additional step would first need to delete the SQLite DB file, but only temporarily (rename?)
  #   Then the system status should show database as "Not loaded"
  #   And the system status should show options as "Not set"
  #   And the system status should show votes as "No votes"
  #   And the system status should show meal plan as "Not set"

  @state
  Scenario: Uploaded database persists across page refresh
    Given I upload the test meal database
    When I refresh the page
    And I go to the "System Admin" tab
    Then the database status should show "Loaded"

  # ====================
  # UI Elements
  # ====================

  @ui
  Scenario: Admin interface shows all required elements
    When I go to the "System Admin" tab
    Then I should see the heading "System Administration"
    And the "Upload Database" button should be visible
    And the "Show Vote Charts" button should be visible
    # Obsolete button for now
#    And the "Save Final Meal Plan" button should be visible
    And the "Reset System" button should be visible
