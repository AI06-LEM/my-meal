// Global state
let mealsDatabase = null;
let weeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
let guestVotes = { votes: [], last_updated: null };
let mealPlan = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, generated_at: null };

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadExistingData();
    updateSystemStatus();
});

function initializeApp() {
    // Load existing data from localStorage or files
    loadDataFromStorage();
}

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Admin interface
    document.getElementById('uploadDatabase').addEventListener('click', uploadDatabase);
    const showVoteResultsBtn = document.getElementById('showVoteResults');
    if (showVoteResultsBtn) {
        showVoteResultsBtn.addEventListener('click', showVoteResults);
    }
    const saveFinalPlanBtn = document.getElementById('saveFinalPlan');
    if (saveFinalPlanBtn) {
        saveFinalPlanBtn.addEventListener('click', saveFinalMealPlan);
    }
    document.getElementById('resetSystem').addEventListener('click', resetSystem);

    // Restaurant interface
    document.getElementById('saveWeeklyOptions').addEventListener('click', saveWeeklyOptions);

    // Guest interface
    document.getElementById('submitVote').addEventListener('click', submitVote);
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Load data for the active tab
    if (tabName === 'restaurant') {
        loadRestaurantInterface();
    } else if (tabName === 'guests') {
        loadGuestInterface();
    }
}

