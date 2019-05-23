
/*
 * utils.js contains common functions used by AutoPass
 * author: Wanpeng Li
 */

/**
 * generate a strong password for user
 * @param  {[string]} mPasswd    [a long-term strong password selected by user]
 * @param  {[string]} hostname   [the host name of the target website]
 * @param  {[type]} pwdPolicy  [a password policy specified by the website]
 * @param  {[type]} digitalObj [a digital file, e.g. a text fragment, picture, or audio sample]
 * @return {[string]}            [return a deterministic password for the user]
 */
function generatePassword(mPasswd, hostname, pwdPolicy, userAccountName,digitalObj) {
    // hash the master password
    var mPasswdHash = sha256(mPasswd);
    // hash hash(master password) + hostname
    var outHash = sha256(mPasswdHash + hostname + userAccountName);
    // generate
    var password = mapStringToPRML(pwdPolicy, outHash);
    return password
}



/**
 * generate a  password offset for user
 * @param  {[string]} mPasswd    [a long-term strong password selected by user]
 * @param  {[string]} hostname   [the host name of the target website]
 * @param  {[type]} pwdPolicy  [a password policy specified by the website]
 * @param  {[type]} digitalObj [a digital file, e.g. a text fragment, picture, or audio sample]
 * @return {[string]}            [return a deterministic password for the user]
 */
function generatePasswordOffset(mPasswd, hostname, pwdPolicy, userAccountName,userPwd,digitalObj){
  var mPasswdHash = sha256(mPasswd);
  // hash hash(master password) + hostname
  var outHash = sha256(mPasswdHash + hostname + userAccountName);
  // generate
  var outNum = bigInt(outHash, 16);
  var userPwdHex = ascii_to_hexa(userPwd);
  var userPwdNum = bigInt(userPwdHex, 16);
  var pwdOffset = userPwdNum.subtract(outNum);
  return pwdOffset.toString(16);
}

/**
 * check the login status
 * @return {Boolean} true if the user has logged in
 */
function hasLoggedIn() {
    var data = localStorage.getItem("masterPassword");
    if (data){
        return true;
    }else{
        return false;
    }
}

/**
 * generate master passwords for the user
 * @return {string} a 128-bit string (16 chars)
 */
function generateMasterkey() {
    return random(16);
}


/**
 * change ascii to hexdecimal
 * @param  {str} str the asicc string
 * @return {str}     the hex string
 */
function ascii_to_hexa(str)
  {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n ++)
     {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
   }
  return arr1.join('');

}

/**
 * convert hex decimal to ascii
 * @param  {str} str1 the hex string to convert
 * @return {str}      the ascii string
 */
function hex_to_ascii(str1)
 {
  var hex  = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
 }

/**
 * calculate sha256 of a give string
 * @param  {string} str [the input string]
 * @return {string}     [the sha256 of the input string]
 */

function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value>>>amount) | (value<<(32 - amount));
  };

  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length'
  var i, j; // Used as a counter across the whole file
  var result = ''

  var words = [];
  var asciiBitLength = ascii[lengthProperty]*8;

  //* caching results is optional - remove/add slash from front of this line to toggle
  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  // (we actually calculate the first 64, but extra values are just ignored)
  var hash = sha256.h = sha256.h || [];
  // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty];
  /*/
  var hash = [], k = [];
  var primeCounter = 0;
  //*/

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
    }
  }

  ascii += '\x80' // Append Ƈ' bit (plus zero padding)
  while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j>>8) return; // ASCII check: only accept characters in range 0-255
    words[i>>2] |= j << ((3 - i)%4)*8;
  }
  words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
  words[words[lengthProperty]] = (asciiBitLength)

  // process each chunk
  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
    var oldHash = hash;
    // This is now the undefinedworking hash", often labelled as variables a...g
    // (we have to truncate as well, otherwise extra entries at the end accumulate
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      // Expand the message into 64 words
      // Used below if
      var w15 = w[i - 15], w2 = w[i - 2];

      // Iterate
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
        + ((e&hash[5])^((~e)&hash[6])) // ch
        + k[i]
        // Expand the message schedule if needed
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
          )|0
        );
      // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
        + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj

      hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
      hash[4] = (hash[4] + temp1)|0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i])|0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i]>>(j*8))&255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
};


/**
 * randomly generate a string
 * @param  {int} howMany the length of the output string
 * @param  {string} chars   the chars used to generate the random string
 * @return {string}         the random string
 */
function random(howMany, chars) {
    var chars = chars
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789_=@+";
    var numbers = new Uint8Array(howMany);
    var rnd = crypto.getRandomValues(numbers);
    var value = new Array(howMany);
    var len = chars.length;
    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };
    return value.join('');
}



// chrome.webRequest.onBeforeSendHeaders.addListener(
//         function(details) {
//           for (var i = 0; i < details.requestHeaders.length; ++i) {
//             if (details.requestHeaders[i].name === '11') {
//               details.requestHeaders.splice(i, 1);
//               break;
//             }
//           }
//           console.log(details.requestHeaders);
//           return {requestHeaders: details.requestHeaders};
//         },
//         {urls: ["<all_urls>"]},
//         ["blocking", "requestHeaders"]);

