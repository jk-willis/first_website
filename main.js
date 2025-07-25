const rowBeginningIndexes = [0,3,6];
const rowEndingIndexes = [2,5,8];
const boardSize = 9;
const boardSquareRoot = Math.sqrt(boardSize);
const context = {
    currentCellId: '',
    currentBoxIndex: '',
    currentCellIndex: '',
    currentPreventingCellId: '',
    possibleAnswers: ['1','2','3','4','5','6','7','8','9'],
    answerButtons: [
        {answer: '1', count: 3},
        {answer: '2', count: 5},
        {answer: '3', count: 4},
        {answer: '4', count: 4},
        {answer: '5', count: 4},
        {answer: '6', count: 1},
        {answer: '7', count: 1},
        {answer: '8', count: 3},
        {answer: '9', count: 4}
    ],
    writeInState: false,
    // Hard
    // board: [
    //     [{ answer: ''},{answer: '6'},{answer: '9'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: '8'},{answer: ''},{answer: '2'},{answer: ''},{answer: ''},{answer: '3'},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: '3'},{answer: ''},{answer: '5'},{answer: ''},{answer: '9'},{answer: ''},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: '8'},{answer: '3'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '1'}],
    //     [{ answer: ''},{answer: ''},{answer: ''},{answer: '6'},{answer: ''},{answer: '9'},{answer: ''},{answer: ''},{answer: ''}],
    //     [{ answer: '6'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '2'},{answer: '9'},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: ''},{answer: '7'},{answer: ''},{answer: '3'},{answer: ''},{answer: '5'},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: '7'},{answer: ''},{answer: ''},{answer: '8'},{answer: ''},{answer: '1'},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: '3'},{answer: '7'},{answer: ''}],
    // ],
    // Easy
    board: [
        [{ answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '9'},{answer: '2'},{answer: '8'},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '4'},{answer: '6'},{answer: ''},{answer: '1'}],
        [{ answer: '5'},{answer: '2'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''}],
        [{ answer: '3'},{answer: ''},{answer: ''},{answer: ''},{answer: '5'},{answer: ''},{answer: ''},{answer: '2'},{answer: '7'}],
        [{ answer: ''},{answer: '8'},{answer: ''},{answer: ''},{answer: '1'},{answer: ''},{answer: ''},{answer: '9'},{answer: ''}],
        [{ answer: '1'},{answer: '9'},{answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: '5'}],
        [{ answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '8'},{answer: '3'}],
        [{ answer: '9'},{answer: ''},{answer: '3'},{answer: '2'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: '2'},{answer: '3'},{answer: '5'},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
    ]
};

/**********************************************************************************************/
// Game Logic
const evaluateAnswer = userInput => {
    // Only accept valid numbers as input
    if (!context.possibleAnswers.includes(userInput)) return;

    if (context.writeInState) {
        if (context.board[context.currentBoxIndex][context.currentCellIndex].answer) return;
        updateWriteIn(`${context.currentCellId}~${userInput - 1}`, userInput)
        return;
    }

    // Ignore the same answer being passed-in
    if (context.board[context.currentBoxIndex][context.currentCellIndex].answer == userInput) return;

    // Highlight cells preventing userInput
    if (foundInCurrentBox(userInput) || foundHorizontally(userInput) || foundVertically(userInput)) return;

    updateBoard(userInput);

    removeHighlights();
}

const foundInCurrentBox = userInput => {
    if (!context.board[context.currentBoxIndex].some(cell => cell.answer === userInput)) return false;
    
    showPreventingCell(`${context.currentBoxIndex}~${context.board[context.currentBoxIndex].indexOf(context.board[context.currentBoxIndex].find(cell => cell.answer === userInput))}`);
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
    showPreventingCell(currentId);
    return true;
}

const findHorizontalIndexes = () => {
    context.horizontalIds = [];
    let startingBox = Math.floor(context.currentBoxIndex / boardSquareRoot) * boardSquareRoot;
    for (let i = 0; i < boardSquareRoot; i++) {
        let startingCell = Math.floor(context.currentCellIndex / boardSquareRoot) * boardSquareRoot;
        for (let j = 0; j < boardSquareRoot; j++) {
            if (`${startingBox}~${startingCell}` != context.currentCellId) context.horizontalIds.push(`${startingBox}~${startingCell}`);
            startingCell++;
        }
        startingBox++;
    }
}

const findVerticalIndexes = () => {
    context.vericalIds = [];
    let startingBox = context.currentBoxIndex % boardSquareRoot;
    for (let i = 0; i < boardSquareRoot; i++) {
        let startingCell = context.currentCellIndex % boardSquareRoot;
        for (let j = 0; j < boardSquareRoot; j++) {
            if (`${startingBox}~${startingCell}` != context.currentCellId) context.vericalIds.push(`${startingBox}~${startingCell}`);
            startingCell += boardSquareRoot;
        }
        startingBox += boardSquareRoot;
    }
}

