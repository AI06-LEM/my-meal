// Guest App - Global state
let mealsDatabase = null;
let weeklyOptions = { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
let existingVotes = [];

// API base path for guest endpoints
const API_BASE = '/api/guest';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    await loadDataFromServer();
    setupEventListeners();
    loadGuestInterface();
}

function setupEventListeners() {
    document.getElementById('submitVote').addEventListener('click', submitVote);
}

async function loadDataFromServer() {
    try {
        // Load weekly options and meals database for display
        const [optionsData, mealsData, votesData] = await Promise.all([
            fetchWeeklyOptions(),
            fetchMealsDatabase(),
            fetchExistingVotes()
        ]);

        if (optionsData) weeklyOptions = optionsData;
        if (mealsData) mealsDatabase = mealsData;
        if (votesData && votesData.votes) existingVotes = votesData.votes;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function fetchWeeklyOptions() {
    try {
        const response = await fetch(`${API_BASE}/weekly-options`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching weekly options:', error);
    }
    return null;
}

async function fetchMealsDatabase() {
    try {
        const response = await fetch(`${API_BASE}/meals`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching meals database:', error);
    }
    return null;
}

async function fetchExistingVotes() {
    try {
        const response = await fetch(`${API_BASE}/votes`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching existing votes:', error);
    }
    return null;
}

function loadGuestInterface() {
    const stateMessageDiv = document.getElementById('guestStateMessage');
    const votingSection = document.getElementById('votingSection');
    
    const hasDatabase = mealsDatabase && 
        ((mealsDatabase.meals && mealsDatabase.meals.length > 0) || 
         (mealsDatabase.meal_combinations && mealsDatabase.meal_combinations.length > 0));
    
    const hasOptions = weeklyOptions && 
        weeklyOptions.meat_options && weeklyOptions.meat_options.length > 0 &&
        weeklyOptions.fish_options && weeklyOptions.fish_options.length > 0 &&
        weeklyOptions.vegetarian_options && weeklyOptions.vegetarian_options.length > 0;
    
    if (!hasDatabase || !hasOptions) {
        // Show state message and hide voting section
        if (stateMessageDiv) {
            stateMessageDiv.textContent = 'Voting is not yet available. Please wait for restaurant to select options.';
            stateMessageDiv.style.display = 'block';
            stateMessageDiv.className = 'state-message info';
        }
        if (votingSection) {
            votingSection.style.display = 'none';
        }
        return;
    }
    
    // Hide state message and show voting section
    if (stateMessageDiv) {
        stateMessageDiv.style.display = 'none';
    }
    if (votingSection) {
        votingSection.style.display = 'block';
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

// Helper function to get all meals in a combo
function getComboMeals(optionId) {
    if (!mealsDatabase || !mealsDatabase.meal_combinations) return null;
    
    const combo = mealsDatabase.meal_combinations.find(c => c.id === optionId);
    if (combo && combo.meals) {
        return combo.meals;
    }
    return null;
}

function formatMealNameForDisplay(name) {
    // Remove " Combo" from the end of meal combination names for display
    if (name && name.endsWith(' Combo')) {
        return name.slice(0, -6);
    }
    return name;
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
            counterpartSpan.innerHTML = `(includes vegetarian option: <strong>${vegCounterpart.name}</strong>)`;
            label.appendChild(counterpartSpan);
        }
    }
    
    // For vegetarian options that are combos, show what they include
    if (category === 'vegetarian' && isPartOfCombo(option.id)) {
        const comboMeals = getComboMeals(option.id);
        if (comboMeals && comboMeals.length > 0) {
            const includesSpan = document.createElement('span');
            includesSpan.className = 'counterpart-info';
            const mealNames = comboMeals.map(m => formatMealNameForDisplay(m.name)).join(' + ');
            includesSpan.innerHTML = `(includes: <strong>${mealNames}</strong>)`;
            label.appendChild(includesSpan);
        }
    }
    
    div.appendChild(label);

    div.addEventListener('click', function(e) {
        // Don't toggle if clicking directly on the input
        if (e.target === input) return;
        
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

    // Also handle direct input clicks
    input.addEventListener('change', function() {
        if (inputType === 'radio') {
            document.querySelectorAll(`input[name="${category}"]`).forEach(radio => {
                radio.closest('.vote-option').classList.remove('selected');
            });
            div.classList.add('selected');
        } else {
            div.classList.toggle('selected', this.checked);
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
    if (existingVotes.some(vote => vote.guest_name === guestName)) {
        showStatus('voteStatus', 'A vote with this name already exists. Please use a different name.', 'error');
        return;
    }

    // Collect selected options
    const meatOptionInput = document.querySelector('input[name="meat"]:checked');
    const fishOptionInput = document.querySelector('input[name="fish"]:checked');
    const vegetarianOptionsInputs = Array.from(document.querySelectorAll('input[name="vegetarian"]:checked'));

    if (!meatOptionInput) {
        showStatus('voteStatus', 'Please select one meat option.', 'error');
        return;
    }

    if (!fishOptionInput) {
        showStatus('voteStatus', 'Please select one fish option.', 'error');
        return;
    }

    if (vegetarianOptionsInputs.length !== 2) {
        showStatus('voteStatus', 'Please select exactly two vegetarian options.', 'error');
        return;
    }

    // Check for duplicate vegetarian options
    const vegetarianValues = vegetarianOptionsInputs.map(input => input.value);
    const uniqueVegetarianValues = [...new Set(vegetarianValues)];
    if (uniqueVegetarianValues.length !== 2) {
        showStatus('voteStatus', 'Please select two different vegetarian options. You cannot select the same option twice.', 'error');
        return;
    }

    const optionFromInput = (input) => {
        if (!input) return null;
        const optionDiv = input.closest('.vote-option');
        if (!optionDiv) return null;
        return {
            id: optionDiv.dataset.optionId,
            name: optionDiv.dataset.optionName
        };
    };

    // Create vote object
    const vote = {
        guest_name: guestName,
        meat_option: optionFromInput(meatOptionInput),
        fish_option: optionFromInput(fishOptionInput),
        vegetarian_options: vegetarianOptionsInputs.map(optionFromInput),
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_BASE}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vote)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit vote');
        }

        // Add vote to local list to prevent duplicate submissions
        existingVotes.push(vote);

        showStatus('voteStatus', 'Vote submitted successfully! Thank you for voting.', 'success');
        
        // Clear form
        document.getElementById('guestName').value = '';
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
            const optionDiv = input.closest('.vote-option');
            if (optionDiv) {
                optionDiv.classList.remove('selected');
            }
        });
    } catch (error) {
        console.error('Error submitting vote:', error);
        showStatus('voteStatus', 'Error submitting vote: ' + error.message, 'error');
    }
}

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="${type}">${message}</div>`;
        element.style.display = 'block';
    }
}
