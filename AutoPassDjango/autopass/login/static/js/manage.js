
var buttons = document.getElementsByTagName("button");
for (var i = 0; i < buttons.length; i++) {
  var button = buttons[i];
  var button_id = button.id;
  var domain = button_id.split("_")[1];
  var selection_id = button_id.replace("button", "selection");
  var selection_tag = document.getElementById(selection_id);
  button.onclick = function function_name(){
    var selected_value = selection_tag.options[selection_tag.selectedIndex].value;
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      console.log(xhr.responseType);
    };
    xhr.open("GET", "https://www.autopasspg.co.uk/delete?account_name=" + selected_value + "&domain=" + domain);
    xhr.send();
  };  // body...
}
