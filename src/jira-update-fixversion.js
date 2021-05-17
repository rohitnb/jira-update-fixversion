const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');


//INPUTS
const jiraIssue = core.getInput('jira-issue');
const jiraToken = core.getInput('jira-token'); 
const jiraDomain = core.getInput('jira-domain');
const prLabel = core.getInput('prLabel');
//END INPUTS

async function run(){

    const projectName = jiraIssue.split("-")[0];
    const label_fv = prLabel.split(":")[1];

    var fixVersionId ;
    var fixVersionName;
    var validFlag=0;

    //This is a function to get all the versions in a JIRA project via the /versions endpoint
    function getFixVersionDetails(callback){
        var config = {
        method: 'get',
        url: jiraDomain+'/rest/api/3/project/'+projectName+"/versions",
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Basic '+jiraToken, 
        }
        };

        axios(config)
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            console.log(error);
            core.setOutput("result",false);
            core.setFailed("Error while fetching valid fixVersions from JIRA");
        });
    }
    //This function updates the fix version of the JIRA issue provided it was valid
    function updateFixVersion(callback){
        var data = JSON.stringify(
            {"update":{
                "fixVersions":[{
                    "set":[{
                        "id":fixVersionId
                    }]
                }]
            }});

        var config = {
            method: 'put',
            url: jiraDomain+'/rest/api/3/issue/'+jiraIssue,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': 'Basic '+jiraToken, 
            },
            data: data
        };

        axios(config)
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            console.log(error);
            core.setOutput("result",false);
            core.setFailed("Error while updating fixVersion");
        });
    }
    //Getting the fix versions and searching for the fixVersion passed in the args of this action
    getFixVersionDetails(function(result){
        for(i=0;i<result.length;i++){
            if(result[i].name.toUpperCase() === label_fv.toUpperCase()){
                fixVersionId = result[i].id;
                fixVersionName = result[i].name;
                validFlag=1;
            }
        }
    });

    //Wait a few seconds to get all the fixversions and iterate
    setTimeout(()=>
    {      
        if(validFlag){
            updateFixVersion(function(result){
                core.setOutput("result",true);
            })
        }else{
            console.log("Invalid version. Set the action to failed here");
            core.setOutput("result",false);
            core.setFailed(label_fv+" is not a valid release version.");
        }
    },2000);
}
run();