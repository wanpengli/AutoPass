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
}

function check_account() {
  // body...
  var account_name = document.getElementById("account_name").value;
  if (account_name.length < 1){
    var show_p = document.getElementById('availability');
    show_p.innerText = "Please enter an account name."
    show_p.hidden = false;
    show_p.style = "color:red;";
  }else{
  // console.log(account_name);
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    console.log(xhr.responseType)
    var ct = xhr.getResponseHeader("content-type") || "";
    if (ct.indexOf('json') > -1) {
      var availability = JSON.parse(xhr.responseText);
      console.log(availability);
      if (availability.isAvailable){
          var show_p = document.getElementById('availability');
          // console.log(show_p);
          show_p.innerText = "The account name is available."
          show_p.hidden = false;
          show_p.style = "color:black;";
      }else{
        var show_p = document.getElementById('availability');
        show_p.innerText = "This name already exists. Please try another name."
        show_p.hidden = false;
        show_p.style = "color:red;";
      }
    }
  };
  xhr.open("GET", "https://www.autopasspg.co.uk/checkaccount?username=" + account_name);
  xhr.send();
  }
}

function printMasterKey() {
  window.print();
  // body...
}


function register() {
  var email =  document.getElementById("user_email").value;
  var emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
  var masterKey = document.getElementById("m_pwd").value;
  var masterKey = verifyPass(masterKey);
  var first_name = document.getElementById("first_name").value;
  var last_name = document.getElementById("last_name").value;
  var account_name = document.getElementById("account_name").value;
  var email_valid = false;
  var master_valid = false;
  var first_name_valid = false;
  var last_name_valid = false;
  var account_name_valid = false;
  var pwd_1 = document.getElementById("f_pwd").value;
  var pwd_2 = document.getElementById("s_pwd").value;
  var pwd_valid = false;

  // check email
  if(!emailReg.exec(email)){
    var email_tag = document.getElementById("email_ava");
    email_tag.hidden = false;
    email_tag.style = "color:red;";
    email_valid = false;
  }else{
    var email_tag = document.getElementById("email_ava");
    email_tag.hidden = true;
    email_valid = true;
  }
  if (first_name.length < 1) {
    var firstname_tag = document.getElementById("first_name_ava");
    firstname_tag.hidden = false;
    firstname_tag.style = "color:red;";
    firstname_valid = false;
  }else{
    var first_name_tag = document.getElementById("first_name_ava");
    first_name_tag.hidden = true;
    first_name_valid = true;
  }
  if (last_name.length < 1) {
    var lastname_tag = document.getElementById("last_name_ava");
    lastname_tag.hidden = false;
    lastname_tag.style = "color:red;";
    lastname_valid = false;
  }else{
    var last_name_tag = document.getElementById("last_name_ava");
    last_name_tag.hidden = true;
    last_name_valid = true;
  }
  if (account_name.length < 1) {
    var accountname_tag = document.getElementById("availability");
    accountname_tag.hidden = false;
    accountname_tag.style = "color:red;";
    accountname_tag.innerText = "Please enter an account name."
    account_name_valid = false;
  }else{
    var account_name_tag = document.getElementById("availability");
    account_name_tag.hidden = true;
    account_name_valid = true;
    console.log("Account name!");
  }


  // check master key
  if(!masterKey.result){
    var master_tag = document.getElementById("m_pwd_ava");
    master_tag.hidden = false;
    master_tag.style = "color:red;";
    master_valid = false;
    console.log(masterKey);
    console.log("Master Key  is not valid!");
  }else{
    var master_tag = document.getElementById("m_pwd_ava");
    master_tag.hidden = true;
    // master_tag.style = "color:red;";
    master_valid = true;
  }

  // check password
  if (pwd_1.length > 7 || pwd_2.length > 7){
    if (pwd_1 === pwd_2){
      var not_same_password = document.getElementById("pwd_not_same");
      not_same_password.hidden = true;
      pwd_valid = true;


    }else{
      var not_same_password = document.getElementById("pwd_not_same");
      not_same_password.hidden = false;
      not_same_password.innerText = 'The passwords  did not match. Try again.';
      pwd_valid = false;
    }

  }else{
    var not_same_password = document.getElementById("pwd_not_same");
    not_same_password.hidden = false;
    pwd_valid = false;
    not_same_password.innerText = 'Password must be at least 8 characters!';
  }


  if(pwd_valid && email_valid && master_valid && first_name_valid && last_name_valid && account_name_valid){
    var enc_master_key = document.getElementById("enc_master_pwd");
    var hash_master_key = document.getElementById("hash_master_pwd");
    var master_key = document.getElementById("m_pwd").value;
    hash_master_key.value = sha256(master_key);
    var user_password = pwd_1;
    var ciper_text = CryptoJS.AES.encrypt(master_key, user_password);
    ciper_text = ciper_text.toString();
    enc_master_key.value = ciper_text;
    document.getElementById("f_pwd").value = sha256 (pwd_1);
    document.getElementById("s_pwd").value = sha256 (pwd_2);
    // console.log(ciper_text);
    // var bytes = CryptoJS.AES.decrypt(ciper_text, user_password);
    // console.log(bytes.toString(CryptoJS.enc.Utf8))
    document.getElementById("registration").submit();

  }
}

/**
 * randomly generate a string
 * @param  {int} howMany the length of the output string
 * @param  {string} chars   the chars used to generate the random string
 * @return {string}         the random string
 */
function random(howMany, chars) {
    var chars = chars
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789!@#$%^&*()_+=-";
    var numbers = new Uint8Array(howMany);
    var rnd = crypto.getRandomValues(numbers);
    var value = new Array(howMany);
    var len = chars.length;
    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };
    return value.join('');
}

/**
 * generate master passwords for the user
 * @return {string} a 128-bit string (16 chars)
 */
function generateMasterkey() {
  var password = random(16);
  var result = verifyPass(password)
  if(result.result){
    return password;
  }else{
    return generateMasterkey();
  }
}

function gen_master_key(){
  var masterKey = document.getElementById("m_pwd");
  var ran_key = generateMasterkey();
  masterKey.value = ran_key;
}



function verifyPass(p){
    var aChars = /[a-z][A-Z]/;
    var aNumber = /[0-9]/;
    var aSpecial = /[!|@|#|$|%|^|&|*|(|)|-|_]/;
    var obj = {};
    obj.result = true;

    if(p.length < 16){
        obj.result=false;
        obj.error="Not long enough!"
        return obj;
    }

    var numChars = 0;
    var numNums = 0;
    var numSpecials = 0;
    for(var i=0; i<p.length; i++){
        if(aChars.test(p[i]))
            numChars++;
        else if(aNumber.test(p[i]))
            numNums++;
        else if(aSpecial.test(p[i]))
            numSpecials++;
    }

    if(aChars < 1 || numNums < 1 || numSpecials < 1){
        obj.result=false;
        obj.error="Wrong Format!";
        return obj;
    }
    return obj;
}