/**
 * retrieve PPD of a website
 * @param  {string} domain the domain name of the target website
 * @param  {integer} count  the number of search results to be retrieved
 * @return {xml}        an xml file
 */
function cashPPD(domain, count) {
  // search for PPD
  var xmlhttp = new XMLHttpRequest();
  var searchURL = "https://api.ppdds.passwordassistance.info/v1/search"
  xmlhttp.open("POST", searchURL);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.setRequestHeader("Accept", "application/json;charset=UTF-8");

  xmlhttp.onload = function () {
    var result = JSON.parse(xmlhttp.responseText);
    console.log(result);
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
            var res = JSON.parse(xml.responseText);
            // console.log(res);
            storePPD(domain, res);
            console.log("Store PPD for domain: " + domain);
          };
          xml.send();
        }
      }
      if (!foundPPD) {
        console.log("No PPD is found on domain: " + domain);
      }
    }else{
      console.log("No PPD is found on domain: " + domain);
    }

  };
  xmlhttp.send(JSON.stringify({ query: domain, count: count}));
}

/**
 * store ppd to local storage
 * @param  {strign} domain the domain name of the website
 * @param  {json} ppd    a pdd json file
 * @return {none}
 */
function storePPD(domain, ppd) {
  var pddStore = localStorage.getItem(domain);
  if (pddStore) {
    console.log(domain + " pdd has been cashed earlier!");
  } else {
    localStorage.setItem(domain, JSON.stringify(ppd));
  }
}

/*
 * Domain name extractor. Turns host names into domain names
 * Adapted from Chris Zarate's public domain genpass tool:
 *  http://labs.zarate.org/passwd/
 */

function extractDomain(host) {
    var s;  // the final result
    // Begin Chris Zarate's code
    var host=host.split('.');

    if(host[2]!=null) {
        s=host[host.length-2]+'.'+host[host.length-1];
        domains='ab.ca|ac.ac|ac.at|ac.be|ac.cn|ac.il|ac.in|ac.jp|ac.kr|ac.nz|ac.th|ac.uk|ac.za|adm.br|adv.br|agro.pl|ah.cn|aid.pl|alt.za|am.br|arq.br|art.br|arts.ro|asn.au|asso.fr|asso.mc|atm.pl|auto.pl|bbs.tr|bc.ca|bio.br|biz.pl|bj.cn|br.com|cn.com|cng.br|cnt.br|co.ac|co.at|co.il|co.in|co.jp|co.kr|co.nz|co.th|co.uk|co.za|com.au|com.br|com.cn|com.ec|com.fr|com.hk|com.mm|com.mx|com.ph|com.pl|com.ro|com.ru|com.sg|com.tr|com.tw|cq.cn|cri.nz|de.com|ecn.br|edu.au|edu.cn|edu.hk|edu.mm|edu.mx|edu.pl|edu.tr|edu.za|eng.br|ernet.in|esp.br|etc.br|eti.br|eu.com|eu.lv|fin.ec|firm.ro|fm.br|fot.br|fst.br|g12.br|gb.com|gb.net|gd.cn|gen.nz|gmina.pl|go.jp|go.kr|go.th|gob.mx|gov.br|gov.cn|gov.ec|gov.il|gov.in|gov.mm|gov.mx|gov.sg|gov.tr|gov.za|govt.nz|gs.cn|gsm.pl|gv.ac|gv.at|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|hu.com|idv.tw|ind.br|inf.br|info.pl|info.ro|iwi.nz|jl.cn|jor.br|jpn.com|js.cn|k12.il|k12.tr|lel.br|ln.cn|ltd.uk|mail.pl|maori.nz|mb.ca|me.uk|med.br|med.ec|media.pl|mi.th|miasta.pl|mil.br|mil.ec|mil.nz|mil.pl|mil.tr|mil.za|mo.cn|muni.il|nb.ca|ne.jp|ne.kr|net.au|net.br|net.cn|net.ec|net.hk|net.il|net.in|net.mm|net.mx|net.nz|net.pl|net.ru|net.sg|net.th|net.tr|net.tw|net.za|nf.ca|ngo.za|nm.cn|nm.kr|no.com|nom.br|nom.pl|nom.ro|nom.za|ns.ca|nt.ca|nt.ro|ntr.br|nx.cn|odo.br|on.ca|or.ac|or.at|or.jp|or.kr|or.th|org.au|org.br|org.cn|org.ec|org.hk|org.il|org.mm|org.mx|org.nz|org.pl|org.ro|org.ru|org.sg|org.tr|org.tw|org.uk|org.za|pc.pl|pe.ca|plc.uk|ppg.br|presse.fr|priv.pl|pro.br|psc.br|psi.br|qc.ca|qc.com|qh.cn|re.kr|realestate.pl|rec.br|rec.ro|rel.pl|res.in|ru.com|sa.com|sc.cn|school.nz|school.za|se.com|se.net|sh.cn|shop.pl|sk.ca|sklep.pl|slg.br|sn.cn|sos.pl|store.ro|targi.pl|tj.cn|tm.fr|tm.mc|tm.pl|tm.ro|tm.za|tmp.br|tourism.pl|travel.pl|tur.br|turystyka.pl|tv.br|tw.cn|uk.co|uk.com|uk.net|us.com|uy.com|vet.br|web.za|web.com|www.ro|xj.cn|xz.cn|yk.ca|yn.cn|za.com';
        domains=domains.split('|');
        for(var i=0;i<domains.length;i++) {
            if(s==domains[i]) {
                s=host[host.length-3]+'.'+s;
                break;
            }
        }
    }else{
        s=host.join('.');
    }
    // End Chris Zarate's code
    return s;
}


