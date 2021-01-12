var fs = require('fs')

var sudoku = require('sudoku')
var words = []
var wordsAssoc = {} // key is word value is something

function goodNine(word) {
  if (word.length != 9) return false

  var chars = {}  // key is char, value is true or undefined
  for(var i=0; i<9; i++) {
    var c = word[i]
    if (c == '-') return false
    if (typeof(chars[c]) != "undefined") return false
    chars[c] = true
  }

  return true
}

function calculateRowScore(row, map) {
  var combinations = [
    [{from:0, length:9}],

    [{from:0, length:8}],
    [{from:1, length:8}],

    [{from:0, length:7}],
    [{from:1, length:7}],
    [{from:2, length:7}],

    [{from:0, length:6}, {from:6, length:3}],
    [{from:1, length:6}],
    [{from:2, length:6}],
    [{from:3, length:6}, {from:0, length:3}],

    [{from:0, length:5}, {from:5, length:4}], // -----/----
    [{from:0, length:5}, {from:5, length:3}], // -----/---.
    [{from:0, length:5}, {from:6, length:3}], // -----/.---
    [{from:1, length:5}, {from:6, length:3}], // .-----/---
    [{from:2, length:5}],                     // ..-----..
    [{from:3, length:5}, {from:0, length:3}], // ---/-----.
    [{from:4, length:5}, {from:0, length:3}], // ---/.-----
    [{from:4, length:5}, {from:1, length:3}], // .---/-----
    [{from:4, length:5}, {from:0, length:4}], // ----/-----

    [{from:0, length:4}, {from:4, length:4}], // ----/----.
    [{from:0, length:4}, {from:5, length:4}], // ----/.----
    [{from:0, length:4}, {from:4, length:3}], // ----/---..
    [{from:0, length:4}, {from:5, length:3}], // ----/.---.
    [{from:0, length:4}, {from:6, length:3}], // ----/..---
    [{from:1, length:4}, {from:5, length:4}], // .----/----
    [{from:1, length:4}, {from:5, length:3}], // .----/---.
    [{from:1, length:4}, {from:6, length:3}], // .----/.---

    [{from:0, length:3}, {from:3, length:3}, {from:6, length:3}], // ---/---/---
    [{from:1, length:3}, {from:4, length:3}], // .---/---..
    [{from:1, length:3}, {from:5, length:3}], // .---/.---.
    [{from:1, length:3}, {from:6, length:3}], // .---/..---
    [{from:2, length:3}, {from:5, length:3}], // ..---/---.
    [{from:2, length:3}, {from:6, length:3}], // ..---/.---

  ]


  var line = ""
  for(var i=0; i<9; i++) {
    var digit = row[i]
    var char = map[digit]
    line += char
  }

  var bestCombinationScore = 0
  var bestCombination = null
  combinations.forEach(spots => {
    var thisScore = 0
    var usedSpots = []
    spots.forEach(spot => {
      var lettersAtSpot = line.substring(spot.from, spot.from + spot.length)
      if (wordsAssoc[lettersAtSpot]) {
        thisScore += spot.length
        usedSpots.push(spot)
      }
    })
    if (thisScore > bestCombinationScore) {
      bestCombinationScore = thisScore
      bestCombination = usedSpots
    }
  })

  return {score:bestCombinationScore, spots:bestCombination}
}


function calculateScore(puzzle, map) {
  var score = 0
  var spots = []

  for(var i=0; i<9; i++) {
    var row = puzzle.slice(i*9, (i+1)*9)
    var rowScore = calculateRowScore(row, map)
    score += rowScore.score
    spots[i] = rowScore.spots
  }

  return {score, spots}
}


function getMap(numbers, word) {
  var map = {}  // key is digit, value is letter from the word
  for(var i=0; i<9; i++) {
    var digit = numbers[i]
    var char = word[i]
    map[digit] = char
  }
  return map
}


function createGame(word) {
  var bestPuzzle = null
  var bestPuzzleScore = 0
  var bestSolution = null
  var bestSpots = null
  var bestMap = null

  for(var i=0; i<100; i++) {

    do {
      var puzzle = sudoku.makepuzzle()
      var solution = sudoku.solvepuzzle(puzzle)
      var difficulty = sudoku.ratepuzzle(puzzle, 4)
    } while(difficulty > 0)

    for(var j=0; j<9; j++) {
      var map = getMap(solution.slice(9*j, 9*(j+1)), word)
      var scoreResult = calculateScore(solution, map)
      var thisScore = scoreResult.score
      if (thisScore > bestPuzzleScore) {
        bestPuzzle = puzzle
        bestSolution = solution
        bestPuzzleScore = thisScore
        bestSpots = scoreResult.spots
        bestMap = map
      }
    }
  }

  return {score:bestPuzzleScore, puzzle:bestPuzzle, map:bestMap, solution:bestSolution, spots:bestSpots}

}


function printPuzzle(puzzle, map, spots) {
  for(var y=0; y<9; y++) {
    for(var x=0; x<9; x++) {
      var rowSpots = spots == null ? null : spots[y]
      if (rowSpots != null) {
        rowSpots.forEach(s => {
          if (s.from == x) process.stdout.write("[")
        })
      }

      var digit = puzzle[y*9+x]
      var char = map[digit] || "."
      process.stdout.write(char)

      if (rowSpots != null) {
        rowSpots.forEach(s => {
          if (s.from + s.length == x+1) process.stdout.write("]")
        })
      }

    }
    process.stdout.write("\n")
  }

  console.log("\n")

}

async function main() {
  file = fs.readFileSync("wordlist.txt", 'utf8')
  words = file.split("\n")

  for(var i=0; i<words.length; i++) {
    words[i] = words[i].toUpperCase()
    wordsAssoc[words[i]] = true
  }
  
  var nine = words.filter(word => goodNine(word))
  
  nine.forEach(word => {
    var game = createGame(word)

    printPuzzle(game.solution, game.map, game.spots)
    printPuzzle(game.puzzle, game.map)
  
    console.log("Best score for " + word + " is " + game.score + "\n")
  })
}


main()

