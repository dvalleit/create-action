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
    const link = request.headers.link
// <https://api.github.com/repositories/895224690/branches?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/895224690/branches?per_page=1&page=3>; rel="last"
    console.log(link)

    const re = /.*page=(.*)>; rel="last/i;
    const found = str.match(re);

    console.log(found); 

    // for await (const {data} of iterator) {
    //     console.log(data)
    // }
}
run();