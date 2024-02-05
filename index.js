const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');


const fileInputPath = core.getInput('file-input');

checkIfFileExists(fileInputPath);

const failedTests = []

fs.readFile(fileInputPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    const tests = data.split("\n")

    tests.forEach(test => {    
      if (test.includes("FAILED")) {
        failedTests.push(getTestFailureMessage(test))
      }
    })
    if (failedTests.length > 0) {
        createAnnotations(failedTests);
    }
   
  })
  
   



function checkIfFileExists(file) {

    if (!fs.existsSync(file)) {
        core.setFailed(`File not found: ${fileInputPath}`);
        return;
    }
}

async function createAnnotations(errors) {
        
    
    let counter = 0 

    // loop through errors array and create annotations for each error
    errors.forEach(async error => {

    try {

        counter++

          const token = core.getInput('repo-token');
          const octokit = github.getOctokit(token);
          
            // call octokit to create a check with annoation details 
            const check = await octokit.rest.checks.create({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                name: 'proccesing-unit-test-runner',
                head_sha: github.context.sha,
                status: 'completed',
                conclusion: 'failure',
                output: {
                    title: 'proccesing-build-checker Report',
                    summary: 'proccesing-build-checker Failed', 
                    annotations: [
                        {
                            path: "./unitTests.pde",
                            start_line: 1,
                            end_line: 1,
                            annotation_level: 'failure',
                            message: error
                        
                        }
                    ]
                }
            });
        
            if (counter < 1) {
            core.setFailed(`Actions failed due to failed unit tests}`)
            }
            
        } catch (error) {
            core.setFailed(error.message);
        }
    })
    }

    function getTestFailureMessage(file) {

        const message = file.split("Test:")[1]
      
        return message;
      }