/**
 * generate C-ary representation of a string
 * @param  {integer} c   the integer use to generate the representation
 * @param  {string} the hex string e.g. 0-f
 * @return {string}     a C-ary representation of the string
 */
function generateCaryString(c,str) {
  var stacks = [];
  var bigNum = bigInt(str, 16);
  // console.log(bigNum);
  while (bigNum.compare(0)){
    var rem = bigNum.mod(c);
    stacks.push(rem);
    bigNum = bigNum.divide(c);
  }
  return stacks.reverse();
}

/**
 * map string representation to characters in PRML
 * @param  {JSON} jsonPRML json file of the PRML file of the website
 * @param  {integer} the hex string, e.g. 0-f
 * @return {string}      a string that match the PRML
 */
function mapStringToPRML(jsonPRML, str) {
  console.log(jsonPRML)
  var characterSet = jsonPRML.ppds[0].characterSets;
  var characters = "";
  // console.log(characterSet)
  // retrieve all characters from PRML
  for (var i = 0; i < characterSet.length; i++) {
    var character = characterSet[i].characters;
    characters += character;
  }

  // build a map between C-ary and strings.
  var dict = {};
  for (var i = 0; i < characters.length; i++) {
    dict[i] = characters[i];
  }
  var c = characters.length;
  var cary = generateCaryString(c, str);
  console.log(cary);
  console.log(dict);
  // transfer C-ary to strings
  var str = "";
  for (var i = 0; i < cary.length; i++) {
    var c = cary[i];
    str += dict[c.toString()];
  }
  return str;
}

/**
 * verify a password whether it satisfy the PRML requirements
 * @param  {JSON} jsonPRML the PRML object for a domain
 * @param  {string} password the generated password
 * @return {password or false}          return true if the generated password is OK
 */
function verifyPassword(jsonPRML, password) {
  var valid = false;
  var tmpPwd = ""
  // retrieve requirements from PRML
  var properties = jsonPRML.ppds[0].properties;
  var maxLength = properties.maxLength;
  var minLength = properties.minLength;
  // check the minmum password length
  if (minLength && password.length < minLength) {
    console.log("Password: " + password + " is not valid, Reason: not enough length")
    return false;
  }
  // check maximum password length and trim generated password
  if (maxLength && password.length > maxLength) {
    console.log("trim Password: " + password + " to meet max length requirement")
    tmpPwd = password.substring(0, maxLength);
    console.log(tmpPwd)
  }
  // check the consecutive occurrence of a character in password
  var maxConsecutive = properties.maxConsecutive;
  var char = tmpPwd[0];
  var counter = 1;
  for (var i = 1; i < tmpPwd.length; i++) {
    var tempChar = tmpPwd[i];
    if (char === tempChar) {
      counter++;
      if (maxConsecutive &&  counter > maxConsecutive) {
        // console.log(counter);
        console.log("Password: " + tmpPwd + " is not valid, Reason: max consecutive occurrence")
        return false;
      }
    }else{
      counter = 1;
      char = tempChar;
    }
  }

  // check character set
  var characterSet = jsonPRML.ppds[0].characterSets;
  for (var i = 0; i < characterSet.length; i++) {
    var charOccursSet = jsonPRML.ppds[0].properties.characterSettings.characterSetSettings;
    var minCharOccurs = charOccursSet[i].minOccurs;
    var maxCharOccurs = charOccursSet[i].maxOccurs;
    if (minCharOccurs) {
      // check min occurs of a charset
      var charSet = new Set(characterSet[i].characters);
      var interSet = occurance(charSet, tmpPwd);
      var count = interSet.length;
      if (count < minCharOccurs) {
        console.log("Password: " + tmpPwd + " is not valid, Reason: min char occurrence")
        return false;
      }
    }
    if (maxCharOccurs) {
      // check max occurs of a charset
      var charSet = new Set(characterSet[i].characters);
      var interSet = occurance(charSet, tmpPwd);
      var count = interSet.length;
      if (count > maxCharOccurs) {
        console.log("Password: " + tmpPwd + " is not valid, Reason: max char occurrence")
        return false;
      }
    }
  }
  return tmpPwd || password;
}

// count occurrence of a set characters appeared in password
function occurance(setChar, password) {
    var _intersection = [];
    for (var elem of password) {
        if (setChar.has(elem)) {
            _intersection.push(elem);
        }
    }
    return _intersection;
}


