const core = require('@actions/core');
const github = require('@actions/github');

GITHUB_TOKEN = core.getInput('TOKEN')
// const octokit = core.getInput('TOKEN')
const octokit = github.getOctokit(GITHUB_TOKEN)
console.log("aloha")

async function run(){
    console.log("hola")
    const iterator = await octokit.paginate.iterator('GET /repos/{owner}/{repo}/branches', {
        owner: 'dvalleit',
        repo: 'create-action',
        per_page: 1,
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    });


    for await (const {data} of iterator) {
        console.log(data)
    }
    // console.log(iterator)
}
run();