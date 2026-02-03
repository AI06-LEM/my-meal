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

  # ====================
  # JSON Validation
  # ====================

  @validation @json
  Scenario: Admin cannot upload invalid JSON file
    When I go to the "System Admin" tab
    And I upload an invalid JSON file
    Then I should see an error about invalid JSON

  @validation @json
  Scenario: Admin cannot upload JSON without meal_combinations
    When I go to the "System Admin" tab
    And I upload a JSON file missing meal_combinations
    Then I should see an error about missing meal_combinations

  @validation @json
  Scenario: Admin sees warning for combination without vegetarian meal
    When I go to the "System Admin" tab
    And I upload a JSON file with combination lacking vegetarian meal
    Then I should see a warning about missing vegetarian meal
    And the database should be uploaded successfully

  # ====================
  # Vote Results Display
  # ====================

  @vote-results
  Scenario: Vote results are grouped by category
    Given the restaurant has selected weekly options with:
      | category    | meal                |
      | meat        | Burger              |
      | meat        | Meatballs           |
      | fish        | Fish and Chips      |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
    And "Voter1" has already voted with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Curry               |
    When I go to the "System Admin" tab
    And I click show vote results
    Then I should see vote results grouped by "meat"
    And I should see vote results grouped by "fish"
    And I should see vote results grouped by "vegetarian"

  @vote-results
  Scenario: Vote results are sorted by vote count within category
    Given the restaurant has selected weekly options with:
      | category    | meal                |
      | meat        | Burger              |
      | meat        | Meatballs           |
      | fish        | Fish and Chips      |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
    And "Voter1" has already voted with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Curry               |
    And "Voter2" has already voted with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Fish and Chips      |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
    When I go to the "System Admin" tab
    And I click show vote results
    Then the "meat" chart should show "Burger" with 2 votes
    And the "meat" chart should show "Meatballs" with 0 votes

  @vote-results
  Scenario: Zero votes in category shows this fact
    Given the restaurant has selected weekly options with:
      | category    | meal                |
      | meat        | Burger              |
      | meat        | Meatballs           |
      | fish        | Fish and Chips      |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
    When I go to the "System Admin" tab
    And I click show vote results
    Then I should see that no votes exist for "meat"
    And I should see that no votes exist for "fish"
    And I should see that no votes exist for "vegetarian"