// Admin Interface Functions
async function uploadDatabase() {
    const fileInput = document.getElementById('databaseFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showStatus('uploadStatus', 'Please select a file to upload.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            mealsDatabase = data;
            await saveDataToStorage();
            showStatus('uploadStatus', 'Database uploaded successfully!', 'success');
            updateSystemStatus();
        } catch (error) {
            showStatus('uploadStatus', 'Error parsing JSON file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

async function resetSystem() {
    // Confirm with user
    if (!confirm('Are you sure you want to reset the system? This will delete all weekly options, guest votes, and meal plans. This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/api/reset', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to reset system');
        }

        // Reset in-memory state
        weeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
        guestVotes = { votes: [], last_updated: null };
        mealPlan = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, generated_at: null };

        // Update UI
        updateSystemStatus();
        showStatus('resetStatus', 'System reset successfully! All weekly options, votes, and meal plans have been deleted.', 'success');
        
        // Clear meal plan display if visible
        document.getElementById('mealPlanResult').innerHTML = '';
    } catch (error) {
        console.error('Error resetting system:', error);
        showStatus('resetStatus', 'Error resetting system: ' + error.message, 'error');
    }
}

// Admin: compute vote counts and display charts instead of auto-generating a plan
function calculateVoteCounts() {
    const meatCounts = {};
    const fishCounts = {};
    const vegetarianCounts = {};

    if (!guestVotes || !Array.isArray(guestVotes.votes)) {
        return { meatCounts, fishCounts, vegetarianCounts };
    }

    guestVotes.votes.forEach(vote => {
        if (vote.meat_option) {
            meatCounts[vote.meat_option] = (meatCounts[vote.meat_option] || 0) + 1;
        }
        if (vote.fish_option) {
            fishCounts[vote.fish_option] = (fishCounts[vote.fish_option] || 0) + 1;
        }
        if (Array.isArray(vote.vegetarian_options)) {
            const uniqueVeg = [...new Set(vote.vegetarian_options)];
            uniqueVeg.forEach(id => {
                vegetarianCounts[id] = (vegetarianCounts[id] || 0) + 1;
            });
        }
    });

    return { meatCounts, fishCounts, vegetarianCounts };
}

function getOptionNameById(id, category) {
    const list = weeklyOptions && weeklyOptions[`${category}_options`];
    if (Array.isArray(list)) {
        const found = list.find(opt => opt.id === id);
        if (found) {
            return formatMealNameForDisplay(found.name);
        }
    }

    // Fallback to meals database
    if (mealsDatabase) {
        if (category === 'vegetarian' && Array.isArray(mealsDatabase.meals)) {
            const meal = mealsDatabase.meals.find(m => m.id === id);
            if (meal) return formatMealNameForDisplay(meal.name);
        }
        if (Array.isArray(mealsDatabase.meal_combinations)) {
            const combo = mealsDatabase.meal_combinations.find(c => c.id === id);
            if (combo) return formatMealNameForDisplay(combo.name);
        }
    }

    return id;
}

function renderChart(chartElementId, counts, category) {
    const container = document.getElementById(chartElementId);
    if (!container) return;

    container.innerHTML = '';
    const entries = Object.entries(counts);

    if (entries.length === 0) {
        container.innerHTML = '<p class="info">No votes yet for this category.</p>';
        return;
    }

    const maxValue = Math.max(...entries.map(([_, value]) => value));

    entries
        .sort((a, b) => b[1] - a[1])
        .forEach(([id, value]) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';

            const label = document.createElement('div');
            label.className = 'chart-bar-label';
            label.textContent = getOptionNameById(id, category);

            const barFill = document.createElement('div');
            barFill.className = 'chart-bar-fill';

            const inner = document.createElement('div');
            inner.className = 'chart-bar-fill-inner';
            const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
            inner.style.width = `${widthPercent}%`;
            barFill.appendChild(inner);

            const valueSpan = document.createElement('div');
            valueSpan.className = 'chart-bar-value';
            valueSpan.textContent = value;

            bar.appendChild(label);
            bar.appendChild(barFill);
            bar.appendChild(valueSpan);

            container.appendChild(bar);
        });
}

function showVoteResults() {
    if (!mealsDatabase) {
        showStatus('voteResultsStatus', 'Please upload a meal database first.', 'error');
        return;
    }

    if (!weeklyOptions || weeklyOptions.meat_options.length === 0 ||
        weeklyOptions.fish_options.length === 0 ||
        weeklyOptions.vegetarian_options.length === 0) {
        showStatus('voteResultsStatus', 'Please set weekly options first.', 'error');
        return;
    }

    if (!guestVotes || guestVotes.votes.length === 0) {
        showStatus('voteResultsStatus', 'No votes have been cast yet.', 'info');
        // Clear charts
        renderChart('meatChart', {}, 'meat');
        renderChart('fishChart', {}, 'fish');
        renderChart('vegetarianChart', {}, 'vegetarian');
        return;
    }

    const { meatCounts, fishCounts, vegetarianCounts } = calculateVoteCounts();
    renderChart('meatChart', meatCounts, 'meat');
    renderChart('fishChart', fishCounts, 'fish');
    renderChart('vegetarianChart', vegetarianCounts, 'vegetarian');

    showStatus('voteResultsStatus', 'Vote charts updated based on current votes.', 'success');
}

function populateFinalPlanForm() {
    const mondaySelect = document.getElementById('mondaySelect');
    const tuesdaySelect = document.getElementById('tuesdaySelect');
    const wednesdaySelect = document.getElementById('wednesdaySelect');
    const thursdaySelect = document.getElementById('thursdaySelect');

    if (!mondaySelect || !tuesdaySelect || !wednesdaySelect || !thursdaySelect) {
        return;
    }

    // Helper to reset and populate a select
    const populate = (select, options, placeholder) => {
        const currentValue = select.value;
        select.innerHTML = '';
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        select.appendChild(placeholderOption);

        if (Array.isArray(options)) {
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id;
                option.textContent = formatMealNameForDisplay(opt.name);
                select.appendChild(option);
            });
        }

        // Try to preserve current selection if still valid
        if (currentValue) {
            const match = Array.from(select.options).find(o => o.value === currentValue);
            if (match) {
                select.value = currentValue;
            }
        }
    };

    populate(mondaySelect, weeklyOptions.meat_options, 'Select a meat option');
    populate(tuesdaySelect, weeklyOptions.fish_options, 'Select a fish option');
    populate(wednesdaySelect, weeklyOptions.vegetarian_options, 'Select a vegetarian option');
    populate(thursdaySelect, weeklyOptions.vegetarian_options, 'Select a vegetarian option');

    // If a meal plan already exists, pre-fill selections from it using option names
    if (mealPlan && mealPlan.monday) {
        setSelectValueByMealName(mondaySelect, mealPlan.monday);
    }
    if (mealPlan && mealPlan.tuesday) {
        setSelectValueByMealName(tuesdaySelect, mealPlan.tuesday);
    }
    if (mealPlan && mealPlan.wednesday) {
        setSelectValueByMealName(wednesdaySelect, mealPlan.wednesday);
    }
    if (mealPlan && mealPlan.thursday) {
        setSelectValueByMealName(thursdaySelect, mealPlan.thursday);
    }
}

