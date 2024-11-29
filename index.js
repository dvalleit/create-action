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
        // console.log(data)
        for (const branch of data) {
            // console.log(branch.name)
            const branchSpecs = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
                owner: OWNER,
                repo: REPO,
                branch: branch.name,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            // console.log(branchSpecs.data.commit.commit.author.date)
            const commitAuthor = branchSpecs.data.commit.commit.author.name
            const commitDate = new Date(branchSpecs.data.commit.commit.author.date)
            const commitDateMill = commitDate.getTime()

            if (commitDateMill > staleDateMill){
                console.log("Stale branch: " + commitDate)
                
            }
            // console.log("Stale Date es:" + staleDate)
            // console.log("Stale Date en mill es:" + staleDateMill)
            // console.log("Commit Date es:" + commitDate)
            // console.log("Commit Date en mill es: " + commitDateMill)
            // console.log(Math.abs(currentDate - commitDate))
            const branchLink = "https://github.com/dvalleit/create-action/tree/"+branch.name
            // '<a href="https://google.com">google.com</a>'
            htmlLink = '<a href="' + branchLink + '">' + branch.name + '(' + commitAuthor + ')</a>'

            // console.log(branchLink)
            // console.log(htmlLink)
            inputArray.push(htmlLink)

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

    console.log(pullRequests)
    console.log("----------------------")
    const openPullRequests = pullRequests.data.length
    console.log(openPullRequests)
      



    
    // Summary
    await core.summary
        .addHeading('Test Results')
        // .addCodeBlock(generateTestResults(), "js")
        .addTable([
            [{data: 'Metric', header: true}, {data: 'Value', header: true}, {data: 'Status', header: true}],
            ['Amount of Branches', amountBranches, 'Pass ✅'],
            ['Stale Branches',  outputArrayString, 'Fail ❌'],
            ['Open Pull Requests', openPullRequests, 'Pass ✅']
        ])
        .addLink('View staging deployment!', 'https://github.com')
        .write()


}


run();

// // Amount of people in group // Who is in the group

// await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
//     owner: 'OWNER',
//     repo: 'REPO',
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })

//   await octokit.request('GET /repos/{owner}/{repo}/teams', {
//     owner: 'OWNER',
//     repo: 'REPO',
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })
// // Who are approvers (per env)// Who approves promotion (per env)

// await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
//     owner: 'OWNER',
//     repo: 'REPO',
//     path: 'PATH',
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })


// await octokit.request('GET /repos/{owner}/{repo}/environments', {
//   owner: 'OWNER',
//   repo: 'REPO',
//   headers: {
//     'X-GitHub-Api-Version': '2022-11-28'
//   }
// // How many pipelines are successful
// // Failing pipelines

// await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
//     owner: 'OWNER',
//     repo: 'REPO',
//     headers: {
//       'X-GitHub-Api-Version': '2022-11-28'
//     }
//   })
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
