const rowBeginningIndexes = [0,3,6];
const rowEndingIndexes = [2,5,8];
const size = 9;
const context = {
    currentCellId: '',
    currentBoxIndex: '',
    currentCellIndex: '',
    currentPreventingCellId: '',
    possibleAnswers: ['1','2','3','4','5','6','7','8','9'],
    writeInState: false,
    board: [
        [{ answer: ''},{answer: '6'},{answer: '9'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: '8'},{answer: ''},{answer: '2'},{answer: ''},{answer: ''},{answer: '3'},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: '3'},{answer: ''},{answer: '5'},{answer: ''},{answer: '9'},{answer: ''},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: '8'},{answer: '3'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '1'}],
        [{ answer: ''},{answer: ''},{answer: ''},{answer: '6'},{answer: ''},{answer: '9'},{answer: ''},{answer: ''},{answer: ''}],
        [{ answer: '6'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '2'},{answer: '9'},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: ''},{answer: '7'},{answer: ''},{answer: '3'},{answer: ''},{answer: '5'},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: '7'},{answer: ''},{answer: ''},{answer: '8'},{answer: ''},{answer: '1'},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: '3'},{answer: '7'},{answer: ''}],
    ]
};

/**********************************************************************************************/
// Game Logic
const evaluateAnswer = userInput => {
    // Only accept valid numbers as input
    if (!context.possibleAnswers.includes(userInput)) return;

    if (context.writeInState) {
        updateWriteIn(`${context.currentCellId}~${userInput - 1}`, userInput)
        return;
    }

    // Ignore the same answer being passed-in
    if (context.board[context.currentBoxIndex][context.currentCellIndex].answer == userInput) return;

    // Highlight cells preventing userInput
    if (foundInCurrentBox(userInput) || foundHorizontally(userInput) || foundVertically(userInput)) return;

    updateBoard(userInput);
}

const foundInCurrentBox = userInput => {
    if (!context.board[context.currentBoxIndex].some(cell => cell.answer === userInput)) return false;
    
    highlightCell(`${context.currentBoxIndex}~${context.board[context.currentBoxIndex].indexOf(context.board[context.currentBoxIndex].find(cell => cell.answer === userInput))}`);
    return true;
}

const foundHorizontally = userInput => {
    let found = false;
    context.horizontalIds.forEach(id => {
        if (checkIds(id, userInput)) {
            found = true;
            return;
        }
    } );
    return found;
}

const foundVertically = userInput => {
    let found = false;
    context.vericalIds.forEach(id => {
        if (checkIds(id, userInput)) {
            found = true;
            return;
        }
    } );
    return found;
}

const checkIds = (currentId, userInput) => {
    let cellIdArray = currentId.split("~");
    let boxToCheck = cellIdArray[0];
    let cellToCheck = cellIdArray[1];
    if (context.board[boxToCheck][cellToCheck].answer != userInput) return false;
    highlightCell(currentId);
    return true;
}

const findHorizontalIndexes = () => {
    context.horizontalIds = [];
    let startingBox = Math.floor(context.currentBoxIndex / 3) * 3;
    for (let i = 0; i < 3; i++) {
        let startingCell = Math.floor(context.currentCellIndex / 3) * 3;
        for (let j = 0; j < 3; j++) {
            if (`${startingBox}~${startingCell}` != context.currentCellId) context.horizontalIds.push(`${startingBox}~${startingCell}`);
            startingCell++;
        }
        startingBox++;
    }
}

const findVerticalIndexes = () => {
    context.vericalIds = [];
    let startingBox = context.currentBoxIndex % 3;
    for (let i = 0; i < 3; i++) {
        let startingCell = context.currentCellIndex % 3;
        for (let j = 0; j < 3; j++) {
            if (`${startingBox}~${startingCell}` != context.currentCellId) context.vericalIds.push(`${startingBox}~${startingCell}`);
            startingCell += 3;
        }
        startingBox += 3;
    }
}

const updateBoard = newValue => {
    document.getElementById(`${context.currentCellId}~answer`).innerHTML = newValue;
    context.board[context.currentBoxIndex][context.currentCellIndex].answer = newValue;
    for (let i = 0; i < size; i++) { updateWriteIn(`${context.currentCellId}~${i}`, '') };
}

const updateWriteIn = (idToUpdate, userInput) => {
    if (!context.board[context.currentBoxIndex][context.currentCellIndex].writeIns[userInput - 1]) {
        document.getElementById(idToUpdate).innerHTML = userInput;
        context.board[context.currentBoxIndex][context.currentCellIndex].writeIns[userInput - 1] = userInput;
    }
    else {
        document.getElementById(idToUpdate).innerHTML = '';
        context.board[context.currentBoxIndex][context.currentCellIndex].writeIns[userInput - 1] = '';
    }
}

const highlightCell = cellId => {
    context.currentPreventingCellId = cellId;
    document.getElementById(cellId).classList.add("preventingCell");
    document.getElementById(cellId).addEventListener("animationend", () => { document.getElementById(cellId).classList.remove("preventingCell") }); 
}
/**********************************************************************************************/

/*--------------------------------------------------------------------------------------------*/
// Buttons
const toggleWriteIn = writeInButton => {
    context.writeInState = !context.writeInState;
    if (context.writeInState) {
        writeInButton.value = 'Answer';
    }
    else {
        writeInButton.value = 'Write-In';
    }
}
/*--------------------------------------------------------------------------------------------*/

/*============================================================================================*/
//Board Creation

// Create Write-In arrays
context.board.forEach(box => {
    box.forEach(cell => { if (!cell.answer) cell.writeIns = Array.from({ length: 9 }, () => '') })
});
/*============================================================================================*/

const templateElement = document.getElementById("templateHB");
const templateSource = templateElement.innerHTML;
const template = Handlebars.compile(templateSource);

// *********************************************************************************************************
// Handlebar Helpers
Handlebars.registerHelper('beginRow'      ,   function(index) { return rowBeginningIndexes.includes(index) } ); // Returns TRUE if starting a row
Handlebars.registerHelper('endRow'        ,   function(index) { return rowEndingIndexes.includes(index)    } ); // Returns TRUE if ending a row
Handlebars.registerHelper('startingValue' ,   function(value) { return value                               } ); // Returns TRUE if value is populated at the start
// *********************************************************************************************************
const compiledHtml = template(context);
document.getElementById("gameArea").innerHTML = compiledHtml;

//createOrRefreshBoard();

// Logic for clicking on a cell
const elements = document.querySelectorAll('.cell');
addEventListener("keydown",  (event) => { if (context.currentBoxIndex && context.currentCellIndex && event.key == 'Backspace') updateBoard('') });
addEventListener("keypress", (event) => { if (context.currentBoxIndex && context.currentCellIndex) evaluateAnswer(event.key) });

const selectCell = clickedCell => {
    const cellIdArray = clickedCell.id.split("~");
    context.currentBoxIndex = cellIdArray[0];
    context.currentCellIndex = cellIdArray[1];

    //Reset cell styles
    if (context.currentCellId && clickedCell.id != context.currentCellId) document.getElementById(context.currentCellId).classList.remove('highlighted');
    
    // Track current cell
    context.currentCellId = clickedCell.id;

    //Testing
    //console.log(clickedCell.childNodes);

    findHorizontalIndexes();
    findVerticalIndexes();

    clickedCell.classList.add('highlighted');
    
    //console.log(context);
}