function setSelectValueByMealName(selectElement, mealName) {
    if (!selectElement || !mealName) return;
    const formattedName = formatMealNameForDisplay(mealName);
    const option = Array.from(selectElement.options).find(
        o => formatMealNameForDisplay(o.textContent) === formattedName
    );
    if (option) {
        selectElement.value = option.value;
    }
}

async function saveFinalMealPlan() {
    const mondaySelect = document.getElementById('mondaySelect');
    const tuesdaySelect = document.getElementById('tuesdaySelect');
    const wednesdaySelect = document.getElementById('wednesdaySelect');
    const thursdaySelect = document.getElementById('thursdaySelect');

    if (!mondaySelect || !tuesdaySelect || !wednesdaySelect || !thursdaySelect) {
        showStatus('finalPlanStatus', 'Final plan form is not available.', 'error');
        return;
    }

    const mondayId = mondaySelect.value;
    const tuesdayId = tuesdaySelect.value;
    const wednesdayId = wednesdaySelect.value;
    const thursdayId = thursdaySelect.value;

    if (!mondayId || !tuesdayId || !wednesdayId || !thursdayId) {
        showStatus('finalPlanStatus', 'Please select 1 meat, 1 fish, and 2 vegetarian options.', 'error');
        return;
    }

    const mondayOption = weeklyOptions.meat_options.find(o => o.id === mondayId);
    const tuesdayOption = weeklyOptions.fish_options.find(o => o.id === tuesdayId);
    const wedOption = weeklyOptions.vegetarian_options.find(o => o.id === wednesdayId);
    const thuOption = weeklyOptions.vegetarian_options.find(o => o.id === thursdayId);

    if (!mondayOption || !tuesdayOption || !wedOption || !thuOption) {
        showStatus('finalPlanStatus', 'Selected meals must be part of this week\'s options.', 'error');
        return;
    }

    // Ensure all four selected meals are different
    const selectedIds = [mondayId, tuesdayId, wednesdayId, thursdayId];
    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== 4) {
        showStatus('finalPlanStatus', 'Each selected meal must be different. Please choose 4 distinct meals.', 'error');
        return;
    }

    mealPlan = {
        monday: mondayOption.name,
        tuesday: tuesdayOption.name,
        wednesday: wedOption.name,
        thursday: thuOption.name,
        friday: null,
        generated_at: new Date().toISOString()
    };

    try {
        await saveMealPlan();
        displayMealPlan();
        updateSystemStatus();
        showStatus('finalPlanStatus', 'Final meal plan saved successfully.', 'success');
    } catch (error) {
        console.error('Error saving final meal plan:', error);
        showStatus('finalPlanStatus', 'Failed to save final meal plan.', 'error');
    }
}

function removeDuplicatesById(options) {
    const seen = new Set();
    return options.filter(option => {
        if (seen.has(option.id)) {
            return false;
        }
        seen.add(option.id);
        return true;
    });
}

function findMostPopular(options, voteCounts, count = 1) {
    if (!options || options.length === 0) {
        return count === 1 ? null : [];
    }
    
    const sorted = options
        .map(option => ({ option, votes: voteCounts[option.id] || 0 }))
        .sort((a, b) => b.votes - a.votes);
    
    if (count === 1) {
        return sorted[0] ? sorted[0].option : null;
    } else {
        return sorted.slice(0, count).map(item => item.option);
    }
}

// Helper function to get vegetarian counterpart ID from a combo
function getVegetarianCounterpartId(optionId) {
    if (!mealsDatabase || !mealsDatabase.meal_combinations) return null;
    
    const combo = mealsDatabase.meal_combinations.find(c => c.id === optionId);
    if (combo && combo.meals) {
        const vegMeal = combo.meals.find(m => m.category === 'vegetarian');
        return vegMeal ? vegMeal.id : null;
    }
    return null;
}

