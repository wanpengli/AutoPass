// create the report page
function checkResult(){
    chrome.tabs.create({url: chrome.extension.getURL("contents/report.html"), active:false}, function(tab){
        console.log("New tabs was crated!!!!");
    });
}
// create the report page
function buildMap(){
    chrome.tabs.create({url: chrome.extension.getURL("contents/report.html"), active:false}, function(tab){
        console.log("New tabs was crated!!!!");
    });
}
// export collected data
function exportData() {
    // body...
    var data = {};
    var urls = Object.keys(localStorage);
    for (var i = 0; i < urls.length; i++) {
        if (urls[i] === "status"){
            continue;
        }
        var value = localStorage.getItem(urls[i]);
        // preserve newlines, etc - use valid JSON
        // console.log(typeof(JSON.parse(value)));
        data[urls[i]] = JSON.parse(value);
    }
    chrome.downloads.download({
        url: "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)),
        filename: "data.json",
        conflictAction: "uniquify", // or "overwrite" / "prompt"
        saveAs: false, // true gives save-as dialogue
    }, function(downloadId) {
        console.log("Downloaded item with ID", downloadId);
    });
}

function clear(){
    localStorage.clear();
}
// document.getElementById("check-report").onclick = checkResult;

document.addEventListener('DOMContentLoaded', function () {
    var exp = document.getElementById("build-map");
    if (exp) {
        document.getElementById("build-map").onclick = buildMap;
    }
    document.getElementById("clear").onclick = exportData;
});


function getPPDs(user, password){
    var xmlhttp = new XMLHttpRequest();
    var searchURL = "http://www.autopasspg.co.uk/getppd/";

    data = 'username=fatma&password=8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
    xmlhttp.open("POST", searchURL);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onload = function (){
        console.log(xmlhttp.responseText);
    }
    xmlhttp.send(data);
}

