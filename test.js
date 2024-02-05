const fs = require('fs');


const failedTests = [];


fs.readFile('./test.txt', 'utf8', (err, data) => {
  if (err) {

    
    console.error(err);
    return;
  }
  
  const tests = data.split("\n")

  tests.forEach(test => {    
    if (test.includes("FAILED")) {
      failedTests.push(getTestFailureMessage(test))
    }
  })  

  console.log(failedTests)
})

function getTestFailureMessage(file) {

  const message = file.split("Test:")[1]

  return message;
}