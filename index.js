var fs = require('fs')

var sudoku = require('sudoku');
 

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


function createGame(word) {
  // console.log(word)

  do {
    var puzzle = sudoku.makepuzzle()
    var solution = sudoku.solvepuzzle(puzzle)
    var difficulty = sudoku.ratepuzzle(puzzle, 4)
  } while(difficulty > 0)

//  console.log(solution)

  var map = {}  // key is digit, value is letter from the word
  for(var i=0; i<9; i++) {
    var digit = solution[9*4+i]
    var char = word[i].toUpperCase()
    map[digit] = char
    // console.log(digit + " = " + char)
  }

  for(var y=0; y<9; y++) {
    for(var x=0; x<9; x++) {
      var digit = puzzle[y*9+x]
      var char = map[digit] || "."
      process.stdout.write(char)
    }
    process.stdout.write("\n")
  }
  console.log("\n")
  /*
  for(var y=0; y<9; y++) {
    for(var x=0; x<9; x++) {
      process.stdout.write(""+solution[y*9+x])
    }
    process.stdout.write("\n")
  }
  */
}


async function main() {
  file = fs.readFileSync("wordlist.txt", 'utf8')
  words = file.split("\n")
  
//    console.log(file)
  
  var nine = words.filter(word => goodNine(word))
  
  nine.forEach(word => {
    createGame(word)
  })

  // console.log(nine.length + " 9 letter words")

}


main()