// Check if selected options have conflicts (e.g., combo's vegetarian counterpart is also selected separately)
function checkForConflicts(selectedMeat, selectedFish, selectedVegetarian) {
    const conflictIds = new Set();
    let message = '';
    
    // Check if meat combo's vegetarian counterpart conflicts
    const meatVegCounterpart = getVegetarianCounterpartId(selectedMeat.id);
    if (meatVegCounterpart) {
        const isConflict = selectedVegetarian.some(veg => veg.id === meatVegCounterpart);
        if (isConflict) {
            conflictIds.add(meatVegCounterpart);
            message += `The selected meat option "${selectedMeat.name}" includes a vegetarian option that was also selected separately. `;
        }
    }
    
    // Check if fish combo's vegetarian counterpart conflicts
    const fishVegCounterpart = getVegetarianCounterpartId(selectedFish.id);
    if (fishVegCounterpart) {
        const isConflict = selectedVegetarian.some(veg => veg.id === fishVegCounterpart);
        if (isConflict) {
            conflictIds.add(fishVegCounterpart);
            message += `The selected fish option "${selectedFish.name}" includes a vegetarian option that was also selected separately. `;
        }
    }
    
    return {
        hasConflict: conflictIds.size > 0,
        conflictIds: Array.from(conflictIds),
        message: message || 'No conflicts detected.'
    };
}

// Resolve conflicts by selecting alternative vegetarian options
function resolveConflicts(uniqueVegetarianOptions, voteCounts, selectedMeat, selectedFish, originalVegetarian) {
    const conflictInfo = checkForConflicts(selectedMeat, selectedFish, originalVegetarian);
    
    if (!conflictInfo.hasConflict) {
        return originalVegetarian;
    }
    
    // Get IDs to exclude (conflicting vegetarian counterparts)
    const excludeIds = new Set(conflictInfo.conflictIds);
    
    // Also exclude the original vegetarian options that conflict
    originalVegetarian.forEach(veg => {
        if (excludeIds.has(veg.id)) {
            excludeIds.add(veg.id);
        }
    });
    
    // Find alternative vegetarian options, excluding conflicts
    let availableOptions = uniqueVegetarianOptions.filter(opt => !excludeIds.has(opt.id));
    
    // If we don't have enough alternatives, we need to be more lenient
    // Try to use options that weren't in the original selection but are available
    if (availableOptions.length < 2) {
        // If still not enough, we might need to accept some conflicts or use any available options
        // But first, let's see if we can use options from the original selection that don't conflict
        const nonConflictingOriginal = originalVegetarian.filter(veg => !excludeIds.has(veg.id));
        if (nonConflictingOriginal.length > 0) {
            availableOptions = [...nonConflictingOriginal, ...availableOptions];
        }
        
        // If still not enough, use all available vegetarian options (this should always be >= 2 based on requirements)
        if (availableOptions.length < 2) {
            availableOptions = uniqueVegetarianOptions;
        }
    }
    
    // Select top 2 vegetarian options from available alternatives, prioritizing vote counts
    const sorted = availableOptions
        .map(option => ({ option, votes: voteCounts[option.id] || 0 }))
        .sort((a, b) => b.votes - a.votes);
    
    // Ensure we have exactly 2 unique options
    const uniqueResolved = [];
    const seenIds = new Set();
    
    // First, try to get options with votes
    for (const item of sorted) {
        if (!seenIds.has(item.option.id)) {
            uniqueResolved.push(item.option);
            seenIds.add(item.option.id);
            if (uniqueResolved.length >= 2) break;
        }
    }
    
    // If we still don't have 2, fill with any remaining options (even with 0 votes)
    if (uniqueResolved.length < 2) {
        for (const opt of availableOptions) {
            if (!seenIds.has(opt.id)) {
                uniqueResolved.push(opt);
                seenIds.add(opt.id);
                if (uniqueResolved.length >= 2) break;
            }
        }
    }
    
    // As a last resort, if we still don't have 2, use any vegetarian options
    if (uniqueResolved.length < 2) {
        for (const opt of uniqueVegetarianOptions) {
            if (!seenIds.has(opt.id)) {
                uniqueResolved.push(opt);
                seenIds.add(opt.id);
                if (uniqueResolved.length >= 2) break;
            }
        }
    }
    
    return uniqueResolved.length === 2 ? uniqueResolved : null;
}

