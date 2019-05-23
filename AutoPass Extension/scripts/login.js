function submitAutopassUser() {

  var xmlhttp = new XMLHttpRequest();
  var searchURL = "http://www.autopasspg.co.uk/autopasslogin/";

  var username = document.getElementById("account_name").value;
  var password = document.getElementById("f_pwd").value;
  if (password && username) {
    var sub_password = sha256(password);
    var data = "username=" + username + "&" + "password=" + sub_password;
    console.log(data)
    xmlhttp.open("POST", searchURL);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onload = function (){
        console.log(xmlhttp.responseText);
        var responseText = JSON.parse(xmlhttp.responseText);
        if (responseText.isUserExsit){
          document.getElementById("login").hidden = true;
          document.getElementById("user_panel").hidden = true;
          document.getElementById("pwd_generate_panel").hidden = false;
          localStorage.setItem('user', JSON.stringify(responseText));
          localStorage.setItem("user_session_pwd", password);
          // cash all domains into the extension local storage

          setUserPanel(responseText);
          var domains = Object.keys(responseText.user_accounts);
          for (var i = 0; i < domains.length; i++) {
            console.log(domains[i])
            setTimeout(cashPPD, 1000 *(i+1), domains[i]);
          }
        }else{
          document.getElementById("login").hidden = false;
          document.getElementById("user_panel").hidden = true;
          document.getElementById("wrong_pwd_msg").hidden = false;
          // alert("User authentication failed! Please log in again");
        }
    }
    xmlhttp.send(data);
  }else{
    if(username){
      document.getElementById("login").hidden = false;
      document.getElementById("user_panel").hidden = true;
      document.getElementById("wrong_pwd_msg").hidden = false;
      document.getElementById("wrong_pwd_msg").textContent = "Password field required!";
    }
    if(password){
      document.getElementById("login").hidden = false;
      document.getElementById("user_panel").hidden = true;
      document.getElementById("wrong_pwd_msg").hidden = false;
      document.getElementById("wrong_pwd_msg").textContent = "Account name field required!";
    }

  }
}


function updateAutopassUserAccounts(domain, user_account, pwd_offset){
  var xmlhttp = new XMLHttpRequest();
  var updateURL = "http://www.autopasspg.co.uk/autopass_update_account/";
  var username = JSON.parse(localStorage.getItem('user')).username;
  var password = localStorage.getItem('user_session_pwd');
  var sub_password = sha256(password);
  var pwd_off = "";
  if (pwd_offset) {
    pwd_off = pwd_offset;
  }else{
    pwd_off="";
  }
  var data = "username=" + username + "&" + "password=" + sub_password + "&" + "domain=" + domain + "&" +"user_account=" + user_account;
  data += "&pwd_offset=" + pwd_off;
  console.log(data)
  xmlhttp.open("POST", updateURL);
  xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xmlhttp.onload = function (){
      console.log(xmlhttp.responseText);
      var responseText = JSON.parse(xmlhttp.responseText);
      if(responseText.update_status === "success" && pwd_offset){
        document.getElementById("pwd_error_msg").hidden = false;
        document.getElementById("pwd_error_msg").textContent = "A password offset has been generated and stored by Autopass for " + domain;
      }
      // if (responseText.update_status === "failed"){
      //   document.getElementById("out_pwd").value = '';
      //   document.getElementById("pwd_error_msg").hidden = false;
      //   document.getElementById("pwd_error_msg").textContent = "Failed to update your data at AutoPass server for  " + domain + ". Reason: " + responseText.reason;

      // }

  }
  xmlhttp.send(data);
}

function refreshStatus() {
  // body...
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
      }};
  xmlhttp.send(data);
}


function setUserPanel(user) {
  document.getElementById("user_info").innerText = "Welcome: " + user.first_name + " " + user.last_name;
  document.getElementById("user_enc_master_pwd").innerText = "Encrypted Master Password: " + user.enc_master_pwd;
  document.getElementById("user_hash_master_pwd").innerText = "Master Password Hash: " + user.hash_master_pwd;
  document.getElementById("user_email").innerText = "Email: " + user.email;
  var user_password = localStorage.getItem("user_session_pwd");
  document.getElementById("user_session_pwd").innerText = "User Session Password: " + user_password;
  // decrypt master key.
  var bytes = CryptoJS.AES.decrypt(user.enc_master_pwd, user_password);
  var master_pwd = bytes.toString(CryptoJS.enc.Utf8);
  localStorage.setItem("masterPassword", master_pwd);
  document.getElementById("raw_master_pwd").innerText = "Master Password: " +master_pwd;
}


