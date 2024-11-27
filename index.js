const core = require('@actions/core');
const github = require('@actions/github');

// GITHUB_TOKEN = core.getInput('TOKEN')
const octokit = github.getOctokit(process.env.TOKEN)

async function run(){

    const request_branches = await octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner: 'dvalleit',
        repo: 'create-action',
        per_page: 1,
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    const link = request_branches.headers.link
// <https://api.github.com/repositories/895224690/branches?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/895224690/branches?per_page=1&page=3>; rel="last"
    console.log(link)

    // const re = /.*page=(.*)>; rel="last/i;
    const lastPattern = /(?<=<[\S]*&page=)([0-9]*)(?=>; rel="last")/i;
    const found = link.match(lastPattern);

    const amountBranches = found[0];
    console.log(amountBranches)
    // for await (const {data} of iterator) {
    //     console.log(data)
    // }

    
    await core.summary
        .addHeading('Test Results')
        .addCodeBlock(generateTestResults(), "js")
        .addTable([
            [{data: 'File', header: true}, {data: 'Result', header: true}],
            ['foo.js', 'Pass ✅'],
            ['bar.js', 'Fail ❌'],
            ['test.js', 'Pass ✅']
        ])
        .addLink('View staging deployment!', 'https://github.com')
        .write()


}

run();