function displayMealPlan() {
    const resultDiv = document.getElementById('mealPlanResult');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let html = '<h3>Weekly Meal Plan</h3>';
    
    days.forEach((day, index) => {
        const meal = mealPlan[day];
        if (meal) {
            html += `
                <div class="meal-plan-day">
                    <span class="day-name">${dayNames[index]}</span>
                    <span class="meal-name">${formatMealNameForDisplay(meal)}</span>
                </div>
            `;
        } else {
            html += `
                <div class="meal-plan-day">
                    <span class="day-name">${dayNames[index]}</span>
                    <span class="meal-name">Leftovers</span>
                </div>
            `;
        }
    });
    
    resultDiv.innerHTML = html;
}

// Restaurant Interface Functions
function loadRestaurantInterface() {
    if (!mealsDatabase) {
        showStatus('saveStatus', 'Please upload a meal database first.', 'error');
        return;
    }

    loadMealOptions();
    populateFinalPlanForm();
}

function loadMealOptions() {
    const meatDiv = document.getElementById('meatOptions');
    const fishDiv = document.getElementById('fishOptions');
    const vegetarianDiv = document.getElementById('vegetarianOptions');

    // Clear existing options
    meatDiv.innerHTML = '';
    fishDiv.innerHTML = '';
    vegetarianDiv.innerHTML = '';

    // Load vegetarian meals (individual meals only)
    mealsDatabase.meals.forEach(meal => {
        if (meal.category === 'vegetarian') {
            const mealCard = createMealCard(meal);
            vegetarianDiv.appendChild(mealCard);
        }
    });

    // Load meal combinations - meat and fish only come from combinations
    if (mealsDatabase.meal_combinations) {
        mealsDatabase.meal_combinations.forEach(combo => {
            const comboCard = createMealCard(combo, true);
            // Determine category based on combo contents
            const hasMeat = combo.meals.some(meal => meal.category === 'meat');
            const hasFish = combo.meals.some(meal => meal.category === 'fish');
            
            if (hasMeat) {
                meatDiv.appendChild(comboCard);
            } else if (hasFish) {
                fishDiv.appendChild(comboCard);
            } else {
                // Vegetarian-only combinations: all meals are vegetarian
                vegetarianDiv.appendChild(comboCard);
            }
        });
    }

    // Restore selected state from saved weeklyOptions
    if (weeklyOptions) {
        // Mark meat options as selected
        if (weeklyOptions.meat_options) {
            weeklyOptions.meat_options.forEach(option => {
                const card = document.querySelector(`[data-meal-id="${option.id}"]`);
                if (card && card.parentElement.id === 'meatOptions') {
                    card.classList.add('selected');
                }
            });
        }

        // Mark fish options as selected
        if (weeklyOptions.fish_options) {
            weeklyOptions.fish_options.forEach(option => {
                const card = document.querySelector(`[data-meal-id="${option.id}"]`);
                if (card && card.parentElement.id === 'fishOptions') {
                    card.classList.add('selected');
                }
            });
        }

        // Mark vegetarian options as selected
        if (weeklyOptions.vegetarian_options) {
            weeklyOptions.vegetarian_options.forEach(option => {
                const card = document.querySelector(`[data-meal-id="${option.id}"]`);
                if (card && card.parentElement.id === 'vegetarianOptions') {
                    card.classList.add('selected');
                }
            });
        }
    }
}

function createMealCard(meal, isCombo = false) {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.dataset.mealId = meal.id;
    card.dataset.mealName = meal.name;
    
    // Store combo information if it's a combo
    if (isCombo && meal.meals) {
        card.dataset.isCombo = 'true';
        card.dataset.comboData = JSON.stringify(meal.meals);
    }
    
    let comboInfo = '';
    if (isCombo && meal.meals) {
        const meatFishMeal = meal.meals.find(m => m.category === 'meat' || m.category === 'fish');
        const vegMeal = meal.meals.find(m => m.category === 'vegetarian');
        if (meatFishMeal && vegMeal) {
            comboInfo = `<p class="dietary-info"><strong>Includes:</strong> ${meatFishMeal.name} + ${vegMeal.name}</p>`;
        } else {
            comboInfo = `<p class="dietary-info">Combo: ${meal.meals.map(m => m.name).join(' / ')}</p>`;
        }
    }

    card.innerHTML = `
        <div class="checkbox"></div>
        <h5>${formatMealNameForDisplay(meal.name)}</h5>
        ${comboInfo}
        <p>Vegan: ${meal.vegan ? 'Yes' : 'No'}</p>
    `;

    card.addEventListener('click', function() {
        toggleMealSelection(this);
    });

    return card;
}