function genPassOffset(){
  var user = localStorage.getItem("user");
  if(user){
    user = JSON.parse(user);
    var domain = document.getElementById("domain_name").value;
    var user_account = document.getElementById("user_account").value;
    var user_pwd = document.getElementById("pwd_offset").value;
    if (!(domain && user_account && user_pwd)) {
      document.getElementById("pwd_error_msg").hidden = false;
      document.getElementById("pwd_error_msg").textContent = "Please input the user name ,URL or your password."
      // alert("Please input the domain and user account you want to generate password");
      return;
    }
    console.log(domain);
    try{
      domain = new URL(domain);
    }catch{
      document.getElementById("pwd_error_msg").hidden = false;
      document.getElementById("pwd_error_msg").textContent = "Please input a valid URL."
    }
    document.getElementById("pwd_error_msg").hidden = true;
    domain = extractDomain(domain.host);
    var ppd = localStorage.getItem(domain);
    if (ppd) {
      ppd = JSON.parse(ppd);
      var masterPwd = localStorage.getItem("masterPassword");
      var passwordOffset = generatePasswordOffset(masterPwd, domain, ppd, user_account, user_pwd);
      updateAutopassUserAccounts(domain, user_account, passwordOffset);
      refreshStatus();
    }else {
      var xmlhttp = new XMLHttpRequest();
      var searchURL = "https://api.ppdds.passwordassistance.info/v1/search"
      xmlhttp.open("POST", searchURL);
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.setRequestHeader("Accept", "application/json;charset=UTF-8");

      xmlhttp.onload = function () {
        var result = JSON.parse(xmlhttp.responseText);
        // console.log(result);
        var results = result.result;
        // retrieve PPD file
        var foundPPD = false;
        if (results && results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            var rawURL = results[i].url;
            var url = new URL(rawURL);
            var domainRetrived = extractDomain(url.host);
            // console.log(domainRetrived)

            // make sure domain names of retrieved PPD same as the search domain
            if (domainRetrived === domain){
              foundPPD = true;
              var handler = results[i].ppdHandle;
              var baseURL = "https://api.ppdds.passwordassistance.info/v1/ppds/";
              var xml = new XMLHttpRequest();
              xml.open("GET", baseURL + handler);
              xml.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
              xml.setRequestHeader("Accept", "application/json;charset=UTF-8");
              // console.log("I am here")
              xml.onload =  function(){
                var ppds = JSON.parse(xml.responseText);
                // console.log(res);
                storePPD(domain, ppds);
                console.log("Store PPD for domain: " + domain);
                var masterPwd = localStorage.getItem("masterPassword");
                var passwordOffset = generatePasswordOffset(masterPwd, domain, ppds, user_account, user_pwd);
                updateAutopassUserAccounts(domain, user_account, passwordOffset);
                refreshStatus();

              };
              xml.send();
            }
          }
          if (!foundPPD) {
            document.getElementById("pwd_error_msg").hidden = false;
            document.getElementById("pwd_error_msg").textContent = "No password policy is found on domain: " + domain;
            console.log("No PPD is found on domain: " + domain);
          }
        }else{
          console.log("No PPD is found on domain: " + domain);
          document.getElementById("pwd_error_msg").hidden = false;
            document.getElementById("pwd_error_msg").textContent = "No password policy is found on domain: " + domain;
        }

      };
      xmlhttp.send(JSON.stringify({ query: domain}));
      // no ppd cache.
    }

  }else{
    document.getElementById("pwd_error_msg").hidden = false;
    document.getElementById("pwd_error_msg").textContent = "You did not log in AutoPass. Please log in.";
    // alert("User authentication failed! Please log in again");
  }
}

