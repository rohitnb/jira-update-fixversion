## JIRA Update Fix Version Action

### What does it do?

This action accepts an input via labels in a PR. The input must be of the type `jira-fixversion:<jira-accepted-fixversion>`. 
For example, 
- `jira-fixversion:v2.2` will add v2.2 as the fix version.

NOTE: If the fix version is not correct or valid, the action will error out.

### Inputs

#### `jira-issue`

**Required** The JIRA issue number in the format XYZ-123. Default `null`

#### `jira-token`

**Required** The JIRA token. To set this token - form the string `<jira-email-address>:<jira-api-token>` and Base64 encode it. For example `abc@xyz.com:7h1s1smyJIRAt0k3n`

#### `jira-domain`

**Required** The JIRA domain. Example: `https://<company>.atlassian.net`

### `prLabel`

**Required** A valid label with the prefix `jira-fixversion` 

### Outputs
`result` - True if update was successful.

### Example usage
```
uses: rohitnb/jira-update-fixversion@master
with:
  jira-issue: 'XYZ-123'
  jira-token: ${{secrets.JIRA_TOKEN}}
  jira-domain: ${{secrets.JIRA_URL}}
  prLabel: 'jira-worklog:2h'
```

### Demo workflow file for Pull Requests
```
name: Update JIRA Fix Version by using PR Labels
on: 
  pull_request:
    types: [labeled]
  

jobs:
  jira-update-fixversion:

    runs-on: ubuntu-latest
    if: |
      contains(github.event.label.name, 'jira-fixversion')
    steps:
    - name: What is the Label that is kicking off this workflow?
      run: echo "Label Selected ${{github.event.label.name}}"
    
    - name: Jira Login
      uses: atlassian/gajira-login@v2.0.0
      env:
        JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
        JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
        JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    
    - name: Find JIRA issue number from the PR Title
      id: pr-title-jira-issue
      uses: atlassian/gajira-find-issue-key@master
      with:
        string: ${{ github.event.pull_request.title }}
        from: ""
      
    - if: ${{ steps.pr-title-jira-issue.outputs.issue == ''}}
      name: JIRA Ticket not found
      run: exit 1
    
    - name: Update Fix version
      id: jira-update-fixversion
      uses: rohitnb/jira-update-fixversion@master
      with:
        jira-issue: ${{steps.pr-title-jira-issue.outputs.issue}}
        jira-token: ${{secrets.JIRA_TOKEN}}
        jira-domain: ${{ secrets.JIRA_BASE_URL }}
        prLabel: ${{github.event.label.name}}
 ```