function toggleMealSelection(card) {
    const isSelected = card.classList.contains('selected');
    const category = getCategoryFromCard(card);
    
    if (isSelected) {
        card.classList.remove('selected');
        removeFromWeeklyOptions(card.dataset.mealId, category);
        
        // If it's a meat/fish combo, also remove the vegetarian counterpart
        if (card.dataset.isCombo === 'true' && (category === 'meat' || category === 'fish')) {
            const comboMeals = JSON.parse(card.dataset.comboData);
            const vegMeal = comboMeals.find(m => m.category === 'vegetarian');
            if (vegMeal) {
                removeFromWeeklyOptions(vegMeal.id, 'vegetarian');
                // Also unselect the vegetarian card if it's visible
                const vegCard = document.querySelector(`[data-meal-id="${vegMeal.id}"]`);
                if (vegCard) {
                    vegCard.classList.remove('selected');
                }
            }
        }
    } else {
        card.classList.add('selected');
        addToWeeklyOptions(card.dataset.mealId, card.dataset.mealName, category);
        
        // If it's a meat/fish combo, automatically add the vegetarian counterpart
        if (card.dataset.isCombo === 'true' && (category === 'meat' || category === 'fish')) {
            const comboMeals = JSON.parse(card.dataset.comboData);
            const vegMeal = comboMeals.find(m => m.category === 'vegetarian');
            if (vegMeal) {
                // Check if it's already added to avoid duplicates
                const alreadyAdded = weeklyOptions.vegetarian_options.some(opt => opt.id === vegMeal.id);
                if (!alreadyAdded) {
                    addToWeeklyOptions(vegMeal.id, vegMeal.name, 'vegetarian');
                    // Also select the vegetarian card if it's visible
                    const vegCard = document.querySelector(`[data-meal-id="${vegMeal.id}"]`);
                    if (vegCard) {
                        vegCard.classList.add('selected');
                    }
                }
            }
        }
    }
}


function getCategoryFromCard(card) {
    const parent = card.parentElement;
    if (parent.id === 'meatOptions') return 'meat';
    if (parent.id === 'fishOptions') return 'fish';
    if (parent.id === 'vegetarianOptions') return 'vegetarian';
    return null;
}

function addToWeeklyOptions(mealId, mealName, category) {
    const option = { id: mealId, name: mealName };
    weeklyOptions[`${category}_options`].push(option);
}

function removeFromWeeklyOptions(mealId, category) {
    const options = weeklyOptions[`${category}_options`];
    const index = options.findIndex(option => option.id === mealId);
    if (index > -1) {
        options.splice(index, 1);
    }
}

async function saveWeeklyOptions() {
    // Rebuild weeklyOptions from currently selected UI elements
    // This ensures previously saved options are removed when changed
    weeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
    
    // Get all selected cards
    const selectedCards = document.querySelectorAll('.meal-card.selected');
    
    selectedCards.forEach(card => {
        const mealId = card.dataset.mealId;
        const mealName = card.dataset.mealName;
        const category = getCategoryFromCard(card);
        
        if (category && mealId && mealName) {
            const option = { id: mealId, name: mealName };
            weeklyOptions[`${category}_options`].push(option);
        }
    });
    
    weeklyOptions.last_updated = new Date().toISOString();
    await saveDataToStorage();
    showStatus('saveStatus', 'Weekly options saved successfully!', 'success');
    updateSystemStatus();
}

// Guest Interface Functions
function loadGuestInterface() {
    if (!mealsDatabase || weeklyOptions.meat_options.length === 0) {
        showStatus('voteStatus', 'Weekly options not set yet. Please wait for restaurant to select options.', 'error');
        return;
    }

    loadVotingOptions();
}

function loadVotingOptions() {
    const meatDiv = document.getElementById('meatVoting');
    const fishDiv = document.getElementById('fishVoting');
    const vegetarianDiv = document.getElementById('vegetarianVoting');

    // Clear existing options
    meatDiv.innerHTML = '';
    fishDiv.innerHTML = '';
    vegetarianDiv.innerHTML = '';

    // Load meat options (these are now always combinations)
    weeklyOptions.meat_options.forEach(option => {
        const voteOption = createVoteOption(option, 'radio', 'meat');
        meatDiv.appendChild(voteOption);
    });

    // Load fish options (these are now always combinations)
    weeklyOptions.fish_options.forEach(option => {
        const voteOption = createVoteOption(option, 'radio', 'fish');
        fishDiv.appendChild(voteOption);
    });

    // Load vegetarian options (these can be individual meals or from combinations)
    weeklyOptions.vegetarian_options.forEach(option => {
        const voteOption = createVoteOption(option, 'checkbox', 'vegetarian');
        vegetarianDiv.appendChild(voteOption);
    });
}

