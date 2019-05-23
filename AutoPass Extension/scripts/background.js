/**
 * set up a user to test function
 *
 */

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.log(request);
    var masterPassword = localStorage.getItem('masterPassword');
    if(!masterPassword){
        console.log(masterPassword)
        alert("Please log in to AutoPass!");
        return;
    }
    sendResponse({"message": "I have received the login form!", "from": "background_page"});

    var website = new URL(request.documentURL);
    var domain = extractDomain(website.host);
    localStorage.setItem('cached_domain', website.protocol + "//" + website.host);
    var ppds = JSON.parse(localStorage.getItem(domain));
    var password = localStorage.getItem("user_session_pwd");
    var username = JSON.parse(localStorage.getItem('user')).username;
    // get the latest user accounts stored at AutoPass
    var xmlhttp = new XMLHttpRequest();
    var searchURL = "http://www.autopasspg.co.uk/autopasslogin/";

    var sub_password = sha256(password);
    var data = "username=" + username + "&" + "password=" + sub_password;
    console.log(data)
    xmlhttp.open("POST", searchURL);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onload = function (){
        console.log(xmlhttp.responseText);
        var responseText = JSON.parse(xmlhttp.responseText);
        if (responseText.isUserExsit){
          localStorage.setItem('user', JSON.stringify(responseText));
          var accounts = responseText.user_accounts[domain];
          var pwdOffset = "";
          if (accounts){
            pwdOffset = accounts[0][1];
          }

          // cash all domains into the extension local storage
          var ppds = JSON.parse(localStorage.getItem(domain));
          if (ppds) {
              if (accounts.length == 1){
                if (pwdOffset && pwdOffset !== "undefined"){
                    // recover user password from password offset.
                    var username = accounts[0][0];
                    var mPasswdHash = sha256(masterPassword);
                    var outHash = sha256(mPasswdHash + domain + username);
                    var outNum = bigInt(outHash, 16);
                    pwdOffset = bigInt(pwdOffset, 16);
                    var userPwd = pwdOffset.add(outNum);
                    userPwd = userPwd.toString(16);
                    userPwd = hex_to_ascii(userPwd);
                    console.log(userPwd)
  // generate
                    // var password = generatePassword(masterPassword, domain, ppds, username);

                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                      chrome.tabs.sendMessage(tabs[0].id, {'username': username,"password": userPwd, "url":request.documentURL}, function(response) {
                        console.log(response);
                      });
                    });
                }else{
                    var username = accounts[0][0];
                    // var mPasswdHash = sha256(masterPassword);
                    var password = generatePassword(masterPassword, domain, ppds, username);
                    password = verifyPassword(ppds, password);
                    if (password){
                        console.log(password)
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                          chrome.tabs.sendMessage(tabs[0].id, {'username': username,"password": password, "url":request.documentURL}, function(response) {
                            console.log(response);
                          });
                        });
                        // sendResponse({'username': username,"password": password, "url":request.documentURL});
                    }
                }
            }else if (accounts.length > 1) {
                var message = 'Two or more accounts on :' + domain + '!Please use Autopass panel to generate password for your specific account.'
                showNotification(message);
            }

          }else{
              // do something if ppd can not be found.
              var message = 'First time usage on ' + domain + ". Please use Autopass panel to generate your passowrd."
              showNotification(message);

          }
        }
      }
    xmlhttp.send(data);

    // var accounts = JSON.parse(localStorage.getItem('user')).user_accounts[domain];
    // console.log(accounts)
    // if (ppds ) {
    //     if (accounts.length == 1){
    //       var username = accounts[0][0];
    //       var password = generatePassword(masterPassword, domain, ppds, username);
    //       password = verifyPassword(ppds, password);
    //       if (password){
    //           console.log(password)
    //           sendResponse({'username': username,"password": password, "url":request.documentURL});
    //       }
    //     }else if (accounts.length > 1) {
    //       alert('We identify you have more than two accounts associated with :' + domain + '!Please use Autopass panel to generate password for your specific account.')
    //     }

    // }else{
    //     // do something if ppd can not be found.
    //     showNotification(domain);

    // }

  });


function showNotification(message) {
    options = {
        "iconUrl": 'images/green.png',
        "title": "AutoPass!",
        "type": "basic",
        "message": message
    };
    chrome.notifications.create(options, function(notificationId)
    {
        setTimeout(function() {
        chrome.notifications.clear(notificationId);
    }, 5000);});
}