const updateBoard = newValue => {
    document.getElementById(`${context.currentCellId}~answer`).innerHTML = newValue;
    context.board[context.currentBoxIndex][context.currentCellIndex].answer = newValue;
    clearWriteIns(newValue);
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

// FIXME -- Try to create a function for the clear as it's repeated 3 times
const clearWriteIns = (newValue) => {
    for (let i = 0; i < boardSize; i++) { 
        updateWriteIn(`${context.currentCellId}~${i}`, '');
        if (context.board[context.currentBoxIndex][i].writeIns && context.board[context.currentBoxIndex][i].writeIns[newValue - 1]) {
            document.getElementById(`${context.currentBoxIndex}~${i}~${newValue - 1}`).innerHTML = '';
            context.board[context.currentBoxIndex][i].writeIns[newValue - 1] = '';
        }
    };
    let cellIdArray = [];
    let writeInBoxIndex = ''
    let writeInCellIndex = '';
    context.horizontalIds.forEach(id => {
        cellIdArray = id.split("~");
        writeInBoxIndex = cellIdArray[0];
        writeInCellIndex = cellIdArray[1];
        if (context.board[writeInBoxIndex][writeInCellIndex].writeIns && context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1]) {
            document.getElementById(`${writeInBoxIndex}~${writeInCellIndex}~${newValue - 1}`).innerHTML = '';
            context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1] = '';
        }
    });
    context.vericalIds.forEach(id => {
        cellIdArray = id.split("~");
        writeInBoxIndex = cellIdArray[0];
        writeInCellIndex = cellIdArray[1];
        if (context.board[writeInBoxIndex][writeInCellIndex].writeIns && context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1]) {
            document.getElementById(`${writeInBoxIndex}~${writeInCellIndex}~${newValue - 1}`).innerHTML = '';
            context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1] = '';
        }
    });
}

const showPreventingCell = cellId => {
    context.currentPreventingCellId = cellId;
    document.getElementById(cellId).classList.add("preventingCell");
    document.getElementById(cellId).addEventListener("animationend", () => { document.getElementById(cellId).classList.remove("preventingCell") }); 
}

const removeHighlights =() => {
    document.getElementById(context.currentCellId).classList.remove('selected');
    document.querySelectorAll('.highlighted').forEach(element => element.classList.remove('highlighted'));
    context.currentCellId = '';
}

const highlightCell = cellId => {
    if (!document.getElementById(cellId).classList.contains('starter') && cellId != context.currentCellId) document.getElementById(cellId).classList.add('highlighted');
}
/**********************************************************************************************/

/*--------------------------------------------------------------------------------------------*/
// Buttons
const clickAnswerButton = answerButton => {
    document.querySelectorAll('.answer-button-selected').forEach(element => element.classList.remove('answer-button-selected'));
    let valueToHighlight = answerButton.id.split("~")[1];
    document.querySelectorAll('.starter').forEach(cell => {
        if (cell.innerHTML == valueToHighlight) cell.classList.add('answer-button-selected');
        //console.log(cell.innerHTML);
    });
    //FIXME -- highlight more than just starter cells as done above
    //document.querySelectorAll('.cell').forEach(cell => {
    //    cell.querySelectorAll('.cell-container').forEach(cellContainer => {
    //        cellContainer.querySelectorAll('.answer').forEach(answer => console.log(answer))
    //    });
    //});
}

const toggleWriteIn = writeInButton => {
    context.writeInState = !context.writeInState;
    // Button should show opposite option
    writeInButton.value = context.writeInState ? 'Answer' : 'Write-In';
}
/*--------------------------------------------------------------------------------------------*/

/*============================================================================================*/
//Board Creation

// Create Write-In arrays
context.board.forEach(box => {
    box.forEach(cell => { if (!cell.answer) cell.writeIns = Array.from({ length: boardSize }, () => '') })
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

// Logic for clicking on a cell
addEventListener("keydown",  (event) => { if (context.currentBoxIndex && context.currentCellIndex && event.key == 'Backspace') updateBoard('') });
addEventListener("keypress", (event) => { if (context.currentBoxIndex && context.currentCellIndex) evaluateAnswer(event.key) });

const selectCell = clickedCell => {
    const cellIdArray = clickedCell.id.split("~");
    context.currentBoxIndex = cellIdArray[0];
    context.currentCellIndex = cellIdArray[1];

    //Remove highlights by clicking on the same cell (not sure if I want to keep this functionality)
    if (context.currentCellId && clickedCell.id == context.currentCellId) {
        removeHighlights();
        return;
    }

    //Reset cell styles
    if (context.currentCellId && clickedCell.id != context.currentCellId) document.getElementById(context.currentCellId).classList.remove('selected');
    document.querySelectorAll('.highlighted').forEach(element => element.classList.remove('highlighted'));
    
    // Track current cell
    context.currentCellId = clickedCell.id;

    findHorizontalIndexes();
    findVerticalIndexes();

    clickedCell.classList.add('selected');
    context.horizontalIds.forEach(id => highlightCell(id));
    context.vericalIds.forEach(id => highlightCell(id));
    for (let i = 0; i < boardSize; i++) highlightCell(`${context.currentBoxIndex}~${i}`);
    
    //console.log(context);
}