// Helper function to find vegetarian counterpart for a meat/fish combo
function findVegetarianCounterpart(optionId) {
    if (!mealsDatabase || !mealsDatabase.meal_combinations) return null;
    
    const combo = mealsDatabase.meal_combinations.find(c => c.id === optionId);
    if (combo && combo.meals) {
        const vegMeal = combo.meals.find(m => m.category === 'vegetarian');
        return vegMeal;
    }
    return null;
}

// Helper function to check if an option is part of a combo
function isPartOfCombo(optionId) {
    if (!mealsDatabase || !mealsDatabase.meal_combinations) return false;
    return mealsDatabase.meal_combinations.some(c => c.id === optionId);
}

function createVoteOption(option, inputType, category) {
    const div = document.createElement('div');
    div.className = 'vote-option';
    div.dataset.optionId = option.id;
    div.dataset.optionName = option.name;
    div.dataset.category = category;

    const input = document.createElement('input');
    input.type = inputType;
    input.name = category;
    input.value = option.id;

    div.appendChild(input);
    const label = document.createElement('label');
    label.appendChild(document.createTextNode(formatMealNameForDisplay(option.name)));
    
    // For meat/fish options, they are always combos - show the vegetarian counterpart
    if ((category === 'meat' || category === 'fish') && isPartOfCombo(option.id)) {
        const vegCounterpart = findVegetarianCounterpart(option.id);
        if (vegCounterpart) {
            const counterpartSpan = document.createElement('span');
            counterpartSpan.className = 'counterpart-info';
            counterpartSpan.innerHTML = ` (includes vegetarian option: <strong>${vegCounterpart.name}</strong>)`;
            label.appendChild(counterpartSpan);
        }
    }
    
    div.appendChild(label);

    div.addEventListener('click', function() {
        if (inputType === 'radio') {
            // Clear other selections in this category
            document.querySelectorAll(`input[name="${category}"]`).forEach(radio => {
                radio.checked = false;
                radio.closest('.vote-option').classList.remove('selected');
            });
            input.checked = true;
            this.classList.add('selected');
        } else if (inputType === 'checkbox') {
            input.checked = !input.checked;
            this.classList.toggle('selected', input.checked);
        }
    });

    return div;
}

async function submitVote() {
    const guestName = document.getElementById('guestName').value.trim();
    
    if (!guestName) {
        showStatus('voteStatus', 'Please enter your name.', 'error');
        return;
    }

    // Check for duplicate names
    if (guestVotes.votes.some(vote => vote.guest_name === guestName)) {
        showStatus('voteStatus', 'A vote with this name already exists. Please use a different name.', 'error');
        return;
    }

    // Collect selected options
    const meatOption = document.querySelector('input[name="meat"]:checked');
    const fishOption = document.querySelector('input[name="fish"]:checked');
    const vegetarianOptions = Array.from(document.querySelectorAll('input[name="vegetarian"]:checked'));

    if (!meatOption) {
        showStatus('voteStatus', 'Please select one meat option.', 'error');
        return;
    }

    if (!fishOption) {
        showStatus('voteStatus', 'Please select one fish option.', 'error');
        return;
    }

    if (vegetarianOptions.length !== 2) {
        showStatus('voteStatus', 'Please select exactly two vegetarian options.', 'error');
        return;
    }

    // Check for duplicate vegetarian options
    const vegetarianValues = vegetarianOptions.map(input => input.value);
    const uniqueVegetarianValues = [...new Set(vegetarianValues)];
    if (uniqueVegetarianValues.length !== 2) {
        showStatus('voteStatus', 'Please select two different vegetarian options. You cannot select the same option twice.', 'error');
        return;
    }

    // Create vote object
    const vote = {
        guest_name: guestName,
        meat_option: meatOption.value,
        fish_option: fishOption.value,
        vegetarian_options: uniqueVegetarianValues,
        timestamp: new Date().toISOString()
    };

    // Add vote to collection
    guestVotes.votes.push(vote);
    guestVotes.last_updated = new Date().toISOString();
    
    await saveDataToStorage();
    showStatus('voteStatus', 'Vote submitted successfully!', 'success');
    updateSystemStatus();
    
    // Clear form
    document.getElementById('guestName').value = '';
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.checked = false;
        input.closest('.vote-option').classList.remove('selected');
    });
}

