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
    document.getElementById('generatePlan').addEventListener('click', generateMealPlan);

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

async function generateMealPlan() {
    if (!mealsDatabase) {
        showStatus('mealPlanResult', 'Please upload a meal database first.', 'error');
        return;
    }

    if (weeklyOptions.meat_options.length === 0 || 
        weeklyOptions.fish_options.length === 0 || 
        weeklyOptions.vegetarian_options.length === 0) {
        showStatus('mealPlanResult', 'Please set weekly options first.', 'error');
        return;
    }

    if (guestVotes.votes.length === 0) {
        showStatus('mealPlanResult', 'No votes have been cast yet.', 'error');
        return;
    }

    // Count votes for each option
    const voteCounts = {};
    
    guestVotes.votes.forEach(vote => {
        // Count meat votes
        if (vote.meat_option) {
            voteCounts[vote.meat_option] = (voteCounts[vote.meat_option] || 0) + 1;
        }
        
        // Count fish votes
        if (vote.fish_option) {
            voteCounts[vote.fish_option] = (voteCounts[vote.fish_option] || 0) + 1;
        }
        
        // Count vegetarian votes
        vote.vegetarian_options.forEach(option => {
            voteCounts[option] = (voteCounts[option] || 0) + 1;
        });
    });

    // Find most popular options for each category (by option.id)
    const selectedMeat = findMostPopular(weeklyOptions.meat_options, voteCounts);
    const selectedFish = findMostPopular(weeklyOptions.fish_options, voteCounts);
    const selectedVegetarian = findMostPopular(weeklyOptions.vegetarian_options, voteCounts, 2);

    // Ensure no duplicates
    const allSelected = [selectedMeat.id, selectedFish.id, ...selectedVegetarian.map(o => o.id)];
    const uniqueSelected = [...new Set(allSelected)];
    
    if (uniqueSelected.length < 4) {
        showStatus('mealPlanResult', 'Not enough unique options selected. Please ensure variety in weekly options.', 'error');
        return;
    }

    // Generate meal plan
    mealPlan = {
        monday: selectedMeat.name,
        tuesday: selectedFish.name,
        wednesday: selectedVegetarian[0].name,
        thursday: selectedVegetarian[1].name,
        friday: null, // Leftovers day
        generated_at: new Date().toISOString()
    };

    await saveDataToStorage();
    displayMealPlan();
    updateSystemStatus();
    showStatus('mealPlanResult', 'Meal plan generated successfully!', 'success');
}

function findMostPopular(options, voteCounts, count = 1) {
    const sorted = options
        .map(option => ({ option, votes: voteCounts[option.id] || 0 }))
        .sort((a, b) => b.votes - a.votes);
    
    if (count === 1) {
        return sorted[0].option;
    } else {
        return sorted.slice(0, count).map(item => item.option);
    }
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
                    <span class="meal-name">${meal}</span>
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
}

function loadMealOptions() {
    const meatDiv = document.getElementById('meatOptions');
    const fishDiv = document.getElementById('fishOptions');
    const vegetarianDiv = document.getElementById('vegetarianOptions');

    // Clear existing options
    meatDiv.innerHTML = '';
    fishDiv.innerHTML = '';
    vegetarianDiv.innerHTML = '';

    // Load individual meals
    mealsDatabase.meals.forEach(meal => {
        const mealCard = createMealCard(meal);
        if (meal.category === 'meat') {
            meatDiv.appendChild(mealCard);
        } else if (meal.category === 'fish') {
            fishDiv.appendChild(mealCard);
        } else if (meal.category === 'vegetarian') {
            vegetarianDiv.appendChild(mealCard);
        }
    });

    // Load meal combinations
    if (mealsDatabase.meal_combinations) {
        mealsDatabase.meal_combinations.forEach(combo => {
            const comboCard = createMealCard(combo, true);
            // Determine category based on combo contents
            const hasMeat = combo.meals.some(meal => meal.category === 'meat');
            const hasFish = combo.meals.some(meal => meal.category === 'fish');
            const hasVegetarian = combo.meals.some(meal => meal.category === 'vegetarian');
            
            if (hasMeat) {
                meatDiv.appendChild(comboCard);
            } else if (hasFish) {
                fishDiv.appendChild(comboCard);
            } else if (hasVegetarian) {
                vegetarianDiv.appendChild(comboCard);
            }
        });
    }
}

function createMealCard(meal, isCombo = false) {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.dataset.mealId = meal.id;
    card.dataset.mealName = meal.name;
    
    let dietaryInfo = '';
    if (meal.dietary_info && meal.dietary_info.length > 0) {
        dietaryInfo = `<p class="dietary-info">Contains: ${meal.dietary_info.join(', ')}</p>`;
    }
    
    let comboInfo = '';
    if (isCombo && meal.meals) {
        comboInfo = `<p class="dietary-info">Combo: ${meal.meals.map(m => m.name).join(' / ')}</p>`;
    }

    card.innerHTML = `
        <div class="checkbox"></div>
        <h5>${meal.name}</h5>
        ${comboInfo}
        ${dietaryInfo}
        <p>Vegetarian: ${meal.vegetarian ? 'Yes' : 'No'}</p>
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
    } else {
        card.classList.add('selected');
        addToWeeklyOptions(card.dataset.mealId, card.dataset.mealName, category);
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

    // Load meat options
    weeklyOptions.meat_options.forEach(option => {
        const voteOption = createVoteOption(option, 'radio', 'meat');
        meatDiv.appendChild(voteOption);
    });

    // Load fish options
    weeklyOptions.fish_options.forEach(option => {
        const voteOption = createVoteOption(option, 'radio', 'fish');
        fishDiv.appendChild(voteOption);
    });

    // Load vegetarian options
    weeklyOptions.vegetarian_options.forEach(option => {
        const voteOption = createVoteOption(option, 'checkbox', 'vegetarian');
        vegetarianDiv.appendChild(voteOption);
    });
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
    div.appendChild(document.createTextNode(option.name));

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

    // Create vote object
    const vote = {
        guest_name: guestName,
        meat_option: meatOption.value,
        fish_option: fishOption.value,
        vegetarian_options: vegetarianOptions.map(input => input.value),
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
        mealPlan.generated_at ? 'Generated' : 'Not generated';
}

// Data persistence functions
async function saveDataToStorage() {
    try {
        // Save all data to server
        await Promise.all([
            saveMealsDatabase(),
            saveWeeklyOptions(),
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

