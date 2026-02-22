// Admin App - Global state
let mealsDatabase = null;
let weeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
let guestVotes = { votes: [], last_updated: null };

// API base path for admin endpoints
const API_BASE = '/api/admin';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadExistingData();
    updateSystemStatus();
});

function initializeApp() {
    // Load existing data from server
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
    document.getElementById('resetSystem').addEventListener('click', resetSystem);

    // Restaurant vote results button
    const restaurantShowVoteResultsBtn = document.getElementById('restaurantShowVoteResults');
    if (restaurantShowVoteResultsBtn) {
        restaurantShowVoteResultsBtn.addEventListener('click', showRestaurantVoteResults);
    }

    // Restaurant interface
    document.getElementById('saveWeeklyOptions').addEventListener('click', saveWeeklyOptions);
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
            
            // Validate: each combination should have at least one vegetarian meal
            const warnings = [];
            if (data.meal_combinations && Array.isArray(data.meal_combinations)) {
                data.meal_combinations.forEach(combo => {
                    if (combo.meals && Array.isArray(combo.meals)) {
                        const hasVegetarian = combo.meals.some(m => m.category === 'vegetarian');
                        if (!hasVegetarian) {
                            warnings.push(`Combination "${combo.name}" lacks a vegetarian meal.`);
                        }
                    }
                });
            }
            
            mealsDatabase = data;
            await saveDataToStorage({ meals: true, weekly: true, votes: true });
            // Reload mealsDatabase from server to get data with server-generated IDs
            mealsDatabase = await loadMealsDatabase();
            
            if (warnings.length > 0) {
                showStatus('uploadStatus', 'Database uploaded with warnings: ' + warnings.join(' '), 'warning');
            } else {
                showStatus('uploadStatus', 'Database uploaded successfully!', 'success');
            }
            updateSystemStatus();
        } catch (error) {
            showStatus('uploadStatus', 'Error parsing JSON file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

async function resetSystem() {
    // Confirm with user
    if (!confirm('Are you sure you want to reset the system? This will delete all weekly options and guest votes. This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reset`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to reset system');
        }

        // Reset in-memory state
        weeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
        guestVotes = { votes: [], last_updated: null };

        // Update UI
        updateSystemStatus();
        
        // Check if database is empty and show appropriate message
        if (!mealsDatabase || 
            (!mealsDatabase.meals || mealsDatabase.meals.length === 0) && 
            (!mealsDatabase.meal_combinations || mealsDatabase.meal_combinations.length === 0)) {
            showStatus('resetStatus', 'System reset successfully. Warning: No meals exist in database.', 'warning');
        } else {
            showStatus('resetStatus', 'System reset successfully! All weekly options and votes have been deleted.', 'success');
        }
    } catch (error) {
        console.error('Error resetting system:', error);
        showStatus('resetStatus', 'Error resetting system: ' + error.message, 'error');
    }
}

// Vote counting and chart rendering
function calculateVoteCounts() {
    const meatCounts = {};
    const fishCounts = {};
    const vegetarianCounts = {};

    if (!guestVotes || !Array.isArray(guestVotes.votes)) {
        return { meatCounts, fishCounts, vegetarianCounts };
    }

    // Helper to extract ID from option (handles both object and string formats)
    const getMealId = (option) => option && (typeof option === 'object' ? option.id : option);

    guestVotes.votes.forEach(vote => {
        const meatId = getMealId(vote.meat_option);
        if (meatId) {
            meatCounts[meatId] = (meatCounts[meatId] || 0) + 1;
        }
        const fishId = getMealId(vote.fish_option);
        if (fishId) {
            fishCounts[fishId] = (fishCounts[fishId] || 0) + 1;
        }
        if (Array.isArray(vote.vegetarian_options)) {
            const uniqueVeg = [...new Set(vote.vegetarian_options.map(getMealId).filter(Boolean))];
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

function showRestaurantVoteResults() {
    if (!mealsDatabase) {
        showStatus('restaurantVoteResultsStatus', 'Please upload a meal database first.', 'error');
        return;
    }

    if (!weeklyOptions || weeklyOptions.meat_options.length === 0 ||
        weeklyOptions.fish_options.length === 0 ||
        weeklyOptions.vegetarian_options.length === 0) {
        showStatus('restaurantVoteResultsStatus', 'Please set weekly options first.', 'error');
        return;
    }

    if (!guestVotes || guestVotes.votes.length === 0) {
        showStatus('restaurantVoteResultsStatus', 'No votes have been cast yet.', 'info');
        // Clear charts
        renderChart('restaurantMeatChart', {}, 'meat');
        renderChart('restaurantFishChart', {}, 'fish');
        renderChart('restaurantVegetarianChart', {}, 'vegetarian');
        return;
    }

    const { meatCounts, fishCounts, vegetarianCounts } = calculateVoteCounts();
    renderChart('restaurantMeatChart', meatCounts, 'meat');
    renderChart('restaurantFishChart', fishCounts, 'fish');
    renderChart('restaurantVegetarianChart', vegetarianCounts, 'vegetarian');

    showStatus('restaurantVoteResultsStatus', 'Vote charts updated based on current votes.', 'success');
}

// Restaurant Interface Functions
function loadRestaurantInterface() {
    const stateMessageDiv = document.getElementById('restaurantStateMessage');
    
    if (!mealsDatabase || 
        (!mealsDatabase.meals || mealsDatabase.meals.length === 0) && 
        (!mealsDatabase.meal_combinations || mealsDatabase.meal_combinations.length === 0)) {
        // Show state message and hide selection UI
        if (stateMessageDiv) {
            stateMessageDiv.textContent = 'Please upload a meal database first.';
            stateMessageDiv.style.display = 'block';
            stateMessageDiv.className = 'state-message info';
        }
        return;
    }
    
    // Hide state message
    if (stateMessageDiv) {
        stateMessageDiv.style.display = 'none';
    }

    loadMealOptions();
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
    if (mealsDatabase.meals) {
        mealsDatabase.meals.forEach(meal => {
            if (meal.category === 'vegetarian') {
                const mealCard = createMealCard(meal);
                vegetarianDiv.appendChild(mealCard);
            }
        });
    }

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
    const newWeeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
    
    // Get all selected cards
    const selectedCards = document.querySelectorAll('.meal-card.selected');
    
    selectedCards.forEach(card => {
        const mealId = card.dataset.mealId;
        const mealName = card.dataset.mealName;
        const category = getCategoryFromCard(card);
        
        if (category && mealId && mealName) {
            const option = { id: mealId, name: mealName };
            newWeeklyOptions[`${category}_options`].push(option);
        }
    });
    
    // Validate minimum selections per spec 6.2
    const meatCount = newWeeklyOptions.meat_options.length;
    const fishCount = newWeeklyOptions.fish_options.length;
    const vegCount = newWeeklyOptions.vegetarian_options.length;
    
    const errors = [];
    if (meatCount < 2) {
        errors.push(`At least 2 meat combinations required (currently ${meatCount}).`);
    }
    if (fishCount < 2) {
        errors.push(`At least 2 fish combinations required (currently ${fishCount}).`);
    }
    if (vegCount < 4) {
        errors.push(`At least 4 vegetarian options required (currently ${vegCount}).`);
    }
    
    if (errors.length > 0) {
        showStatus('saveStatus', 'Validation failed: ' + errors.join(' '), 'error');
        return;
    }
    
    // Check if there are existing votes and warn about deletion
    if (guestVotes && guestVotes.votes && guestVotes.votes.length > 0) {
        if (!confirm(`Warning: Saving new weekly options will delete ${guestVotes.votes.length} existing guest vote(s). Do you want to continue?`)) {
            return;
        }
    }
    
    newWeeklyOptions.last_updated = new Date().toISOString();
    weeklyOptions = newWeeklyOptions;
    
    // Save weekly options (this will also delete votes on the server)
    await saveDataToStorage({ meals: false, weekly: true, votes: false });
    
    // Reset votes in memory after save (server deletes them)
    guestVotes = { votes: [], last_updated: null };
    
    showStatus('saveStatus', 'Weekly options saved successfully!', 'success');
    updateSystemStatus();
}

// Utility Functions
function formatMealNameForDisplay(name) {
    // Remove " Combo" from the end of meal combination names for display
    if (name && name.endsWith(' Combo')) {
        return name.slice(0, -6);
    }
    return name;
}

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="${type}">${message}</div>`;
        element.style.display = 'block';
    }
}

function updateSystemStatus() {
    const hasDatabase = mealsDatabase && 
        ((mealsDatabase.meals && mealsDatabase.meals.length > 0) || 
         (mealsDatabase.meal_combinations && mealsDatabase.meal_combinations.length > 0));
    
    document.getElementById('dbStatus').textContent = hasDatabase ? 'Loaded' : 'Empty';
    document.getElementById('optionsStatus').textContent = 
        (weeklyOptions.meat_options.length > 0 || weeklyOptions.fish_options.length > 0 || weeklyOptions.vegetarian_options.length > 0) 
        ? 'Set' : 'Not set';
    document.getElementById('votesStatus').textContent = 
        guestVotes.votes.length > 0 ? `${guestVotes.votes.length} votes` : 'No votes';
}

// Data persistence functions
async function saveDataToStorage(options = {}) {
    const {
        meals = true,
        weekly = true,
        votes = true
    } = options;

    try {
        // Save data sequentially to avoid SQLite locking when multiple writes happen.
        if (meals && mealsDatabase) {
            await saveMealsDatabase();
        }
        if (weekly) {
            await persistWeeklyOptions();
        }
        if (votes) {
            await saveGuestVotes();
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showStatus('uploadStatus', 'Error saving data to server', 'error');
    }
}

async function loadDataFromStorage() {
    try {
        // Load all data from server
        const [dbData, optionsData, votesData] = await Promise.all([
            loadMealsDatabase(),
            loadWeeklyOptions(),
            loadGuestVotes()
        ]);

        if (dbData) mealsDatabase = dbData;
        if (optionsData) weeklyOptions = optionsData;
        if (votesData) guestVotes = votesData;

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
        const response = await fetch(`${API_BASE}/meals-database`);
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
        const response = await fetch(`${API_BASE}/meals-database`, {
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
        const response = await fetch(`${API_BASE}/weekly-options`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error loading weekly options:', error);
    }
    return null;
}

async function persistWeeklyOptions() {
    try {
        const response = await fetch(`${API_BASE}/weekly-options`, {
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
        const response = await fetch(`${API_BASE}/guest-votes`);
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
        const response = await fetch(`${API_BASE}/guest-votes`, {
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