// Utility Functions
function formatMealNameForDisplay(name) {
    // Remove " Combo" from the end of meal combination names for display
    if (name && name.endsWith(' Combo')) {
        return name.slice(0, -6); // Remove " Combo" (6 characters)
    }
    return name;
}

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="${type}">${message}</div>`;
    element.style.display = 'block';
}

function updateSystemStatus() {
    document.getElementById('dbStatus').textContent = mealsDatabase ? 'Loaded' : 'Not loaded';
    document.getElementById('optionsStatus').textContent = 
        (weeklyOptions.meat_options.length > 0 || weeklyOptions.fish_options.length > 0 || weeklyOptions.vegetarian_options.length > 0) 
        ? 'Set' : 'Not set';
    document.getElementById('votesStatus').textContent = 
        guestVotes.votes.length > 0 ? `${guestVotes.votes.length} votes` : 'No votes';
    document.getElementById('planStatus').textContent = 
        mealPlan.generated_at ? 'Set (manual)' : 'Not set';
}

// Data persistence functions
async function saveDataToStorage() {
    try {
        // Save all data to server
        await Promise.all([
            saveMealsDatabase(),
            saveWeeklyOptions(), // weekly options
            saveGuestVotes(),
            saveMealPlan()
        ]);
    } catch (error) {
        console.error('Error saving data:', error);
        showStatus('uploadStatus', 'Error saving data to server', 'error');
    }
}

async function loadDataFromStorage() {
    try {
        // Load all data from server
        const [dbData, optionsData, votesData, planData] = await Promise.all([
            loadMealsDatabase(),
            loadWeeklyOptions(),
            loadGuestVotes(),
            loadMealPlan()
        ]);

        if (dbData) mealsDatabase = dbData;
        if (optionsData) weeklyOptions = optionsData;
        if (votesData) guestVotes = votesData;
        if (planData) mealPlan = planData;

        updateSystemStatus();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function loadExistingData() {
    // Load data from server on page load
    loadDataFromStorage();
}

// API functions
async function loadMealsDatabase() {
    try {
        const response = await fetch('/api/meals-database');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error loading meals database:', error);
    }
    return null;
}

async function saveMealsDatabase() {
    if (!mealsDatabase) return;
    try {
        const response = await fetch('/api/meals-database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealsDatabase)
        });
        if (!response.ok) {
            throw new Error('Failed to save meals database');
        }
    } catch (error) {
        console.error('Error saving meals database:', error);
        throw error;
    }
}

async function loadWeeklyOptions() {
    try {
        const response = await fetch('/api/weekly-options');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error loading weekly options:', error);
    }
    return null;
}

async function saveWeeklyOptions() {
    try {
        const response = await fetch('/api/weekly-options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(weeklyOptions)
        });
        if (!response.ok) {
            throw new Error('Failed to save weekly options');
        }
    } catch (error) {
        console.error('Error saving weekly options:', error);
        throw error;
    }
}

async function loadGuestVotes() {
    try {
        const response = await fetch('/api/guest-votes');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error loading guest votes:', error);
    }
    return null;
}

async function saveGuestVotes() {
    try {
        const response = await fetch('/api/guest-votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestVotes)
        });
        if (!response.ok) {
            throw new Error('Failed to save guest votes');
        }
    } catch (error) {
        console.error('Error saving guest votes:', error);
        throw error;
    }
}

async function loadMealPlan() {
    try {
        const response = await fetch('/api/meal-plan');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error loading meal plan:', error);
    }
    return null;
}

async function saveMealPlan() {
    try {
        const response = await fetch('/api/meal-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealPlan)
        });
        if (!response.ok) {
            throw new Error('Failed to save meal plan');
        }
    } catch (error) {
        console.error('Error saving meal plan:', error);
        throw error;
    }
}