function genPassword() {
  // body...
  var user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
    var domain = document.getElementById("domain_name").value;
    var user_account = document.getElementById("user_account").value;
    if (!(domain && user_account)) {
      document.getElementById("pwd_error_msg").hidden = false;
      document.getElementById("pwd_error_msg").textContent = "Please input the user name and URL."
      // alert("Please input the domain and user account you want to generate password");
      return;
    }
    console.log(domain)

    try{
      domain = new URL(domain);
    }catch{
      document.getElementById("pwd_error_msg").hidden = false;
      document.getElementById("pwd_error_msg").textContent = "Please input a valid URL."
    }
    document.getElementById("pwd_error_msg").hidden = true;
    domain = extractDomain(domain.host);
    var ppd = localStorage.getItem(domain);
    if (ppd) {
      ppd = JSON.parse(ppd);
      var masterPwd = localStorage.getItem("masterPassword");
      domain_accounts = user.user_accounts[domain];
      // check whether accounts exists.
      var account_exist = false;
      if (domain_accounts){
        for (var i = 0; i < domain_accounts.length; i++) {
          var temp_account = domain_accounts[i][0];
          if (temp_account === user_account){
            account_exist = true;
          }
        }
      }else{
        account_exist = false;
      }
      // generate password for given user account
      if (account_exist){
        for (var i = 0; i < domain_accounts.length; i++) {
          if (user_account === domain_accounts[i][0]){
            console.log(user_account)
            if (domain_accounts[i][1]){
              var pwdOffset = domain_accounts[i][1];
              // password offset is existing
              var username = user_account;
              var mPasswdHash = sha256(masterPwd);
              var outHash = sha256(mPasswdHash + domain + username);
              var outNum = bigInt(outHash, 16);
              pwdOffset = bigInt(pwdOffset, 16);
              var userPwd = pwdOffset.add(outNum);
              userPwd = userPwd.toString(16);
              userPwd = hex_to_ascii(userPwd);
              document.getElementById("out_pwd").value = userPwd;
            }else{
              var password = generatePassword(masterPwd, domain, ppd, user_account);

              password = verifyPassword(ppd, password);
              if (password) {
                document.getElementById("out_pwd").value = password;
                updateAutopassUserAccounts(domain, user_account);
                refreshStatus();
              }
            }
          }
        }
      }else{
        var password = generatePassword(masterPwd, domain, ppd, user_account);
        password = verifyPassword(ppd, password);
        if (password) {
          document.getElementById("out_pwd").value = password;
          updateAutopassUserAccounts(domain, user_account);
          refreshStatus();
        }
      }
      // generate password if password offset is used
    } else {
      var xmlhttp = new XMLHttpRequest();
      var searchURL = "https://api.ppdds.passwordassistance.info/v1/search"
      xmlhttp.open("POST", searchURL);
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.setRequestHeader("Accept", "application/json;charset=UTF-8");

      xmlhttp.onload = function () {
        var result = JSON.parse(xmlhttp.responseText);
        // console.log(result);
        var results = result.result;
        // retrieve PPD file
        var foundPPD = false;
        if (results && results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            var rawURL = results[i].url;
            var url = new URL(rawURL);
            var domainRetrived = extractDomain(url.host);
            // console.log(domainRetrived)

            // make sure domain names of retrieved PPD same as the search domain
            if (domainRetrived === domain){
              foundPPD = true;
              var handler = results[i].ppdHandle;
              var baseURL = "https://api.ppdds.passwordassistance.info/v1/ppds/";
              var xml = new XMLHttpRequest();
              xml.open("GET", baseURL + handler);
              xml.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
              xml.setRequestHeader("Accept", "application/json;charset=UTF-8");
              // console.log("I am here")
              xml.onload =  function(){
                var ppds = JSON.parse(xml.responseText);
                // console.log(res);
                storePPD(domain, ppds);
                console.log("Store PPD for domain: " + domain);
                var masterPwd = localStorage.getItem("masterPassword");

                domain_accounts = user.user_accounts[domain];

                var account_exist = false;
                if (domain_accounts){
                  for (var i = 0; i < domain_accounts.length; i++) {
                    var temp_account = domain_accounts[i][0];
                    if (temp_account === user_account){
                      account_exist = true;
                    }
                  }
                }else{
                  account_exist = false;
                }
                // generate password for given user account
                if (account_exist){
                  for (var i = 0; i < domain_accounts.length; i++) {
                    if (user_account === domain_accounts[i][0]){
                      console.log(user_account)
                      if (domain_accounts[i][1]){
                        var pwdOffset = domain_accounts[i][1];
                        // password offset is existing
                        var username = user_account;
                        var mPasswdHash = sha256(masterPwd);
                        var outHash = sha256(mPasswdHash + domain + username);
                        var outNum = bigInt(outHash, 16);
                        pwdOffset = bigInt(pwdOffset, 16);
                        var userPwd = pwdOffset.add(outNum);
                        userPwd = userPwd.toString(16);
                        userPwd = hex_to_ascii(userPwd);
                        document.getElementById("out_pwd").value = userPwd;
                      }else{
                        var password = generatePassword(masterPwd, domain, ppds, user_account);

                        password = verifyPassword(ppds, password);
                        if (password) {
                          document.getElementById("out_pwd").value = password;
                          updateAutopassUserAccounts(domain, user_account);
                          refreshStatus();
                        }
                      }
                    }
                  }
                }else{
                  var password = generatePassword(masterPwd, domain, ppds, user_account);
                  password = verifyPassword(ppds, password);
                  if (password) {
                    document.getElementById("out_pwd").value = password;
                    updateAutopassUserAccounts(domain, user_account);
                    refreshStatus();
                  }
                }
              };
              xml.send();
            }
          }
          if (!foundPPD) {
            document.getElementById("pwd_error_msg").hidden = false;
            document.getElementById("pwd_error_msg").textContent = "No password policy is found on domain: " + domain;
            console.log("No PPD is found on domain: " + domain);
          }
        }else{
          console.log("No PPD is found on domain: " + domain);
          document.getElementById("pwd_error_msg").hidden = false;
            document.getElementById("pwd_error_msg").textContent = "No password policy is found on domain: " + domain;
        }

      };
      xmlhttp.send(JSON.stringify({ query: domain}));
      // no ppd cache.
    }

  }else{
    document.getElementById("pwd_error_msg").hidden = false;
    document.getElementById("pwd_error_msg").textContent = "You did not log in AutoPass. Please log in.";
    // alert("User authentication failed! Please log in again");
  }
}

