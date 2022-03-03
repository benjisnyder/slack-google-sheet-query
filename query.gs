function doPost(request){
  // testing data
  /*request = {
    parameter : {
      text : "risk"
    }
  }*/
  if (typeof request !== undefined) {
    var params = request.parameter;

    if (params.text.length === 0) {
      return ContentService.createTextOutput("Whoops, you forgot to add your search term!");
    }

    var term = params.text.toUpperCase(); //the options provided after the command as a single string
    //visit https://api.slack.com/slash-commands/#app_command_handling for available payload sent by slack

    /*var sheet = SpreadsheetApp.getActiveSheet();
    var textFinder = sheet.createTextFinder(term);
    var searchRow = textFinder.findNext().getRow();*/
    var rows = SpreadsheetApp.getActive().getSheetByName('Directory').getDataRange().getValues();;
    var matches = '';
    var dil = '';
    var ret = {};
    var count = 0;

    rows.forEach(function(row) {
      // 0 = name, 1 = org, 2 = tags
      var orgMatch = row[1].toUpperCase().includes(term);
      var tagMatch = row[2].toUpperCase().includes(term);

      if (count > 0 && (orgMatch || tagMatch)) { // skip the first row (don't use getRange() as it doesn't return an array)
        if (matches.length > 0) {
          dil = '\n';
        } else {
          dil = '';
        }
        
        matches += dil + "*" + row[0] + "* (" + row[1] + (row[2].length > 0 ? (", " + row[2]) : '') + ")";
      }

      count++;
    });

    if (matches.length === 0) {
      return ContentService.createTextOutput('We don\'t see anyone matching that term.');
    }

    ret = {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": '*We found these folks related to "' + params.text + '"*'
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": matches
          }
        }
      ]
    }

    //finally we return the reponse back to slack
    return ContentService.createTextOutput(JSON.stringify(ret)).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput("Something went wrong!");
  }
}
