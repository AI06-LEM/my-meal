
# [TODO] Bugs

- [TODO] If you upload the database, then select a meat option at the restaurant interface, the first meat option is automatically selected.

 - [TODO] Remove the `dietary_info` from the `meals_database.json`, from the `script.json` as well as from the user interface.
   Question for us: Is this still unfinished?

 - [TODO] When resetting system, in system admin UI under current status, 1 vote always remains shown, meal plan shows as generated, database as loaded and weekly options as set. Instead, the whole database should be wiped by resetting the system, and this should be reflected also by what is shown under such status information at the system admin UI.

 - [TODO] Weekly options saved by restaurant are saved and then not removed when changed. Remove previously saved weekly options when saving.
   Question for us: How about if the restaurant tab is visited again, after weekly options have been selected already, then these selected options are shown as selected, and then the current selection can be transparently changed (selections added or removed).
   Question for us: Whenever the weekly options are changed, then the previous guest votes might become inconsistent with that selection. So, should we perhaps wipe all guest votes when the selection changed?

 - [TODO] Vegetarian Combos are formatted differently in the guest UI. Ensure same formatting as meat and fish combos (what it includes).
   Question for us: Does this mean that a combo of two vegetarian meals is shown as two separate meals instead of as a single choice (that includes two meal options)?

 - [DONE] Check `meals_database.json` for vegetarian meal duplicates, for example one vegetarian meal in a meal combo and another as an independent meal that are effectively the same meal. These should not coexist, so remove the independent vegetarian meal in that case. Then change the independent vegetarian meals into meal combos with other vegetarian dishes, but ensure compatibility (i.e. mushroom risotto with vegetable risotto). 

 - [DONE] Update the database: for the fish and vegetarian combinations, don't include only tofu vegetarian options. Remember, however, that the vegetarian option should not simply be a completely different dish, but should instead mainly replace the fish. So, first find vegetarian alternatives that could substitute the fish in the dish (think vegetarian paella), then update the database accordingly.

- [DONE] When a guest vote is submitted, not all details are showed in the database. The guest name is shown, but the meal IDs and the meal names are not shown. And in the sqlite_sequence, the id  numbers are not refreshed.

 - [DONE] Add a reset button in the system admin tab, which would wipe the internal memory (i.e., delete relevant local files: `weekly_options.json`, `guest_votes.json` and `meal_plan.json`).
 
 - [DONE] In the user interface for `meal_combinations`, the dietary info is not shown, even though that information is contained in the database. Please show this information also in the UI.

 - [DONE] In the user interface, showing whether a dish is vegetarian or not is redundant, as all dishes are or include a vegetarian option. However, only remove this information from the user interface, please still retain it internally.

 - [DONE] In the user interface for both the restaurant as well as the guests, please rename the meal combinations: remove the term "Combo" (e.g., "Burger Combo" would become simply "Burger"). Nevertheless, only the name shown in the interface is changed, the app otherwise remains the same.
 - [DONE] Please carefully proofread the file `meals_database.json`, there are several issues including the following:
   * [DONE] *Every* meat and fish dish should be part of a `meal_combinations` complemented by a vegetarian or vegan counterpart dish. In other words, there can be no exclusively non-vegetarian meals. In the end, all votes for a meat and fish dish must also include a vote for a vegetarian or vegan counterpart dish, so that vegetarians are always served as well (by contrast, we do *not* always need a vegan dish).
   * [DONE] In a `meal_combinations` with meat of fish, the two options should be similar and only differ by one main ingredient (e.g., a meat burger and a vegetarian burger are correct, while combining Tuna Pasta and Pasta Primavera is not correct).
   * [DONE] Dietary options should be only `gluten`, `gluten-free` is redundant as a possible value. If `gluten` is not set as a flag, this implies `gluten-free`. 
   * [DONE]  `vegan` is redundant as a dietary option under `dietary_info`, as this option is already set as the separate `vegan` property.
   * [DONE] Add another 10 meals to the database

 - [DONE] When generating the final plan, we get the following error: `Not enough unique options selected. Please ensure variety in weekly options.` This happens also after 12 guest votes have been submitted (see value of current `guest_votes.json`). It is not clear for the user, why this error happens. If there is a problem with the guest votes themselves, then this should be reported immediately when a submits their vote and the guest should be asked to resubmit. Otherwise, if there is at least one guest vote, any combination of votes should result in a final meal plan consistent with the given votes. If this is not possible with the current voting mechanism, then feel free to come back to discuss that voting mechanism and how it can be revised.

 - [DONE] It appears that several files with persistent data are not updated when the program is running, e.g., 
   * `meal_plan.json` is not containing the final result after the system admin clicked on the button [Generate Weekly Meal Plan]
   * `guest_votes.json` remains empty after votes are submitted
   * `weekly_options.json` remains empty after Seefood entered options

