
@e2e @smoke
Feature: End-to-End Workflow
  As the complete system
  I want all components to work together
  So that the weekly meal planning process succeeds

  # ====================
  # Smoke Test (Quick Sanity Check)
  # ====================

  @smoke @quick
  Scenario: Quick sanity check - all tabs accessible
    Given I am on the home page
    When I go to the "System Admin" tab
    Then I should see the heading "System Administration"
    When I go to the "Restaurant" tab
    Then I should see the heading "Restaurant - Weekly Options"
    When I go to the "Guests" tab
    Then I should see the heading "Guest Voting"


  # ====================
  # Complete Workflow
  # ====================

  @full-workflow
  Scenario: Complete meal planning workflow from start to finish
    # Step 1: Admin uploads database
    Given I am on the home page
    When I go to the "System Admin" tab
    And I reset the system
    And I upload the meal database
    Then the database should be uploaded successfully
    And the database status should show "Loaded"

    # Step 2: Restaurant selects weekly options
    When I go to the "Restaurant" tab
    Then meal options should be displayed
    When I select "Burger" as a meat option
    And I select "Meatballs" as a meat option
    And I select "Fish and Chips" as a fish option
    And I select "Pasta" as a fish option
    And I select "Lasagna" as a vegetarian option
    And I select "Stir Fry" as a vegetarian option
    And I select "Salad" as a vegetarian option
    And I select "Curry" as a vegetarian option
    And I save the weekly options
    Then the weekly options should be saved successfully

    # Step 3: Guests vote for their preferences
    When I go to the "Guests" tab
    And I enter my name as "Student Alice"
    And I select meat option "Burger"
    And I select fish option "Pasta"
    And I select vegetarian option "Lasagna"
    And I select vegetarian option "Curry"
    And I submit my vote
    Then I should see a confirmation message

    # Step 4: Admin views results and creates meal plan
    When I go to the "System Admin" tab
    Then the system status should show 1 votes
    When I click show vote results
    Then I should see vote charts
    
    # When I select "Burger" for Monday
    # And I select "Pasta" for Tuesday
    # And I select "Mushroom Risotto" for Wednesday
    # And I select "Vegetable Risotto" for Thursday
    # And I save the final meal plan
    # Then the meal plan should be saved successfully
    # And the weekly meal plan should be displayed
