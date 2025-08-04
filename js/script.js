/*
 * Joshua Pendlebury
 * Assignment 3 - COMP1073
 * 2025-08-04
 */

//---------VARIABLES----------------------------

//API information
const apiURL = 'https://wordsapiv1.p.rapidapi.com/words/';
const apiKey = '6318468d40msh3a14004dcdaa38ap181f97jsnd10037ee9706';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': apiKey,
		'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
	}
};

//Defining html output elements
const correctLetters = document.getElementById("playerGuess");
const keyboard = document.getElementById("keyboard");
const lifeDisplay = document.getElementById("lives");
const definition = document.getElementById("definition");
const gameOutput = document.getElementById("victory");

//Defining input buttons (keyboard is created later)
const newGameBtn = document.getElementById("newGame");
const definitionBtn = document.getElementById("displayDef");

//All characters the player must guess (anything not here will be given to the player)
const guessChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

//Global vars to hold API request results
let answerWord;
let answerDef = "";

//Global vars to run the Hangman game
let guessString = "";
let playerLives = 6;
let guessableBlanks = 0;

let gameRunning = true;

//---------FUNCTIONS----------------------------

/**
 * Requests a random word from the WordsAPI
 */
async function requestRandomWord(){
    let cURL = `${apiURL}?random=true`;

    let outputJSON;
    await fetch(cURL, options)
        .then(response => {
            return response.json();
        })
        .then(json => {
            setGameVars(json);
        })
        .catch(function(err) {
            console.log(`Fetch Error: ${err}`);
        });
}

/**
 * Gets word and definition from the json returned by API request
 * @param {object} json 
 */
function setGameVars(json){
    console.log(json)
    answerWord = json.word.toUpperCase();
    if("results" in json){
        answerDef = json.results[0].definition;
    }
    else{
        answerDef = "No definition available";
    }
    
}

/**
 * Generates all the buttons for the keyboard
 * @returns - list of all key elements
 */
function assembleKeys(){
    for (let char of guessChars){
        let key = document.createElement("button");
        key.value = char;
        key.textContent = char;
        key.classList.add("key");
        keyboard.appendChild(key);
    }
    return document.querySelectorAll(".key");
}

/**
 * Reveals a character from the hidden word
 * @param {string} guessedChar A single character
 */
function revealChar(guessedChar){
    for(let i=0; i<answerWord.length; i++){
        if(guessedChar === answerWord[i].toUpperCase()){
            guessString = replaceAt(guessString, i, guessedChar);
        }
    }
    console.log(guessString);
    correctLetters.textContent = guessString;
}

/**
 * Displays the answer word's definition
 */
function displayDefinition(){
    definition.textContent = `Definition: ${answerDef}`;
}

/**
 * Replaces a character at an index of a string
 * @param {string} str The string you want to replace a character in
 * @param {int} index The index of the character you want to replace
 * @param {string} char The character you want to replace it with
 * @returns {string} Modified string
 */
function replaceAt(str, index, char){
    let outStr = "";
    for(let i=0; i<str.length; i++){
        if(i === index){
            outStr += char;
        }
        else{
            outStr += str[i];
        }
    }
    return outStr;
}

/**
 * Creates the string with Guessable characters replaced with underscores "_"
 */
function assembleBlankWord(){
    for(let char of answerWord){
        if(guessChars.includes(char.toUpperCase())){
            guessString += "_";
            guessableBlanks ++;
        }
        else{
            guessString += char;
        }
    }
    gameOutput.textContent = `Letters: ${guessableBlanks}`
}

/**
 * Sets up a new game of Hangman
 */
async function newGame(){
    //Queries the WordsAPI for a random word
    await requestRandomWord();
    
    console.log(answerWord);
    console.log(answerDef);

    //Resetting game variables
    playerLives = 6;
    guessString = "";
    guessableBlanks = 0;
    gameRunning = true;
    
    assembleBlankWord();
    
    //Resetting Html elements
    correctLetters.textContent = guessString;
    lifeDisplay.textContent = playerLives;
    definition.textContent = "";

    allKeys.forEach(function(key) {
        key.classList.remove("correct");
        key.classList.remove("incorrect");

        //Adding event listeners to all player guess keys with anonymous function to handle player turns (Button press)
        key.addEventListener("click", function eventHandler(e) {
            e.preventDefault();

            //If statement prevents action if the game is won or lost
            if(gameRunning){
                let guess = key.value;
                console.log(guess);

                if (answerWord.toUpperCase().includes(guess)){
                    key.classList.add("correct");
                    console.log("correct");
                    revealChar(guess);
                }
                else{
                    key.classList.add("incorrect");
                    console.log("incorrect");
                    playerLives --;
                    lifeDisplay.textContent = playerLives;
                }

                key.removeEventListener("click", eventHandler);
                key.addEventListener("click", (e) => e.preventDefault());
                if(playerLives <= 0){
                    console.log("Defeat");
                    gameOver();
                }
                else if(guessString === answerWord){
                    console.log("victory")
                    gameWon();
                }
            }
        });
    });
}

/**
 * Code ran when all the players lives have been used
 */
function gameOver(){
    displayDefinition();
    gameOutput.textContent = `You Lose! The word was ${answerWord}.` ;
    gameRunning = false;
}

/**
 * Code ran when the complete word has been guessed
 */
function gameWon(){
    //Disabling all keys
    allKeys.forEach(function(key) {
        key.addEventListener("click", (e) => e.preventDefault());
    });
    displayDefinition();
    gameOutput.textContent = "You Win!";
    gameRunning = false;
}

//---------STARTUP CODE-----------------------
//Creates all the players buttons and saves the list of all of them as a const
const allKeys = assembleKeys();
//Creates new game on site launch
newGame();

//---------EVENT HANDLERS---------------------
definitionBtn.addEventListener("click", (e) => {
    e.preventDefault();
    displayDefinition();
});
newGameBtn.addEventListener("click", (e) => {
    e.preventDefault();
    newGame();
})