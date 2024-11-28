const core = require('@actions/core');
const github = require('@actions/github');

// GITHUB_TOKEN = core.getInput('TOKEN')
const octokit = github.getOctokit(process.env.TOKEN)
const OWNER = 'dvalleit'
const REPO = 'create-action'

async function run(){

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
            htmlLink = '<a href="' + branchLink + '">' + branch.name + '</a>'

            // console.log(branchLink)
            // console.log(htmlLink)
            inputArray.push(htmlLink)

        }
    }

    // console.log(inputArray)
    const outputArrayString = inputArray.toString().replaceAll(",", " , ")
    // console.log(outputArrayString)

    const pullRequests = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner: OWNER,
        repo: REPO,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    console.log(pullRequests.data.length)
      
    
    await core.summary
        .addHeading('Test Results')
        // .addCodeBlock(generateTestResults(), "js")
        .addTable([
            [{data: 'Metric', header: true}, {data: 'Value', header: true}, {data: 'Status', header: true}],
            ['Amount of Branches', amountBranches, 'Pass ✅'],
            ['bar.js',  outputArrayString, 'Fail ❌'],
            ['test.js', amountBranches, 'Pass ✅']
        ])
        .addLink('View staging deployment!', 'https://github.com')
        .write()


}

run();

// Amount of people in group
// Who is in the group
// Who are approvers (per env)
// Who makes changes to CodeOwners
// Actions Versions v/s latest version
// Who approves promotion (per env)
// How many pipelines are successful
// Failing pipelines
// Cancelled pipelines
// Who created last tag
// Amount of vulnerabilities (code scan)
// Amount of branches
// Stale branches
// Stale PRs
// Branches 
// Alert of all the above