function logOut() {
  localStorage.clear();
  document.getElementById("login").hidden = false;
  document.getElementById("pwd_generate_panel").hidden = true;
  document.getElementById("user_panel").hidden = true;
  // body...
}

function copy(){
  var text = document.getElementById("out_pwd");
  if (text.value) {
    text.select();
    document.execCommand("copy");
    document.getElementById("pwd_error_msg").hidden = false;
    document.getElementById("pwd_error_msg").textContent = "Password has been copied to clipboard.";
    document.getElementById("pwd_error_msg").style = "color:black";
  }else{
    document.getElementById("pwd_error_msg").hidden = false;
    document.getElementById("pwd_error_msg").textContent = "No password to copy."
  }

}


function onToggle() {
    // check if checkbox is checked
    if (document.getElementById('checkbox_offset').checked){
      // if checked
      document.getElementById("pwd_gen_table").style.display = "none";
      document.getElementById("pwd_offset_table").style.display = "inline";

      // console.log('checked');
    } else {
      // if unchecked
      document.getElementById("pwd_gen_table").style.display = "inline";
      document.getElementById("pwd_offset_table").style.display = "none";

    }
  }

// caches user input to local storage.

// render the login html.
document.getElementById("autopass_submit").onclick = submitAutopassUser;
document.getElementById("checkbox_offset").onclick = onToggle;
document.getElementById("gen_pwd").onclick = genPassword;
document.getElementById("log_out").onclick = logOut;
document.getElementById("copy_pwd").onclick = copy;
document.getElementById("confirm_pwd").onclick = genPassOffset;
var user = localStorage.getItem("user");
if (user) {
  document.getElementById("login").hidden = true;
  document.getElementById("user_panel").hidden = true;

  user = JSON.parse(user);
  document.getElementById("welcome").textContent = "Hi, " + user.username + ". Welcome to AutoPass."
  document.getElementById("pwd_generate_panel").hidden = false;
  setUserPanel(user);
  var userAccount = document.getElementById('user_account');
  var website  = document.getElementById("domain_name");
  userAccount.oninput = function () {
    var user_input = userAccount.value;
    localStorage.setItem('cached_input', user_input);
  }
  website.oninput = function () {
    var domain = website.value;
    localStorage.setItem('cached_domain', domain);
  }
  // auto fill user previous input.
  var cached_input = localStorage.getItem("cached_input");
  var cached_domain = localStorage.getItem("cached_domain");
  document.getElementById('user_account').value = cached_input;
  document.getElementById('domain_name').value = cached_domain;
  // if (cached_input) {
  //   document.getElementById('user_account').value = cached_input;
  // }
  // if (cached_domain) {
  //   document.getElementById("website").value = cached_domain;
  // }

}else{
  document.getElementById("login").hidden = false;
  document.getElementById("pwd_generate_panel").hidden = true;
  document.getElementById("user_panel").hidden = true;
}



