const core = require('@actions/core');
const github = require('@actions/github');

// GITHUB_TOKEN = core.getInput('TOKEN')
const octokit = github.getOctokit(process.env.TOKEN)
const OWNER = 'dvalleit'
const REPO = 'create-action'

async function run(){

    // Get Branches Info
    const request_branches = await octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner: OWNER,
        repo: REPO,
        per_page: 1,
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    const link = request_branches.headers.link
    const lastPattern = /(?<=<[\S]*&page=)([0-9]*)(?=>; rel="last")/i;
    const found = link.match(lastPattern);
    const amountBranches = found[0];
    // console.log(amountBranches)

    // const listedBranches = await octokit.request('GET /repos/{owner}/{repo}/branches', {
    //     owner: 'dvalleit',
    //     repo: 'create-action',
    //     per_page: 100,
    //     headers: {
    //         'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // })
    // console.log(listedBranches.data)

    const inputArray = [];
    const currentDate = new Date();
    const staleDate = new Date(currentDate.setMonth(currentDate.getMonth() - 3))
    const staleDateMill = currentDate.setMonth(currentDate.getMonth() - 3);
    let htmlLink = ''


    const listedBranches = await octokit.paginate.iterator('GET /repos/{owner}/{repo}/branches', {
        owner: OWNER,
        repo: REPO,
        per_page: 100,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    
    for await (const {data} of listedBranches) {
        for (const branch of data) {
            const branchSpecs = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
                owner: OWNER,
                repo: REPO,
                branch: branch.name,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            const commitAuthor = branchSpecs.data.commit.commit.author.name
            const commitDate = new Date(branchSpecs.data.commit.commit.author.date)
            const commitDateMill = commitDate.getTime()

            if (commitDateMill > staleDateMill){
                const branchLink = "https://github.com/dvalleit/create-action/tree/"+branch.name
                htmlLink = '<a href="' + branchLink + '">' + branch.name + '(' + commitAuthor + ')</a>'
    
                inputArray.push(htmlLink)
            }

        }
    }

    const outputArrayString = inputArray.toString().replaceAll(",", " , ")

    // Get Pull Requests Info
    const pullRequests = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner: OWNER,
        repo: REPO,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    const openPullRequests = pullRequests.data.length
      
    // // Get teams info
    // const collaborators = await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
    //     owner: OWNER,
    //     repo: REPO,
    //     headers: {
    //       'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // })

    // console.log(collaborators)

    // Get teams
    // const associatedTeams = await octokit.request('GET /repos/{owner}/{repo}/teams', {
    //     owner: OWNER,
    //     repo: REPO,
    //     headers: {
    //       'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // })

    // console.log(associatedTeams)
    

    //Get CODEOWNERS
    const codeownersContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: OWNER,
        repo: REPO,
        path: '.github/CODEOWNERS',
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    const encryptedContent = codeownersContent.data.content
    const decryptedContent = atob(encryptedContent)

    // Get successful pipelines
    const pipelines = await octokit.paginate.iterator('GET /repos/{owner}/{repo}/actions/runs', {
        owner: OWNER,
        repo: REPO,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    // console.log(successfulPipelines.data.workflow_runs)
    for await (const {data} of pipelines) {
        for (const workflowRun of data) {
            console.log(workflowRun.status)
        }
    }

    // Summary
    await core.summary
        .addHeading('Test Results')
        // .addCodeBlock(generateTestResults(), "js")
        .addTable([
            [{data: 'Metric', header: true}, {data: 'Value', header: true}, {data: 'Status', header: true}],
            ['Amount of Branches', amountBranches, 'Pass ✅'],
            ['Stale Branches',  outputArrayString, 'Fail ❌'],
            ['Open Pull Requests', openPullRequests, 'Pass ✅'],
            ['CODEOWNERS', decryptedContent , 'Pass ✅'],
            ['Successful Pipelines', successfulPipelines , 'Fail ❌']

        ])
        .addLink('View staging deployment!', 'https://github.com')
        .write()


}


run();





// // Who are approvers (per env)// Who approves promotion (per env)




// await octokit.request('GET /repos/{owner}/{repo}/environments', {
//   owner: 'OWNER',
//   repo: 'REPO',
//   headers: {
//     'X-GitHub-Api-Version': '2022-11-28'
//   }



// // Who created last tag

// await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
//     owner: 'OWNER',
//     repo: 'REPO',
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })
// // Amount of vulnerabilities (code scan)
// await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
//     owner: 'OWNER',
//     repo: 'REPO',
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })
  

// })// Actions Versions v/s latest version
